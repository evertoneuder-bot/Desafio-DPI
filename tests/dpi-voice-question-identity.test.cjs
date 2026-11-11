'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const router = fs.readFileSync(path.join(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');

test('voice question detection distinguishes a new DOM question from repeated text', () => {
  assert.match(router, /let lastSpokenQuestion = null;/);
  assert.match(router, /question !== lastSpokenQuestion \|\| prompt !== lastSpokenPrompt/);
  assert.match(router, /lastSpokenQuestion = question;/);
  assert.doesNotMatch(router, /if \(prompt && prompt !== lastSpokenPrompt\)/);
});

test('question text uses real whitespace normalization, not a literal slash-s', () => {
  const lines = router.split('\n').filter(line => line.includes('question.textContent') || line.includes('question?.textContent'));
  assert.ok(lines.length >= 3);
  for (const line of lines) {
    assert.match(line, /replace\(\/\\s\+\/g,/);
    assert.doesNotMatch(line, /replace\(\/\\\\s\+\/g,/);
  }
});

test('voice diagnostics do not contain question text or identifiers', () => {
  assert.match(router, /browserVoiceSpeaking:/);
  assert.match(router, /browserVoicePending:/);
  assert.match(router, /neuralAssistantEnabled:/);
  const diagnostic = router.match(/keep\(diagnostics\.questions, \{([\s\S]*?)\}\);/);
  assert.ok(diagnostic);
  assert.doesNotMatch(diagnostic[1], /\b(prompt|text|questionId|patient|key)\s*:/);
});

test('question scan uses a bounded, coalesced timer instead of an indefinitely reset debounce', () => {
  assert.match(router, /if \(scanTimer\) return;/);
  assert.match(router, /scanTimer = root\.setTimeout\(scan, 32\);/);
  assert.match(router, /scanTimer = 0;/);
  assert.doesNotMatch(router, /clearTimeout\(scanTimer\); scanTimer = root\.setTimeout\(scan, 160\)/);
});
