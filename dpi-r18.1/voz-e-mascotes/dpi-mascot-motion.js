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
  window.addEventListener('elx-speech-end', () => stage.classList.remove('is-speaking'));
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
