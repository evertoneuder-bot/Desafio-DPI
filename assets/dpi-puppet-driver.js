import {mountWordgameStage} from './fsm/wordgame-stage.js';
import {MascotDirector,STATES as S,TRIGGERS as T} from './fsm/character-state-machine.js';
import {SpriteRenderer} from './fsm/sprite-renderer.js';
import {actingClips} from './fsm/acting-clips.js';
import {mouths} from './fsm/acting-mouths.js';

const director=new MascotDirector(),actors=new Map(),doc=document;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let last=0,screenKey='',phase='',speech=false,persona='male',audio=null,envelope=null,clip='',epoch=0,speechTime=0,level=0,hoverAt=-100;
const pendingEnvelopes=new Map(),actions=new Map();
const visualPoses=new Set(['POINT_UP','POINT_UP_RIGHT','POINT_RIGHT','POINT_LEFT','CROSSED','PRESENT','ARM_RIGHT','ARM_UP','FACE']);
function show(persona,pose,seconds=1.4){if(!['male','female'].includes(persona)||!visualPoses.has(pose))return false;actions.set(persona,{pose,start:performance.now()/1000,duration:Math.min(3,Math.max(.3,seconds))});return true}
window.DPIMascotActing={show};
function direction(target){const stage=doc.getElementById('elx-character-stage');if(!stage||!target)return 'POINT_RIGHT';const a=stage.getBoundingClientRect(),b=target.getBoundingClientRect();if(b.top>a.bottom)return 'PRESENT';if(b.right<a.left+a.width/2)return 'POINT_LEFT';return b.top<a.top+a.height*.35?'POINT_UP_RIGHT':'POINT_RIGHT'}
function enabled(){const choice=doc.documentElement.dataset.dpiMascotMotion;return choice==='full'||(choice!=='off'&&!reduce.matches)}
function scan(){
 mountWordgameStage(doc,window.DPI2DArtwork);
 for(const [canvas] of actors)if(!canvas.isConnected)actors.delete(canvas);
 for(const canvas of doc.querySelectorAll('canvas.dpi-acting-canvas'))if(!actors.has(canvas)){
  const name=canvas.dataset.persona==='female'?'Fernanda':'Tom',renderer=new SpriteRenderer(canvas,actingClips(name));
  const actor={name,renderer,ready:false,mouth:new Image(),visual:null,visualTime:0,blend:1,previous:null};actors.set(canvas,actor);actor.mouth.src=mouths[name].src;
  renderer.load().then(()=>{actor.ready=true;canvas.dataset.assets='ready'}).catch(error=>{canvas.dataset.assets='failed';console.error('Mascote: falha ao carregar sprites',error)});
 }
 const internal=doc.getElementById('internal');if(!internal?.classList.contains('on'))return;
 const title=internal.querySelector('h2,h1')?.textContent?.trim()||'';
 const game=/RELÂMPAGO|ELIMINAÇÃO|ALVO|ASSOCIAÇÃO|FECHE O DIAGNÓSTICO|FORCA|CAÇA.PALAVRAS|CRUZADAS/i.test(title);
 if(game){if(phase!=='minigame'){director.trigger(T.START_MINIGAME);phase='minigame';screenKey=''}return}
 const question=internal.querySelector('.question-text,.dpi-case-question');
 if(/^QUESTÃO\s+\d/i.test(title)||internal.querySelector('.dpi-case-option')){
  const key=title+'|'+(question?.textContent||internal.querySelector('.option,.dpi-case-option')?.textContent||'');
  if(key!==screenKey){screenKey=key;phase='quiz';director.trigger(T.NEW_QUESTION,{questionId:key});const who=window.ELXAssistentes?.getPersona?.()||'male';show(who,direction(question||internal.querySelector('.option,.dpi-case-option')))}return;
 }
 // An explanation belongs to the committed answer: keep its two-second reaction.
 if(/EXPLICAÇÃO|RESPOSTA/i.test(title))return;
 if(phase){director.trigger(T.END_MINIGAME);phase='';screenKey=''}
}
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;scan()})}}).observe(doc.body,{childList:true,subtree:true,characterData:true});scan();
window.addEventListener('dpi-animation-result',event=>{scan();director.trigger(event.detail.correct?T.CORRECT:T.INCORRECT)});
window.DPIMascotDirector=director;

