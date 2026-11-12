const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'game', 'part08.txt'), 'utf8');
const start = source.indexOf('let speechRun=0,speechMusicVolume=null;');
const end = source.indexOf('\nfunction quizMenu()', start);
const speechCode = source.slice(start, end);

test('desktop music stays lowered while a replacement utterance plays', () => {
  assert.ok(start >= 0 && end > start);
  const utterances = [];
  const bgm = { volume: 0.16 };
  const state = { voice: true };
  const synth = {cancel() {}, speak() {}};
  class Utterance {
    constructor(text) { this.text = text; utterances.push(this); }
  }
  const speak = new Function('state', 'window', 'speechSynthesis', 'bgm', 'SpeechSynthesisUtterance',
    speechCode + '\nreturn speak;'
  )(state, {speechSynthesis: synth}, synth, bgm, Utterance);

  speak('Pergunta 1');
  assert.equal(bgm.volume, 0.025);
  speak('Pergunta 2');
  utterances[0].onend();
  assert.equal(bgm.volume, 0.025, 'the old utterance cannot turn music up over the new voice');
  utterances[1].onend();
  assert.equal(bgm.volume, 0.16, 'restore original music volume when current voice ends');
  speak('Pergunta 3');
  utterances[2].onerror();
  assert.equal(bgm.volume, 0.16, 'restore music even when the current voice fails');
});

test('desktop audio cancellation preserves last baseline across several replacements', () => {
  const utterances = [], bgm = {volume:0.075};
  class Utterance { constructor(text){this.text=text;utterances.push(this)} }
  const synth = {cancel(){},speak(){}};
  const speak = new Function('state','window','speechSynthesis','bgm','SpeechSynthesisUtterance',
    speechCode + '\nreturn speak;'
  )({voice:true},{speechSynthesis:synth},synth,bgm,Utterance);
  speak('A');speak('B');speak('C');
  utterances[0].onerror();
  utterances[1].onend();
  assert.equal(bgm.volume,0.025);
  utterances[2].onend();
  assert.equal(bgm.volume,0.075);
});
