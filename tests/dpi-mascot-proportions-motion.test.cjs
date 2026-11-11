'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-rounds.css'), 'utf8');
const motion = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js'), 'utf8');

test('approved art is retained, with independent male and female layers', () => {
  assert.match(motion, /sourceImage\.replaceWith\(art\)/);
  assert.match(motion, /img\.src = src/);
  assert.match(motion, /\['male', 'Everton'\]/);
  assert.match(motion, /\['female', 'Fernanda'\]/);
  assert.match(css, /clip-path:inset\(0 48\.32% 0 0\)/);
  assert.match(css, /clip-path:inset\(0 0 0 51\.68%\)/);
});
test('Fernanda is smaller than Tom in every animation state', () => {
  assert.match(css, /--elx-persona-scale:1;/);
  assert.match(css, /data-persona="female"\]\{--elx-persona-scale:\.88;/);
  for (const state of ['elxMascotIdle','elxMascotSpeak','elxMascotListen','elxMascotGreet','elxMascotCheer','elxMascotComfort']) {
    const match = css.match(new RegExp('@keyframes '+ state +'\\{([^\\n]+)'));
    assert.ok(match, 'Missing motion state '+state);
    assert.match(match[1], /scale\(var\(--elx-persona-scale\)\)/);
  }
  assert.match(css, /prefers-reduced-motion:reduce\)\{#elx-character-stage \.elx-mascot-motion-persona\{animation:none!important;transform:scale\(var\(--elx-persona-scale\)\)/);
});
test('motion is slower and eased rather than a mechanically looping bounce', () => {
  assert.match(css, /animation:elxMascotIdle 5\.8s ease-in-out infinite/);
  assert.match(css, /animation:elxMascotSpeak 2\.1s ease-in-out infinite/);
  assert.doesNotMatch(css, /animation:elxMascotSpeak \.48s ease-in-out infinite alternate/);
});
test('speech only animates the selected persona; both retain rest animation', () => {
  assert.match(css, /data-active-persona="male"\]\.is-speaking/);
  assert.match(css, /data-active-persona="female"\]\.is-speaking/);
  assert.match(motion, /event\.detail\?\.persona/);
  assert.match(motion, /elx-speech-end/);
});

test('one persona reacts at a time, while the other keeps natural idle animation', () => {
  for (const state of ['is-greeting', 'is-correct', 'is-incorrect']) {
    for (const persona of ['male','female']) {
      const selector = '#elx-character-stage[data-active-persona="' + persona + '"].' + state +
        ' .elx-mascot-motion-persona[data-persona="' + persona + '"]';
      assert.ok(css.includes(selector), 'Missing active selector '+selector);
    }
    assert.doesNotMatch(css, new RegExp('#elx-character-stage\\.'+state+' \\.elx-mascot-motion-persona'));
  }
  assert.match(motion, /persona\(who \|\| stage\.dataset\.activePersona \|\| window\.ELXAssistentes\?\.getPersona\?\.\(\) \|\| 'male'\)/);
});