function stop(){speech=false;audio=null;envelope=null;clip='';level=0;epoch++;director.setBoolean('speaking',false)}
async function prepare(){
 const src=audio?.currentSrc||audio?.src;if(!src||src===clip)return;clip=src;envelope=null;const revision=epoch;
 if(!pendingEnvelopes.has(src))pendingEnvelopes.set(src,(async()=>{
  const Context=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Context)return null;
  const bytes=await(await fetch(src)).arrayBuffer(),context=new Context(1,1,24000),buffer=await context.decodeAudioData(bytes),samples=buffer.getChannelData(0),step=Math.round(buffer.sampleRate/50),values=[];
  for(let start=0;start<samples.length;start+=step){let sum=0,n=0;for(let i=start;i<Math.min(samples.length,start+step);i+=4){sum+=samples[i]*samples[i];n++}values.push(Math.min(1,Math.sqrt(sum/Math.max(n,1))*8))}return values;
 })().catch(()=>null));
 const data=await pendingEnvelopes.get(src);if(revision===epoch&&src===clip)envelope=data;
 if(pendingEnvelopes.size>8)pendingEnvelopes.delete(pendingEnvelopes.keys().next().value);
}
window.addEventListener('elx-speech-start',event=>{stop();speech=true;speechTime=0;persona=event.detail?.persona||'male';audio=event.detail?.audio||window.ELXVoicePlayback?.element?.();director.setBoolean('speaking',true);prepare()});
for(const event of ['elx-speech-end','elx-speech-paused','elx-voice-unavailable','elx-user-speaking'])window.addEventListener(event,stop);
doc.addEventListener('visibilitychange',()=>{director.setBoolean('paused',doc.hidden);last=0;if(doc.hidden)stop()});
let focusedTarget=null;
for(const eventName of ['pointerover','focusin'])doc.addEventListener(eventName,event=>{
 const target=event.target.closest?.('.option,.dpi-case-option,.dpi-round-option,.dpi-target-dot,.dpi-play-tools button');if(!target||target.disabled||target===focusedTarget)return;focusedTarget=target;
 const who=window.ELXAssistentes?.getPersona?.()||'male';show(who,target.matches('.dpi-target-dot')&&who==='male'?'ARM_RIGHT':direction(target));
});
doc.addEventListener('click',event=>{
 const mascot=event.target.closest?.('.elx-mascot-hotspot[data-persona]');if(mascot)show(mascot.dataset.persona,'FACE',2);
},true);

function frame(now){
 requestAnimationFrame(frame);if(last&&now-last<32)return;const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(doc.hidden)return;
 const live=enabled(),snapshots=director.update(live?dt:0);if(speech)speechTime+=dt;
 let target=0;if(live&&speech&&audio&&!audio.paused&&!audio.ended){if((audio.currentSrc||audio.src)!==clip)prepare();target=envelope?.[Math.floor(audio.currentTime*50)]||0}
 level+=(target-level)*(target>level?.65:.45);if(level<.015)level=0;
 for(const [canvas,actor] of actors){if(!actor.ready)continue;
  const original=snapshots[actor.name==='Tom'?0:1],active=(canvas.dataset.persona===persona),state={...original};
  if(!live){state.state=S.IDLE_QUIZ;state.time=0;state.previous=null;state.weight=1;state.blink=false}
  else if([S.IDLE_QUIZ,S.THINKING].includes(state.state)&&speech){state.state=active?'TALK':'CROSSED';state.time=active?speechTime:0;state.blink=false}
  const action=actions.get(canvas.dataset.persona),canAct=[S.IDLE_QUIZ,S.THINKING].includes(original.state);
  if(live&&canAct&&action&&now/1000-action.start<action.duration){state.state=action.pose;state.time=now/1000-action.start;state.blink=false}

  if(actor.visual!==state.state){actor.previous=actor.visual?{state:actor.visual,time:actor.visualTime}:null;actor.visual=state.state;actor.blend=0}
  actor.visualTime=state.time;actor.blend=Math.min(1,actor.blend+dt/.09);const weight=actor.blend*actor.blend*(3-2*actor.blend);
  state.previous=actor.previous&&weight<1?{...actor.previous,weight:1-weight}:null;state.weight=state.previous?weight:1;
  actor.renderer.render(state);
  if(live&&speech&&active&&level>.02&&['TALK','FACE',S.IDLE_QUIZ].includes(state.state)&&actor.mouth.complete&&actor.mouth.naturalWidth){
   const ctx=actor.renderer.context,m=mouths[actor.name],baseScale=Math.min(canvas.width/400,canvas.height/480),scale=baseScale*actor.renderer.characterScale;
   ctx.globalAlpha=Math.min(1,level*2);ctx.drawImage(actor.mouth,canvas.width/2+(m.x-200)*scale,canvas.height-4*baseScale+(state.state==='FACE'?m.y-205:m.y-465)*scale,m.w*scale,m.h*scale);ctx.globalAlpha=1;
  }
  canvas.dataset.state=original.state;canvas.dataset.pose=state.state;canvas.dataset.mouthLevel=active?level.toFixed(2):'0';
 }
 const stage=doc.getElementById('elx-character-stage');if(stage){stage.dataset.animationVersion='story-half-fernanda-v1';stage.dataset.lipSource=envelope?'audio-envelope':speech?'waiting-envelope':'idle'}
}
requestAnimationFrame(frame);
