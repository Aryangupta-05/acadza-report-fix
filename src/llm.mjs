import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';
const ajv=new Ajv({allErrors:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export class ModelClient {
 constructor({provider=process.env.LLM_PROVIDER||'gemini',model,cache='.cache',fetcher=fetch,retries=1,timeout=90000}={}) {
  this.provider=provider;this.model=model||(provider==='gemini'?process.env.GEMINI_MODEL||'gemini-2.5-flash':process.env.OPENAI_MODEL);this.cache=cache;this.fetcher=fetcher;this.retries=retries;this.timeout=timeout;this.calls=0;this.hits=0;this.traces=[];
 }
 async generate(system,data,schema,phase) {
  const key=this.provider==='gemini'?process.env.GEMINI_API_KEY:process.env.OPENAI_API_KEY;
  if(!key)throw new Error('Missing '+(this.provider==='gemini'?'GEMINI_API_KEY':'OPENAI_API_KEY'));
  if(!this.model)throw new Error('An explicit provider model is required');
  const input=JSON.stringify({UNTRUSTED_DATA:data});
  const digest=createHash('sha256').update(JSON.stringify({provider:this.provider,model:this.model,system,input,schema})).digest('hex');
  const path=`${this.cache}/${digest}.json`,valid=ajv.compile(schema);
  try{const stored=JSON.parse(await readFile(path,'utf8'));if(valid(stored.output)){this.hits++;this.traces.push({phase,cache:true,digest,model:this.model});return stored.output;}}catch{}
  for(let attempt=0;attempt<=this.retries;attempt++) {
   const started=Date.now();let status;
   try {
    let url,body,headers={'Content-Type':'application/json'};
    if(this.provider==='gemini') {
     url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
     headers['x-goog-api-key']=key;
     body={systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:input}]}],generationConfig:{responseMimeType:'application/json',responseJsonSchema:schema,temperature:0.1,maxOutputTokens:10000}};
    } else {
     url='https://api.openai.com/v1/responses';headers.Authorization=`Bearer ${key}`;
     body={model:this.model,input:[{role:'system',content:system},{role:'user',content:input}],text:{format:{type:'json_schema',name:'triage',strict:true,schema}},max_output_tokens:10000};
    }
    this.calls++;const res=await this.fetcher(url,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(this.timeout)});status=res.status;
    // Do not log raw provider error bodies: they may contain secrets or reflected input.
    if(!res.ok){const e=new Error('Provider HTTP '+res.status);e.retryable=[500,502,503,504].includes(res.status);e.rateLimited=res.status===429;throw e;}
    const raw=await res.json();
    const outputText=this.provider==='gemini'?raw.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join(''):raw.output?.filter(o=>o.type==='message').flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');
    if(!outputText)throw new Error('Model refusal or empty output');
    const output=JSON.parse(outputText);if(!valid(output))throw new Error('Structured output failed schema validation: '+ajv.errorsText(valid.errors));
    const meta={phase,provider:this.provider,model:this.model,cache:false,digest,attempt,status,elapsedMs:Date.now()-started,usage:raw.usageMetadata||raw.usage||null,responseId:raw.responseId||raw.id||null};
    this.traces.push(meta);await mkdir(this.cache,{recursive:true});await writeFile(path+'.tmp',JSON.stringify({output,meta},null,2));await rename(path+'.tmp',path);return output;
   }catch(e){this.traces.push({phase,digest,model:this.model,attempt,status:status||null,elapsedMs:Date.now()-started,error:e.message.replaceAll(key,'[REDACTED]')});if(attempt===this.retries||e.retryable===false)throw e;await sleep(Math.min(1000*2**attempt,8000));}
  }
 }
}
