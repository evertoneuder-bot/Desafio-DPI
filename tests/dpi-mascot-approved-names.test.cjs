'use strict';
// Static regression: approved character names in captions and accessible mascot labels.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const directory = path.join(__dirname, '..', 'dpi-r18.1', 'voz-e-mascotes');
const router = fs.readFileSync(path.join(directory, 'dpi-launch-router.js'), 'utf8');
const motion = fs.readFileSync(path.join(directory, 'dpi-mascot-motion.js'), 'utf8');

test('speech captions name the approved Tom and Fernanda personas', () => {
  assert.match(router, /event\.detail\?\.persona === 'female' \? 'Fernanda' : 'Tom'/);
  assert.doesNotMatch(router, /'Everton'/);
});

test('mascot accessible labels use Tom and Fernanda', () => {
  assert.match(motion, /Tom e Fernanda, mascotes veterinários com radioproteção/);
  assert.match(motion, /\['male', 'Tom'\]/);
  assert.match(motion, /\['female', 'Fernanda'\]/);
  assert.doesNotMatch(motion, /Everton/);
});
