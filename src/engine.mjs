import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {ModelClient} from './llm.mjs';
import {taxonomy,resultSchema,validateResult,validatePatch,version} from './safety.mjs';
const solveSchema={type:'object',additionalProperties:false,required:['summary','answer','uncertainty','figureRequired'],properties:{summary:{type:'string'},answer:{type:'string'},uncertainty:{type:'string'},figureRequired:{type:'boolean'}}};
const triageSchema={type:'object',additionalProperties:false,required:['results'],properties:{results:{type:'array',items:resultSchema}}};
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
async function main(){
 const args=process.argv.slice(2),get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
 const mode=get('--mode','live');if(!['live','reviewed'].includes(mode))throw new Error('Mode must be live or reviewed');
 const questions=JSON.parse(await readFile(get('--questions','data/questions.json'),'utf8')),reports=JSON.parse(await readFile(get('--reports','data/reports.json'),'utf8'));
 const prompts={solve:await readFile('prompts/solve-v1.txt','utf8'),triage:await readFile('prompts/triage-v1.txt','utf8')};
 const reviewed=mode==='reviewed'?JSON.parse(await readFile('docs/development-reviewed.json','utf8')):[];
 const run=await runEngine({questions,reports,prompts,mode,reviewed,client:new ModelClient({model:get('--model',undefined)})});
 await mkdir('docs',{recursive:true});await writeFile(get('--out','results.json'),JSON.stringify(run.results,null,2)+'\n');
 await writeFile('docs/engine-run.json',JSON.stringify({...run,results:undefined,generatedAt:new Date().toISOString()},null,2));
 console.log(JSON.stringify({mode,results:run.results.length,failures:run.failures.length,calls:run.traces.filter(t=>!t.cache&&!t.error).length,cacheHits:run.traces.filter(t=>t.cache).length}));
 if(run.failures.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
