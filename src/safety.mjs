import {createHash} from 'node:crypto';
import Ajv from 'ajv';
import taxonomy from '../data/taxonomy.json' with {type:'json'};
import {text} from './content.mjs';
export {taxonomy};
export const version = q => createHash('sha256').update(JSON.stringify(q)).digest('hex');
export class SafetyError extends Error { constructor(message,status=422) {super(message);this.status=status;} }
const val={anyOf:[{type:'string'},{type:'array',items:{type:'string'}}]};
export const editSchema={type:'object',additionalProperties:false,required:['field','find','replace'],properties:{field:{type:'string',enum:['question','solution','answer','questionType']},find:val,replace:val}};
export const resultSchema={type:'object',additionalProperties:false,required:['reportId','questionId','verdict','repair','edit','route','confidence','evidence','student_reply'],properties:{reportId:{type:'string'},questionId:{type:'string'},verdict:{type:'string',enum:Object.keys(taxonomy.verdicts)},repair:{anyOf:[{type:'string',enum:Object.keys(taxonomy.repairs)},{type:'null'}]},edit:{anyOf:[editSchema,{type:'null'}]},route:{type:'string',enum:['auto_apply','faculty_review','no_change']},confidence:{type:'number',minimum:0,maximum:1},evidence:{type:'string',minLength:5,maxLength:2200},student_reply:{type:'string',minLength:5,maxLength:700}}};
const ajv=new Ajv({allErrors:true});
export const schemaValid=ajv.compile(resultSchema);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validAnswer(type,value) {
 if(type==='scq') return typeof value==='string'&&/^[ABCD]$/.test(value);
 if(type==='integerQuestion') return typeof value==='string'&&/^-?\d+$/.test(value);
 return type==='mcq'&&Array.isArray(value)&&value.length>0&&value.every(v=>typeof v==='string'&&/^[ABCD]$/.test(v))&&new Set(value).size===value.length;
}
const tags=s=>(s.match(/<\/?\s*[a-z][^>]*>/gi)||[]).map(v=>v.toLowerCase());
const math=s=>(s.match(/<math\b[\s\S]*?<\/math>/gi)||[]);
const image=s=>(s.match(/<img\b[^>]*>/gi)||[]);
const optionOffset=s=>{let m=/(?:\(\s*A\s*\)|\(A\))/.exec(text(s));return m?.index??-1;};
export function validateResult(r,q,report) {
 if(!schemaValid(r)) throw new SafetyError('Invalid result schema: '+ajv.errorsText(schemaValid.errors));
 if(r.questionId!==q._id||r.reportId!==report.reportId||report.questionId!==q._id) throw new SafetyError('Result identity mismatch');
 if(r.verdict!=='defect'&&(r.repair!==null||r.edit!==null||r.route==='auto_apply')) throw new SafetyError('Non-defect cannot carry a repair');
 if(r.verdict==='defect'&&r.repair===null) throw new SafetyError('Defect needs taxonomy repair');
 const repair=taxonomy.repairs[r.repair];
 if(repair&&!repair.auto&&(r.edit!==null||r.route!=='faculty_review')) throw new SafetyError('Manual-only repair: recommendation only');
 if(r.edit===null&&r.route==='auto_apply') throw new SafetyError('Cannot auto-apply absent patch');
 if(/\bfixed\b|\bcorrected\s+(?:it|now)\b/i.test(r.student_reply)&&r.edit!==null) throw new SafetyError('Reply falsely claims persisted fix');
 const sentences=r.student_reply.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);if(sentences.length>3)throw new SafetyError('Reply must have at most three sentences');
 if(r.edit) validatePatch(q,r.repair,r.edit);
 return r;
}
export function validatePatch(q,repairKey,edit,{facultyAuthored=false}={}) {
 const repair=taxonomy.repairs[repairKey];
 if(!repair) throw new SafetyError('Unknown repair');
 if(!facultyAuthored&&(!repair.auto||!repair.fields.includes(edit.field))) throw new SafetyError('Repair field outside approved scope');
 if(facultyAuthored&&!['question','solution','answer'].includes(edit.field)) throw new SafetyError('Faculty authoring only supports content fields');
 const b=q[q.questionType];if(!b)throw new SafetyError('Unsupported production question payload');
 const old=edit.field==='questionType'?q.questionType:b[edit.field];
 if(old===undefined)throw new SafetyError('Field absent');
 if(edit.field==='answer') {
   if(!eq(old,edit.find))throw new SafetyError('Answer precondition mismatch');
   if(!validAnswer(q.questionType,edit.replace))throw new SafetyError('Invalid answer format for question type');
 } else {
   if(typeof edit.find!=='string'||typeof edit.replace!=='string')throw new SafetyError('Text patch requires strings');
   if(!edit.find.trim()) {
     // Only a wholly empty solution may receive an explicitly typed missing-solution insertion.
     if(!(repairKey==='solution_missing'&&edit.field==='solution'&&old===''&&edit.find===''&&edit.replace.trim()))throw new SafetyError('Empty insertion anchor rejected');
   } else if(old.split(edit.find).length!==2) throw new SafetyError('Exact anchor must match once');
   if(edit.field!=='questionType') {
     if(!eq(image(edit.find),image(edit.replace)))throw new SafetyError('Image moves or changes forbidden');
     if(/<(?:script|iframe|object|svg|style)\b|\son\w+\s*=|javascript:/i.test(edit.replace))throw new SafetyError('Unsafe HTML in patch');
   }
 }
 if(eq(edit.find,edit.replace))throw new SafetyError('Patch makes no change');
 if(edit.field==='questionType') {
   if(repairKey!=='type_mismatch'||!['scq','mcq','integerQuestion'].includes(edit.replace))throw new SafetyError('Invalid type migration');
   if(!(q.questionType==='mcq'&&edit.replace==='scq'&&Array.isArray(b.answer)&&b.answer.filter(v=>v).length===1&&/^[ABCD]$/.test(b.answer.filter(v=>v)[0])))throw new SafetyError('Unproven migration: faculty must author a valid schema separately');
   return {eligible:false,reasons:['Question-type migration requires faculty approval']};
 }
 if(!facultyAuthored) {
 const before=text(String(edit.find)), after=text(String(edit.replace));
 if(['spelling','noise','exam_reference'].includes(repairKey)) {
   if(!eq(math(String(edit.find)),math(String(edit.replace)))||!eq(tags(String(edit.find)),tags(String(edit.replace))))throw new SafetyError('Cosmetic patch changes markup or math');
 }
 if(repairKey==='spelling') {
   if(!/^[A-Za-z ’'\-]+$/.test(before+after))throw new SafetyError('Spelling must be words only');
   const norm=v=>v.toLowerCase().replace(/\s/g,'');
   // A deliberately small verified dictionary. Other spelling proposals require author review.
   const dictionary={'epithellialtisue':'epithelialtissue','plexux':'plexus','shurbs':'shrubs','mere':'more','prominant':'prominent','riceis':'riceis'};
   if(dictionary[norm(before)]!==norm(after))throw new SafetyError('Spelling pair outside verified dictionary');
 }
 if(repairKey==='noise'&&(!before||after!==''||!(/^(?:space for rough work|rough work|question\s*\d+|q\.?\s*\d+|source\s*:.*)$/i.test(before))))throw new SafetyError('Noise removal is not an approved source label');
 if(repairKey==='exam_reference'&&!(after===''&&/^\(?\s*(?:JEE(?: Main| Advanced)?|NEET|AIPMT)\s+\d{4}\s*\)?$/i.test(before)))throw new SafetyError('Only exam reference label can be removed');
 if(repairKey==='answer_form'&&!(edit.field==='question'&&edit.replace.includes(edit.find)&&/^\s*(?:\(in (?:N|newtons|cm|m|seconds|s|volts|V)\)|in (?:N|newtons|cm|m|seconds|s|volts|V))[ .]*$/i.test(edit.replace.replace(edit.find,''))))throw new SafetyError('Answer form must only add an approved unit');
 if(repairKey==='markup_leak') {
   const frac=/^\\frac\{(\d+)\}\{(\d+)\}$/.exec(edit.find);
   const expected=frac?`<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>${frac[1]}</mn><mn>${frac[2]}</mn></mfrac></math>`:null;
   if(!expected||edit.replace!==expected)throw new SafetyError('Markup equivalence not proven by the deterministic fraction converter');
 }
 if(repairKey==='notation') {
   if(tags(edit.find).length||tags(edit.replace).length)throw new SafetyError('Complex notation changes require faculty authorship');
   const a=String(edit.find),b=String(edit.replace);let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;
   const longer=a.length>b.length?a:b,shorter=a.length>b.length?b:a;
   if(Math.abs(a.length-b.length)!==1||!/[()\[\]{}^]/.test(longer[i]||'')||longer.slice(0,i)+longer.slice(i+1)!==shorter)throw new SafetyError('Notation patch is not a single lost bracket or exponent marker');
 }
 if(repairKey==='option_repair') {
   const next=b.question.replace(edit.find,edit.replace),a=optionOffset(b.question),z=optionOffset(next);
   if(a<0||z<0||text(b.question).slice(0,a)!==text(next).slice(0,z))throw new SafetyError('Option repair changes stem');
   if(!/\([ABCD]\)/.test(before+after))throw new SafetyError('Option edit must include an option anchor');
 }
 if(repairKey==='stem_data') {
   if(edit.field!=='question'||!edit.replace.includes(edit.find))throw new SafetyError('Stem-data guard accepts explicit additive missing data only');
   const next=b.question.replace(edit.find,edit.replace),a=optionOffset(b.question),z=optionOffset(next);
   if(a>=0&&(z<0||text(b.question).slice(a)!==text(next).slice(z)))throw new SafetyError('Stem-data patch changes options');
   const additions=after.replace(before,'').match(/\d+(?:\.\d+)?/g)||[];
   if(additions.length===0||!additions.every(n=>text(b.solution).includes(n)))throw new SafetyError('Missing stem value must be explicitly supported by stored solution');
 }
 if(repairKey==='solution_missing'&&b.solution.trim()!=='')throw new SafetyError('Missing solution operation requires truly empty solution');
 if(repairKey==='solution_missing'&&!text(edit.replace).includes(Array.isArray(b.answer)?b.answer.join(', '):b.answer))throw new SafetyError('New solution does not state the keyed answer');
 }
 const lowRisk=['spelling','noise','exam_reference','markup_leak'];
 return {eligible:!facultyAuthored&&lowRisk.includes(repairKey),reasons:lowRisk.includes(repairKey)?[]:['Semantic repair requires faculty verification or executable proof']};
}
export function patched(q,repair,edit,options={}) {
 validatePatch(q,repair,edit,options);const next=structuredClone(q),oldType=q.questionType;
 if(edit.field==='questionType') {next.questionType=edit.replace;next[edit.replace]=next[oldType];delete next[oldType];next[edit.replace].answer=next[edit.replace].answer.filter(Boolean)[0];}
 else if(edit.field==='answer') next[oldType].answer=structuredClone(edit.replace);
 else next[oldType][edit.field]=edit.find===''?edit.replace:next[oldType][edit.field].replace(edit.find,edit.replace);
 // Everything outside the explicitly authorized field remains byte-equivalent in JSON.
 return next;
}
