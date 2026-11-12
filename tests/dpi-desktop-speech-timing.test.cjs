const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'game', 'part08.txt'), 'utf8');
const start = source.indexOf('let speechRun=0,speechMusicVolume=null;');
const end = source.indexOf('\nfunction quizMenu()', start);

test('desktop speech exposes elapsed time to first audio event without storing spoken text', () => {
  assert.ok(start >= 0 && end > start);
  const utterances = [];
  let clock = 100;
  const win = { performance: { now: () => clock } };
  const synth = { cancel() {}, speak() {} };
  const bgm = { volume: 0.16 };
  class Utterance {
    constructor(text) { this.text = text; utterances.push(this); }
  }
  const speak = new Function('state', 'window', 'speechSynthesis', 'bgm', 'SpeechSynthesisUtterance',
    source.slice(start, end) + '\nreturn speak;'
  )({ voice: true }, win, synth, bgm, Utterance);
  speak('Pergunta confidencial A');
  clock = 235;
  utterances[0].onstart();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[0].startDelayMs, 135);
  assert.equal(win.__dpiDesktopSpeechTiming.samples[0].outcome, 'started');
  assert.doesNotMatch(JSON.stringify(win.__dpiDesktopSpeechTiming), /Pergunta|confidencial/);
  assert.equal(bgm.volume, 0.025);
  utterances[0].onend();
  assert.equal(bgm.volume, 0.16);
});

test('desktop timing holds bounded samples and does not let stale speech restore music', () => {
  const utterances = [];
  let clock = 0;
  const win = { performance: { now: () => clock } };
  const synth = { cancel() {}, speak() {} };
  const bgm = { volume: 0.12 };
  class Utterance { constructor(text) { utterances.push(this); } }
  const speak = new Function('state', 'window', 'speechSynthesis', 'bgm', 'SpeechSynthesisUtterance',
    source.slice(start, end) + '\nreturn speak;'
  )({ voice: true }, win, synth, bgm, Utterance);
  for (let i = 0; i < 32; i++) { clock += 10; speak('Q' + i); }
  assert.equal(win.__dpiDesktopSpeechTiming.samples.length, 30);
  utterances[30].onstart();
  utterances[30].onend();
  assert.equal(bgm.volume, 0.025);
  clock += 80;
  utterances[31].onstart();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[29].startDelayMs, 80);
  utterances[31].onend();
  assert.equal(bgm.volume, 0.12);
});
