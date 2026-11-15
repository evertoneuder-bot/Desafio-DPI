'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const router = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');

test('late end event from Tom does not close an active Fernanda caption', () => {
  const start = router.indexOf('    let captionTimer = 0;');
  const end = router.indexOf('    // Reveal the complete workflow', start);
  assert.ok(start >= 0 && end > start, 'caption handler must exist');
  const listeners = {};
  const activeClasses = new Set();
  const bubble = {
    replaceChildren() {},
    classList: {
      add: name => activeClasses.add(name),
      remove: name => activeClasses.delete(name)
    }
  };
  const root = {
    pending: null,
    addEventListener(name, fn) { listeners[name] = fn; },
    setInterval() { return 1; },
    clearInterval() {},
    setTimeout(fn) { this.pending = fn; return 2; },
    clearTimeout() { this.pending = null; }
  };
  const doc = {
    querySelector: () => bubble,
    querySelectorAll: () => [bubble],
    createElement: () => ({ textContent: '', setAttribute() {} })
  };
  new Function('root', 'doc', router.slice(start, end))(root, doc);
  listeners['elx-speech-start']({ detail: { persona: 'male', text: 'Tom' } });
  listeners['elx-speech-start']({ detail: { persona: 'female', text: 'Fernanda' } });
  listeners['elx-speech-end']({ detail: { persona: 'male' } });
  assert.equal(root.pending, null, 'late Tom end must not hide Fernanda caption');
  assert.equal(activeClasses.has('is-speaking'), true);
  listeners['elx-speech-end']({ detail: { persona: 'female' } });
  assert.equal(typeof root.pending, 'function');
  root.pending();
  assert.equal(activeClasses.has('is-speaking'), false);
});
