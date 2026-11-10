import sanitize from 'sanitize-html';
export const mathTags = 'math mrow mi mn mo msup msub msubsup mfrac msqrt mroot mstyle mspace mtext mover munder munderover mfenced mtable mtr mtd menclose mpadded mphantom semantics annotation'.split(' ');
export function safeHTML(value='') {
  return sanitize(String(value), {
    allowedTags: ['p','br','div','span','h1','h2','h3','h4','b','strong','i','em','u','sub','sup','ul','ol','li','table','tr','td','th','img',...mathTags],
    allowedAttributes: {'*': [], math:['xmlns','display'], mo:['stretchy','fence','form'], mstyle:['displaystyle','mathvariant'], mi:['mathvariant'], mspace:['width','height','linebreak'], img:['src','alt','width','height']},
    allowedSchemes:['https'], allowProtocolRelative:false,
    transformTags: {img: (tag,attrs)=>({tagName:'img',attribs:{src:/^https:\/\//i.test(attrs.src||'')?attrs.src:'',alt:attrs.alt||'Question diagram',loading:'lazy',referrerpolicy:'no-referrer'}})},
    nonTextTags:['script','style','textarea','noscript','iframe','object','svg'],
  });
}
export const text = value => sanitize(String(value??''), {allowedTags:[],allowedAttributes:{}}).replace(/&nbsp;/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&').replace(/&minus;/g,'−').replace(/&mu;/g,'μ').replace(/&pi;/g,'π').replace(/\s+/g,' ').trim();
export function images(question) { const p=question[question.questionType]; return [...p.quesImages,...p.solutionImages].map(v=>typeof v==='string'?v:v?.url||v?.src||'').filter(Boolean); }
