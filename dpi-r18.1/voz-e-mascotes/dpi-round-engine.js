(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DpiRoundEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  const difficultyKey = value => {
    const v = normalize(value);
    if (v === 'FACIL') return 'fácil';
    if (v === 'DIFICIL') return 'difícil';
    return 'intermediária';
  };
  const conceptKey = q => [normalize(q.tema), normalize(q.subtema), normalize(q.resposta_correta_extenso)].join('|');
  const answerHistory = new Map();
  const questionHistory = new Map();
  function shuffle(values, random) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  function takeDiverse(pool, count, chosen, random, round) {
    let rest = pool.filter(q => !chosen.has(conceptKey(q)));
    const result = [];
    while (rest.length && result.length < count) {
      rest = shuffle(rest, random);
      const topics = new Set((round || []).concat(result).map(q => normalize(q.tema)));
      const subtopics = new Set((round || []).concat(result).map(q => normalize(q.subtema)));
      rest.sort((a, b) => {
        const score = q => (topics.has(normalize(q.tema)) ? 0 : 4) + (subtopics.has(normalize(q.subtema)) ? 0 : 2);
        return score(b) - score(a);
      });
      const q = rest.shift();
      result.push(q);
      chosen.add(conceptKey(q));
      rest = rest.filter(item => conceptKey(item) !== conceptKey(q));
    }
    return result;
  }
  function createRound(bank, options) {
    const opts = options || {};
    const size = Math.max(1, Math.min(50, Number(opts.size) || 10));
    const random = typeof opts.random === 'function' ? opts.random : Math.random;
    const seen = new Set();
    const seenAnswers = new Set();
    const seenQuestions = new Set();
    const valid = (Array.isArray(bank) ? bank : []).filter(q => {
      const answer = String(q.letra_correta || '').trim().toUpperCase();
      const complete = q && q.id && q.pergunta && q.subtema && q.resposta_correta_extenso && ['A', 'B', 'C', 'D'].includes(answer);
      if (!complete) return false;
      const key = conceptKey(q);
      const answerKey = normalize(q.resposta_correta_extenso);
      const question = normalize(q.pergunta);
      if (seen.has(key) || seenAnswers.has(answerKey) || seenQuestions.has(question)) return false;
      seen.add(key);
      seenAnswers.add(answerKey);
      seenQuestions.add(question);
      return true;
    });
    const chosen = new Set();
    const quotas = [
      ['fácil', Math.round(size * 0.3)],
      ['intermediária', Math.round(size * 0.4)],
      ['difícil', Math.floor(size * 0.3)]
    ];
    const round = [];
    for (const [difficulty, quota] of quotas) round.push(...takeDiverse(valid.filter(q => difficultyKey(q.dificuldade) === difficulty), quota, chosen, random, round));
    if (round.length < size) round.push(...takeDiverse(valid, size - round.length, chosen, random, round));
    return shuffle(round, random);
  }
  function createFreshRound(bank, options) {
    const opts = options || {};
    const historyKey = String(opts.historyKey || 'elx-session');
    const targetSize = Math.max(1, Math.min(50, Number(opts.size) || 10));
    const previousAnswers = answerHistory.get(historyKey) || new Set();
    const previousQuestions = questionHistory.get(historyKey) || new Set();
    const rows = Array.isArray(bank) ? bank : [];
    const valid = rows.filter(q => q && q.id && q.pergunta && q.subtema && q.resposta_correta_extenso && ['A', 'B', 'C', 'D'].includes(String(q.letra_correta || '').trim().toUpperCase()));
    const questionKey = q => normalize(q && q.pergunta);
    const answerKey = q => normalize(q && q.resposta_correta_extenso);
    if (!valid.some(q => !previousQuestions.has(questionKey(q)))) previousQuestions.clear();
    const unseenQuestions = valid.filter(q => !previousQuestions.has(questionKey(q)));
    const freshAnswers = unseenQuestions.filter(q => !previousAnswers.has(answerKey(q)));
    let round = createRound(freshAnswers, opts);
    if (round.length < targetSize) {
      const selectedAnswers = new Set(round.map(answerKey));
      const additional = unseenQuestions.filter(q => !selectedAnswers.has(answerKey(q)));
      for (const q of createRound(additional, opts)) {
        const key = answerKey(q);
        if (selectedAnswers.has(key)) continue;
        round.push(q);
        selectedAnswers.add(key);
        if (round.length >= targetSize) break;
      }
    }
    if (round.length < targetSize) {
      const selectedAnswers = new Set(round.map(answerKey));
      const unusedRows = valid.filter(q => !selectedAnswers.has(answerKey(q)));
      for (const q of createRound(unusedRows, opts)) {
        const key = answerKey(q);
        if (selectedAnswers.has(key)) continue;
        round.push(q);
        selectedAnswers.add(key);
        if (round.length >= targetSize) break;
      }
    }
    for (const q of round) {
      previousAnswers.add(answerKey(q));
      previousQuestions.add(questionKey(q));
    }
    answerHistory.set(historyKey, previousAnswers);
    questionHistory.set(historyKey, previousQuestions);
    return round;
  }
  function resetAnswerHistory(historyKey) {
    if (historyKey == null) { answerHistory.clear(); questionHistory.clear(); }
    else { answerHistory.delete(String(historyKey)); questionHistory.delete(String(historyKey)); }
  }
  function auditBank(bank) {
    const rows = Array.isArray(bank) ? bank : [];
    const countDistinct = key => new Set(rows.map(q => normalize(q[key])).filter(Boolean)).size;
    const countRepeated = key => rows.length - countDistinct(key);
    const conceptSet = new Set(rows.map(conceptKey));
    const ids = rows.map(q => String(q.id || '').trim());
    return {
      total: rows.length,
      uniqueIds: new Set(ids).size,
      duplicateIds: rows.length - new Set(ids).size,
      uniqueQuestions: countDistinct('pergunta'),
      duplicateQuestions: countRepeated('pergunta'),
      uniqueHints: countDistinct('dica'),
      duplicateHints: countRepeated('dica'),
      uniqueExplanations: countDistinct('explicacao'),
      duplicateExplanations: countRepeated('explicacao'),
      uniqueConcepts: conceptSet.size,
      repeatedConceptRows: rows.length - conceptSet.size,
      invalidAnswers: rows.filter(q => !['A', 'B', 'C', 'D'].includes(String(q.letra_correta || '').trim().toUpperCase())).length,
      missingCoreFields: rows.filter(q => ['id', 'tema', 'subtema', 'pergunta', 'dica', 'explicacao', 'resposta_correta_extenso'].some(k => !String(q[k] || '').trim())).length,
      topicCounts: rows.reduce((out, q) => { const key = String(q.tema || 'Sem tema'); out[key] = (out[key] || 0) + 1; return out; }, {})
    };
  }
  function createWordRound(bank, options) {
    const opts = options || {};
    const size = Math.max(1, Math.min(20, Number(opts.size) || 10));
    const random = typeof opts.random === 'function' ? opts.random : Math.random;
    const terms = new Map();
    (Array.isArray(bank) ? bank : []).forEach(q => {
      const term = normalize(q.palavra_jogo || q.subtema || '').replace(/[^A-Z]/g, '');
      if (term.length >= 4 && term.length <= 10 && !terms.has(term)) terms.set(term, { ...q, gameWord: term });
    });
    return shuffle([...terms.values()], random).slice(0, size);
  }
  return { createRound, createFreshRound, resetAnswerHistory, createWordRound, auditBank, conceptKey };
});
