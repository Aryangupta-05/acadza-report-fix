import {readFile,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateResult,validatePatch,patched} from '../src/safety.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const questions=await read('data/questions.json'),reports=await read('data/reports.json'),results=await read('results.json');
function check(v,message){if(!v)throw new Error(message)}
check(questions.length===43&&reports.length===44&&results.length===44,'Expected 43 questions and 44 reports/results');
check(new Set(results.map(r=>r.reportId)).size===44,'Duplicate report results');
for(const report of reports){const r=results.find(r=>r.reportId===report.reportId),q=questions.find(q=>q._id===report.questionId);check(r&&q,'Missing result or question');validateResult(r,q,report);if(r.edit){const gate=validatePatch(q,r.repair,r.edit);check(r.route!=='auto_apply'||gate.eligible,'Ineligible automatic route');const next=patched(q,r.repair,r.edit);let repeated=false;try{patched(next,r.repair,r.edit)}catch{repeated=true}check(repeated,'Patch must reject repeated application');}}
for(const dir of ['src','scripts','public','tests'])for(const name of await readdir(dir)){if(/\.(?:m?js)$/.test(name))execFileSync(process.execPath,['--check',dir+'/'+name],{stdio:'pipe'});}
const manifest=Object.fromEntries(await Promise.all(['questions','reports','taxonomy'].map(async name=>[name+'.json',createHash('sha256').update(await readFile('data/'+name+'.json')).digest('hex')])));
const old=await read('docs/input-hashes.json').catch(()=>null);if(old)check(JSON.stringify(old)===JSON.stringify(manifest),'Original input hash mismatch');
const coverage={questions:questions.length,reports:reports.length,results:results.length,groups:new Set(reports.map(r=>r.questionId)).size,defects:results.filter(r=>r.verdict==='defect').length,patches:results.filter(r=>r.edit).length,eligibleAuto:results.filter(r=>r.route==='auto_apply').length,routes:Object.fromEntries(['auto_apply','faculty_review','no_change'].map(k=>[k,results.filter(r=>r.route===k).length])),hashes:manifest};
await writeFile('docs/results-check.json',JSON.stringify(coverage,null,2));console.log(JSON.stringify(coverage,null,2));
