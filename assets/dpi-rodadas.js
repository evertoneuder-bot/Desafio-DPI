/* Desafio DPI: rounds of ten for existing minigames. Does not modify the question bank. */
(function(){
"use strict";
const names={miniLightning:"Relâmpago",miniTarget:"Alvo",miniElimination:"Eliminação",miniAssociation:"Associação",miniHangman:"Forca",miniCrossword:"Palavras Cruzadas",miniDiagnosis:"Feche o Diagnóstico"};
// Clinical case demonstration must not be mistaken for a validated emergency simulator.
if(typeof window.caseView==="function"){
 window.caseView=function(){
  if(typeof window.shell==="function")window.shell("PLANTÃO VETERINÁRIO",'<p>O simulador clínico completo ainda está em validação. Nenhuma conduta de emergência será apresentada como caso científico sem revisão e fonte verificável.</p><button class="btn" onclick="challenges()">VOLTAR AOS DESAFIOS</button>');
 };
}
const originalResult=window.miniResult;
let locked=false;
if(typeof originalResult!=="function")return;
let session=null;
for(const name of Object.keys(names)){
 const original=window[name];
 if(typeof original!=="function")continue;
 window[name]=function(...args){
  if(!session||session.name!==name||session.finished){session={name,round:0,correct:0,finished:false};locked=false;}
  return original.apply(this,args);
 };
}
window.miniResult=function(ok,title,detail,pts){
 if(!session||session.finished||locked)return;
 locked=true;
 session.round++;if(ok)session.correct++;
 originalResult.apply(this,arguments);
 if(typeof window.dpiNarrate==="function")window.dpiNarrate(ok?"correct":"incorrect");
 const panel=document.querySelector("#internal .panel");if(!panel){locked=false;return;}
 const feedback=panel.querySelector(".feedback:last-of-type");if(!feedback){locked=false;return;}
 const nav=feedback.querySelector(".navrow");if(nav)nav.remove();
 const progress=document.createElement("p");progress.className="muted";progress.textContent="Questão "+session.round+" de 10 · Acertos: "+session.correct;feedback.appendChild(progress);
 const next=document.createElement("button");next.className="btn";
 if(session.round>=10){
  session.finished=true;next.textContent="CONCLUIR DESAFIO";
  next.onclick=()=>{if(!session)return;next.disabled=true;const summary=session;session=null;locked=false;if(typeof window.dpiNarrate==="function")window.dpiNarrate("finish");window.shell("DESAFIO CONCLUÍDO",'<h2>'+summary.correct+'/10 acertos</h2><p>Você concluiu '+names[summary.name]+'.</p><button class="btn" onclick="challenges()">VOLTAR AOS DESAFIOS</button>');};
 }else{
  next.textContent="PRÓXIMA QUESTÃO";
  next.onclick=()=>{if(!session||!locked)return;const name=session.name;locked=false;next.disabled=true;if(typeof window.dpiNarrate==="function")window.dpiNarrate("next");const fn=window[name];if(typeof fn==="function")fn();};
 }
 feedback.appendChild(next);
};


// References are optional for legacy questions; never invent a citation.
function referenceFor(q){
 if(!q||typeof q!=="object")return null;
 const raw=q.referencia_url||q.fonte_url||q.url_referencia||q.doi_url||q.bibliografia_url;
 if(typeof raw!=="string")return null;
 try{const u=new URL(raw,location.origin);if(u.protocol!=="https:"&&u.protocol!=="http:")return null;if(u.username||u.password)return null;if(u.origin===location.origin&&!u.pathname.startsWith("/biblioteca/")&&!u.pathname.startsWith("/data/biblioteca/"))return null;return u.href;}catch(e){return null;}
}
function showReference(q){
 const url=referenceFor(q),panel=document.querySelector("#internal .panel");
 if(!url||!panel||panel.querySelector(".dpi-check-reference"))return;
 const link=document.createElement("a");
 link.className="dpi-check-reference";
 link.href=url;link.target="_blank";link.rel="noopener noreferrer";
 link.textContent="↗ Checar referência";
 link.setAttribute("aria-label","Checar referência bibliográfica desta pergunta");
 link.style.cssText="display:inline-block;font-size:11px;line-height:1.3;opacity:.76;margin:3px 0 9px;text-decoration:underline";
 const question=panel.querySelector(".question-text,.miniStage > p");
 if(question)question.insertAdjacentElement("afterend",link);
}
const refObserver=new MutationObserver(()=>{
 const panel=document.querySelector("#internal .panel");
 if(!panel)return;
 const text=(panel.querySelector(".question-text,.miniStage > p")?.textContent||"").trim();
 if(!text)return;
 const candidates=[typeof state!=="undefined"&&state.qs&&state.qs[state.i],window._lgQ,window._tgQ,window._dgQ].filter(Boolean);
 const q=candidates.find(item=>text.includes(String(item.pergunta||"").trim())&&String(item.pergunta||"").trim());
 showReference(q);
});
refObserver.observe(document.body,{childList:true,subtree:true});

// Preserve scientific correctness when varying the position of quiz alternatives.
const oldRender=window.renderQ;
if(typeof oldRender==="function")window.renderQ=function(){
 try{
  const q=state.qs[state.i];
  if(q&&!q.dpiShuffled){
   const fields=["alternativa_a","alternativa_b","alternativa_c","alternativa_d"];
   const labels=["A","B","C","D"];
   const correct=labels.indexOf(String(q.letra_correta).trim().toUpperCase());
   if(correct>=0&&fields.every(k=>typeof q[k]==="string")){
    const order=[0,1,2,3];
    for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    const shuffled={...q,dpiShuffled:true};
    order.forEach((from,to)=>{shuffled[fields[to]]=q[fields[from]];});
    shuffled.letra_correta=labels[order.indexOf(correct)];
    state.qs[state.i]=shuffled;
   }
  }
 }catch(e){console.warn("DPI: alternativas originais preservadas",e);}
 return oldRender.apply(this,arguments);
};

const originalChallenges=window.challenges;
if(typeof originalChallenges==="function")window.challenges=function(...args){session=null;locked=false;return originalChallenges.apply(this,args);};
window.addEventListener("click",function(ev){const target=ev.target.closest("button");if(target&&/^(SAIR|← DESAFIOS|VOLTAR|INÍCIO)$/.test((target.textContent||"").trim())){session=null;locked=false;}});
})();