/* Conversational answers: transcribe freely, never grade by text length or exact wording. */
(function(){
"use strict";
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null,active=false;
let currentQuestion="";
function stop(){if(recognition){try{recognition.stop();}catch(e){}}active=false;}
function attach(){
 const question=document.querySelector("#internal .question-text");
 if(!question||document.getElementById("dpi-answer-by-voice"))return;
 const panel=document.querySelector("#internal .panel");if(!panel)return;
 const questionText=(question.textContent||"").trim();
 if(currentQuestion!==questionText){stop();currentQuestion=questionText;}
 const wrap=document.createElement("section");wrap.id="dpi-answer-by-voice";
 wrap.style.cssText="margin:12px 0;padding:12px;border:1px solid #607d8b;border-radius:12px";
 wrap.innerHTML='<button type="button" class="btn secondary" id="dpi-mic-answer">🎙️ RESPONDER COM MINHAS PALAVRAS</button><p class="muted">Explique com suas palavras. Respostas longas são bem-vindas. A transcrição não recebe nota automática nesta versão.</p><textarea id="dpi-answer-transcript" rows="3" aria-label="Minha resposta por voz" style="width:100%;box-sizing:border-box" placeholder="Sua resposta aparece aqui; você pode corrigir o texto."></textarea><p id="dpi-mic-status" role="status" class="muted"></p>';
 question.after(wrap);
 const button=wrap.querySelector("#dpi-mic-answer"),textarea=wrap.querySelector("#dpi-answer-transcript"),status=wrap.querySelector("#dpi-mic-status");
 if(!Recognition){button.disabled=true;status.textContent="Reconhecimento de voz indisponível neste navegador. Digite sua explicação livremente.";return;}
 button.addEventListener("click",()=>{
  if(active){stop();status.textContent="Gravação encerrada. Você pode revisar a transcrição.";button.textContent="🎙️ RESPONDER COM MINHAS PALAVRAS";return;}
  if(recognition)stop();
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  recognition=new Recognition();recognition.lang="pt-BR";recognition.continuous=true;recognition.interimResults=true;
  const prefix=textarea.value.trim();let finalized="";
  recognition.onresult=ev=>{let interim="";finalized="";for(let i=0;i<ev.results.length;i++){const t=ev.results[i][0].transcript;if(ev.results[i].isFinal)finalized+=t+" ";else interim+=t;}textarea.value=[prefix,finalized.trim(),interim.trim()].filter(Boolean).join(" ");};
  recognition.onerror=ev=>{active=false;button.textContent="🎙️ RESPONDER COM MINHAS PALAVRAS";status.textContent=ev.error==="not-allowed"?"Microfone não autorizado. Você ainda pode digitar a resposta.":"Não foi possível reconhecer a fala. Tente novamente ou digite.";};
  recognition.onend=()=>{active=false;button.textContent="🎙️ RESPONDER COM MINHAS PALAVRAS";if(!status.textContent.includes("não")&&!status.textContent.includes("indisponível"))status.textContent="Transcrição encerrada. Revise o texto antes de continuar.";};
  try{recognition.start();active=true;button.textContent="■ PARAR GRAVAÇÃO";status.textContent="Pode falar naturalmente. Não precisa repetir o texto da alternativa.";}catch(e){status.textContent="Microfone indisponível neste dispositivo.";}
 });
}
const observer=new MutationObserver(()=>{if(active&&!document.getElementById("dpi-answer-by-voice"))stop();attach();});
observer.observe(document.body,{childList:true,subtree:true});
attach();
})();