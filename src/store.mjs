import {mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {version,patched,SafetyError} from './safety.mjs';
const ddl=[
 'CREATE TABLE IF NOT EXISTS cases (workspace TEXT NOT NULL, question_id TEXT NOT NULL, question_json TEXT NOT NULL, source_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT \'pending\', PRIMARY KEY (workspace,question_id))',
 'CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, workspace TEXT NOT NULL, question_id TEXT NOT NULL, action TEXT NOT NULL, at TEXT NOT NULL, actor TEXT NOT NULL, reason TEXT NOT NULL, source_version TEXT NOT NULL, resulting_version TEXT NOT NULL, patch_json TEXT, provenance TEXT NOT NULL, request_id TEXT NOT NULL, UNIQUE(workspace,request_id))',
 'CREATE INDEX IF NOT EXISTS audit_case ON audit(workspace,question_id,at)',
];
export async function createDatabase({url=process.env.DATABASE_URL,path=process.env.DATABASE_PATH||'runtime/acadza.sqlite'}={}) {
 if(url){const {Pool}=await import('pg');const pool=new Pool({connectionString:url,max:5});return{kind:'postgres',async tx(fn){const c=await pool.connect();try{await c.query('BEGIN');const v=await fn({run:async(sql,args=[])=>{let n=0;return c.query(sql.replace(/\?/g,()=>'$'+(++n)),args);},get:async(sql,args=[])=>{let n=0;return(await c.query(sql.replace(/\?/g,()=>'$'+(++n)),args)).rows[0]},all:async(sql,args=[])=>{let n=0;return(await c.query(sql.replace(/\?/g,()=>'$'+(++n)),args)).rows}});await c.query('COMMIT');return v;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}},async init(){for(const sql of ddl)await pool.query(sql);},close:()=>pool.end()};}
 await mkdir(dirname(path),{recursive:true});const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(path);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');let tail=Promise.resolve();
 const api={run:async(sql,args=[])=>db.prepare(sql).run(...args),get:async(sql,args=[])=>db.prepare(sql).get(...args),all:async(sql,args=[])=>db.prepare(sql).all(...args)};
 return{kind:'sqlite',async init(){for(const sql of ddl)db.exec(sql)},tx(fn){const job=tail.then(async()=>{db.exec('BEGIN IMMEDIATE');try{const v=await fn(api);db.exec('COMMIT');return v;}catch(e){db.exec('ROLLBACK');throw e;}});tail=job.catch(()=>{});return job;},close:async()=>{await tail;db.close()}};
}
export class ReviewStore {
 constructor(db,questions){this.db=db;this.questions=questions;}
 async seed(workspace){await this.db.tx(async t=>{for(const q of this.questions)await t.run('INSERT INTO cases(workspace,question_id,question_json,source_json) VALUES(?,?,?,?) ON CONFLICT(workspace,question_id) DO NOTHING',[workspace,q._id,JSON.stringify(q),JSON.stringify(q)]);});}
 async list(workspace){return this.db.tx(t=>t.all('SELECT * FROM cases WHERE workspace=?',[workspace]));}
 async detail(workspace,id){return this.db.tx(async t=>{const row=await t.get('SELECT * FROM cases WHERE workspace=? AND question_id=?',[workspace,id]);if(!row)throw new SafetyError('Case not found',404);return{...row,question:JSON.parse(row.question_json),source:JSON.parse(row.source_json),audit:await t.all('SELECT * FROM audit WHERE workspace=? AND question_id=? ORDER BY at DESC,id DESC',[workspace,id])};});}
 async action(workspace,id,input,proposal){
  if(!['approve','edit','reject'].includes(input.action))throw new SafetyError('Invalid action');
  if(typeof input.reason!=='string'||input.reason.trim().length<3||input.reason.length>1000)throw new SafetyError('A review reason is required');
  if(!/^[a-zA-Z0-9-]{8,80}$/.test(input.requestId||''))throw new SafetyError('Valid idempotency key required');
  return this.db.tx(async t=>{
   const duplicate=await t.get('SELECT * FROM audit WHERE workspace=? AND request_id=?',[workspace,input.requestId]);if(duplicate){if(duplicate.question_id!==id)throw new SafetyError('Idempotency key used for another case',409);return{duplicate:true,audit:duplicate};}
   const lock=this.db.kind==='postgres'?' FOR UPDATE':'';
   const row=await t.get('SELECT * FROM cases WHERE workspace=? AND question_id=?'+lock,[workspace,id]);if(!row)throw new SafetyError('Case not found',404);
   const q=JSON.parse(row.question_json),sourceVersion=version(q);
   if(row.status!=='pending'||input.revision!==row.revision||input.sourceVersion!==sourceVersion)throw new SafetyError('This case changed. Reload before reviewing.',409);
   let next=q,patch=null,status='rejected',provenance='faculty_review';
   if(input.action!=='reject') {
    patch=input.action==='edit'?input.edit:proposal.edit;
    if(input.action==='edit'&&!patch)throw new SafetyError('An edited patch is required');
    if(input.action==='approve'&&proposal.sourceVersion!==sourceVersion)throw new SafetyError('Proposal is stale',409);
    const facultyAuthored=input.action==='edit'&&proposal.manualOnly;
    if(facultyAuthored&&input.facultyAuthored!==true)throw new SafetyError('Confirm faculty-authored content');
    if(patch){next=patched(q,proposal.repair,patch,{facultyAuthored});status='applied';provenance=facultyAuthored?'faculty_authored':input.action==='edit'?'faculty_edited_ai_proposal':'ai_proposal_faculty_approved';}
    else status='reviewed';
   }
   await t.run('UPDATE cases SET question_json=?,revision=revision+1,status=? WHERE workspace=? AND question_id=? AND revision=?',[JSON.stringify(next),status,workspace,id,input.revision]);
   const audit={id:randomUUID(),workspace,question_id:id,action:input.action,at:new Date().toISOString(),actor:'Demo faculty reviewer',reason:input.reason.trim(),source_version:sourceVersion,resulting_version:version(next),patch_json:patch?JSON.stringify(patch):null,provenance,request_id:input.requestId};
   await t.run('INSERT INTO audit(id,workspace,question_id,action,at,actor,reason,source_version,resulting_version,patch_json,provenance,request_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',Object.values(audit));
   return{status,revision:row.revision+1,audit,question:next};
  });
 }
}
