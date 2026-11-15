'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js'), 'utf8');

test('a stale speech-end from the other persona cannot stop the active mascot', () => {
  const listeners = {};
  const classes = new Set();
  const stage = {
    dataset: {},
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name))
    },
    querySelector: () => sourceImage,
    addEventListener: () => {},
    appendChild: () => {}
  };
  const sourceImage = {
    src: '/approved-mascots.png',
    replaceWith: () => {}
  };
  const makeNode = () => ({
    dataset: {},
    className: '',
    setAttribute: () => {},
    appendChild: () => {}
  });
  const window = {
    addEventListener: (name, fn) => { listeners[name] = fn; },
    ELXAssistentes: { getPersona: () => 'male' }
  };
  vm.runInNewContext(source, {
    window,
    document: {
      getElementById: () => stage,
      createElement: makeNode
    },
    setTimeout: () => 1,
    clearTimeout: () => {}
  });
  listeners['elx-speech-start']({ detail: { persona: 'male' } });
  assert.equal(classes.has('is-speaking'), true);
  listeners['elx-speech-start']({ detail: { persona: 'female' } });
  assert.equal(stage.dataset.activePersona, 'female');
  listeners['elx-speech-end']({ detail: { persona: 'male' } });
  assert.equal(classes.has('is-speaking'), true, 'late Tom end must not stop Fernanda');
  listeners['elx-speech-end']({ detail: { persona: 'female' } });
  assert.equal(classes.has('is-speaking'), false, 'Fernanda end stops her speech');
});

test('untagged legacy speech-end still stops speaking', () => {
  assert.match(source, /if \(endedPersona && endedPersona !== stage\.dataset\.activePersona\) return;/);
  assert.match(source, /stage\.classList\.remove\('is-speaking'\)/);
});
