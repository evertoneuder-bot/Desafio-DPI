'use strict';
// Isolated expansion: no changes to the approved game or its visual interface.
const modules=[
{title:'DPI Integrado',path:'../dados/novos-desafios/dpi-integrado.json'},
{title:'Qual Exame? Qual Projeção?',path:'../dados/novos-desafios/qual-exame-qual-projecao.json'},
{title:'Telerradiologia clínica',path:'../dados/novos-desafios/telerradiologia-clinica.json'},
{title:'Desafio do Olhar',path:'../dados/novos-desafios/desafio-do-olhar.json',images:true}
];
const root=document.getElementById('modules');
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
function validated(c,visual){
 const a=c?.alternatives,refs=c?.references;
 return c?.review_status==='validado'&&nonempty(c.id)&&nonempty(c.question)&&nonempty(c.correct_id)
 &&Array.isArray(a)&&a.length===4&&new Set(a.map(x=>x.id)).size===4
 &&a.every(x=>nonempty(x.id)&&nonempty(x.text)&&nonempty(x.rationale))
 &&a.some(x=>x.id===c.correct_id)
 &&Array.isArray(refs)&&refs.length>0&&refs.every(x=>nonempty(x.title)&&nonempty(x.locator)&&x.verified===true)
 &&(!visual||(Array.isArray(c.images)&&c.images.length>0&&c.images.every(i=>
 nonempty(i.path)&&nonempty(i.source)&&nonempty(i.license_or_permission)
 &&i.anonymized===true&&nonempty(i.reference_diagnosis))));
}
function render(m,data){
 const all=Array.isArray(data.cases)?data.cases:[],valid=all.filter(c=>validated(c,!!m.images));
 const section=document.createElement('section'),h=document.createElement('h2'),p=document.createElement('p'),button=document.createElement('button');
 h.textContent=m.title;p.textContent=`${all.length} registros • ${valid.length} homologados`;
 button.type='button';button.disabled=valid.length===0;
 button.textContent=valid.length?'Iniciar módulo validado':'Aguardando auditoria e liberação';
 section.append(h,p,button);root.append(section);
 if(!valid.length)return;
 const area=document.createElement('div');area.setAttribute('aria-live','polite');section.append(area);
 let index=0,score=0;
 const show=()=>{
  area.replaceChildren();
  if(index>=valid.length){
   const result=document.createElement('p');result.textContent=`Concluído: ${score} acertos em ${valid.length} questões.`;
   const restart=document.createElement('button');restart.type='button';restart.textContent='Recomeçar';
   restart.addEventListener('click',()=>{index=0;score=0;show();});area.append(result,restart);return;
  }
  const q=valid[index],title=document.createElement('h3'),context=document.createElement('p');
  title.textContent=`Questão ${index+1} de ${valid.length}: ${q.question}`;
  context.textContent=q.clinical_context||'';area.append(title,context);
  if(m.images){
   for(const im of q.images){const picture=document.createElement('img');picture.src=im.path;picture.alt=im.alt||'Imagem veterinária do desafio';picture.loading='eager';picture.style.maxWidth='100%';area.append(picture);}
  }
  const feedback=document.createElement('p'),next=document.createElement('button');
  next.type='button';next.textContent='Próxima questão';next.hidden=true;
  for(const a of q.alternatives){
   const option=document.createElement('button');option.type='button';option.textContent=`${a.id}. ${a.text}`;option.style.display='block';option.style.margin='8px 0';
   option.addEventListener('click',()=>{
    if(!next.hidden)return;
    const correct=a.id===q.correct_id;if(correct)score++;
    feedback.textContent=(correct?'Correto. ':'Resposta incorreta. ')+q.alternatives.find(x=>x.id===q.correct_id).rationale;
    next.hidden=false;
   });area.append(option);
  }
  next.addEventListener('click',()=>{index++;show();});area.append(feedback,next);
 };
 button.addEventListener('click',()=>{button.hidden=true;show();});
}
async function main(){
 root.replaceChildren();
 for(const m of modules){
  try{const response=await fetch(m.path,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);render(m,await response.json());}
  catch(error){const p=document.createElement('p');p.textContent=m.title+': indisponível ('+error.message+')';root.append(p);}
 }
}
main();
