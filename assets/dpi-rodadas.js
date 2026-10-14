/* Desafio DPI: rounds of ten for existing minigames. Does not modify the question bank. */
(function(){
"use strict";
for(const name of ['shell','showHome']){
 const original=window[name];if(typeof original!=='function')continue;
 window[name]=function(...args){if(typeof miniTimer!=='undefined'&&miniTimer!==null){clearInterval(miniTimer);miniTimer=null;}return original.apply(this,args)};
}
const names={miniLightning:"Relâmpago",miniTarget:"Alvo",miniElimination:"Eliminação",miniAssociation:"Associação",miniHangman:"Forca",miniCrossword:"Palavras Cruzadas",miniDiagnosis:"Feche o Diagnóstico"};
const originalResult=window.miniResult;
let locked=false;
if(typeof originalResult!=="function")return;
let session=null;
for(const name of Object.keys(names)){
 const original=window[name];
 if(typeof original!=="function")continue;
 window[name]=function(...args){
  if(!session||session.name!==name||session.finished){session={name,round:0,correct:0,score:0,finished:false};locked=false;}
  const result=original.apply(this,args);
  window._miniQuestion=questionFor(name);
  return result;
 };
}
window.miniResult=function(ok,title,detail,pts){
 if(!session||session.finished||locked)return;
 locked=true;
 session.round++;if(ok)session.correct++;session.score+=ok?(pts||15):5;
 originalResult.apply(this,arguments);
 const panel=document.querySelector("#internal .panel");if(!panel){locked=false;return;}
 const feedback=panel.querySelector(".feedback:last-of-type");if(!feedback){locked=false;return;}
 const explanation=plainText(detail||"");
 const speech=(ok?"Boa escolha. ":"Vamos revisar esse raciocínio. ")+(explanation||plainText(title)||"Confira a explicação e tente de novo.");
 window.ELXMascotDirector?.teach(ok?"correct":"incorrect",speech);
 if(typeof window.dpiNarrate==="function")window.dpiNarrate("scientific",speech.slice(0,240));
 const question=activeQuestion(panel);
 const reference=referenceFor(question);
 if(reference){
  const link=document.createElement("a");link.className="dpi-applied-literature";link.href=reference;link.target="_blank";link.rel="noopener noreferrer";link.textContent="📚";link.title="Literatura aplicada";link.setAttribute("aria-label","Literatura aplicada — abrir a fonte desta questão");
  feedback.appendChild(link);
 }
 const nav=feedback.querySelector(".navrow");if(nav)nav.remove();
 const progress=document.createElement("p");progress.className="muted";progress.textContent="Questão "+session.round+" de 10 · Acertos: "+session.correct;feedback.appendChild(progress);
 const next=document.createElement("button");next.className="btn";
 if(session.round>=10){
  session.finished=true;next.textContent="CONCLUIR DESAFIO";
  next.onclick=()=>{if(!session)return;next.disabled=true;const summary=session;session=null;try{const p=typeof prof==='function'?prof():null;if(p){const rows=JSON.parse(localStorage.getItem('dpiScoresV8')||'[]');rows.push({name:p.name,cat:p.cat,score:summary.score,date:Date.now(),game:summary.name});localStorage.setItem('dpiScoresV8',JSON.stringify(rows))}}catch(e){console.warn('Não foi possível guardar o resultado neste aparelho',e)};locked=false;if(typeof window.dpiNarrate==="function")window.dpiNarrate("finish");window.shell("DESAFIO CONCLUÍDO",'<h2>'+summary.correct+'/10 acertos</h2><p>Você concluiu '+names[summary.name]+'.</p><button class="btn" onclick="challenges()">VOLTAR AOS DESAFIOS</button>');};
 }else{
  next.textContent="PRÓXIMA QUESTÃO";
  next.onclick=()=>{if(!session||!locked)return;const name=session.name;locked=false;next.disabled=true;if(typeof window.dpiNarrate==="function")window.dpiNarrate("next");const fn=window[name];if(typeof fn==="function")fn();};
 }
 feedback.appendChild(next);
};

function plainText(value){const box=document.createElement("span");box.textContent=String(value||"");return(box.textContent||"").replace(/\s+/g," ").trim()}
function activeQuestion(panel){
 const shown=plainText(panel?.querySelector(".miniStage > p")?.textContent||"");
 const candidates=[typeof state!=="undefined"&&state?.qs?.[state.i],window._lgQ,window._tgQ,window._elQ,window._dgQ,window._miniQuestion,...(Array.isArray(window._asQs)?window._asQs:[])].filter(q=>q&&typeof q==="object");
 if(shown){const match=candidates.find(q=>q.pergunta&&shown.includes(String(q.pergunta).trim()));if(match)return match}
 return window._miniQuestion||null;
}
function questionFor(name){
 const direct={miniLightning:window._lgQ,miniTarget:window._tgQ,miniElimination:window._elQ,miniDiagnosis:window._dgQ,miniAssociation:window._asQs?.[0]};
 if(direct[name])return direct[name];
 try{
  if(typeof BANK!="undefined"&&typeof normWord==="function"){
   const term=name==="miniHangman"?window._hgWord:name==="miniCrossword"?window._cw?.a:null;
   if(term)return BANK.find(q=>normWord(q.subtema||q.tema)===term)||null;
  }
 }catch(e){}
 return null;
}
function referenceFor(q){
 if(!q||typeof q!=="object")return null;
 let raw=q.referencia_url||q.fonte_url||q.url_referencia||q.doi_url||q.bibliografia_url||q.url_fonte;
 if(!raw){const doi=String(q.doi||q.referencia||q.fonte||"").match(/\b10\.\d{4,9}\/[^\s;,]+/i);if(doi)raw="https://doi.org/"+doi[0].replace(/[.)]+$/g,"")}
 if(typeof raw!=="string")return null;
 try{const u=new URL(raw,location.origin);if(u.protocol!=="https:"&&u.protocol!=="http:")return null;if(u.username||u.password)return null;if(u.origin===location.origin&&!u.pathname.startsWith("/biblioteca/")&&!u.pathname.startsWith("/data/biblioteca/"))return null;return u.href}catch(e){return null}
}

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
