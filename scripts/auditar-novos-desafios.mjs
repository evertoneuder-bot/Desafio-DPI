// Auditoria estrutural reproduzível; não substitui revisão científica.
import {readFileSync} from 'node:fs';
const files=['dpi-integrado','qual-exame-qual-projecao','telerradiologia-clinica','desafio-do-olhar'];
let failures=0;
for(const file of files){
 const data=JSON.parse(readFileSync(new URL('../dados/novos-desafios/'+file+'.json',import.meta.url),'utf8'));
 const cases=data.cases||[],ids=new Set();let longest=0,invalid=0,approved=0,imaged=0;
 for(const c of cases){
  const a=c.alternatives||[];
  const valid=typeof c.id==='string'&&!ids.has(c.id)&&typeof c.question==='string'&&a.length===4&&new Set(a.map(x=>x.id)).size===4&&a.some(x=>x.id===c.correct_id)&&Array.isArray(c.references)&&c.references.length>0;
  if(!valid)invalid++;ids.add(c.id);
  if(c.review_status==='validado')approved++;
  if(Array.isArray(c.images)&&c.images.length)imaged++;
  if(a.length===4){const max=Math.max(...a.map(x=>String(x.text||'').length));if(a.find(x=>x.id===c.correct_id)?.text?.length===max)longest++;}
 }
 console.log(JSON.stringify({file,total:cases.length,invalid,approved,withImages:imaged,correctIsLongest:longest,percentLongest:cases.length?Math.round(longest*100/cases.length):0}));
 if(invalid)failures++;
}
if(failures)process.exitCode=1;
