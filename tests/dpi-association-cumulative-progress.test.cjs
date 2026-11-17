'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-game-rounds.js'), 'utf8');

test('association progress counts completed pairs from previous blocks', () => {
  // A fresh block clears matched, so the running total must include batchStart.
  const total = 'association.batchStart + association.matched.size';
  assert.ok(source.includes(total), 'cumulative total is required');
  assert.ok(source.includes("progressNode.textContent = (" + total + ")"), 'live count');
  assert.ok(source.includes("'PARES ASSOCIADOS ' + (" + total + ")"), 'meter label');
  assert.ok(source.includes('Math.round((' + total + ') / session.questions.length * 100)'), 'meter bar');
  assert.ok(source.includes("' + (" + total + ") + ' de '"), 'initial count');
  assert.ok(source.includes('association.batchStart = end; association.matched = new Set()'), 'block reset preserved');
});
