/* Voice controls: prefer Brazilian Portuguese voice, read question only on request. */
(function(){
"use strict";
const synth=window.speechSynthesis;
if(!synth||typeof window.SpeechSynthesisUtterance!=="function")return;
let voiceName="",volume=0.9,casualAudio=false,activeUtterance=null;
const casual={welcome:["Bora jogar?","Preparado para o próximo desafio?","Vamos nessa!"],correct:["Boa! Acertou essa.","Mandou bem! Vamos pra próxima?","Isso aí! Mais um acerto."],incorrect:["Quase! Vamos entender essa.","Não foi dessa vez. Seguimos juntos!","Boa tentativa. Confira a explicação."],next:["Próxima pergunta!","Vamos pra próxima?","Seguimos!"],finish:["Desafio concluído! Mandou bem por chegar até aqui.","Terminamos essa rodada! Quer tentar outra?"]};
let lastCasual=-1;
function pickCasual(kind){const arr=casual[kind]||[];if(!arr.length)return "";lastCasual=(lastCasual+1)%arr.length;return arr[lastCasual];}
function narrate(text,scientific){if(!text)return;synth.cancel();const u=new SpeechSynthesisUtterance(String(text).trim());u.lang="pt-BR";u.rate=scientific?.94:1.04;u.pitch=scientific?1:1.06;u.volume=volume;const v=preferred();if(v)u.voice=v;activeUtterance=u;synth.speak(u);}
window.dpiNarrate=function(kind,scientificText){if(kind!=="question"&&kind!=="scientific"&&kind!=="explanation"&&!casualAudio)return;if(kind==="question"||kind==="scientific"){narrate(scientificText,true);return;}if(kind==="explanation"){narrate(scientificText,true);return;}narrate(pickCasual(kind),false);};
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
 activeUtterance=utter;synth.speak(utter);
};
window.dpiVoiceSettings=function(){
 const voices=synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));
 const list=voices.map(v=>'<option value="'+v.name.replace(/"/g,"&quot;")+'" '+(v.name===voiceName?'selected':'')+'>'+v.name.replace(/</g,"&lt;")+'</option>').join("");
 window.shell("VOZ E LEITURA",'<p>Escolha uma voz em português brasileiro disponível no dispositivo.</p><label><input type="checkbox" '+(casualAudio?'checked':'')+' onchange="dpiToggleCasual(this.checked)"> Narração casual durante as partidas</label><p></p><label>Voz</label><select id="dpi-voice-choice" style="width:100%;padding:10px" onchange="dpiChooseVoice(this.value)">'+list+'</select><p><label>Volume da leitura</label><input aria-label="Volume da leitura" type="range" min="0" max="100" value="'+Math.round(volume*100)+'" oninput="dpiSetVoiceVolume(this.value)"></p><button class="btn" onclick="dpiReadSample()">TESTAR VOZ</button><button class="btn secondary" onclick="challenges()">VOLTAR</button><p class="muted">Vozes gravadas de Everton e Fernanda dependem da integração de áudio autorizada. Esta opção usa as vozes do dispositivo.</p>');
};
window.dpiChooseVoice=v=>{voiceName=v;localStorage.setItem("dpi-voice-name",v);};
window.dpiSetVoiceVolume=v=>{volume=Math.max(0,Math.min(1,Number(v)/100));localStorage.setItem("dpi-voice-volume",String(volume));};
window.dpiReadSample=()=>narrate(pickCasual("welcome"),false);
window.dpiToggleCasual=function(checked){casualAudio=!!checked;localStorage.setItem("dpi-casual-audio",casualAudio?"1":"0");};
casualAudio=localStorage.getItem("dpi-casual-audio")==="1";voiceName=localStorage.getItem("dpi-voice-name")||"";volume=Math.max(0,Math.min(1,Number(localStorage.getItem("dpi-voice-volume")||".9")||0));
const old=window.challenges;
if(typeof old==="function")window.challenges=function(){old.apply(this,arguments);const p=document.querySelector("#internal .panel");if(!p)return;const b=document.createElement("button");b.className="btn secondary";b.textContent="🔊 VOZ E LEITURA";b.onclick=window.dpiVoiceSettings;p.appendChild(b);};
document.addEventListener("click",e=>{if(e.target.closest("#dpi-read-question"))window.dpiReadQuestion();});
const observer=new MutationObserver(()=>{const el=document.querySelector(".question-text")||document.querySelector(".miniStage > p");if(!el||document.getElementById("dpi-read-question"))return;const b=document.createElement("button");b.id="dpi-read-question";b.className="btn secondary";b.textContent="🔊 LER PERGUNTA";el.after(b);});
observer.observe(document.body,{subtree:true,childList:true});
// Keep scientific questions verbatim; never narrate full screens or navigation.
const originalSpeak=window.speak;
if(typeof originalSpeak==="function")window.speak=function(text){
 const q=document.querySelector(".question-text");
 if(q&&String(text).trim()===q.textContent.trim())return window.dpiNarrate("question",text);
 return; // Suppress unsolicited narration of interface text.
};
})();