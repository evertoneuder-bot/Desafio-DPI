'use strict';
const modules=[
{title:'DPI Integrado',path:'../dados/novos-desafios/dpi-integrado.json'},
{title:'Qual Exame? Qual Projeção?',path:'../dados/novos-desafios/qual-exame-qual-projecao.json'},
{title:'Telerradiologia clínica',path:'../dados/novos-desafios/telerradiologia-clinica.json'},
{title:'Desafio do Olhar',path:'../dados/novos-desafios/desafio-do-olhar.json',images:true}
];
const root=document.getElementById('modules');
function validated(c,visual){const a=c?.alternatives;return c?.review_status==='validado'&&Array.isArray(a)&&a.length===4&&new Set(a.map(x=>x.id)).size===4&&a.some(x=>x.id===c.correct_id)&&Array.isArray(c.references)&&c.references.length>0&&(!visual||(Array.isArray(c.images)&&c.images.length>0&&c.images.every(i=>i.path&&i.source&&i.license_or_permission&&i.anonymized===true&&i.reference_diagnosis)));}
function render(m,data){const all=Array.isArray(data.cases)?data.cases:[];const valid=all.filter(c=>validated(c,!!m.images));const s=document.createElement('section');const h=document.createElement('h2');h.textContent=m.title;s.append(h);const p=document.createElement('p');p.textContent=`${all.length} registros • ${valid.length} homologados e disponíveis`;s.append(p);const b=document.createElement('button');b.type='button';b.disabled=valid.length===0;b.textContent=valid.length?'Iniciar módulo validado':'Aguardando dupla auditoria';s.append(b);if(valid.length){b.addEventListener('click',()=>{const q=valid[0];const v=document.createElement('p');v.textContent=q.question;s.append(v);b.disabled=true;});}root.append(s);}
async function main(){root.replaceChildren();for(const m of modules){try{const r=await fetch(m.path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);render(m,await r.json());}catch(e){const p=document.createElement('p');p.textContent=m.title+': indisponível ('+e.message+')';root.append(p);}}}main();
