const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'game', 'part08.txt'), 'utf8');
const start = source.indexOf('let speechRun=0,speechMusicVolume=null;');
const end = source.indexOf('\nfunction quizMenu()', start);
const speechCode = source.slice(start, end);

test('answer and home paths stop ongoing question narration', () => {
  assert.match(source, /function answer\(i,el\)\{\s*stopSpeech\(\);/);
  assert.match(source, /function showHome\(\)\{stopSpeech\(\);/);
});

test('stopSpeech cancels active voice, restores music and ignores late events', () => {
  const utterances = [], bgm = { volume: 0.075 };
  let cancellations = 0;
  const synth = { cancel() { cancellations++; }, speak() {} };
  class Utterance { constructor(text) { this.text=text; utterances.push(this); } }
  const { speak, stopSpeech } = new Function('state','window','speechSynthesis','bgm','SpeechSynthesisUtterance',
    speechCode + '\nreturn {speak,stopSpeech};'
  )({voice:true}, {speechSynthesis:synth}, synth, bgm, Utterance);
  speak('Pergunta');
  assert.equal(bgm.volume, 0.025);
  stopSpeech();
  assert.equal(bgm.volume, 0.075);
  utterances[0].onend();
  assert.equal(bgm.volume, 0.075);
  assert.equal(cancellations, 2);
});

test('stopSpeech is safe before the first utterance', () => {
  const bgm = {volume:0.16};
  const synth = {cancel() {}};
  const {stopSpeech} = new Function('state','window','speechSynthesis','bgm','SpeechSynthesisUtterance',
    speechCode + '\nreturn {stopSpeech};'
  )({voice:true},{speechSynthesis:synth},synth,bgm,class {});
  stopSpeech();
  assert.equal(bgm.volume,0.16);
});
