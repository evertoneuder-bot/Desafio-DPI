'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js'), 'utf8');

test('reaction changes visual persona without stealing ownership of active speech', () => {
  const listeners = {};
  const classes = new Set();
  const stage = {
    dataset: {},
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name))
    },
    querySelector: () => ({src:'/mascots.png', replaceWith(){}}),
    addEventListener(){}
  };
  vm.runInNewContext(source, {
    window: {
      addEventListener: (name, fn) => {listeners[name] = fn;},
      ELXAssistentes: {getPersona: () => 'male'}
    },
    document: {
      getElementById: () => stage,
      createElement: () => ({dataset:{},setAttribute(){},appendChild(){}})
    },
    setTimeout: () => 1,
    clearTimeout(){}
  });
  listeners['elx-speech-start']({detail:{persona:'male'}});
  listeners['elx-mascot-react']({detail:{pose:'greeting',who:'female'}});
  assert.equal(stage.dataset.activePersona, 'female');
  listeners['elx-speech-end']({detail:{persona:'male'}});
  assert.equal(classes.has('is-speaking'), false, 'Tom must finish despite Fernanda reaction');
  listeners['elx-speech-start']({detail:{persona:'female'}});
  listeners['elx-speech-end']({detail:{persona:'male'}});
  assert.equal(classes.has('is-speaking'), true, 'late Tom end must not interrupt Fernanda');
  listeners['elx-speech-end']({detail:{persona:'female'}});
  assert.equal(classes.has('is-speaking'), false);
});
