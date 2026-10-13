/* Desafio DPI: rounds of ten for existing minigames. Does not modify the question bank. */
(function(){
"use strict";
const names={miniLightning:"Relâmpago",miniTarget:"Alvo",miniElimination:"Eliminação",miniAssociation:"Associação",miniHangman:"Forca",miniCrossword:"Palavras Cruzadas",miniDiagnosis:"Feche o Diagnóstico"};
const originalResult=window.miniResult;
let locked=false;
if(typeof originalResult!=="function")return;
let session=null;
for(const name of Object.keys(names)){
 const original=window[name];
 if(typeof original!=="function")continue;
 window[name]=function(...args){
  if(!session||session.name!==name||session.finished){session={name,round:0,correct:0,finished:false};}
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
  next.onclick=()=>{const summary=session;session=null;locked=false;if(typeof window.dpiNarrate==="function")window.dpiNarrate("finish");window.shell("DESAFIO CONCLUÍDO",'<h2>'+summary.correct+'/10 acertos</h2><p>Você concluiu '+names[summary.name]+'.</p><button class="btn" onclick="challenges()">VOLTAR AOS DESAFIOS</button>');};
 }else{
  next.textContent="PRÓXIMA QUESTÃO";
  next.onclick=()=>{if(!session||!locked)return;const name=session.name;locked=false;next.disabled=true;if(typeof window.dpiNarrate==="function")window.dpiNarrate("next");const fn=window[name];if(typeof fn==="function")fn();};
 }
 feedback.appendChild(next);
};
const originalChallenges=window.challenges;
if(typeof originalChallenges==="function")window.challenges=function(...args){session=null;locked=false;return originalChallenges.apply(this,args);};
window.addEventListener("click",function(ev){const target=ev.target.closest("button");if(target&&/^(SAIR|← DESAFIOS|VOLTAR|INÍCIO)$/.test((target.textContent||"").trim())){session=null;locked=false;}});
})();