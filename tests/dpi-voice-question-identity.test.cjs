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
  assert.match(scanBody, /\+\+narrationGeneration;[\s\S]*?openResult\(result\);\s*return;/);
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
    if (phase === 'reader-installed-late') delete root.dpiReadQuestion;
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
    else if (phase === 'reader-installed-late') {
      root.dpiReadQuestion = () => { reads++; return 'late'; };
      observer();
      advance(50);
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'reader-replaced') {
      root.dpiReadQuestion = () => { reads++; return 'replacement'; };
      observer();
      advance(50);
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'inline-reader-first') {
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'busy-browser-late-observation') {
      // Inline narration starts before a congested main thread lets
      // MutationObserver's initial scan detect the question.
      root.dpiReadQuestion();
      timers.forEach(timer => { if (timer.at === 32) timer.at = 900; });
      advance(1200);
    } else if (phase === 'inline-reader-after-detection') {
      advance(50);
      root.dpiReadQuestion();
      advance(300);
    } else if (phase === 'busy-browser-delayed-timer') {
      advance(50);
      root.dpiReadQuestion();
      // Simulate the browser running the existing fallback much later than due.
      timers.forEach(timer => { if (timer.at === 212) timer.at = 900; });
      advance(1000);
    } else if (phase === 'same-node-after-feedback') {
      advance(300);
      feedback = { isConnected: false };
      observer();
      advance(350);
      feedback = null;
      observer();
      advance(650);
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
  assert.deepEqual(simulate('reader-installed-late'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('reader-replaced'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('inline-reader-first'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('busy-browser-late-observation'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('inline-reader-after-detection'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('busy-browser-delayed-timer'), { reads: 1, recorded: 0 });
  assert.deepEqual(simulate('feedback'), { reads: 0, recorded: 0 });
  assert.deepEqual(simulate('dialog'), { reads: 0, recorded: 0 });
  assert.deepEqual(simulate('replacement'), { reads: 1, recorded: 1 });
  assert.deepEqual(simulate('disappear-return'), { reads: 2, recorded: 2 });
  assert.deepEqual(simulate('same-node-after-feedback'), { reads: 2, recorded: 2 });
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
  assert.match(snippet, /return reader\.apply\(this, arguments\);/);
  assert.match(snippet, /keep\(diagnostics\.publicReads/);
  assert.doesNotMatch(snippet, /keep\(diagnostics\.publicReads, \{[^}]*\b(?:prompt|text|patient|name|url|token|apiKey)\s*:/);
  const scan = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan, /lastPublicRead\?\.question === question/);
  assert.match(scan, /lastPublicRead\.prompt === prompt/);
});

test('Plantão narration guides each phase without a second competing speech', () => {
  const start = router.indexOf('    const phaseGuidance = {');
  const end = router.indexOf('    const openResult =', start);
  assert.ok(start > 0 && end > start);
  const block = router.slice(start, end);
  for (const stage of [
    'AVALIAÇÃO INICIAL', 'HISTÓRICO E TRIAGEM', 'ESTABILIZAÇÃO E SEGURANÇA',
    'PERGUNTA CLÍNICA', 'PLANO DE IMAGEM', 'MODALIDADE E PROJEÇÕES',
    'AQUISIÇÃO E POSICIONAMENTO', 'QUALIDADE TÉCNICA', 'INTERPRETAÇÃO',
    'INTEGRAÇÃO DOS ACHADOS', 'REAVALIAÇÃO E PRÓXIMA CONDUTA', 'REGISTRO E COMUNICAÇÃO'
  ]) assert.ok(block.includes("'" + stage + "':"));
  assert.match(block, /\.dpi-case-phase b/);
  assert.match(block, /\.dpi-case-option/);
  assert.match(block, /Etapa do plantão:/);
  const call = router.slice(router.indexOf("const plantaoText ="), router.indexOf("}, 180);",router.indexOf("const plantaoText =")));
  assert.match(call, /if \(plantaoText && assistant\(\)\?\.isEnabled\?\.\(\)\) speak\(plantaoText\);/);
  assert.match(call, /else if \(viaReader\) root\.dpiReadQuestion\(\);/);
});

test('Plantão primary reader includes phase explanation, question and options in one speech', () => {
  const from = router.indexOf('  function installQuestionAndResultFlow() {');
  const to = router.indexOf("  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', installQuestionAndResultFlow");
  const installer = router.slice(from, to);
  let nativeReads = 0, spoken = [];
  const phase = { textContent: 'QUALIDADE TÉCNICA' };
  const question = { textContent: 'A imagem permite avaliação?', isConnected: true,
    matches: selector => selector === '.dpi-case-question' };
  const options = [
    { textContent: 'A A imagem está adequada', querySelector: () => ({ textContent: 'A imagem está adequada' }) },
    { textContent: 'B Não, repetir aquisição', querySelector: () => ({ textContent: 'Não, repetir aquisição' }) }
  ];
  const internal = {
    querySelector: selector => selector === '.dpi-case-phase b' ? phase :
      selector.includes('.dpi-round-question') ? question : null,
    querySelectorAll: selector => selector === '.dpi-case-option' ? options : [],
    contains: node => node === question
  };
  const assistant = { isEnabled: () => true, getPersona: () => 'female',
    speak: (text, persona) => { spoken.push({ text, persona }); } };
  const doc = {
    body: {},
    getElementById: () => internal,
    querySelector: selector => selector.startsWith('#internal .dpi-round-question') ? question : null,
    addEventListener: () => {}
  };
  const root = {
    document: doc, addEventListener: () => {},
    performance: { now: () => 100 },
    setTimeout: () => 1, clearTimeout: () => {},
    MutationObserver: class { observe() {} },
    ELXAssistentes: assistant,
    dpiReadQuestion: () => { nativeReads++; return 'old'; }
  };
  new Function('root', installer + '\ninstallQuestionAndResultFlow();')(root);
  const returned = root.dpiReadQuestion();
  assert.equal(nativeReads, 0);
  assert.equal(spoken.length, 1);
  assert.match(spoken[0].text, /QUALIDADE TÉCNICA/);
  assert.match(spoken[0].text, /Confira se as imagens permitem uma avaliação confiável/);
  assert.match(spoken[0].text, /A imagem permite avaliação/);
  assert.match(spoken[0].text, /Alternativa A: A imagem está adequada/);
  assert.match(spoken[0].text, /Alternativa B: Não, repetir aquisição/);
  assert.doesNotMatch(spoken[0].text, /Alternativa A: A A imagem/);
  assert.equal(returned, spoken[0].text);
});

test('inline reader timing is recorded without user text, URLs or credentials', () => {
  assert.match(router, /diagnostics\.publicReads \|\|= \[\]/);
  assert.match(router, /lastPublicReadAt = invokedAt;/);
  assert.match(router, /msAfterPublicRead: lastPublicReadAt !== null \? Math\.round\(at - lastPublicReadAt\) : null/);
  const block = router.match(/keep\(diagnostics\.publicReads, \{([^}]+)\}\);/);
  assert.ok(block);
  assert.match(block[1], /kind:/);
  assert.doesNotMatch(block[1], /\b(prompt|text|patient|name|url|secret|voiceId|token|apiKey)\s*:/);
});

test('inline public read yields audio timing even if it precedes observer question detection', () => {
  const from = router.indexOf('  function installQuestionAndResultFlow() {');
  const to = router.indexOf("  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', installQuestionAndResultFlow");
  const installer = router.slice(from, to);
  const handlers = {}, media = {};
  let clock = 100;
  const question = {textContent:'Exemplo',matches:()=>false};
  const internal = {querySelector:()=>null};
  const doc = {
    body:{}, getElementById:()=>internal,
    querySelector:(s)=>s.startsWith('#internal .dpi-round-question')?question:null,
    addEventListener:(name,fn)=>{media[name]=fn;}
  };
  const root = {document:doc, addEventListener:(name,fn)=>{handlers[name]=fn;},
    performance:{now:()=>clock}, setTimeout:()=>1, clearTimeout:()=>{},
    MutationObserver: class {observe() {}},
    dpiReadQuestion:()=>undefined
  };
  new Function('root', installer+'\ninstallQuestionAndResultFlow();')(root);
  root.dpiReadQuestion();
  clock = 150;
  handlers['elx-speech-start']({});
  clock = 170;
  media.playing({target:{tagName:'AUDIO'}});
  assert.equal(root.__dpiAudioDiagnostics.publicReads.length,1);
  assert.equal(root.__dpiAudioDiagnostics.speechStarts[0].msAfterPublicRead,50);
  assert.equal(root.__dpiAudioDiagnostics.mediaStarts[0].msAfterPublicRead,70);
  assert.equal(root.__dpiAudioDiagnostics.speechStarts[0].msAfterQuestionDetected,null);
});

test('public-read timing resets on disappearance or replacement of the question', () => {
  const scan = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan, /lastPublicRead = null;\s*lastPublicReadAt = null;\s*latestQuestionAt = 0;\s*return;/);
  assert.match(scan, /if \(lastPublicRead\?\.question !== question \|\| lastPublicRead\.prompt !== prompt\) lastPublicReadAt = null;/);
});

test('static voice manifest readiness is recorded for diagnosing the initial delay', () => {
  const block = router.match(/keep\(diagnostics\.publicReads, \{([\s\S]*?)\}\);/);
  assert.ok(block);
  assert.match(block[1], /staticCatalogPending: typeof root\.DPIStaticVoice\?\.settled === 'boolean' \? !root\.DPIStaticVoice\.settled : null/);
  assert.match(block[1], /persona: root\.ELXAssistentes\?\.getPersona/);
  assert.doesNotMatch(block[1], /\b(text|prompt|patient|name|url|token|apiKey)\s*:/);
  const fallback = router.match(/keep\(diagnostics\.narrationCalls, \{([\s\S]*?)\}\);/);
  assert.ok(fallback);
  assert.match(fallback[1], /staticCatalogPending:/);
});

test('static voice readiness remains unknown if no catalog state is exposed', () => {
  const block = router.match(/keep\(diagnostics\.publicReads, \{([\s\S]*?)\}\);/);
  assert.ok(block);
  assert.match(block[1], /staticCatalogPending:.*: null/);
  assert.doesNotMatch(block[1], /staticCatalogPending: Boolean\(/);
});

test('catalog pending diagnostic distinguishes missing, loading and completed catalog', () => {
  const source = router.match(/staticCatalogPending: ([^\n,}]+)/)?.[1];
  assert.ok(source);
  const readPending = new Function('root', 'return ' + source);
  assert.equal(readPending({}), null);
  assert.equal(readPending({DPIStaticVoice:{}}), null);
  assert.equal(readPending({DPIStaticVoice:{settled:false}}), true);
  assert.equal(readPending({DPIStaticVoice:{settled:true}}), false);
});

test('neural TTS network timing distinguishes first response byte from body transfer', () => {
  const block = router.match(/keep\(diagnostics\.requests, \{([\s\S]*?)\}\);/);
  assert.ok(block);
  assert.match(block[1], /msUntilFirstByte:/);
  assert.match(block[1], /msReceivingBody:/);
  assert.doesNotMatch(block[1], /\b(text|prompt|content|src|url|apiKey|voiceId)\s*:/);
  const from = router.indexOf('if (typeof root.PerformanceObserver');
  const snippet = router.slice(from, router.indexOf('    const assistant =', from));
  let resourceObserver;
  const diagnostics = {requests:[]};
  const root = {PerformanceObserver:class{
    constructor(callback){resourceObserver=callback;}
    observe(){}
  }};
  const keep=(items,entry)=>items.push(entry);
  const setup=snippet.replace('const observeTts = new root.PerformanceObserver', 'const observeTts = new root.PerformanceObserver');
  new Function('root','diagnostics','keep',setup)(root,diagnostics,keep);
  resourceObserver({getEntries:()=>[
    {name:'https://test.example/api/tts',startTime:100,duration:200,responseStart:240,responseEnd:300,
     serverTiming:[{name:'subscription',duration:35}]},
    {name:'https://test.example/music',startTime:100,duration:300,responseStart:200,responseEnd:400}
  ]});
  assert.equal(diagnostics.requests.length,1);
  resourceObserver({getEntries:()=>[
    {name:'https://test.example/api/tts',startTime:400,duration:0,responseStart:0,responseEnd:0,serverTiming:[]}
  ]});
  assert.equal(diagnostics.requests[1].msUntilFirstByte,null);
  assert.equal(diagnostics.requests[1].msReceivingBody,null);
  assert.deepEqual(diagnostics.requests[0],{
    startedAt:100,totalMs:200,msUntilFirstByte:140,msReceivingBody:60,
    serverTimings:[{name:'subscription',durationMs:35}]
  });
});

test('feedback speech cannot inherit the previous question reader latency baseline', () => {
  const from = router.indexOf('    const openResult = node => {');
  const to = router.indexOf('    let lastSpokenPrompt =',from);
  const block = router.slice(from,to);
  assert.ok(from >= 0 && to > from);
  assert.match(block, /lastPublicReadAt = null;\s*latestQuestionAt = 0;\s*speak\(\[heading, explanation\]/);
  assert.ok(block.indexOf('lastPublicReadAt = null;') < block.indexOf('speak([heading, explanation]'));
});

test('late fallback suppression uses rendered question identity, not a clock window', () => {
  const scan = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan, /lastPublicRead\?\.question === question &&\s*lastPublicRead\.prompt === prompt\) return;/);
  assert.doesNotMatch(scan, /lastPublicRead\.at >= detectedAt - 500/);
  assert.doesNotMatch(scan, /now\(\) - lastPublicRead\.at <= 500/);
});

test('feedback resets question identity while preserving already-read duplicate suppression', () => {
  const scan=router.slice(router.indexOf('const scan = () => {'),router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan,/if \(result\) \{\s*\+\+narrationGeneration;[\s\S]*?lastSpokenQuestion = null;/);
  assert.match(scan,/lastSpokenQuestion = null;\s*lastSpokenPrompt = '';\s*lastPublicRead = null;\s*lastPublicReadAt = null;\s*openResult\(result\)/);
});

test('question timing resets before feedback speech and after disappearing question', () => {
  const feedback = router.slice(router.indexOf('    const openResult = node => {'), router.indexOf('    let lastSpokenPrompt ='));
  assert.match(feedback, /latestQuestionAt = 0;\s*speak\(\[heading, explanation\]/);
  const scan = router.slice(router.indexOf('const scan = () => {'), router.indexOf('// Coalesce frequent DOM changes'));
  assert.match(scan, /if \(!prompt\) \{[\s\S]*?lastPublicReadAt = null;\s*latestQuestionAt = 0;\s*return;/);
  assert.match(router, /msAfterQuestionDetected: latestQuestionAt \? Math\.round\(at - latestQuestionAt\) : null/);
});
