/* Voice controls: prefer Brazilian Portuguese voice, read question only on request. */
(function(){
"use strict";
const synth=window.speechSynthesis;
if(!synth||typeof window.SpeechSynthesisUtterance!=="function"){document.documentElement.classList.add("dpi-no-speech");const init=()=>{const home=document.getElementById("home");if(!home||document.getElementById("dpi-no-speech-note"))return;const note=document.createElement("p");note.id="dpi-no-speech-note";note.className="muted";note.setAttribute("role","status");note.textContent="A narração não está disponível neste navegador. Você pode continuar jogando com os botões da tela.";home.appendChild(note);};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();return;}
let voiceName="",volume=0.9,casualAudio=false,activeUtterance=null,speechSerial=0;
const casual={welcome:["Bora jogar?","Preparado para o próximo desafio?","Vamos nessa!"],correct:["Boa! Acertou essa.","Mandou bem! Vamos pra próxima?","Isso aí! Mais um acerto."],incorrect:["Quase! Vamos entender essa.","Não foi dessa vez. Seguimos juntos!","Boa tentativa. Confira a explicação."],next:["Próxima pergunta!","Vamos pra próxima?","Seguimos!"],finish:["Desafio concluído! Mandou bem por chegar até aqui.","Terminamos essa rodada! Quer tentar outra?"]};
let lastCasual=-1;
function pickCasual(kind){const arr=casual[kind]||[];if(!arr.length)return "";lastCasual=(lastCasual+1)%arr.length;return arr[lastCasual];}
function narrate(text,scientific){if(!text||!casualAudio)return;synth.cancel();const serial=++speechSerial;const u=new SpeechSynthesisUtterance(String(text).trim());u.lang="pt-BR";u.rate=scientific?.94:1.04;u.pitch=scientific?1:1.06;u.volume=volume;const v=preferred();if(v)u.voice=v;activeUtterance=u;document.body?.classList.add("dpi-mascots-speaking");u.onend=u.onerror=()=>{if(serial===speechSerial)document.body?.classList.remove("dpi-mascots-speaking");};synth.speak(u);}
window.dpiNarrate=function(kind,scientificText){if(kind!=="question"&&kind!=="scientific"&&kind!=="explanation"&&!casualAudio)return;if(kind==="question"||kind==="scientific"){narrate(scientificText,true);return;}if(kind==="explanation"){narrate(scientificText,true);return;}narrate(pickCasual(kind),false);};
const preferred=()=>{const voices=synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));return voices.find(v=>v.name===voiceName)||voices.find(v=>/natural|neural|premium/i.test(v.name))||voices[0]||null;};
window.dpiReadQuestion=function(){if(!casualAudio)return;
 const el=document.querySelector(".question-text")||document.querySelector(".miniStage > p");
 if(!el)return;
 synth.cancel();const serial=++speechSerial;
 const utter=new SpeechSynthesisUtterance(el.textContent.trim());utter.lang="pt-BR";utter.rate=0.94;utter.pitch=1;utter.volume=volume;
 const voice=preferred();if(voice)utter.voice=voice;
 const bgm=window.bgm;const previous=bgm&&typeof bgm.volume==="number"?bgm.volume:null;
 if(previous!==null)bgm.volume=Math.min(previous,.025);
 document.body?.classList.add("dpi-mascots-speaking");utter.onend=utter.onerror=()=>{if(previous!==null&&serial===speechSerial)bgm.volume=previous;if(serial===speechSerial)document.body?.classList.remove("dpi-mascots-speaking");};
 activeUtterance=utter;synth.speak(utter);
};
window.dpiVoiceSettings=function(){
 const voices=synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));
 const list=voices.map(v=>'<option value="'+v.name.replace(/"/g,"&quot;")+'" '+(v.name===voiceName?'selected':'')+'>'+v.name.replace(/</g,"&lt;")+'</option>').join("");
 window.shell("VOZ E LEITURA",'<p>Escolha uma voz em português brasileiro disponível no dispositivo.</p><label><input type="checkbox" '+(casualAudio?'checked':'')+' onchange="dpiToggleCasual(this.checked)"> Ativar voz e narração (desligue quando quiser)</label><p></p><label>Voz</label><select id="dpi-voice-choice" style="width:100%;padding:10px" onchange="dpiChooseVoice(this.value)">'+list+'</select><p><label>Volume da leitura</label><input aria-label="Volume da leitura" type="range" min="0" max="100" value="'+Math.round(volume*100)+'" oninput="dpiSetVoiceVolume(this.value)"></p><button class="btn" onclick="dpiReadSample()">TESTAR VOZ</button><button class="btn secondary" onclick="challenges()">VOLTAR</button><p class="muted">Vozes gravadas de Everton e Fernanda dependem da integração de áudio autorizada. Esta opção usa as vozes do dispositivo.</p>');
};
window.dpiChooseVoice=v=>{voiceName=v;localStorage.setItem("dpi-voice-name",v);};
window.dpiSetVoiceVolume=v=>{volume=Math.max(0,Math.min(1,Number(v)/100));localStorage.setItem("dpi-voice-volume",String(volume));};
window.dpiReadSample=()=>{if(!casualAudio)return;narrate(pickCasual("welcome"),false);};
window.dpiToggleCasual=function(checked){casualAudio=!!checked;localStorage.setItem("dpi-casual-audio",casualAudio?"1":"0");if(!casualAudio){++speechSerial;synth.cancel();document.body?.classList.remove("dpi-mascots-speaking");introSpoken=true;const bgm=window.bgm;if(bgm&&typeof bgm.pause==="function")bgm.pause();}else{introSpoken=false;}syncHomeVoiceButton();};
casualAudio=localStorage.getItem("dpi-casual-audio")!=="0";voiceName=localStorage.getItem("dpi-voice-name")||"";volume=Math.max(0,Math.min(1,Number(localStorage.getItem("dpi-voice-volume")||".9")||0));

const introText="Ei, que bom te ver! Everton e Fernanda estão aqui para jogar com você no EL-X VET. Escolha um desafio, explore especialidades e divirta-se aprendendo. Cada rodada tem dez perguntas. Você pode responder pelos botões e, quando disponível, usar sua voz. Para ouvir uma pergunta, é só pedir. Você controla o áudio a qualquer momento. Bora começar?";
let introSpoken=false;
function welcome(){
 if(introSpoken||!casualAudio)return;
 introSpoken=true;
 try{sessionStorage.setItem("dpi-welcome-spoken","1");}catch(e){}
 narrate(introText,false);
}
function homeIntro(){
 const home=document.getElementById("home");
 if(!home||!home.classList.contains("on"))return;
 if(!document.getElementById("dpi-welcome-guide")){
 const btn=document.createElement("button");btn.type="button";btn.id="dpi-welcome-guide";btn.className="btn secondary";btn.textContent="🎙️ OI! ME EXPLICA COMO JOGAR";
 btn.onclick=()=>{if(!casualAudio){window.dpiVoiceSettings();return;}introSpoken=false;welcome();};
 home.appendChild(btn);
 }
 if(!document.getElementById("dpi-home-voice-toggle")){
  const toggle=document.createElement("button");
  toggle.type="button";toggle.id="dpi-home-voice-toggle";toggle.className="btn secondary";
  toggle.setAttribute("aria-label","Ligar ou desligar a voz");
  toggle.onclick=()=>{window.dpiToggleCasual(!casualAudio);syncHomeVoiceButton();};
  home.appendChild(toggle);
 }
 syncHomeVoiceButton();
}
function syncHomeVoiceButton(){
 const toggle=document.getElementById("dpi-home-voice-toggle");
 if(!toggle)return;
 toggle.textContent=casualAudio?"🔊 DESLIGAR VOZ":"🔇 LIGAR VOZ";
 toggle.setAttribute("aria-pressed",String(casualAudio));
 toggle.setAttribute("title",casualAudio?"Desativar toda a narração":"Ativar narração");
}
try{introSpoken=sessionStorage.getItem("dpi-welcome-spoken")==="1";}catch(e){}
document.addEventListener("pointerdown",function(ev){
 if(introSpoken||!casualAudio)return;
 if(ev.target.closest("input,select,textarea,#dpi-mic-answer,#dpi-welcome-guide,#dpi-home-voice-toggle"))return;
 const home=document.getElementById("home");
 if(home&&home.classList.contains("on"))welcome();
});
const introObserver=new MutationObserver(homeIntro);
introObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
homeIntro();


/* Silent visual guide: moves between visible menu options, never intercepts taps. */
(function(){
 let mascot=null,index=0,lastMove=0;
 function update(){
  if(!document.body)return;
  if(!mascot){mascot=document.createElement("div");mascot.id="dpi-menu-mascot";mascot.setAttribute("aria-hidden","true");mascot.innerHTML='<span class="dpi-mascot-face" title="Everton">🐶</span><span class="dpi-mascot-face" title="Fernanda">🐱</span>';document.body.appendChild(mascot);}
  const options=Array.from(document.querySelectorAll("#internal .panel button, #home button, #internal .panel [role=button]")).filter(el=>{const r=el.getBoundingClientRect();return r.width>30&&r.height>20&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;});
  if(!options.length){mascot.hidden=true;return;}
  mascot.hidden=false;
  const now=Date.now();if(now-lastMove<3400)return;lastMove=now;
  const target=options[index++%options.length],r=target.getBoundingClientRect();
  const x=Math.min(innerWidth-45,Math.max(2,r.left-48)),y=Math.min(innerHeight-50,Math.max(2,r.top+(r.height-36)/2));
  mascot.style.left=x+"px";mascot.style.top=y+"px";mascot.dataset.guide=index%2?"Everton":"Fernanda";
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{update();setInterval(update,1100);},{once:true});else{update();setInterval(update,1100);}
})();

const old=window.challenges;
if(typeof old==="function")window.challenges=function(){old.apply(this,arguments);const p=document.querySelector("#internal .panel");if(!p)return;const b=document.createElement("button");b.className="btn secondary";b.textContent="🔊 VOZ E LEITURA";b.onclick=window.dpiVoiceSettings;p.appendChild(b);};
document.addEventListener("click",e=>{if(e.target.closest("#dpi-read-question"))window.dpiReadQuestion();});
const observer=new MutationObserver(()=>{const el=document.querySelector(".question-text")||document.querySelector(".miniStage > p");if(!el||document.getElementById("dpi-read-question"))return;const b=document.createElement("button");b.id="dpi-read-question";b.className="btn secondary";b.textContent="🔊 LER PERGUNTA";el.after(b);});
observer.observe(document.body,{subtree:true,childList:true});
// Keep scientific questions verbatim; never narrate full screens or navigation.
// The original quiz speak() is lexical; use a capture-phase click handler for
// short interface feedback without attempting to read entire screens.
document.addEventListener("click",function(e){const btn=e.target.closest("button");if(!btn)return;const t=(btn.textContent||"").trim();if(t==="PRÓXIMO →"&&casualAudio)window.dpiNarrate("next");},true);
})();