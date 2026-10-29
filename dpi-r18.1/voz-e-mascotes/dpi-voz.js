/* EL-X assistants: one speech owner and one persistent opt-out for every entry point. */
(function(){
'use strict';
const synth=window.speechSynthesis;
const music=window.bgm||document.getElementById('bgm');
const localPreview=/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
let neuralStatus=null,neuralStatusPromise=null,neuralRequest=null,neuralURL=null,lastVoiceError=null;
const knownVoiceErrors=new Set(['tts-key-not-configured','provider-auth-failed','provider-permission-denied','provider-quota-or-rate-limit','provider-model-or-voice-invalid','provider-access-failed','invalid-provider-response']);
function voiceErrorReason(payload,status){const reason=String(payload?.error||'');if(knownVoiceErrors.has(reason))return reason;if(status===401)return'provider-auth-failed';if(status===403)return'provider-permission-denied';if(status===402||status===429)return'provider-quota-or-rate-limit';if(status===503)return'tts-key-not-configured';return'provider-access-failed'}
function voiceErrorMessage(reason){switch(reason){case'tts-key-not-configured':return'A voz nova não está configurada no servidor. As gravações aprovadas continuam disponíveis.';case'provider-auth-failed':return'A chave do serviço de voz foi recusada. As gravações aprovadas continuam disponíveis.';case'provider-permission-denied':return'A conta não tem permissão para esta voz. As gravações aprovadas continuam disponíveis.';case'provider-quota-or-rate-limit':return'A cota ou o limite do serviço de voz foi atingido. As gravações aprovadas continuam disponíveis.';case'provider-model-or-voice-invalid':return'A configuração do modelo ou da voz não foi aceita. As gravações aprovadas continuam disponíveis.';case'invalid-provider-response':return'O serviço de voz retornou um áudio inválido. As gravações aprovadas continuam disponíveis.';default:return'O serviço de voz está temporariamente indisponível. As gravações aprovadas continuam disponíveis.'}}
function refreshVoiceDiagnostic(){const label=document.getElementById('elx-neural-status');if(!label)return;const error=lastVoiceError?.reason;label.textContent=error?voiceErrorMessage(error):neuralStatus?.configured?'Voz conversacional configurada; fala local alternativa só é usada se autorizada pelo jogador.':neuralStatus?.error==='local-preview-no-api'?'Prévia local: apresentações aprovadas disponíveis; falas novas dependem do servidor ou da opção de voz do aparelho.':neuralStatus?.error==='tts-key-not-configured'?'Servidor sem voz dinâmica configurada; falas novas ficam em texto, a menos que o jogador habilite a voz do aparelho.':neuralStatus?.error==='provider-access-failed'?'Servidor de voz indisponível; habilite a voz do aparelho se aceitar uma voz diferente das gravações aprovadas.':'Não foi possível verificar o servidor; a voz do aparelho só será usada se você a habilitar.';label.setAttribute('data-voice-diagnostic',JSON.stringify(lastVoiceError||neuralStatus||{error:'request-unavailable'}))}
function duck(){if(music&&restoreVolume===null){restoreVolume=music.volume;music.volume=Math.min(restoreVolume,.025)}}
function checkNeural(){
 if(neuralStatusPromise)return neuralStatusPromise;
 neuralStatusPromise=(async()=>{
  if(localPreview){neuralStatus={configured:false,error:'local-preview-no-api'};}
  else if(typeof window.fetch==='function'){
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),2500);
   try{const r=await window.fetch('/api/audio-status',{credentials:'same-origin',signal:controller.signal});neuralStatus=await r.json();neuralStatus.httpStatus=r.status}
   catch{neuralStatus=null}finally{clearTimeout(timeout)}
  }
  refreshVoiceDiagnostic();return neuralStatus;
 })().finally(()=>{neuralStatusPromise=null});
 return neuralStatusPromise;
}
async function neuralSay(text,who,done){
 stop();const token=generation;
 if(localPreview){notify('elx-voice-unavailable',{persona:who,reason:'local-preview-api-unavailable'});return}
 neuralRequest=new AbortController();
 try{
 const r=await window.fetch('/api/tts',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:String(text).replace(/\bEL-X VET\b/gi,'Éli xis vét'),gender:who}),signal:neuralRequest.signal});
 if(!r.ok){const body=await r.json().catch(()=>null),reason=voiceErrorReason(body,r.status);throw Object.assign(new Error(reason),{voiceReason:reason,providerStatus:Number(body?.providerStatus)||r.status})}lastVoiceError=null;refreshVoiceDiagnostic();const blob=await r.blob();if(token!==generation||!enabled)return;
 neuralURL=URL.createObjectURL(blob);recording=new Audio(neuralURL);recording.volume=volume;recording.playbackRate=speed;recording.preservesPitch=true;duck();
 recording.onplaying=()=>{if(token===generation){started=true;notify('elx-speech-start',{persona:who,text,audio:recording})}};
 recording.onended=()=>{if(token===generation){stop();if(enabled&&done)done()}};recording.onerror=()=>{if(token===generation)stop()};await recording.play();
 }catch(error){if(token===generation){const reason=error?.voiceReason||'provider-access-failed';lastVoiceError={reason,providerStatus:Number(error?.providerStatus)||0};stop();refreshVoiceDiagnostic();if(deviceVoice&&synth&&typeof window.SpeechSynthesisUtterance==='function'){notify('elx-voice-unavailable',{persona:who,reason,providerStatus:lastVoiceError.providerStatus,fallback:true,message:'A voz conversacional do servidor falhou. Habilite a voz do aparelho nas configurações se quiser continuar falando.'});sayDevice(text,who,false,done)}else notify('elx-voice-unavailable',{persona:who,reason,providerStatus:lastVoiceError.providerStatus,message:voiceErrorMessage(reason)})}}
}
const read=(k,f=null)=>{try{return localStorage.getItem(k)??f}catch{return f}};
const save=(k,v)=>{try{localStorage.setItem(k,String(v))}catch{}};
const parse=(s,f)=>{try{return JSON.parse(s)||f}catch{return f}};
const settings=parse(read('dpiSettingsV8','{}'),{});
let enabled=read('dpi-casual-audio')!=='0'&&settings.voice!==false;
// Dynamic speech defaults to the free device voice when no server voice is configured.
// An explicit saved "0" remains a user opt-out.
// The owner explicitly approved the assistant voices for this project. Use the
// phone's built-in pt-BR voice when server TTS is not configured; an explicit
// opt-out remains respected and can be switched back in voice settings.
let deviceVoice=read('dpi-device-voice')!=='0';
let volume=Math.max(0,Math.min(1,Number(read('dpi-voice-volume','1'))||0));
const clampSpeed=v=>Number.isFinite(Number(v))?Math.max(.75,Math.min(1.5,Number(v))):1;
let speed=clampSpeed(read('dpi-voice-speed','1'));
let persona=read('elx-persona','male')==='female'?'female':'male';
let generation=0,speechRequest=0,restoreVolume=null,introSpoken=false,active=null,started=false,introStarted=false,recording=null,speechState=null,pausedState=null,onboardingPending=false;
function available(){return synth?synth.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang)):[]}
function preferred(who){const vs=available(),name=read('elx-voice-'+who,read('dpi-voice-name','')),gender=who==='male'?/antonio|antônio|daniel|felipe|ricardo|\bmale\b/i:/francisca|fernanda|maria|luciana|joana|\bfemale\b/i;const matches=vs.filter(v=>gender.test(v.name)),natural=v=>/natural|neural|premium|enhanced/i.test(v.name)||v.localService===false;return vs.find(v=>v.name===name&&natural(v))||matches.find(natural)||vs.find(v=>v.name===name)||matches[0]||vs.find(natural)||vs[0]||null}
function notify(type,detail){if(typeof window.CustomEvent==='function')window.dispatchEvent(new CustomEvent(type,{detail}))}
function stop(){const wasSpeaking=started;generation++;speechRequest++;neuralRequest?.abort();neuralRequest=null;active=null;started=false;speechState=null;pausedState=null;if(recording){recording.pause();recording.currentTime=0;recording=null}if(neuralURL){URL.revokeObjectURL(neuralURL);neuralURL=null}if(synth)synth.cancel();if(wasSpeaking)notify('elx-speech-end');if(restoreVolume!==null&&music){music.volume=restoreVolume;restoreVolume=null}document.getElementById('dpi-menu-mascot')?.removeAttribute('data-speaking')}
function pauseForMute(){if(recording){pausedState={kind:'audio',audio:recording,time:recording.currentTime,persona:speechState?.persona||persona,text:speechState?.text||''};recording.pause();generation++;active=null;started=false;if(restoreVolume!==null&&music){music.volume=restoreVolume;restoreVolume=null}notify('elx-speech-paused',{persona:pausedState.persona,text:pausedState.text,charIndex:Math.floor((pausedState.text.length||0)*(pausedState.time/(recording.duration||1))) });return}if(active&&speechState){pausedState={kind:'tts',text:speechState.text,offset:speechState.offset,persona:speechState.persona,scientific:speechState.scientific,done:speechState.done};generation++;synth?.cancel();active=null;started=false;if(restoreVolume!==null&&music){music.volume=restoreVolume;restoreVolume=null}notify('elx-speech-paused',{persona:pausedState.persona,text:pausedState.text,charIndex:pausedState.offset})}}
function resumeAfterMute(){if(!pausedState)return;const p=pausedState;pausedState=null;if(p.kind==='tts'){say(p.text.slice(p.offset),p.persona,p.scientific,p.done);return}const audio=p.audio;recording=audio;const token=++generation;audio.currentTime=p.time;audio.volume=volume;duck();audio.onplaying=()=>{if(token===generation){started=true;notify('elx-speech-start',{persona:p.persona,text:p.text,audio})}};audio.onended=()=>{if(token===generation){stop();if(onboardingPending){onboardingPending=false;notify('elx-welcome-complete',{persona:p.persona})}}};audio.onerror=()=>{if(token===generation)stop()};audio.play().catch(()=>{});}
function sayDevice(text,who=persona,scientific=false,done){
 if(!synth||typeof window.SpeechSynthesisUtterance!=='function'||!text){notify('elx-voice-unavailable',{persona:who,reason:'device-speech-unavailable',message:'Este aparelho não oferece voz de leitura. A conversa por texto continua disponível.'});return false;}
 stop();const spokenText=String(text).trim().replace(/\bEL-X VET\b/gi,'Éli xis vét').replace(/\bEL-X\b/gi,'Éli xis');speechState={text:spokenText,offset:0,persona:who,scientific,done};
 const token=generation,u=new SpeechSynthesisUtterance(spokenText);
 u.lang='pt-BR';u.rate=(scientific?.94:1.02)*speed;u.pitch=1;u.volume=volume;const v=preferred(who);if(v)u.voice=v;
 duck();
 const mascot=document.getElementById('dpi-menu-mascot');if(mascot)mascot.dataset.speaking=who;
 u.onstart=()=>{if(token!==generation)return;started=true;if(!introStarted)introStarted=true;notify('elx-speech-start',{persona:who,text:u.text})};
 const finish=()=>{if(token!==generation)return;active=null;started=false;notify('elx-speech-end');if(restoreVolume!==null&&music){music.volume=restoreVolume;restoreVolume=null}mascot?.removeAttribute('data-speaking');if(enabled&&done)done()};
 u.onboundary=e=>{if(token===generation&&started){speechState.offset=e.charIndex||0;notify('elx-speech-progress',{persona:who,text:u.text,charIndex:e.charIndex||0})}};u.onend=finish;u.onerror=()=>{if(token===generation){stop();if(!introStarted)introSpoken=false}};active=u;synth.speak(u);return true;
}
function sayResolved(text,who,scientific,done){
 if(!enabled)return false;
 if(neuralStatus?.configured&&neuralStatus?.[who==='female'?'femaleConfigured':'maleConfigured']&&typeof window.Audio==='function'){neuralSay(text,who,done);return true;}
 if(deviceVoice)return sayDevice(text,who,scientific,done);
 window.ELXMascotDirector?.teach('teaching',String(text||''),who);notify('elx-voice-unavailable',{persona:who,reason:'approved-dynamic-voice-pending',message:'As falas novas estão sem voz dinâmica. Se quiser, habilite a voz provisória do aparelho nas configurações; a conversa por texto continua disponível.'});return false;
}
function say(text,who=persona,scientific=false,done){
 if(!enabled||!text)return false;
 if(neuralStatus===null){
  const request=++speechRequest,token=generation;
  checkNeural().then(()=>{if(request===speechRequest&&token===generation&&enabled)sayResolved(text,who,scientific,done)});
  return true;
 }
 return sayResolved(text,who,scientific,done);
}
function toggle(value){const wasEnabled=enabled;enabled=!!value;speechRequest++;settings.voice=enabled;if(typeof state!=='undefined')state.voice=enabled;save('dpi-casual-audio',enabled?'1':'0');const current=parse(read('dpiSettingsV8','{}'),{});save('dpiSettingsV8',JSON.stringify({...current,voice:enabled}));if(!enabled)pauseForMute();else if(!wasEnabled)resumeAfterMute();notify('elx-voice-setting',{enabled});document.querySelectorAll('[data-elx-voice-toggle]').forEach(el=>el.checked=enabled);const control=document.getElementById('elx-global-mute');if(control)control.textContent=enabled?'Desligar voz':'Ativar voz'}
if(typeof state!=='undefined')state.voice=enabled;
const originalOpt=window.setOpt;
window.setOpt=function(k,v){if(k==='voice'){toggle(v);return}if(originalOpt)originalOpt(k,v)};
window.speak=text=>say(text,persona,true);
const renderQuestion=window.renderQ;
if(renderQuestion)window.renderQ=function(){const speak=window.speak;window.speak=()=>false;try{return renderQuestion.apply(this,arguments)}finally{window.speak=speak}};
const casual={welcome:'Bora jogar? Eu estou aqui com você!',correct:'Boa! Acertou essa. Vamos juntos para a próxima?',incorrect:'Não foi dessa vez. Vamos conferir a explicação juntos.',next:'Vamos para a próxima pergunta!',finish:'Rodada concluída! Quer tentar outro desafio?'};
window.dpiNarrate=(kind,text)=>say(text||casual[kind],persona,['question','scientific','explanation'].includes(kind));
window.dpiReadQuestion=()=>{const el=document.querySelector('.question-text')||document.querySelector('.miniStage > p');if(el)say(el.textContent,persona,true)};
window.dpiToggleCasual=toggle;
window.dpiChooseVoice=name=>save('elx-voice-'+persona,name);
window.dpiChoosePersona=who=>{stop();persona=who==='female'?'female':'male';save('elx-persona',persona);notify('elx-persona-setting',{persona})};
window.dpiSetVoiceVolume=v=>{volume=Math.max(0,Math.min(1,Number(v)/100));save('dpi-voice-volume',volume)};
window.dpiSetVoiceSpeed=v=>{speed=clampSpeed(v);save('dpi-voice-speed',speed);if(recording)recording.playbackRate=speed;const label=document.getElementById('elx-voice-speed-value');if(label)label.textContent=speed.toFixed(2).replace('.',',')+'×'};
window.dpiUseDeviceVoice=value=>{deviceVoice=!!value;save('dpi-device-voice',deviceVoice?'1':'0');if(!deviceVoice)stop()};
window.dpiPlayApproved=()=>approvedRecording(persona);
window.dpiReadSample=()=>say(persona==='male'?'Oi! Eu sou o Everton, seu parceiro no Desafio DPI. Vamos nessa?':'Oi! Eu sou a Fernanda. Estou aqui para estudar e jogar com você!');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.dpiVoiceSettings=function(returnToPortal){
 const fromPortal=returnToPortal??!!document.body.classList?.contains('elx-portal-on');if(fromPortal)window.ELXPortal?.applyScreenVisibility(false);
 const options=available().map(v=>'<option value="'+esc(v.name)+'" '+(preferred(persona)?.name===v.name?'selected':'')+'>'+esc(v.name)+'</option>').join('');
 window.shell('EVERTON E FERNANDA — VOZ',`<label><input data-elx-voice-toggle type="checkbox" ${enabled?'checked':''} onchange="dpiToggleCasual(this.checked)"> Ativar voz</label><p>Quando você desligar, os dois ficam em silêncio até você reativar.</p><label>Mascote <select onchange="dpiChoosePersona(this.value);dpiVoiceSettings(${fromPortal})"><option value="male" ${persona==='male'?'selected':''}>Everton — cachorrinho</option><option value="female" ${persona==='female'?'selected':''}>Fernanda — gatinha</option></select></label><p><label>Voz provisória do aparelho <select onchange="dpiChooseVoice(this.value)">${options||'<option>Nenhuma voz pt-BR disponível</option>'}</select></label></p><label>Volume <input aria-label="Volume da voz" type="range" min="0" max="100" value="${Math.round(volume*100)}" oninput="dpiSetVoiceVolume(this.value)"></label><p><label>Velocidade da voz <output id="elx-voice-speed-value">${speed.toFixed(2).replace('.',',')}×</output> <input aria-label="Velocidade da voz" type="range" min="0.75" max="1.50" step="0.05" value="${speed}" oninput="dpiSetVoiceSpeed(this.value)"></label><button class="btn secondary" onclick="dpiSetVoiceSpeed(1);dpiVoiceSettings(${fromPortal})">VELOCIDADE NORMAL — 1×</button></p><p><label><input type="checkbox" ${deviceVoice?'checked':''} onchange="dpiUseDeviceVoice(this.checked)"> Permitir voz gratuita do aparelho como alternativa para falas novas</label></p><p><button class="btn" onclick="dpiReadSample()">TESTAR VOZ DO APARELHO — ALTERNATIVA</button><button class="btn secondary" onclick="dpiApprovedEverton()">OUVIR REFERÊNCIA APROVADA — EVERTON</button><button class="btn secondary" onclick="dpiApprovedFernanda()">OUVIR REFERÊNCIA APROVADA — FERNANDA</button><button class="btn secondary" onclick="${fromPortal?'ELXPortal.show()':'showHome()'}">VOLTAR</button></p><p class="muted">As apresentações usam as gravações aprovadas de Everton e Fernanda. Falas novas preferem a voz conversacional do servidor quando configurada e usam a voz gratuita do aparelho como alternativa. Essa alternativa pode soar diferente das gravações aprovadas.</p><p id="elx-neural-status" role="status">Verificando disponibilidade das falas novas…</p>`);checkNeural();
};
function approvedRecording(who){if(!enabled||typeof window.Audio!=='function')return;window.dpiChoosePersona(who);stop();const token=generation,transcript=who==='female'?'Olá, pessoal! Bem-vindos ao Desafio DPI! Aqui, nosso objetivo é aprender, testar conhecimentos e enfrentar os desafios da rotina veterinária. Preparados? Vamos começar? Atenção à pergunta. Escolha sua resposta e boa sorte!':'Olá, pessoal! Sejam bem-vindos ao Desafio DPI! Estão prontos para colocar seus conhecimentos veterinários à prova? Então, vamos começar!';speechState={text:transcript,persona:who};recording=document.getElementById(who==='female'?'voiceFernanda':'voiceEverton');if(!recording){notify('elx-voice-unavailable',{persona:who,reason:'approved-recording-missing'});return}recording.pause();recording.currentTime=0;recording.volume=volume;recording.playbackRate=speed;recording.preservesPitch=true;duck();recording.onplaying=()=>{if(token!==generation)return;started=true;introStarted=true;notify('elx-speech-start',{persona:who,text:transcript,audio:recording})};recording.ontimeupdate=()=>{if(token===generation&&recording?.duration)notify('elx-speech-progress',{persona:who,text:transcript,charIndex:Math.floor(transcript.length*recording.currentTime/recording.duration)})};recording.onended=()=>{if(token===generation){stop();if(onboardingPending){onboardingPending=false;notify('elx-welcome-complete',{persona:who})}}};recording.onerror=()=>{if(token===generation){stop();if(onboardingPending)notify('elx-welcome-complete',{persona:who});onboardingPending=false}};recording.play().catch(()=>{if(token===generation){stop();introSpoken=false;introStarted=false;window.ELXMascotDirector?.teach('notice','Toque novamente para iniciar a gravação aprovada.')}})}
window.dpiApprovedEverton=()=>approvedRecording('male');
window.dpiApprovedFernanda=()=>approvedRecording('female');
const presentations={
 portal:'Oi! Bora aprender jogando na EL-X? Escolha um grupo aqui embaixo ou busque a área que você curte. Tem vários caminhos para explorar!',
 vet:'Bem-vindo ao Desafio DPI, da EL-X VET! Escolha um minijogo, responda às perguntas e confira as dicas. São dez por rodada. Bora começar?'
};
const studyInvitation='Você também pode trazer seu conteúdo de estudo. E, se preferir jogar sem conversa, é só tocar em Desligar voz.';
function welcome(context){
 if(introSpoken||!enabled)return;introSpoken=true;
 const selected=context||(document.body.dataset?.studyArea==='vet'?'vet':'portal');onboardingPending=selected==='portal'&&!window.ELXProfile?.complete?.(window.ELXProfile?.read?.());if(typeof window.Audio==='function'){approvedRecording(persona);return;}
 say(presentations[selected]||presentations.portal,persona,false,()=>{if(onboardingPending){onboardingPending=false;notify('elx-welcome-complete',{persona})}say(studyInvitation,persona)});
}
window.dpiWelcome=context=>{introSpoken=false;welcome(context)};
window.dpiVetWelcome=()=>window.dpiWelcome('vet');
const oldChallenges=window.challenges;
if(oldChallenges)window.challenges=function(){oldChallenges.apply(this,arguments);const p=document.querySelector('#internal .panel');if(!p)return;const b=document.createElement('button');b.className='btn secondary';b.textContent='🔊 EVERTON E FERNANDA';b.onclick=window.dpiVoiceSettings;p.appendChild(b)};
function attach(){
 if(!document.getElementById('elx-global-mute')){const b=document.createElement('button');b.id='elx-global-mute';b.className='elx-mute-button';b.setAttribute('aria-label','Silenciar ou ativar voz');b.textContent=enabled?'Desligar voz':'Ativar voz';b.onclick=()=>{toggle(!enabled);b.textContent=enabled?'Desligar voz':'Ativar voz'};document.body.appendChild(b)}
 const el=document.querySelector('.question-text')||document.querySelector('.miniStage > p');
 if(el&&!document.getElementById('dpi-read-question')){const b=document.createElement('button');b.id='dpi-read-question';b.className='btn secondary';b.textContent='🔊 LER PERGUNTA';b.onclick=window.dpiReadQuestion;el.after(b)}
}
const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});attach();
function firstInteraction(e){const h=document.getElementById('home'),p=document.getElementById('elx-first-screen');if((h?.classList.contains('on')||p&&!p.hidden)&&!introStarted&&!started){introSpoken=false;welcome(p&&!p.hidden?'portal':undefined)}}
document.addEventListener('pointerdown',firstInteraction);document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')firstInteraction(e)});
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
window.ELXAssistentes={speak:say,stop,checkNeural,setEnabled:toggle,isEnabled:()=>enabled,getPersona:()=>persona,getVoiceSpeed:()=>speed,getVoiceVolume:()=>volume,selectPersona:window.dpiChoosePersona};
checkNeural();
window.addEventListener('elx-welcome-complete',()=>{if(!window.ELXProfile?.complete?.(window.ELXProfile?.read?.()))window.ELXProfile?.open?.()});
const initialHome=document.getElementById('home'),initialPortal=document.getElementById('elx-first-screen');if(initialPortal&&!initialPortal.hidden)welcome('portal');else if(initialHome?.classList.contains('on'))welcome();
})();
