/* R32: motion states for the approved transparent mascot art. */
(function () {
  'use strict';
  let gameReactionTimer=0;
  const gamePose=pose=>document.querySelectorAll?.('.dpi-play-mascot,.dpi-wordgame-coach img,.elx-mascot-motion-persona').forEach(image=>{const selected=window.ELXAssistentes?.getPersona?.()||'male';image.dataset.voicePose=pose==='speaking'&&image.dataset.persona&&image.dataset.persona!==selected?'listening':pose});
  const desktopCoachStyle=document.createElement('style');
  desktopCoachStyle.id='dpi-coach-desktop-persistent-layout';
  desktopCoachStyle.textContent='@media (min-width: 761px){.dpi-play-coach:not(.is-speaking),.dpi-play-coach.is-speaking{min-height:430px!important}.dpi-play-coach:not(.is-speaking) .dpi-play-mascot,.dpi-play-coach.is-speaking .dpi-play-mascot{height:300px!important;width:min(100%,285px)!important}}';
  document.head?.appendChild(desktopCoachStyle);
  window.addEventListener('elx-speech-start',()=>{clearTimeout(gameReactionTimer);gamePose('speaking')});
  for(const event of ['elx-speech-end','elx-speech-paused','elx-voice-unavailable'])window.addEventListener(event,()=>{clearTimeout(gameReactionTimer);gamePose('idle')});
  window.addEventListener('elx-user-speaking',()=>gamePose('listening'));
  window.addEventListener('elx-user-speech-end',()=>gamePose('idle'));
  window.addEventListener('elx-mascot-react',event=>{const pose=event.detail?.pose;if(!['celebrate','incorrect','greeting'].includes(pose))return;clearTimeout(gameReactionTimer);gamePose(pose);gameReactionTimer=setTimeout(()=>gamePose('idle'),1800)});
  const stage = document.getElementById('elx-character-stage');
  const sourceImage = stage?.querySelector('img.elx-approved-mascot-pair');
  if (!stage || !sourceImage) return;

  const src = sourceImage.currentSrc || sourceImage.src;
  const art = document.createElement('div');
  art.className = 'elx-approved-mascot-pair elx-approved-mascot-motion';
  art.setAttribute('role', 'img');
  art.setAttribute('aria-label', 'Everton e Fernanda, mascotes veterinários com radioproteção');
  for (const [persona, label] of [['male', 'Everton'], ['female', 'Fernanda']]) {
    const figure = document.createElement('span');
    figure.className = 'elx-mascot-motion-persona';
    figure.dataset.persona = persona;
    figure.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    img.dataset.character = label;
    figure.appendChild(img);
    art.appendChild(figure);
  }
  sourceImage.replaceWith(art);
  stage.classList.add('elx-motion-active');

  let reactionTimer;
  function persona(value) {
    if (value === 'female' || value === 'male') stage.dataset.activePersona = value;
  }
  function react(name, who) {
    persona(who);
    stage.dataset.reaction = name;
    stage.classList.remove('is-greeting', 'is-correct', 'is-incorrect');
    const state = name === 'greeting' ? 'is-greeting' : name === 'celebrate' ? 'is-correct' : name === 'incorrect' ? 'is-incorrect' : '';
    if (state) stage.classList.add(state);
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => {
      stage.classList.remove('is-greeting', 'is-correct', 'is-incorrect');
      delete stage.dataset.reaction;
    }, 1500);
  }
  window.addEventListener('elx-speech-start', event => {
    persona(event.detail?.persona || window.ELXAssistentes?.getPersona?.());
    stage.classList.add('is-speaking');
    stage.classList.remove('is-listening');
  });
  for (const event of ['elx-speech-end', 'elx-speech-paused', 'elx-voice-unavailable']) {
    window.addEventListener(event, () => stage.classList.remove('is-speaking'));
  }
  window.addEventListener('elx-user-speaking', () => {
    stage.classList.remove('is-speaking');
    stage.classList.add('is-listening');
  });
  window.addEventListener('elx-user-speech-end', () => stage.classList.remove('is-listening'));
  window.addEventListener('elx-mascot-react', event => react(event.detail?.pose || 'idle', event.detail?.who));
  stage.addEventListener('click', event => {
    const hotspot = event.target.closest('.elx-mascot-hotspot[data-persona]');
    if (hotspot) react('greeting', hotspot.dataset.persona);
  });
})();
