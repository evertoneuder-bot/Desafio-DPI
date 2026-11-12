'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../game/part08.txt'), 'utf8');
const start = source.indexOf('let speechRun=0,speechMusicVolume=null;');
const end = source.indexOf('\nfunction quizMenu()', start);
test('superseded desktop speech does not count as completed or failed playback', () => {
  assert.ok(start >= 0 && end > start);
  const utterances = [];
  let now = 100;
  const synth = { cancel() {}, speak() {} };
  class Utterance { constructor(text) { this.text=text; utterances.push(this); } }
  const win = {speechSynthesis:synth, performance:{now:()=>now}};
  const bgm = {volume:0.16};
  const speak = new Function('state','window','speechSynthesis','bgm','SpeechSynthesisUtterance',
    source.slice(start,end) + '\nreturn speak;'
  )({voice:true},win,synth,bgm,Utterance);
  speak('first'); now=140; speak('second');
  utterances[0].onend();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[0].outcome,'superseded-end');
  assert.equal(bgm.volume,0.025);
  now=200; utterances[1].onstart(); utterances[1].onend();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[1].outcome,'ended');
  assert.equal(win.__dpiDesktopSpeechTiming.samples[1].startDelayMs,60);
  assert.equal(bgm.volume,0.16);
  speak('third'); speak('fourth'); utterances[2].onerror();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[2].outcome,'superseded-error');
  assert.equal(bgm.volume,0.025);
  utterances[3].onerror();
  assert.equal(win.__dpiDesktopSpeechTiming.samples[3].outcome,'error');
  assert.equal(bgm.volume,0.16);
});
