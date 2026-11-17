/* R32: motion states for the approved transparent mascot art. */
(function () {
  'use strict';
  const stage = document.getElementById('elx-character-stage');
  const sourceImage = stage?.querySelector('img.elx-approved-mascot-pair');
  if (!stage || !sourceImage) return;

  const src = sourceImage.currentSrc || sourceImage.src;
  const art = document.createElement('div');
  art.className = 'elx-approved-mascot-pair elx-approved-mascot-motion';
  art.setAttribute('role', 'img');
  art.setAttribute('aria-label', 'Tom e Fernanda, mascotes veterinários com radioproteção');
  for (const [persona, label] of [['male', 'Tom'], ['female', 'Fernanda']]) {
    const figure = document.createElement('span');
    figure.className = 'elx-mascot-motion-persona';
    figure.dataset.persona = persona;
    figure.setAttribute('aria-hidden', 'true');
    // Prefer the articulated renderer; retain the approved image when it is unavailable.
    if (window.DPI2DArtwork?.create) figure.innerHTML = window.DPI2DArtwork.create(src,persona);
    else {
      const img = document.createElement('img');
      img.src = src; img.alt = ''; img.draggable = false; img.dataset.character = label;
      figure.appendChild(img);
    }
    art.appendChild(figure);
  }
  sourceImage.replaceWith(art);
  stage.classList.add('elx-motion-active');

  const style=document.createElement('style');
  style.id='dpi-articulated-2d-motion';stage.dataset.animationVersion='puppet-2d-v8';
  style.textContent=`
#elx-character-stage .elx-mascot-motion-persona[data-persona="male"]{left:0;right:auto;width:50%;clip-path:none!important}
#elx-character-stage .elx-mascot-motion-persona[data-persona="female"]{left:50%;right:auto;width:50%;clip-path:none!important}
#elx-character-stage .elx-mascot-hotspot{pointer-events:auto!important;cursor:pointer}
#elx-character-stage.elx-motion-active .elx-mascot-motion-persona{animation:dpi2DIdle 4.8s ease-in-out infinite!important;transform-origin:25% 92%}
#elx-character-stage.elx-motion-active .elx-mascot-motion-persona[data-persona="female"]{transform-origin:75% 92%;animation-delay:-1.7s!important}
#elx-character-stage[data-active-persona="male"] .elx-mascot-motion-persona[data-persona="male"],#elx-character-stage[data-active-persona="female"] .elx-mascot-motion-persona[data-persona="female"]{animation-delay:0s!important}
`;
  for(const [state,keyframes,timing] of [['speaking','dpi2DSpeak','1.1s ease-in-out infinite'],['listening','dpi2DListen','2s ease-in-out infinite'],['greeting','dpi2DGreet','1.4s ease-in-out 1'],['celebrate','dpi2DCheer','1.4s ease-in-out 1'],['incorrect','dpi2DComfort','1.4s ease-in-out 1'],['hover','dpi2DListen','2s ease-in-out infinite']]){
    for(const who of ['male','female'])style.textContent+=`#elx-character-stage.elx-motion-active[data-active-persona="${who}"][data-motion-state="${state}"] .elx-mascot-motion-persona[data-persona="${who}"]{animation:${keyframes} ${timing}!important}`;
  }
  style.textContent+=`
@keyframes dpi2DIdle{0%,100%{transform:translateY(0) scale(var(--elx-persona-scale))}50%{transform:translateY(-3px) scale(var(--elx-persona-scale))}}
@keyframes dpi2DSpeak{0%,100%{transform:translateY(0) rotate(0) scale(var(--elx-persona-scale))}40%{transform:translateY(-2px) rotate(.18deg) scale(var(--elx-persona-scale))}70%{transform:translateY(-.8px) rotate(-.12deg) scale(var(--elx-persona-scale))}}
@keyframes dpi2DListen{0%,100%{transform:rotate(0) scale(var(--elx-persona-scale))}50%{transform:rotate(.35deg) scale(var(--elx-persona-scale))}}
@keyframes dpi2DGreet{0%,100%{transform:translateY(0) rotate(0) scale(var(--elx-persona-scale))}35%{transform:translateY(-3px) rotate(-.45deg) scale(var(--elx-persona-scale))}70%{transform:translateY(-1px) rotate(.2deg) scale(var(--elx-persona-scale))}}
@keyframes dpi2DCheer{0%,100%{transform:translateY(0) rotate(0) scale(var(--elx-persona-scale))}30%{transform:translateY(-12px) rotate(1deg) scale(var(--elx-persona-scale))}65%{transform:translateY(-2px) rotate(-.2deg) scale(var(--elx-persona-scale))}}
@keyframes dpi2DComfort{0%,100%{transform:translateY(0) rotate(0) scale(var(--elx-persona-scale))}45%{transform:translateY(1px) rotate(-.4deg) scale(var(--elx-persona-scale))}}
#elx-character-stage[data-motion-paused="true"] .elx-mascot-motion-persona{animation-play-state:paused!important}
@media(prefers-reduced-motion:reduce){html:not([data-dpi-mascot-motion="full"]) #elx-character-stage.elx-motion-active[data-active-persona][data-motion-state] .elx-mascot-motion-persona[data-persona]{animation:none!important}}
`;
  style.textContent+=`
#elx-character-stage .dpi-2d-rig{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
#elx-character-stage .dpi-2d-head{transform-box:view-box;animation:dpiHeadIdle 4s ease-in-out infinite}
#elx-character-stage .dpi-2d-eye{transform-box:view-box;animation:dpiBlink 4.7s linear infinite}
#elx-character-stage .elx-mascot-motion-persona[data-persona="female"] .dpi-2d-head{animation-delay:-1.6s}
#elx-character-stage .elx-mascot-motion-persona[data-persona="female"] .dpi-2d-eye{animation-delay:-2.1s}
`;
  for(const [state,anim] of [['speaking','dpiHeadTalk 1.15s ease-in-out infinite'],['greeting','dpiHeadGreet 1.5s ease-in-out 1'],['celebrate','dpiHeadGreet 1.5s ease-in-out 1'],['incorrect','dpiHeadConcern 1.5s ease-in-out 1'],['listening','dpiHeadListen 2.5s ease-in-out infinite'],['hover','dpiHeadListen 2.5s ease-in-out infinite']]){
    for(const who of ['male','female'])style.textContent+=`#elx-character-stage[data-active-persona="${who}"][data-motion-state="${state}"] .elx-mascot-motion-persona[data-persona="${who}"] .dpi-2d-head{animation:${anim};animation-delay:0s}`;
  }
  style.textContent+=`
@keyframes dpiHeadIdle{0%,100%{transform:rotate(0)}42%{transform:rotate(.35deg)}68%{transform:rotate(-.25deg)}}
@keyframes dpiHeadTalk{0%,100%{transform:rotate(0) translateY(0)}30%{transform:rotate(-.6deg) translateY(1px)}65%{transform:rotate(.8deg) translateY(-1px)}}
@keyframes dpiHeadListen{0%,100%{transform:rotate(0)}50%{transform:rotate(1.2deg)}}
@keyframes dpiHeadGreet{0%,100%{transform:rotate(0)}25%{transform:rotate(-1.6deg)}60%{transform:rotate(1.2deg)}}
@keyframes dpiHeadConcern{0%,100%{transform:rotate(0)}35%{transform:rotate(-1.4deg) translateY(1px)}70%{transform:rotate(.6deg)}}
@keyframes dpiBlink{0%,41%,45%,100%{transform:scaleY(1)}43%{transform:scaleY(.04)}}
#elx-character-stage[data-motion-paused="true"] .dpi-2d-head,#elx-character-stage[data-motion-paused="true"] .dpi-2d-eye{animation-play-state:paused!important}
@media(prefers-reduced-motion:reduce){html:not([data-dpi-mascot-motion="full"]) #elx-character-stage .dpi-2d-head,html:not([data-dpi-mascot-motion="full"]) #elx-character-stage .dpi-2d-eye{animation:none!important}}
`;
  style.textContent+='html[data-dpi-mascot-motion="off"] #elx-character-stage.elx-motion-active[data-active-persona][data-motion-state] .elx-mascot-motion-persona[data-persona]{animation:none!important}';

  document.head?.append?.(style);
  let reactionTimer,reaction='',speaking=false,listening=false,attention=false,speakingPersona=null;
  function sync(){
    stage.classList.remove('is-speaking','is-listening','is-greeting','is-correct','is-incorrect');
    const state=reaction||(speaking?'speaking':listening?'listening':attention?'hover':'idle');
    stage.dataset.motionState=state;
    if(speaking)stage.classList.add('is-speaking');
    if(listening)stage.classList.add('is-listening');
    const cls={greeting:'is-greeting',celebrate:'is-correct',incorrect:'is-incorrect'}[reaction];
    if(cls)stage.classList.add(cls);
  }
  function persona(value){if(value==='female'||value==='male')stage.dataset.activePersona=value}
  function react(name,who){
    const poses={celebrate:'celebrate',incorrect:'incorrect',greeting:'greeting','guide-right':'hover','guide-left':'hover'};
    const next=poses[name];if(!next)return;
    // A hover or greeting must not replace feedback for a committed answer.
    if(['celebrate','incorrect'].includes(reaction)&&!['celebrate','incorrect'].includes(next))return;
    persona(who);reaction=next;stage.dataset.reaction=next;sync();clearTimeout(reactionTimer);
    reactionTimer=setTimeout(()=>{reaction='';delete stage.dataset.reaction;sync()},1500);
  }
  window.addEventListener('elx-speech-start',event=>{persona(event.detail?.persona||window.ELXAssistentes?.getPersona?.());speakingPersona=stage.dataset.activePersona||null;speaking=true;listening=false;sync()});
  for(const eventName of ['elx-speech-end','elx-speech-paused','elx-voice-unavailable'])window.addEventListener(eventName,event=>{const endedPersona=event.detail?.persona;if (endedPersona && speakingPersona && endedPersona !== speakingPersona) return;speakingPersona=null;speaking=false;sync()});
  window.addEventListener('elx-user-speaking',()=>{speakingPersona=null;speaking=false;listening=true;sync()});
  window.addEventListener('elx-user-speech-end',()=>{listening=false;sync()});
  window.addEventListener('elx-mascot-react',event=>react(event.detail?.pose,event.detail?.who));
  window.addEventListener('elx-persona-setting',event=>{persona(event.detail?.persona);sync()});
  const selector='.option,.dpi-case-option,.dpi-round-option,.dpi-target-dot';
  for(const type of ['pointerover','focusin'])document.addEventListener?.(type,event=>{const button=event.target.closest?.(selector);if(button&&!button.disabled){attention=true;sync()}});
  for(const type of ['pointerout','focusout'])document.addEventListener?.(type,event=>{if(event.target.closest?.(selector)&&!event.relatedTarget?.closest?.(selector)){attention=false;sync()}});
  // Results can reuse a DOM node: track its committed class/content, not just its identity.
  const seen=new WeakMap();let queued=false;
  function scanResults(){queued=false;document.querySelectorAll('.feedback.ok,.feedback.no,.dpi-case-feedback.is-correct,.dpi-case-feedback.is-wrong,.dpi-round-result.is-correct,.dpi-round-result.is-wrong').forEach(node=>{
    if(node.getClientRects&&!node.getClientRects().length)return;
    const state=node.matches('.ok,.is-correct')?'celebrate':'incorrect',signature=state+'|'+node.textContent;
    if(seen.get(node)===signature)return;seen.set(node,signature);window.dispatchEvent(new CustomEvent('dpi-animation-result',{detail:{correct:state==='celebrate'}}));attention=false;react(state,window.ELXAssistentes?.getPersona?.());
  })}
  if (typeof MutationObserver === 'function' && document.body && document.querySelectorAll) new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(scanResults)}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  document.addEventListener?.('visibilitychange',()=>{stage.dataset.motionPaused=String(document.hidden);if(document.hidden){speaking=false;listening=false;attention=false;reaction='';clearTimeout(reactionTimer);delete stage.dataset.reaction;sync()}});
  persona(window.ELXAssistentes?.getPersona?.()||'male');sync();
  stage.addEventListener('click', event => {
    const hotspot = event.target.closest('.elx-mascot-hotspot[data-persona]');
    if(hotspot){
      event.preventDefault();event.stopImmediatePropagation();
      const who=hotspot.dataset.persona;
      window.dpiChoosePersona?.(who);
      if(!window.ELXAssistentes?.isEnabled?.())window.ELXAssistentes?.setEnabled?.(true);
      window.dpiPlayApproved?.();react('greeting',who);
    }
  },true);
})();
