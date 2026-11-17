'use strict';
const modules=[
{title:'DPI Integrado',path:'../dados/novos-desafios/dpi-integrado.json'},
{title:'Qual Exame? Qual Projeção?',path:'../dados/novos-desafios/qual-exame-qual-projecao.json'},
{title:'Telerradiologia clínica',path:'../dados/novos-desafios/telerradiologia-clinica.json'},
{title:'Desafio do Olhar',path:'../dados/novos-desafios/desafio-do-olhar.json',visual:true}
];
const root=document.getElementById('modules');
const status=document.getElementById('error');
const preview=new URLSearchParams(location.search).get('avaliacao')==='preliminar';
function structurallyValid(c){const a=c?.alternatives;return typeof c?.question==='string'&&Array.isArray(a)&&a.length===4&&new Set(a.map(x=>x.id)).size===4&&a.some(x=>x.id===c.correct_id)&&Array.isArray(c.references)&&c.references.length>0;}
function imageReady(c){return Array.isArray(c.images)&&c.images.length>0&&c.images.every(i=>i.path&&i.source&&i.license_or_permission&&i.anonymized===true&&i.reference_diagnosis);}
function playable(c,visual){return structurallyValid(c)&&c.review_status==='validado'&&(!visual||imageReady(c));}
function node(tag,content,cls){const e=document.createElement(tag);if(content!==undefined)e.textContent=content;if(cls)e.className=cls;return e;}
function startQuiz(section,cases,visual){section.replaceChildren(node('h2',section.dataset.title));let index=0,score=0,answered=false;
const progress=node('p');const question=node('h3');const answers=node('div');const feedback=node('p');feedback.setAttribute('aria-live','polite');const next=node('button','Próxima questão');next.type='button';next.hidden=true;const exit=node('button','Voltar aos módulos');exit.type='button';exit.addEventListener('click',()=>location.reload());section.append(progress,question,answers,feedback,next,exit);
function render(){if(index>=cases.length){question.textContent='Rodada concluída';progress.textContent=`Pontuação: ${score} de ${cases.length}`;answers.replaceChildren();feedback.textContent='Resultado apenas desta sessão de avaliação; não altera ranking ou pontuação oficial.';next.hidden=true;return;}
const c=cases[index];answered=false;progress.textContent=`Questão ${index+1} de ${cases.length} · Acertos: ${score}`;question.textContent=c.question;answers.replaceChildren();feedback.textContent='';next.hidden=true;
if(visual){const img=document.createElement('img');img.src=c.images[0].path;img.alt=c.images[0].alt||'Imagem diagnóstica para interpretação';img.style.cssText='max-width:100%;height:auto';answers.append(img);}
for(const a of c.alternatives){const btn=node('button',a.id+' — '+a.text);btn.type='button';btn.style.cssText='display:block;margin:8px 0;text-align:left;width:100%';btn.addEventListener('click',()=>{if(answered)return;answered=true;const correct=a.id===c.correct_id;if(correct)score++;feedback.textContent=(correct?'Resposta correta. ':'Resposta incorreta. ')+(c.rationale||c.alternatives.find(x=>x.id===c.correct_id)?.rationale||'')+' Gabarito: '+c.correct_id;for(const el of answers.querySelectorAll('button'))el.disabled=true;next.hidden=false;});answers.append(btn);}
}
next.addEventListener('click',()=>{index++;render();});render();}
async function main(){root.replaceChildren();if(preview){root.append(node('p','AVALIAÇÃO PRELIMINAR: conteúdo não homologado. Os resultados não integram o jogo principal.','status'));}else{root.append(node('p','Modo seguro: somente questões com dupla revisão validada podem ser jogadas.','status'));}
for(const m of modules){const section=node('section');section.dataset.title=m.title;root.append(section);section.append(node('h2',m.title));try{const response=await fetch(m.path,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();const all=Array.isArray(data.cases)?data.cases:[];const ready=all.filter(c=>playable(c,!!m.visual));const sample=!m.visual&&preview?all.filter(structurallyValid):ready;section.append(node('p',`${all.length} registros · ${ready.length} homologados · ${sample.length} disponíveis nesta visualização`));const button=node('button',sample.length?'Iniciar avaliação preliminar':'Aguardando validação');button.type='button';button.disabled=!sample.length;section.append(button);button.addEventListener('click',()=>startQuiz(section,sample,m.visual));if(m.visual&&!ready.length)section.append(node('p','Desafios visuais indisponíveis: imagens e licenças ainda não verificadas.','muted'));}catch(e){section.append(node('p','Falha ao carregar: '+e.message));status.textContent='Verifique a publicação dos arquivos JSON no mesmo domínio.';}}
}main();
