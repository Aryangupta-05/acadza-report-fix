import {randomBytes} from 'node:crypto';
import {safeHTML,text,images} from './content.mjs';
import {taxonomy,version,patched} from './safety.mjs';
export const urgency=(reports,results,now=Date.now())=>{
 const severity=results.some(r=>['answer_key','unsound','type_mismatch'].includes(r.repair))?60:results.some(r=>r.verdict==='defect')?40:results.some(r=>r.route==='faculty_review')?20:5;
 const age=Math.max(0,(now-Math.min(...reports.map(r=>Date.parse(r.reportedAt))))/86400000);
 return Math.round(severity+Math.min(20,5*(reports.length-1))+Math.min(20,age*2));
};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export function createApp({store,questions,reports,results,runInfo,assets}) {
 const groups=questions.filter(q=>reports.some(r=>r.questionId===q._id));
 const sessions=new Map(),rates=new Map();
 function workspace(req){const match=/acadza_workspace=([a-f0-9]{48})/.exec(req.headers.get('cookie')||'');return match?.[1];}
 function csrfOK(req){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
 const proposal=q=>{
   const rr=results.filter(r=>r.questionId===q._id),candidate=rr.find(r=>r.edit)||rr.find(r=>r.verdict==='defect')||rr[0];
   const edits=rr.filter(r=>r.edit).map(r=>JSON.stringify(r.edit)),conflict=new Set(edits).size>1;
   return{...candidate,edit:conflict?null:candidate?.edit||null,conflict,sourceVersion:version(q),manualOnly:candidate?.repair?taxonomy.repairs[candidate.repair]?.auto===false:false};
 };
 return async function app(req){
  const url=new URL(req.url),path=url.pathname;
  try {
   if(path==='/health')return json({ok:true,store:store.db.kind,mode:runInfo.mode||'not_generated'});
   if(path==='/api/session'&&req.method==='POST'){
    if(!csrfOK(req))return json({error:'Cross-origin mutation blocked'},403);
    let key=workspace(req);if(!key)key=randomBytes(24).toString('hex');await store.seed(key);const csrf=randomBytes(24).toString('hex');sessions.set(key,csrf);
    return json({csrf,actor:'Demo faculty reviewer',scope:'Your durable evaluation workspace',mode:runInfo.mode||'not_generated'},200,{'Set-Cookie':`acadza_workspace=${key}; Path=/; HttpOnly; SameSite=Strict; Max-Age=691200${url.protocol==='https:'?'; Secure':''}`});
   }
   if(path.startsWith('/api/')){
    const scope=workspace(req);if(!scope)return json({error:'Start an evaluation session'},401);
    if(path==='/api/cases'&&req.method==='GET'){
     const rows=await store.list(scope),cases=groups.map(q=>{const row=rows.find(r=>r.question_id===q._id),rr=results.filter(r=>r.questionId===q._id),rs=reports.filter(r=>r.questionId===q._id),p=proposal(q);return{id:q._id,title:text(q[q.questionType].question).split(/\(A\)/)[0],subject:q.subject,chapter:q.chapter,type:q.questionType,reports:rs.length,status:row?.status||'pending',verdict:p.verdict||'not_actionable',repair:p.repair||null,confidence:p.confidence||0,route:p.route||'faculty_review',urgency:urgency(rs,rr),search:rs.map(r=>r.comment).join(' '),failure:rr.some(r=>r.confidence===0)};}).sort((a,b)=>b.urgency-a.urgency||a.id.localeCompare(b.id));
     return json({cases,totalReports:reports.length,totalQuestions:questions.length,mode:runInfo.mode||'not_generated',model:runInfo.traces?.find(t=>!t.error)?.model||null,failures:runInfo.failures?.length||0});
    }
    const match=/^\/api\/cases\/([a-f0-9]{24})(\/actions)?$/.exec(path);if(!match)return json({error:'Not found'},404);
    const q=questions.find(q=>q._id===match[1]);if(!q||!groups.some(g=>g._id===q._id))return json({error:'Not found'},404);
    const p=proposal(q);
    if(match[2]&&req.method==='POST'){
     if(!csrfOK(req)||req.headers.get('x-csrf-token')!==sessions.get(scope))return json({error:'Session expired. Refresh before saving.'},403);
     const rate=rates.get(scope)||{at:Date.now(),count:0};if(Date.now()-rate.at>60000){rate.at=Date.now();rate.count=0;}if(++rate.count>30)return json({error:'Too many actions; wait one minute'},429);rates.set(scope,rate);
     const raw=await req.text();if(raw.length>20000)return json({error:'Patch too large'},413);const input=JSON.parse(raw);
     if(p.conflict&&input.action==='approve')return json({error:'Conflicting proposals require faculty editing'},422);
     const out=await store.action(scope,q._id,input,p);return json(out);
    }
    if(req.method==='GET'){
     const row=await store.detail(scope,q._id),b=row.question[row.question.questionType];let after=null,patchError=null;
     try{if(p.edit)after=patched(q,p.repair,p.edit)}catch(e){patchError=e.message;}
     const safeQ=q=>{const b=q[q.questionType];return{question:safeHTML(b.question),solution:safeHTML(b.solution),answer:b.answer,type:q.questionType}};
     const rs=reports.filter(r=>r.questionId===q._id).map(({studentId,...r})=>r),rr=results.filter(r=>r.questionId===q._id);
     return json({id:q._id,subject:q.subject,chapter:q.chapter,status:row.status,revision:row.revision,sourceVersion:version(row.question),source:safeQ(q),current:safeQ(row.question),after:after?safeQ(after):null,raw:{question:b.question,solution:b.solution,answer:b.answer},proposal:p,patchError,results:rr,reports:rs,audit:row.audit,images:images(q).filter(s=>/^https:\/\//i.test(s)),missingFigure:/figure|diagram|as shown/i.test(text(b.question))&&images(q).length===0,taxonomy:taxonomy.repairs,analysis:runInfo.analyses?.find(a=>a.questionId===q._id)||null});
    }
    return json({error:'Method not allowed'},405);
   }
   const file=path==='/'?'index.html':path.slice(1);if(!['index.html','app.js','style.css'].includes(file))return new Response('Not found',{status:404});
   return new Response(assets[file],{headers:{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
  }catch(e){return json({error:e.status?e.message:'Request failed. Check the server and retry.'},e.status||500);}
 };
}
