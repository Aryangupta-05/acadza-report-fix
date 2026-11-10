import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createDatabase,ReviewStore} from './store.mjs';
import {createApp} from './app.mjs';
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const questions=await read('data/questions.json'),reports=await read('data/reports.json');
let results=[],runInfo={};try{results=await read('results.json');runInfo=await read('docs/engine-run.json')}catch{}
if(process.env.NODE_ENV==='production'&&!process.env.DATABASE_URL)throw new Error('Production requires durable DATABASE_URL; refusing ephemeral SQLite');
const db=await createDatabase();await db.init();const store=new ReviewStore(db,questions),assets=Object.fromEntries(await Promise.all(['index.html','app.js','style.css'].map(async name=>[name,await readFile('public/'+name,'utf8')])));
try{assets['demo.mp4']=await readFile('public/demo.mp4')}catch{}
const app=createApp({store,questions,reports,results,runInfo,assets});
const server=http.createServer(async(req,res)=>{try{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>25000){res.writeHead(413);res.end();return;}chunks.push(chunk);}const scheme=process.env.NODE_ENV==='production'?'https':'http';const request=new Request(scheme+'://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});const out=await app(request);res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()));}catch{res.writeHead(500);res.end('Server request failed');}});
server.listen(Number(process.env.PORT||3100),'0.0.0.0',()=>console.log('Acadza console: http://localhost:'+(process.env.PORT||3100)));
process.on('SIGTERM',()=>server.close(async()=>{await db.close();process.exit(0)}));
