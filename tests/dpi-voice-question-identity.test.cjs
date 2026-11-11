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

test('client audio playback timing is read-only and excludes media URLs or audio contents', () => {
  assert.match(router, /doc\.addEventListener\('playing', event => \{/);
  assert.match(router, /event\.target\?\.tagName !== 'AUDIO'/);
  assert.match(router, /keep\(diagnostics\.mediaStarts, \{/);
  const eventBlock = router.match(/keep\(diagnostics\.mediaStarts, \{([\s\S]*?)\}\);/);
  assert.ok(eventBlock);
  assert.doesNotMatch(eventBlock[1], /\b(src|url|text|prompt|voiceId|patient)\s*:/);
});

test('narration invocation diagnostics distinguish reader and fallback without storing speech text', () => {
  assert.match(router, /diagnostics\.narrationCalls \|\|= \[\]/);
  assert.match(router, /keep\(diagnostics\.narrationCalls, \{/);
  assert.match(router, /path: viaReader \? 'public-question-reader' : 'assistant-fallback'/);
  const block = router.match(/keep\(diagnostics\.narrationCalls, \{([\s\S]*?)\}\);/);
  assert.ok(block);
  assert.doesNotMatch(block[1], /\b(text|prompt|content|src|url|apiKey|voiceId)\s*:/);
});

test('outdated narration cannot speak after a question is replaced or moved', () => {
  assert.match(router, /let narrationGeneration = 0;/);
  assert.match(router, /const generation = \+\+narrationGeneration;/);
  assert.match(router, /generation !== narrationGeneration/);
  assert.match(router, /!internal\.contains\(question\)/);
});

test('narration timing uses the detection time of its own question', () => {
  assert.match(router, /const detectedAt = latestQuestionAt;/);
  assert.match(router, /msAfterQuestionDetected: Math\.round\(now\(\) - detectedAt\)/);
  assert.doesNotMatch(router, /msAfterQuestionDetected: Math\.round\(now\(\) - latestQuestionAt\)/);
});

test('answer feedback takes priority over scheduling question narration', () => {
  const scanBody = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.ok(scanBody.indexOf('const result = internal.querySelector(resultSelector)') < scanBody.indexOf('const question = internal.querySelector'));
  assert.match(scanBody, /\+\+narrationGeneration;\s*openResult\(result\);\s*return;/);
  assert.match(scanBody, /if \(doc\.querySelector\('\.dpi-answer-dialog'\)\) return;/);
});

test('pending question narration is suppressed if feedback appeared before playback', () => {
  const scanBody = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scanBody, /internal\.querySelector\(resultSelector\) \|\| doc\.querySelector\('\.dpi-answer-dialog'\)/);
  assert.match(scanBody, /generation !== narrationGeneration/);
});

test('timed DOM simulation prevents question/feedback narration collisions', () => {
  const from = router.indexOf('  function installQuestionAndResultFlow() {');
  const to = router.indexOf("  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', installQuestionAndResultFlow");
  assert.ok(from >= 0 && to > from);
  const installer = router.slice(from, to);
  function simulate(phase) {
    let clock = 0, nextId = 0, timers = [], observer;
    let reads = 0, feedback = null, dialog = false;
    let question = { textContent: 'Pergunta A', isConnected: true };
    const internal = {
      querySelector: selector => selector.startsWith('.dpi-round-question') ? question :
        selector.startsWith('#internal .feedback') ? feedback : null,
      contains: node => node === question
    };
    const doc = {
      body: {},
      getElementById: () => internal,
      querySelector: selector => selector.includes('.dpi-round-question') && selector.startsWith('#internal ') ? question :
        selector === '.dpi-answer-dialog' && dialog ? {} : null,
      addEventListener: () => {}
    };
    const root = {
      document: doc, performance: { now: () => clock }, addEventListener: () => {},
      setTimeout(fn, delay) {
        const timer = { at: clock + delay, id: ++nextId, fn };
        timers.push(timer);
        return timer.id;
      },
      clearTimeout(id) { timers = timers.filter(timer => timer.id !== id); },
      MutationObserver: class {
        constructor(callback) { observer = callback; }
        observe() {}
      },
      dpiReadQuestion() { reads++; },
      speechSynthesis: { speaking: false, pending: false }
    };
    new Function('root', installer + '\ninstallQuestionAndResultFlow();')(root);
    function advance(toTime) {
      for (;;) {
        const job = timers.filter(item => item.at <= toTime).sort((a, b) => a.at - b.at || a.id - b.id)[0];
        if (!job) break;
        timers = timers.filter(item => item !== job);
        clock = job.at;
        job.fn();
      }
      clock = toTime;
    }
    if (phase === 'normal') advance(300);
    else if (phase === 'inline-reader-first') {
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'inline-reader-after-detection') {
      advance(50);
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'disappear-return') {
      advance(300);
      const previousQuestion = question;
      question = null;
      observer();
      advance(350);
      question = previousQuestion;
      observer();
      advance(650);
    } else {
      advance(50);
      if (phase === 'feedback') feedback = { isConnected: false };
      if (phase === 'dialog') dialog = true;
      if (phase === 'replacement') question = { textContent: 'Pergunta B', isConnected: true };
      observer();
      advance(350);
    }
    return { reads, recorded: root.__dpiAudioDiagnostics.narrationCalls.length };
  }
  assert.deepEqual(simulate('normal'), { reads: 1, recorded: 1 });
  assert.deepEqual(simulate('inline-reader-first'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('inline-reader-after-detection'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('feedback'), { reads: 0, recorded: 0 });
  assert.deepEqual(simulate('dialog'), { reads: 0, recorded: 0 });
  assert.deepEqual(simulate('replacement'), { reads: 1, recorded: 1 });
  assert.deepEqual(simulate('disappear-return'), { reads: 2, recorded: 2 });
});

test('question identity resets when the question temporarily disappears', () => {
  const scanBody = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scanBody, /if \(!prompt\) \{/);
  assert.match(scanBody, /if \(lastSpokenQuestion\) \+\+narrationGeneration;/);
  assert.match(scanBody, /lastSpokenQuestion = null;\s*lastSpokenPrompt = '';/);
});

test('public question reader is tracked without exposing prompt text or mutating its return', () => {
  const from = router.indexOf("    // The inline game sometimes calls its own public reader");
  assert.ok(from > 0);
  const snippet = router.slice(from, router.indexOf('    let latestQuestionAt = 0;', from));
  assert.match(snippet, /return originalReadQuestion\.apply\(this, arguments\);/);
  assert.doesNotMatch(snippet, /keep\(diagnostics/);
  const scan = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan, /lastPublicRead\?\.question === question/);
  assert.match(scan, /lastPublicRead\.prompt === prompt/);
});
