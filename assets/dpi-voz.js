/* Voice controls: prefer Brazilian Portuguese voice, read question only on request. */
(function(){
"use strict";
const synth=window.speechSynthesis;
if(!synth)return;
let enabled=false,voiceName="",volume=0.9;
const preferred=()=>{const voices=synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));return voices.find(v=>v.name===voiceName)||voices.find(v=>/natural|neural|premium/i.test(v.name))||voices[0]||null;};
window.dpiReadQuestion=function(){
 const el=document.querySelector(".question-text")||document.querySelector(".miniStage > p");
 if(!el)return;
 synth.cancel();
 const utter=new SpeechSynthesisUtterance(el.textContent.trim());utter.lang="pt-BR";utter.rate=0.94;utter.pitch=1;utter.volume=volume;
 const voice=preferred();if(voice)utter.voice=voice;
 const bgm=window.bgm;const previous=bgm&&typeof bgm.volume==="number"?bgm.volume:null;
 if(previous!==null)bgm.volume=Math.min(previous,.025);
 utter.onend=utter.onerror=()=>{if(previous!==null)bgm.volume=previous;};
 synth.speak(utter);
};
window.dpiVoiceSettings=function(){
 const voices=synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));
 const list=voices.map(v=>'<option value="'+v.name.replace(/"/g,"&quot;")+'" '+(v.name===voiceName?'selected':'')+'>'+v.name.replace(/</g,"&lt;")+'</option>').join("");
 window.shell("VOZ E LEITURA",'<p>Escolha uma voz em português brasileiro disponível no dispositivo.</p><label>Voz</label><select id="dpi-voice-choice" style="width:100%;padding:10px" onchange="dpiChooseVoice(this.value)">'+list+'</select><p><label>Volume da leitura</label><input aria-label="Volume da leitura" type="range" min="0" max="100" value="'+Math.round(volume*100)+'" oninput="dpiSetVoiceVolume(this.value)"></p><button class="btn" onclick="dpiReadSample()">TESTAR VOZ</button><button class="btn secondary" onclick="challenges()">VOLTAR</button><p class="muted">Vozes gravadas de Everton e Fernanda dependem da integração de áudio autorizada. Esta opção usa as vozes do dispositivo.</p>');
};
window.dpiChooseVoice=v=>{voiceName=v;localStorage.setItem("dpi-voice-name",v);};
window.dpiSetVoiceVolume=v=>{volume=Math.max(0,Math.min(1,Number(v)/100));localStorage.setItem("dpi-voice-volume",String(volume));};
window.dpiReadSample=()=>{synth.cancel();const u=new SpeechSynthesisUtterance("Bem-vindo ao Desafio DPI. Conhecimento veterinário em jogo!");u.lang="pt-BR";u.volume=volume;u.rate=.94;const v=preferred();if(v)u.voice=v;synth.speak(u);};
voiceName=localStorage.getItem("dpi-voice-name")||"";volume=Number(localStorage.getItem("dpi-voice-volume")||".9");
const old=window.challenges;
if(typeof old==="function")window.challenges=function(){old.apply(this,arguments);const p=document.querySelector("#internal .panel");if(!p)return;const b=document.createElement("button");b.className="btn secondary";b.textContent="🔊 VOZ E LEITURA";b.onclick=window.dpiVoiceSettings;p.appendChild(b);};
document.addEventListener("click",e=>{if(e.target.closest("#dpi-read-question"))window.dpiReadQuestion();});
const observer=new MutationObserver(()=>{const el=document.querySelector(".question-text");if(!el||document.getElementById("dpi-read-question"))return;const b=document.createElement("button");b.id="dpi-read-question";b.className="btn secondary";b.textContent="🔊 LER PERGUNTA";el.after(b);});
observer.observe(document.body,{subtree:true,childList:true});
})();