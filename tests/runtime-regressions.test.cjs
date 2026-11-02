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

test('an explicit device-voice preference is preserved', () => {
  const storage = { getItem: () => '1' };
  let selected;
  applyDeviceVoiceDefault(storage, value => { selected = value; });
  assert.equal(selected, undefined);
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
