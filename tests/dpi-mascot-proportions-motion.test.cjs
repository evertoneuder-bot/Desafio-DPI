'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-rounds.css'), 'utf8');
const motion = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js'), 'utf8');

test('approved art is retained, with independent male and female layers', () => {
  assert.match(motion, /sourceImage\.replaceWith\(art\)/);
  assert.match(motion, /window\.DPI2DArtwork\.create\(src,persona\)/);
  assert.match(motion, /\['male', 'Tom'\]/);
  assert.match(motion, /\['female', 'Fernanda'\]/);
  assert.match(css, /clip-path:inset\(0 48\.32% 0 0\)/);
  assert.match(css, /clip-path:inset\(0 0 0 51\.68%\)/);
});
test('Fernanda is smaller than Tom in every animation state', () => {
  assert.match(css, /--elx-persona-scale:1;/);
  assert.match(css, /data-persona="female"\]\{--elx-persona-scale:\.8;/);
  for (const state of ['elxMascotIdle','elxMascotSpeak','elxMascotListen','elxMascotGreet','elxMascotCheer','elxMascotComfort']) {
    const match = css.match(new RegExp('@keyframes '+ state +'\\{([^\\n]+)'));
    assert.ok(match, 'Missing motion state '+state);
    assert.match(match[1], /scale\(var\(--elx-persona-scale\)\)/);
  }
  assert.match(css, /prefers-reduced-motion:reduce\)\{#elx-character-stage \.elx-mascot-motion-persona\{animation:none!important;transform:scale\(var\(--elx-persona-scale\)\)/);
});
test('canvas renderer scales Fernanda to 80% exactly once; fallback image uses the same ratio', () => {
  const renderer = fs.readFileSync(path.join(__dirname, '../assets/fsm/sprite-renderer.js'), 'utf8');
  const artwork = fs.readFileSync(path.join(__dirname, '../assets/dpi-2d-art.js'), 'utf8');
  assert.match(renderer, /characterScale = canvas\.dataset\.persona === 'female' \? \.8 : 1/);
  assert.match(artwork, /dpi-acting-canvas/);
  assert.ok(css.includes('[data-persona="female"]:has(> .dpi-acting-canvas){--elx-persona-scale:1}'));
  assert.ok(css.includes('[data-persona="female"]{--elx-persona-scale:.8;'));
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
  for (const state of ['dpi2DIdle','dpi2DSpeak','dpi2DListen','dpi2DGreet','dpi2DCheer','dpi2DComfort']) {
    const keyframe = motion.split('@keyframes '+state+'{')[1]?.split('}')[0];
    assert.ok(keyframe, 'Missing articulated motion '+state);
    assert.ok(keyframe.includes('scale(var(--elx-persona-scale))'), 'Scale must survive '+state);
  }
});


test('head articulation never reapplies body persona scale', () => {
  for (const state of ['dpiHeadIdle','dpiHeadTalk','dpiHeadListen','dpiHeadGreet','dpiHeadConcern']) {
    const keyframe = motion.split('@keyframes '+state+'{')[1]?.split('}')[0];
    assert.ok(keyframe, 'Missing head motion '+state);
    assert.ok(!keyframe.includes('--elx-persona-scale'), 'Head must not scale independently in '+state);
  }
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
  assert.match(motion, /persona\(who\);reaction=next/);
  assert.match(motion, /data-active-persona=\"\$\{who\}\"/);
});

test('idle puppet motion is not globally overridden by an unconditional animation reset', () => {
  assert.ok(motion.includes('animation:dpi2DIdle 4.8s ease-in-out infinite!important'));
  assert.ok(!motion.includes('#elx-character-stage.elx-motion-active[data-active-persona][data-motion-state] .elx-mascot-motion-persona[data-persona],#elx-character-stage.elx-motion-active .elx-mascot-motion-persona{animation:none!important;transform:none!important}'));
});
