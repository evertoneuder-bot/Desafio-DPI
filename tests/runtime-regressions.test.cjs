const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { applyDeviceVoiceDefault, removeTutorOption } = require('../dpi-r18.1/voz-e-mascotes/dpi-profile-draft.js');
const router = fs.readFileSync('dpi-r18.1/voz-e-mascotes/dpi-launch-router.js', 'utf8');

test('first load keeps the approved server voice as default, not device speech', () => {
  const values = new Map();
  const storage = { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) };
  let selected;
  applyDeviceVoiceDefault(storage, value => { selected = value; });
  assert.equal(selected, false);
  assert.equal(values.get('dpi-device-voice'), '0', 'persist the non-robotic default for the next screen/load');
});

test('legacy auto-enabled device speech is reset once without affecting future manual choices', () => {
  const values = new Map([['dpi-device-voice', '1']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let selected;
  applyDeviceVoiceDefault(storage, value => { selected = value; });
  assert.equal(selected, false);
  assert.equal(values.get('dpi-device-voice'), '0');
  assert.equal(values.get('dpi-device-voice-migrated-v1'), '1');
  values.set('dpi-device-voice', '1');
  selected = undefined;
  applyDeviceVoiceDefault(storage, value => { selected = value; });
  assert.equal(selected, undefined);
  assert.equal(values.get('dpi-device-voice'), '1');
});

test('registration no longer offers the unrelated tutor profile', () => {
  const option = { value: 'client', removed: false, remove() { this.removed = true; } };
  const select = { options: [option, { value: 'vet' }] };
  removeTutorOption(select);
  assert.equal(option.removed, true);
});

test('voice recovery never enables device speech when no preference exists', () => {
  assert.doesNotMatch(router, /dpiUseDeviceVoice\(true\)/);
  assert.match(router, /storage\.getItem\('dpi-device-voice'\) == null/);
  assert.match(router, /root\.dpiUseDeviceVoice\(false\)/);
});
