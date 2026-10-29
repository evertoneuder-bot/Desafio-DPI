(function (root) {
  'use strict';
  const engine = root.DpiRoundEngine;
  if (!engine || !root.document) return;
  // Preserve the page's approved Plantão entry, which shows the full-screen siren.
  const approvedPlantaoEntry = typeof root.caseStart === 'function' ? root.caseStart : null;
  const session = { mode: '', questions: [], index: 0, score: 0, correct: 0, reviewed: [], hint: 0, eliminated: new Set(), answered: false, timer: null, seconds: 60, wrongAttempts: 0 };
  const hangman = { words: [], index: 0, wins: 0, missed: [], active: false };
  const association = { batchStart: 0, selectedLeft: null, selectedRight: null, matched: new Set(), errors: 0 };
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const letters = ['A', 'B', 'C', 'D'];
  const modeNames = { lightning: '⚡ RELÂMPAGO', target: '🎯 ALVO', elimination: '✂ ELIMINAÇÃO', diagnosis: '🩺 FECHE O DIAGNÓSTICO', association: '🔗 ASSOCIAÇÃO' };
  function begin(mode) {
    clearInterval(session.timer);
    Object.assign(session, { mode, seconds: 60, questions: engine.createFreshRound(BANK, { size: 10, historyKey: 'elx-session' }), index: 0, score: 0, correct: 0, reviewed: [], hint: 0, currentHint: '', eliminated: new Set(), answered: false, wrongAttempts: 0 });
    if (!session.questions.length) {
      shell('DESAFIO DPI', '<p>Não há questões válidas suficientes para iniciar esta rodada.</p><button class="btn secondary" onclick="challenges()">VOLTAR AOS MINIJOGOS</button>');
      return;
    }
    if (mode === 'association') { Object.assign(association, { batchStart: 0, selectedLeft: null, selectedRight: null, matched: new Set(), errors: 0 }); renderAssociation(); }
    else render();
  }
  function progress() {
    const pct = Math.round(session.index / session.questions.length * 100);
    const label = session.mode === 'association' ? 'PARES ASSOCIADOS ' + session.index + ' / ' + session.questions.length : 'QUESTÃO ' + (session.index + 1) + ' / ' + session.questions.length;
    const stat = session.mode === 'association' ? session.wrongAttempts + ' tentativas incorretas · ' + session.score + ' pts' : session.correct + ' acertos · ' + session.score + ' pts';
    return '<div class="dpi-round-meter"><div><b>' + label + '</b><span>' + stat + '</span></div><div class="dpi-round-track"><i style="width:' + pct + '%"></i></div></div>';
  }
  function renderAssociation() {
    const start = association.batchStart, batch = session.questions.slice(start, start + 4);
    if (!batch.length) return finish();
    const rights = batch.slice().sort(() => Math.random() - 0.5);
    const left = batch.map(q => '<button class="dpi-assoc-choice" data-side="left" data-pair="' + esc(q.id) + '" onclick="DpiGameRounds.pickPair(\'left\',\'' + esc(q.id) + '\')"><b>CONCEITO</b><span>' + esc(q.subtema) + '</span><small>' + esc(q.tema) + '</small></button>').join('');
    const right = rights.map(q => '<button class="dpi-assoc-choice" data-side="right" data-pair="' + esc(q.id) + '" onclick="DpiGameRounds.pickPair(\'right\',\'' + esc(q.id) + '\')"><b>DECISÃO</b><span>' + esc(q.resposta_correta_extenso) + '</span></button>').join('');
    shell(modeNames.association, '<section class="dpi-round-session">' + progress() + '<h3 class="dpi-round-question">Relacione o conceito ao princípio técnico correspondente.</h3><p class="dpi-round-instruction">Toque em um conceito e depois na decisão correta. A rodada tem dez pares, em três telas para manter a leitura confortável.</p><p id="dpiPairProgress" class="dpi-round-source">' + association.matched.size + ' de ' + session.questions.length + ' pares concluídos</p><div class="dpi-assoc-grid"><div>' + left + '</div><div>' + right + '</div></div><div id="dpiRoundFeedback" aria-live="polite"></div><p class="dpi-round-source">Conteúdo para estudo · Fonte vinculada em cada registro do banco.</p>' + miniNav() + '</section>');
  }
  function updateAssociationProgress() {
    const label = root.document.querySelector('.dpi-round-meter b');
    const stat = root.document.querySelector('.dpi-round-meter span');
    const bar = root.document.querySelector('.dpi-round-track i');
    if (label) label.textContent = 'PARES ASSOCIADOS ' + association.matched.size + ' / ' + session.questions.length;
    if (stat) stat.textContent = session.wrongAttempts + ' tentativas incorretas · ' + session.score + ' pts';
    if (bar) bar.style.width = Math.round(association.matched.size / session.questions.length * 100) + '%';
  }
  function pickPair(side, id) {
    if (association.matched.has(id)) return;
    association[side === 'left' ? 'selectedLeft' : 'selectedRight'] = id;
    root.document.querySelectorAll('.dpi-assoc-choice').forEach(button => {
      if (button.dataset.side === side) button.classList.toggle('is-selected', button.dataset.pair === id);
    });
    if (!association.selectedLeft || !association.selectedRight) return;
    const leftId = association.selectedLeft, rightId = association.selectedRight;
    association.selectedLeft = null; association.selectedRight = null;
    const leftButton = root.document.querySelector('.dpi-assoc-choice[data-side="left"][data-pair="' + leftId + '"]');
    const rightButton = root.document.querySelector('.dpi-assoc-choice[data-side="right"][data-pair="' + rightId + '"]');
    if (leftId === rightId) {
      association.matched.add(leftId); session.correct++; session.score += 10;
      if (leftButton) { leftButton.disabled = true; leftButton.classList.add('is-matched'); }
      if (rightButton) { rightButton.disabled = true; rightButton.classList.add('is-matched'); }
      if (typeof root.trackMission === 'function') root.trackMission(true, 10);
      if (typeof root.livelyFx === 'function') root.livelyFx(true);
      const progressNode = root.document.getElementById('dpiPairProgress');
      if (progressNode) progressNode.textContent = association.matched.size + ' de ' + session.questions.length + ' pares concluídos';
      updateAssociationProgress();
      if (association.matched.size === Math.min(4, session.questions.length - association.batchStart)) {
        const end = Math.min(association.batchStart + 4, session.questions.length);
        session.index = end;
        const feedback = root.document.getElementById('dpiRoundFeedback');
        if (feedback) feedback.innerHTML = '<div class="dpi-round-result is-correct"><b>✓ BLOCO CONCLUÍDO</b><p>' + end + ' de ' + session.questions.length + ' pares associados.</p><button class="btn" onclick="DpiGameRounds.nextAssociation()">' + (end < session.questions.length ? 'PRÓXIMO BLOCO →' : 'VER RESULTADO →') + '</button></div>';
      }
    } else {
      association.errors++; session.wrongAttempts++;
      if (typeof root.trackMission === 'function') root.trackMission(false, 5);
      updateAssociationProgress();
      if (leftButton) leftButton.classList.add('is-mismatch');
      if (rightButton) rightButton.classList.add('is-mismatch');
      const feedback = root.document.getElementById('dpiRoundFeedback');
      if (feedback) feedback.innerHTML = '<div class="dpi-round-result is-wrong"><b>AINDA NÃO FORMOU O PAR</b><p>Releia os dois lados e tente outra associação.</p></div>';
      const pair = session.questions.find(q => String(q.id) === String(leftId));
      setTimeout(() => { leftButton?.classList.remove('is-selected', 'is-mismatch'); rightButton?.classList.remove('is-selected', 'is-mismatch'); }, 550);
    }
  }
  function nextAssociation() {
    const end = Math.min(association.batchStart + 4, session.questions.length);
    if (end >= session.questions.length) return finish();
    association.batchStart = end; association.matched = new Set();
    renderAssociation();
  }
  function render() {
    clearInterval(session.timer);
    const q = session.questions[session.index];
    if (!q) return finish();
    session.answered = false;
    session.hint = 0;
    session.currentHint = '';
    session.eliminated = new Set();
    const choices = [q.alternativa_a, q.alternativa_b, q.alternativa_c, q.alternativa_d];
    let stage = '';
    if (session.mode === 'target') {
      stage = '<p class="dpi-round-instruction">Acerte o alvo correspondente à alternativa tecnicamente correta.</p><div class="dpi-target-stage" role="group" aria-label="Escolha a alternativa"><button class="dpi-target-dot" onclick="DpiGameRounds.answer(0)">A</button><button class="dpi-target-dot" onclick="DpiGameRounds.answer(1)">B</button><button class="dpi-target-dot" onclick="DpiGameRounds.answer(2)">C</button><button class="dpi-target-dot" onclick="DpiGameRounds.answer(3)">D</button></div><div class="dpi-round-options">' + choices.map((v, i) => '<div class="dpi-round-option"><b>' + letters[i] + '</b><span>' + esc(v) + '</span></div>').join('') + '</div>';
    } else if (session.mode === 'elimination') {
      stage = '<p class="dpi-round-instruction">Elimine as alternativas incorretas. Se eliminar a resposta correta, esta questão termina.</p><div class="dpi-round-options">' + choices.map((v, i) => '<button class="dpi-round-option" data-choice="' + i + '" onclick="DpiGameRounds.eliminate(' + i + ')"><b>' + letters[i] + '</b><span>' + esc(v) + '</span></button>').join('') + '</div>';
    } else if (session.mode === 'diagnosis') {
      stage = '<p class="dpi-round-instruction">Leia o caso e use o assistente por voz se quiser uma pista. Você pode decidir a qualquer momento.</p><div class="dpi-round-hints" id="dpiRoundHints"></div><div class="dpi-round-actions"><button class="btn" onclick="DpiGameRounds.showChoices()">JÁ SEI — DECIDIR</button></div><div id="dpiRoundChoices" class="dpi-round-options"></div>';
    } else {
      stage = '<p class="dpi-round-instruction">Escolha a conduta mais adequada dentro do tempo.</p><div class="dpi-round-timer">⏱ <b id="dpiRoundClock">60</b> s</div><div class="dpi-round-options">' + choices.map((v, i) => '<button class="dpi-round-option" onclick="DpiGameRounds.answer(' + i + ')"><b>' + letters[i] + '</b><span>' + esc(v) + '</span></button>').join('') + '</div>';
    }
    shell(modeNames[session.mode], '<section class="dpi-round-session">' + progress() + '<h3 class="dpi-round-question">' + esc(q.pergunta) + '</h3>' + stage + '<div id="dpiRoundFeedback" aria-live="polite"></div><p class="dpi-round-source">Conteúdo para estudo · Fonte: ' + esc(q.fonte || q.referencia || 'registro do banco') + '</p>' + miniNav() + '</section>');
    if (session.mode === 'lightning') {
      session.seconds = 60;
      session.timer = setInterval(() => {
        session.seconds--;
        const clock = root.document.getElementById('dpiRoundClock');
        if (clock) clock.textContent = String(session.seconds);
        if (session.seconds <= 0) submit(-1, 'TEMPO ESGOTADO');
      }, 1000);
    }
  }
  function showChoices() {
    const q = session.questions[session.index];
    const target = root.document.getElementById('dpiRoundChoices');
    if (!q || !target) return;
    target.innerHTML = [q.alternativa_a, q.alternativa_b, q.alternativa_c, q.alternativa_d].map((v, i) => '<button class="dpi-round-option" onclick="DpiGameRounds.answer(' + i + ')"><b>' + letters[i] + '</b><span>' + esc(v) + '</span></button>').join('');
  }
  function revealHint() {
    const q = session.questions[session.index];
    const hints = [...new Set([q && q.dica, q && q.limitacao_clinica, q && q.explicacao].map(value => String(value || '').trim()).filter(Boolean))];
    const target = root.document.getElementById('dpiRoundHints');
    if (!hints.length) return '';
    session.hint = (session.hint % hints.length) + 1;
    session.currentHint = hints[session.hint - 1];
    if (target) target.insertAdjacentHTML('beforeend', '<p class="dpi-round-hint"><b>PISTA ' + session.hint + '</b> ' + esc(session.currentHint) + '</p>');
    return session.currentHint;
  }
  function submit(index, title, resultOverride) {
    if (session.answered) return;
    session.answered = true;
    clearInterval(session.timer);
    const q = session.questions[session.index];
    const correctIndex = letters.indexOf(String(q.letra_correta || '').toUpperCase());
    const correct = resultOverride === undefined ? index === correctIndex : resultOverride;
    session.correct += correct ? 1 : 0;
    const gained = correct ? Number(q.pontuacao) || 10 : 0;
    session.score += gained;
    if (!correct) session.reviewed.push(q);
    if (typeof root.trackMission === 'function') root.trackMission(correct, gained || 5);
    if (typeof root.livelyFx === 'function') root.livelyFx(correct);
    root.document.querySelectorAll('.dpi-round-option[data-choice],.dpi-round-session .dpi-round-options button').forEach((button) => {
      button.disabled = true;
      const b = button.querySelector('b');
      const option = b ? b.textContent.trim() : '';
      if (option === letters[correctIndex]) button.classList.add('okpick');
      if (index >= 0 && option === letters[index] && !correct) button.classList.add('badpick');
    });
    root.document.querySelectorAll('.dpi-target-dot').forEach((button, i) => {
      button.disabled = true;
      if (i === correctIndex) button.classList.add('okpick');
      if (i === index && !correct) button.classList.add('badpick');
    });
    const feedback = root.document.getElementById('dpiRoundFeedback');
    if (feedback) feedback.innerHTML = '<div class="dpi-round-result ' + (correct ? 'is-correct' : 'is-wrong') + '"><b>' + (title || (correct ? '✓ BOA DECISÃO' : index < 0 ? '⏱ TEMPO ESGOTADO' : '↻ DECISÃO INCORRETA')) + '</b><p><strong>Resposta:</strong> ' + esc(q.resposta_correta_extenso) + '</p><p>' + esc(q.explicacao || q.dica) + '</p><button class="btn" onclick="DpiGameRounds.next()">' + (session.index + 1 < session.questions.length ? 'PRÓXIMA QUESTÃO →' : 'VER RESULTADO →') + '</button></div>';
  }
  function eliminate(index) {
    if (session.answered || session.eliminated.has(index)) return;
    const q = session.questions[session.index];
    const button = root.document.querySelector('.dpi-round-option[data-choice="' + index + '"]');
    const correctIndex = letters.indexOf(String(q.letra_correta || '').toUpperCase());
    if (index === correctIndex) return submit(index, '✕ VOCÊ ELIMINOU A RESPOSTA CERTA', false);
    session.eliminated.add(index);
    if (button) { button.disabled = true; button.classList.add('is-eliminated'); }
    if (session.eliminated.size === 3) submit(correctIndex, '✓ VOCÊ ELIMINOU AS TRÊS ALTERNATIVAS INCORRETAS', true);
  }
  function next() { if (!session.answered) return; session.index++; render(); }
  function surrender() {
    if (hangman.active && !hangman.currentDone && root._hgWord) {
      hangman.currentDone = true;
      hangman.surrenderedCurrent = true;
      if (typeof root.trackAbandonment === 'function') root.trackAbandonment();
      const word = root._hgWord;
      root._hgGuessed = new Set([...word]);
      const cells = [...word].map(letter => '<span class="dpi-hg-revealed-letter">' + esc(letter) + '</span>').join('');
      const nextText = hangman.index + 1 < hangman.words.length ? 'PRÓXIMO TERMO →' : 'VER RESULTADO →';
      const body = hangmanProgress() + '<div class="dpi-hg-game"><div class="dpi-hg-meta"><span>TERMO REVELADO</span><b>DESISTÊNCIA</b></div><p class="dpi-hg-clue">🔎 ' + esc(root._hgClue || hangman.words[hangman.index]?.dica || '') + '</p><div class="hangword is-revealed" aria-label="Resposta revelada: ' + esc(word) + '">' + cells + '</div><div class="dpi-hg-reveal-note"><b>Desistência registrada</b><span>A palavra foi completada no tabuleiro e não conta como erro.</span></div><button class="dpi-ws-next" onclick="DpiGameRounds.nextWord()">' + nextText + '</button><button class="btn secondary" onclick="miniWordHub()">SAIR DA RODADA</button></div>';
      wordShell('FORCA CLÍNICA · RESPOSTA REVELADA', body, 'A resposta foi completada no tabuleiro. A desistência fica separada dos erros.');
      return true;
    }
    if (!session.mode || session.answered) return false;
    clearInterval(session.timer);
    session.answered = true;
    if (typeof root.trackAbandonment === 'function') root.trackAbandonment();
    if (session.mode === 'association') {
      const answers = session.questions.map(q => '<li><b>' + esc(q.subtema || q.tema) + '</b> → ' + esc(q.resposta_correta_extenso) + '</li>').join('');
      const feedback = root.document.getElementById('dpiRoundFeedback');
      if (feedback) feedback.innerHTML = '<div class="dpi-round-result"><b>DESISTÊNCIA REGISTRADA · GABARITO</b><ol>' + answers + '</ol><small>Esta desistência não entra como erro no ranking.</small></div>';
    } else {
      const q = session.questions[session.index];
      if (!q) return false;
      const correctIndex = letters.indexOf(String(q.letra_correta || '').toUpperCase());
      root.document.querySelectorAll('.dpi-round-option[data-choice],.dpi-round-session .dpi-round-options button,.dpi-target-dot').forEach((button, i) => {
        button.disabled = true;
        if (i === correctIndex || button.querySelector('b')?.textContent.trim() === letters[correctIndex]) button.classList.add('okpick');
      });
      const feedback = root.document.getElementById('dpiRoundFeedback');
      if (feedback) feedback.innerHTML = '<div class="dpi-round-result"><b>DESISTÊNCIA REGISTRADA · RESPOSTA</b><p><strong>Resposta:</strong> ' + esc(q.resposta_correta_extenso) + '</p><p>' + esc(q.explicacao || q.dica) + '</p><small>Foi registrada à parte, sem contar como erro no ranking.</small><button class="btn" onclick="DpiGameRounds.next()">PRÓXIMA QUESTÃO →</button></div>';
    }
    return true;
  }
  function finish() {
    clearInterval(session.timer);
    const misses = session.reviewed.map(q => '<li><b>' + esc(q.tema) + ' · ' + esc(q.subtema) + '</b><p>' + esc(q.pergunta) + '</p><p><strong>Resposta:</strong> ' + esc(q.resposta_correta_extenso) + '</p><p>' + esc(q.explicacao || q.dica) + '</p><small>Fonte: ' + esc(q.fonte || q.referencia) + '</small></li>').join('');
    const recap = misses ? '<h4>REVISÃO DO QUE ERROU</h4><ol>' + misses + '</ol>' : session.wrongAttempts ? '<p>Você completou os dez pares depois de ' + session.wrongAttempts + ' associações incorretas.</p>' : '<p>Rodada perfeita. Você acertou todas as decisões.</p>';
    shell('RODADA CONCLUÍDA', '<div class="dpi-round-summary"><p class="dpi-round-kicker">' + modeNames[session.mode] + ' · 10 ' + (session.mode === 'association' ? 'PARES' : 'QUESTÕES') + '</p><h3>' + session.correct + ' / ' + session.questions.length + (session.mode === 'association' ? ' pares' : ' acertos') + '</h3><p>' + session.score + ' pontos · ' + session.wrongAttempts + ' tentativas incorretas</p><div class="dpi-round-track"><i style="width:' + Math.round(session.correct / session.questions.length * 100) + '%"></i></div>' + recap + '<button class="btn" onclick="DpiGameRounds.start(\'' + session.mode + '\')">JOGAR OUTRA RODADA</button><button class="btn secondary" onclick="challenges()">VOLTAR AOS MINIJOGOS</button></div>');
  }
  function startHangman() {
    const words = engine.createWordRound(BANK, { size: 10 });
    if (words.length < 10) { wordShell('FORCA CLÍNICA', '<p>O banco ainda não tem dez termos válidos para esta rodada.</p><button class="btn secondary" onclick="miniWordHub()">VOLTAR</button>', 'Não há dez termos únicos para esta partida.'); return; }
    Object.assign(hangman, { words, index: 0, wins: 0, missed: [], active: true });
    Object.assign(session, { score: 0, wrongAttempts: 0 });
    renderHangman();
  }
  function hangmanProgress() {
    const pct = Math.round(hangman.index / hangman.words.length * 100);
    return '<div class="dpi-round-meter"><div><b>TERMO ' + (hangman.index + 1) + ' / ' + hangman.words.length + '</b><span>' + hangman.wins + ' descobertos</span></div><div class="dpi-round-track"><i style="width:' + pct + '%"></i></div></div>';
  }
  function renderHangman() {
    const entry = hangman.words[hangman.index];
    if (!entry) return finishHangman();
    hangman.currentDone = false;
    root._hgWord = entry.gameWord;
    root._hgClue = typeof root.clueFor === 'function' ? root.clueFor(entry.gameWord) : entry.dica;
    root._hgGuessed = new Set();
    root._hgWrong = 0;
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => '<button class="dpi-hg-key" onclick="DpiGameRounds.guessLetter(\'' + l + '\')">' + l + '</button>').join('');
    renderHangmanBoard(keys);
  }
  function renderHangmanBoard(keys) {
    const word = root._hgWord, guessed = root._hgGuessed, wrong = root._hgWrong;
    const display = [...word].map(c => guessed.has(c) ? c : '_').join(' ');
    const lives = Array.from({ length: 6 }, (_, i) => '<i class="' + (i < wrong ? 'is-lost' : '') + '"></i>').join('');
    const keyboard = keys || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => '<button class="dpi-hg-key ' + (guessed.has(l) ? 'is-used' : '') + '" ' + (guessed.has(l) ? 'disabled' : '') + ' onclick="DpiGameRounds.guessLetter(\'' + l + '\')">' + l + '</button>').join('');
    const body = hangmanProgress() + '<div class="dpi-hg-game"><div class="dpi-hg-meta"><span>TERMO TÉCNICO</span><b>ERROS ' + wrong + '/6</b></div><div class="dpi-hg-lives">' + lives + '</div><p class="dpi-hg-clue">🔎 ' + esc(root._hgClue || 'Termo do banco veterinário.') + '</p><div class="hangword">' + display + '</div><div class="dpi-hg-keyboard">' + keyboard + '</div></div><p class="dpi-round-source">Cada rodada traz dez termos diferentes, com pistas ligadas ao banco DPI.</p>';
    wordShell('FORCA CLÍNICA', body, 'Termo ' + (hangman.index + 1) + ' de 10. ' + (root._hgClue || 'Use a pista para descobrir a palavra.'));
  }
  function guessLetter(letter) {
    if (!root._hgGuessed || root._hgGuessed.has(letter)) return;
    root._hgGuessed.add(letter);
    if (!root._hgWord.includes(letter)) root._hgWrong++;
    const won = [...root._hgWord].every(c => root._hgGuessed.has(c));
    if (won || root._hgWrong >= 6) return endHangmanWord(won);
    renderHangmanBoard();
  }
  function endHangmanWord(won) {
    hangman.currentDone = true;
    const word = root._hgWord, entry = hangman.words[hangman.index];
    if (won) { hangman.wins++; session.score += 20; }
    else hangman.missed.push(entry);
    if (typeof root.trackMission === 'function') root.trackMission(won, won ? 20 : 5);
    if (typeof root.livelyFx === 'function') root.livelyFx(won);
    const nextText = hangman.index + 1 < hangman.words.length ? 'PRÓXIMO TERMO →' : 'VER RESULTADO →';
    const body = '<div class="dpi-ws-result ' + (won ? 'is-win' : 'is-loss') + '"><div class="dpi-ws-result-badge">' + (won ? '✓' : '↻') + '</div><p class="dpi-ws-level">TERMO ' + (hangman.index + 1) + ' DE 10</p><h2>' + (won ? 'Termo descoberto!' : 'Pista e resposta') + '</h2><p><b>' + esc(word) + '</b></p><p>' + esc(root._hgClue) + '</p><button class="dpi-ws-next" onclick="DpiGameRounds.nextWord()">' + nextText + '</button><button class="btn secondary" onclick="miniWordHub()">SAIR DA RODADA</button></div>';
    wordShell('FORCA CLÍNICA', body, won ? 'Boa! Você descobriu ' + word + '.' : 'O termo era ' + word + '. A pista e a resposta ficam para revisão.');
  }
  function nextWord() { hangman.index++; if (hangman.index >= hangman.words.length) finishHangman(); else renderHangman(); }
  function finishHangman() {
    const items = hangman.missed.map(entry => '<li><b>' + esc(entry.gameWord) + ':</b> ' + esc(entry.dica || entry.resposta_correta_extenso) + '</li>').join('');
    const pct = Math.round(hangman.wins / hangman.words.length * 100);
    wordShell('RODADA DE FORCA CONCLUÍDA', '<div class="dpi-round-summary"><p class="dpi-round-kicker">PALAVRA MISTERIOSA · 10 TERMOS</p><h3>' + hangman.wins + ' / 10 descobertos</h3><p>' + session.score + ' pontos</p><div class="dpi-round-track"><i style="width:' + pct + '%"></i></div>' + (items ? '<h4>REVISÃO DOS TERMOS</h4><ol>' + items + '</ol>' : '<p>Você descobriu os dez termos!</p>') + '<button class="btn" onclick="DpiGameRounds.startHangman()">JOGAR OUTRA RODADA</button><button class="btn secondary" onclick="miniWordHub()">VOLTAR AOS MINIJOGOS</button></div>', 'Rodada finalizada: ' + hangman.wins + ' de 10 termos descobertos.');
  }
  root.DpiGameRounds = { start: begin, answer: submit, eliminate, revealHint, showChoices, next, surrender, isActive: () => hangman.active ? !hangman.currentDone && !!root._hgWord : !!session.mode && !session.answered, startHangman, guessLetter, nextWord, pickPair, nextAssociation, getSession: () => session, getHint: () => { if(hangman.active) return root._hgClue || hangman.words[hangman.index]?.dica || "Use a pista para descobrir o termo técnico."; const q=session.questions[session.index]; return session.currentHint || (q && (q.dica || q.limitacao_clinica || q.explicacao || "Revise o contexto da questão e a fonte exibida.")); } };
  root.miniLightning = () => begin('lightning');
  root.lgAnswer = submit;
  root.miniTarget = () => begin('target');
  root.tgAnswer = submit;
  root.miniElimination = () => begin('elimination');
  root.elPick = eliminate;
  root.miniDiagnosis = () => begin('diagnosis');
  root.dgAnswer = submit;
  root.miniAssociation = () => begin('association');
  if (approvedPlantaoEntry) root.caseStart = approvedPlantaoEntry;
  root.miniHangman = startHangman;
  root.hgGuess = guessLetter;
  root.startQuiz = function (size) {
    state.n = size;
    state.i = 0;
    state.score = 0;
    state.qs = engine.createFreshRound(BANK, { size, historyKey: 'elx-session' });
    renderQ();
  };
})(window);
