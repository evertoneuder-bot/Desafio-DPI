'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../game/part08.txt'), 'utf8');
const start = source.indexOf('let speechRun=0,speechMusicVolume=null;');
const end = source.indexOf('\nfunction quizMenu()', start);

test('idle engine is not cancelled before starting each question', () => {
  assert.ok(start >= 0 && end > start);
  let cancels = 0;
  let calls = 0;
  const synth = {
    speaking: false, pending: false, paused: false,
    cancel() { cancels++; },
    speak() { calls++; }
  };
  const win = {speechSynthesis: synth, performance: {now: () => 0}};
  class Utterance { constructor(text) { this.text = text; } }
  const speak = new Function('state','window','speechSynthesis','bgm','SpeechSynthesisUtterance',
    source.slice(start,end) + '\nreturn speak;'
  )({voice:true},win,synth,{volume:0.16},Utterance);
  speak('Pergunta 1');
  speak('Pergunta 2');
  assert.equal(cancels, 0);
  assert.equal(calls, 2);
  synth.speaking = true;
  speak('Pergunta 3');
  assert.equal(cancels, 1, 'active speech must still be cancelled to avoid overlap');
});
