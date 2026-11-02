const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html', 'utf8');
const start = html.indexOf('function say(text,who=persona,scientific=false,done){');
const end = html.indexOf('\nfunction toggle(', start);
assert.ok(start >= 0 && end > start, 'the app speech router must remain discoverable');
const source = html.slice(start, end);

function fixture({ voiceStatus = null, deviceVoice = true } = {}) {
  const calls = { check: 0, neural: [], device: [], resolved: [] };
  const context = {
    enabled: true,
    persona: 'male',
    neuralStatus: voiceStatus,
    neuralStatusPromise: null,
    speechRequest: 0,
    generation: 1,
    deviceVoice,
    checkNeural() { calls.check++; },
    neuralSay(...args) { calls.neural.push(args); return true; },
    sayDevice(...args) { calls.device.push(args); },
    sayResolved(...args) { calls.resolved.push(args); },
    window: {
      DPISpeechPlan: { cleanSpeech: text => text },
      Audio: function Audio() {}
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { calls, say: context.say };
}

test('new speech uses the configured server voice while status is still loading', () => {
  const f = fixture({ deviceVoice: false });
  f.say('Vamos começar', 'male');
  assert.equal(f.calls.check, 1);
  assert.equal(f.calls.neural.length, 1);
  assert.equal(f.calls.device.length, 0);
});

test('a configured female server voice is used without waiting for status polling', () => {
  const f = fixture({ voiceStatus: { configured: true, femaleConfigured: true } });
  f.say('Vamos começar', 'female');
  assert.equal(f.calls.neural.length, 1);
  assert.equal(f.calls.device.length, 0);
});
