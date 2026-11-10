import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {ModelClient} from './llm.mjs';
import {taxonomy,resultSchema,validateResult,validatePatch,version} from './safety.mjs';
import {calculations} from './calculations.mjs';
export const batchTriageInstruction='Input contains a batch of independent question cases. Return resultsByReport as an object keyed by every supplied report ID. Include a distinct result for each report, including multiple reports about the same question. Never merge or omit duplicate reports. The schema fixes each report and question identity. Use executable_calculations as checkable arithmetic corroboration; they are calculated from the stem, not the key or the student. Do not round intermediate values. Student replies must describe a proposal or referral and must not claim a saved correction.';
export function batchTriageSchema(reports){return{type:'object',additionalProperties:false,required:['resultsByReport'],properties:{resultsByReport:{type:'object',additionalProperties:false,required:reports.map(r=>r.reportId),properties:Object.fromEntries(reports.map(r=>[r.reportId,{...resultSchema,properties:{...resultSchema.properties,reportId:{type:'string',enum:[r.reportId]},questionId:{type:'string',enum:[r.questionId]}}}]))}}};}
export const batchSolveInstruction='Input contains independent questions. Return analysesByQuestion as an object keyed by every supplied question ID, with a distinct solve for each. Never merge or omit questions. Keep each summary concise (at most80 words), showing only checkable equations or facts, not private reasoning. Use the stem-only executable_calculations to check arithmetic; do not round intermediate products.';
export function batchSolveSchema(questions){return{type:'object',additionalProperties:false,required:['analysesByQuestion'],properties:{analysesByQuestion:{type:'object',additionalProperties:false,required:questions.map(q=>q._id),properties:Object.fromEntries(questions.map(q=>[q._id,solveSchema]))}}};}
export const solveSchema={type:'object',additionalProperties:false,required:['summary','answer','uncertainty','figureRequired'],properties:{summary:{type:'string'},answer:{type:'string'},uncertainty:{type:'string'},figureRequired:{type:'boolean'}}};
export const triageSchema={type:'object',additionalProperties:false,required:['results'],properties:{results:{type:'array',items:resultSchema}}};
export const solveBatchSchema={type:'object',additionalProperties:false,required:['analyses'],properties:{analyses:{type:'array',items:{type:'object',additionalProperties:false,required:['questionId','solve'],properties:{questionId:{type:'string'},solve:solveSchema}}}}};
export async function runEngine({questions,reports,client=new ModelClient(),prompts,mode='live',reviewed=[]}) {
 const results=[],analyses=[],failures=[],groups=new Map();
 for(const r of reports){if(!groups.has(r.questionId))groups.set(r.questionId,[]);groups.get(r.questionId).push(r);}
 for(const [id,group]of groups) {
  const q=questions.find(q=>q._id===id);if(!q)throw new Error('Unknown question reference '+id);
  try {
   let output,solve;
   if(mode==='reviewed'){const saved=reviewed.find(x=>x.sourceVersion===version(q));if(!saved)throw new Error('No matching reviewed snapshot');solve=saved.solve;output={results:saved.results};}
   else {
    const b=q[q.questionType];solve=await client.generate(prompts.solve,{questionType:q.questionType,question:b.question,quesImages:b.quesImages},solveSchema,'independent_solve');
    output=await client.generate(prompts.triage,{question:q,reports:group.map(({studentId,...r})=>r),taxonomy,independent_solve:solve},triageSchema,'triage');
   }
   if(output.results.length!==group.length||new Set(output.results.map(r=>r.reportId)).size!==group.length)throw new Error('Incorrect group result coverage');
   for(const r of output.results){const report=group.find(x=>x.reportId===r.reportId);if(!report)throw new Error('Unexpected report ID');
    try {validateResult(r,q,report);if(r.edit&&r.route==='auto_apply'&&!validatePatch(q,r.repair,r.edit).eligible)r.route='faculty_review';results.push(r);}
    catch(e){failures.push({questionId:id,reportId:r.reportId,error:e.message,proposed:r});results.push({...r,edit:null,route:'faculty_review',evidence:r.evidence+' Safety gate: '+e.message,student_reply:'Thanks for flagging this. The proposed change needs a faculty check before anything is changed.'});}
   }
   analyses.push({questionId:id,sourceVersion:version(q),solve,mode});
  }catch(e){failures.push({questionId:id,error:e.message});for(const report of group)results.push({reportId:report.reportId,questionId:id,verdict:'not_actionable',repair:null,edit:null,route:'faculty_review',confidence:0,evidence:'Triage unavailable: '+e.message+'. This is an execution failure, not a finding that the report lacks merit.',student_reply:'Thanks for reporting this. We could not complete the check, so a faculty member needs to review it.'});}
 }
 results.sort((a,b)=>a.reportId.localeCompare(b.reportId));return{results,analyses,failures,traces:client.traces||[],mode};
}
export async function runBatched({questions,reports,client,prompts,batchSize=4,onCheckpoint=async()=>{}}) {
 const needed=questions.filter(q=>reports.some(r=>r.questionId===q._id));
 const blind={analyses:[]};
 for(let start=0;start<needed.length;start+=batchSize){const batch=needed.slice(start,start+batchSize);const keyed=await client.generate(prompts.solve+'\n'+batchSolveInstruction,{questions:batch.map(q=>({questionId:q._id,questionType:q.questionType,question:q[q.questionType].question,quesImages:q[q.questionType].quesImages,executable_calculations:calculations(q)}))},batchSolveSchema(batch),'independent_solve_batch');for(const [questionId,solve]of Object.entries(keyed.analysesByQuestion))blind.analyses.push({questionId,solve});}
 if(blind.analyses.length!==needed.length||new Set(blind.analyses.map(a=>a.questionId)).size!==needed.length||blind.analyses.some(a=>!needed.some(q=>q._id===a.questionId)))throw new Error('Independent solve batch has incorrect coverage');
 const run={results:[],analyses:blind.analyses.map(a=>({...a,sourceVersion:version(needed.find(q=>q._id===a.questionId)),mode:'live'})),failures:[],traces:client.traces,mode:'live',batchSize};
 for(let start=0;start<needed.length;start+=batchSize){
  const batch=needed.slice(start,start+batchSize),group=reports.filter(r=>batch.some(q=>q._id===r.questionId));
  const keyed=await client.generate(prompts.triage+'\n'+batchTriageInstruction,{taxonomy,cases:batch.map(q=>({question:q,reports:group.filter(r=>r.questionId===q._id).map(({studentId,...r})=>r),independent_solve:blind.analyses.find(a=>a.questionId===q._id).solve,executable_calculations:calculations(q)}))},batchTriageSchema(group),'triage_batch');
  const output={results:Object.values(keyed.resultsByReport)};
  if(output.results.length!==group.length||new Set(output.results.map(r=>r.reportId)).size!==group.length)throw new Error('Batch report coverage mismatch');
  for(const r of output.results){const report=group.find(g=>g.reportId===r.reportId),q=batch.find(q=>q._id===r.questionId);if(!report||!q)throw new Error('Unexpected batch result identity');
   try{validateResult(r,q,report);if(r.edit&&r.route==='auto_apply'&&!validatePatch(q,r.repair,r.edit).eligible)r.route='faculty_review';run.results.push(r)}
   catch(e){run.failures.push({reportId:r.reportId,questionId:q._id,error:e.message,proposed:structuredClone(r)});const fallback={reportId:report.reportId,questionId:q._id,verdict:'not_actionable',repair:null,edit:null,route:'faculty_review',confidence:0,evidence:'Model proposal blocked by safety validation: '+e.message,student_reply:'Thanks for flagging this. A faculty member needs to check it before any change is made.'};run.results.push(fallback);}
  }
  run.results.sort((a,b)=>a.reportId.localeCompare(b.reportId));await onCheckpoint(run);console.log('Checkpoint: '+run.results.length+'/'+reports.length+' reports');
 }
 return run;
}
async function main(){
 const args=process.argv.slice(2),get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
 const mode=get('--mode','live');if(!['live','reviewed'].includes(mode))throw new Error('Mode must be live or reviewed');
 const questions=JSON.parse(await readFile(get('--questions','data/questions.json'),'utf8')),reports=JSON.parse(await readFile(get('--reports','data/reports.json'),'utf8'));
 const prompts={solve:await readFile('prompts/solve-v1.txt','utf8'),triage:await readFile('prompts/triage-v1.txt','utf8')};
 const reviewed=mode==='reviewed'?JSON.parse(await readFile('docs/development-reviewed.json','utf8')):[];
 const client=new ModelClient({model:get('--model',undefined)});
 const run=mode==='live'?await runBatched({questions,reports,client,prompts,onCheckpoint:async r=>{await writeFile('docs/batch-checkpoint.json',JSON.stringify(r,null,2))}}):await runEngine({questions,reports,prompts,mode,reviewed,client});
 const out=get('--out','results.json'),runOut=get('--run-out',out==='results.json'?'docs/engine-run.json':out+'.run.json');
 await mkdir('docs',{recursive:true});await writeFile(out,JSON.stringify(run.results,null,2)+'\n');
 await writeFile(runOut,JSON.stringify({...run,results:undefined,generatedAt:new Date().toISOString()},null,2));
 console.log(JSON.stringify({mode,results:run.results.length,failures:run.failures.length,calls:run.traces.filter(t=>!t.cache&&!t.error).length,cacheHits:run.traces.filter(t=>t.cache).length}));
 if(run.failures.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
