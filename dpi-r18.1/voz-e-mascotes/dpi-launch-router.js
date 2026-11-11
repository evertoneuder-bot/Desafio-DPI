(function (root) {
  'use strict';
  const params = new URLSearchParams(root.location.search);
  const mode = params.get('mode');
  const actions = {
    quiz: 'quizMenu',
    challenges: 'challenges',
    plantao: 'launchPlantao',
    profile: 'profile',
    settings: 'settings',
    ranking: 'ranking',
    bank: 'bankView',
    achievements: 'achievements',
    start: 'startFromPresentation',
    feature: 'openPresentationFeature'
  };
  const returningToDpiCover = params.get('return') === 'dpi';
  const presentationFeature = params.get('feature');

  // Keep the question narrator's shared helpers in the global scope. The
  // inline voice engine calls both functions while rendering each game step.
  root.dpiGameKey = root.dpiGameKey || function (node = root.document.getElementById('internal')) {
    if (!node) return '';
    if (node.querySelector('.dpi-case-question')) return 'plantao';
    if (node.querySelector('.dpi-round-session')) return 'round:' + String(node.querySelector('.dpi-play-content h2')?.textContent || 'rodada').trim();
    if (node.querySelector('.dpi-ws-grid')) return 'wordsearch';
    if (node.querySelector('.dpi-crossword-board')) return 'crossword';
    if (node.querySelector('.dpi-hg-game')) return 'hangman';
    if (node.querySelector('.dpi-word-modes')) return 'wordhub';
    if (node.querySelector('.dpi-game-panel .option') && /^QUESTÃO/i.test(node.querySelector('.dpi-game-panel h2')?.textContent || '')) return 'quiz';
    return '';
  };
  root.dpiGuideControls = root.dpiGuideControls || function () {
    const group = root.document.querySelector('#internal .dpi-help-actions');
    if (!group) return;
    const targets = [...group.querySelectorAll('button')];
    targets.forEach(element => element.classList.add('dpi-help-guide-target'));
    root.setTimeout(() => targets.forEach(element => element.isConnected && element.classList.remove('dpi-help-guide-target')), 2600);
    root.ELXMascotDirector?.react?.('guide-right');
  };

  // Keep the approved bibliography label visible in the legacy game shell
  // while the main cover and game are being converged on the shared design.
  function applyApprovedMobileShell() {
    const doc = root.document;
    const libraryButton = typeof doc.querySelector === 'function'
      ? doc.querySelector('.utility button[onclick*="bankView"]')
      : null;
    if (libraryButton) {
      for (const node of libraryButton.childNodes) {
        if (node.nodeType === 3 && /BANCO/i.test(node.nodeValue || '')) node.nodeValue = 'BANCO BIBLIOGRÁFICO';
      }
    }
    if (typeof doc.getElementById === 'function' && typeof doc.createElement === 'function' && doc.head?.append && !doc.getElementById('dpi-approved-mobile-shell')) {
      const style = doc.createElement('style');
      style.id = 'dpi-approved-mobile-shell';
      style.textContent = `
        @media(max-width:640px){.utility{grid-template-columns:repeat(2,minmax(0,1fr))!important;height:auto!important}.utility button{min-height:46px!important;font-size:10px!important;padding:5px 3px!important}.utility b{display:inline-block!important;margin:0 5px 0 0!important;vertical-align:middle!important;font-size:16px!important}}
        .dpi-play-app:has(.dpi-case-hud) .dpi-play-heading{display:none!important}
        .dpi-play-app:has(.dpi-case-hud) .dpi-play-topbar{grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important}
        .dpi-play-app:has(.dpi-case-hud) .dpi-play-brand{grid-column:1!important;grid-row:1!important}
        .dpi-play-app:has(.dpi-case-hud) .dpi-play-controls{grid-column:2!important;grid-row:1!important}
        .dpi-case-phase{max-height:220px;overflow:hidden;animation:elx-phase-brief 7s ease-in forwards}
        .dpi-case-phase small{display:none!important}
        @keyframes elx-phase-brief{0%,78%{opacity:1;max-height:220px;margin:.7rem 0 1rem;padding:.7rem 1rem;border-left-width:4px}100%{opacity:0;max-height:0;margin:0;padding-block:0;border-left-width:0;visibility:hidden}}
        body.dpi-voice-off .dpi-play-coach,body.dpi-voice-off .dpi-wordgame-coach{display:none!important}
        body.dpi-voice-off .dpi-play-layout,body.dpi-voice-off .dpi-wordgame-layout{grid-template-columns:minmax(0,1fr)!important;gap:0!important;padding-top:8px!important}
        body.dpi-voice-off .dpi-play-content,body.dpi-voice-off .dpi-wordgame-main{grid-column:1/-1!important;width:100%!important;max-width:none!important}
        body.dpi-voice-off .dpi-silent-mission{display:none!important}
        .dpi-play-speech:not(.is-speaking){display:none!important}
        .dpi-play-speech.is-speaking{display:block!important}
        @media(max-width:620px){
          #internal .dpi-play-coach.is-speaking{min-height:200px!important;height:auto!important}
          #internal .dpi-play-coach:not(.is-speaking){min-height:120px!important;height:auto!important}
        }
      `;
      doc.head.append(style);
    }

    if (root.__dpiTransientVoiceUiInstalled || typeof doc.querySelector !== 'function') return;
    root.__dpiTransientVoiceUiInstalled = true;

    // The visible Conversar control is the user's microphone gesture: start
    // hands-free on tap, and stop on the next tap. Keep the panel open.
    const conversation = doc.querySelector('#elx-conversation');
    const summary = conversation?.querySelector?.('summary');
    summary?.addEventListener?.('click', event => {
      const assistant = root.ELXAssistentes;
      const voice = root.ELXConversation;
      if (!assistant?.isEnabled?.() || !voice) return;
      event.preventDefault();
      if (voice.isHandsFreeActive?.()) voice.stopListening?.();
      else voice.open?.({ voice: true });
    });

    let captionTimer = 0;
    let captionHideTimer = 0;
    root.addEventListener('elx-speech-start', event => {
      const bubble = doc.querySelector('#internal .dpi-play-speech');
      if (!bubble) return;
      root.clearInterval(captionTimer);
      root.clearTimeout(captionHideTimer);
      const name = event.detail?.persona === 'female' ? 'Fernanda' : 'Everton';
      const text = String(event.detail?.text || '').trim();
      const speaker = doc.createElement('b');
      const caption = doc.createElement('p');
      speaker.textContent = name;
      caption.setAttribute('aria-live', 'polite');
      bubble.replaceChildren(speaker, caption);
      bubble.classList.add('is-speaking');
      let index = 0;
      captionTimer = root.setInterval(() => {
        caption.textContent = text.slice(0, ++index);
        if (index >= text.length) root.clearInterval(captionTimer);
      }, 18);
    });
    const closeCaption = () => {
      root.clearInterval(captionTimer);
      root.clearTimeout(captionHideTimer);
      captionHideTimer = root.setTimeout(() => {
        doc.querySelectorAll?.('#internal .dpi-play-speech.is-speaking').forEach(node => node.classList.remove('is-speaking'));
      }, 700);
    };
    root.addEventListener('elx-speech-end', closeCaption);
    root.addEventListener('elx-voice-unavailable', closeCaption);

    // Reveal the complete workflow only in the explicit instruction dialog.
    const originalInstructions = root.dpiRequestInstructions;
    if (typeof originalInstructions === 'function' && typeof root.dpiGameInstructions === 'function' && typeof root.dpiShowInstructionsDialog === 'function') {
      root.dpiRequestInstructions = function () {
        if (!doc.querySelector('#internal .dpi-case-question')) return originalInstructions.apply(this, arguments);
        const workflow = 'Fluxo do plantão: avaliação inicial, histórico e triagem, estabilização e segurança, pergunta clínica, plano de imagem, modalidade e projeções, aquisição e posicionamento, qualidade técnica, interpretação, integração dos achados, reavaliação e próxima conduta, registro e comunicação.';
        const text = root.dpiGameInstructions() + ' ' + workflow;
        root.dpiShowInstructionsDialog(text);
        if (root.ELXAssistentes?.isEnabled?.()) {
          root._coachLine = text + ' Você também pode me interromper e perguntar.';
          root.ELXAssistentes.speak(root._coachLine);
        }
      };
    }
  }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', applyApprovedMobileShell, { once: true });
  else applyApprovedMobileShell();


  // Read each newly rendered prompt, accept spoken A-D answers when the
  // browser speech-recognition API is available, and make answer feedback
  // dismissible without leaving the old result over the next question.
  function installQuestionAndResultFlow() {
    const doc = root.document;
    if (!doc?.body || root.__dpiQuestionResultFlowInstalled) return;
    root.__dpiQuestionResultFlowInstalled = true;
    const resultSelector = '#internal .feedback.ok,#internal .feedback.no,#internal .dpi-case-feedback.is-correct,#internal .dpi-case-feedback.is-wrong,#internal .dpi-round-result.is-correct,#internal .dpi-round-result.is-wrong';
    let scanTimer = 0;
    // Read-only, in-memory timings. No spoken content, IDs, credentials or UI changes.
    const diagnostics = root.__dpiAudioDiagnostics ||= { questions: [], requests: [], speechStarts: [], mediaStarts: [] };
    diagnostics.mediaStarts ||= [];
    diagnostics.narrationCalls ||= [];
    const keep = (collection, entry) => {
      collection.push(entry);
      if (collection.length > 30) collection.shift();
    };
    const now = () => root.performance?.now?.() ?? Date.now();
    // The inline game sometimes calls its own public reader while rendering.
    // Track that invocation so this observer does not stop and restart the
    // same speech 180 ms later. The wrapper preserves the original return.
    let lastPublicRead = null;
    let observedPublicReader = null;
    const ensurePublicReaderTracked = () => {
      const reader = root.dpiReadQuestion;
      if (typeof reader !== 'function' || reader === observedPublicReader) return;
      const wrapped = function () {
        const current = doc.querySelector('#internal .dpi-round-question,#internal .dpi-case-question,#internal .question-text');
        lastPublicRead = {
          question: current,
          prompt: current?.textContent?.replace(/\s+/g, ' ').trim() || '',
          at: now()
        };
        return reader.apply(this, arguments);
      };
      observedPublicReader = wrapped;
      root.dpiReadQuestion = wrapped;
    };
    ensurePublicReaderTracked();
    let latestQuestionAt = 0;
    root.addEventListener('elx-speech-start', () => {
      const at = now();
      keep(diagnostics.speechStarts, {
        msAfterQuestionDetected: latestQuestionAt ? Math.round(at - latestQuestionAt) : null,
        at: Math.round(at)
      });
    });
    // 'playing' is the browser's media playback event, not merely a TTS request.
    // It can also include sound effects or music; do not label it neural speech.
    doc.addEventListener('playing', event => {
      if (event.target?.tagName !== 'AUDIO') return;
      const at = now();
      keep(diagnostics.mediaStarts, {
        msAfterQuestionDetected: latestQuestionAt ? Math.round(at - latestQuestionAt) : null,
        at: Math.round(at)
      });
    }, true);
    if (typeof root.PerformanceObserver === 'function') {
      try {
        const observeTts = new root.PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (!/\/api\/tts(?:\?|$)/.test(entry.name)) return;
            keep(diagnostics.requests, {
              startedAt: Math.round(entry.startTime),
              totalMs: Math.round(entry.duration),
              serverTimings: (entry.serverTiming || []).map(item => ({
                name: item.name,
                durationMs: Math.round(item.duration)
              }))
            });
          });
        });
        observeTts.observe({ type: 'resource', buffered: true });
      } catch (_) { /* PerformanceObserver is optional. */ }
    }
    const assistant = () => root.ELXAssistentes;
    const speak = text => {
      const voice = assistant();
      if (voice?.isEnabled?.() && text) voice.speak(text, voice.getPersona?.() || 'male', true);
    };
    // Plantão phases use the existing label as their source of truth. Explain
    // the learning objective, not a clinical diagnosis or a prescribed action.
    const phaseGuidance = {
      'AVALIAÇÃO INICIAL': 'Observe o estado geral e identifique prioridades.',
      'HISTÓRICO E TRIAGEM': 'Relacione o histórico aos sinais e à urgência.',
      'ESTABILIZAÇÃO E SEGURANÇA': 'Considere a estabilidade e a segurança antes da imagem.',
      'PERGUNTA CLÍNICA': 'Defina qual dúvida o exame deve esclarecer.',
      'PLANO DE IMAGEM': 'Escolha o método de imagem conforme o objetivo clínico.',
      'MODALIDADE E PROJEÇÕES': 'Avalie quais projeções respondem à pergunta clínica.',
      'AQUISIÇÃO E POSICIONAMENTO': 'Considere posicionamento e técnica para obter imagens adequadas.',
      'QUALIDADE TÉCNICA': 'Confira se as imagens permitem uma avaliação confiável.',
      'INTERPRETAÇÃO': 'Analise os achados e suas limitações.',
      'INTEGRAÇÃO DOS ACHADOS': 'Relacione os achados à apresentação clínica.',
      'REAVALIAÇÃO E PRÓXIMA CONDUTA': 'Reavalie a evolução e a necessidade de novas medidas.',
      'REGISTRO E COMUNICAÇÃO': 'Organize as informações e comunique as conclusões.'
    };
    const caseNarration = (internal, question) => {
      const phase = internal.querySelector('.dpi-case-phase b')?.textContent?.replace(/\s+/g, ' ').trim().toUpperCase();
      if (!phase || !Object.prototype.hasOwnProperty.call(phaseGuidance, phase)) return '';
      const prompt = question?.textContent?.replace(/\s+/g, ' ').trim() || '';
      if (!prompt) return '';
      const options = [...internal.querySelectorAll('.dpi-case-option')].slice(0, 4)
        .map((button, index) => String.fromCharCode(65 + index) + '. ' + String(button.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      return ['Etapa do plantão: ' + phase + '.', phaseGuidance[phase], prompt, ...options].join(' ');
    };
    const openResult = node => {
      if (!node?.isConnected || node.dataset.dpiDialogOpen || !node.matches(resultSelector)) return;
      node.dataset.dpiDialogOpen = 'true';
      const overlay = doc.createElement('div');
      overlay.className = 'dpi-answer-dialog';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Resultado da resposta');
      Object.assign(overlay.style, { position:'fixed', inset:'0', zIndex:'10060', display:'grid', placeItems:'center', padding:'16px', background:'#001522cc', overflowY:'auto' });
      const card = doc.createElement('section');
      Object.assign(card.style, { position:'relative', width:'min(100%,620px)', maxHeight:'min(84dvh,760px)', overflowY:'auto', padding:'22px 18px 18px', border:'1px solid #64cedd', borderRadius:'20px', background:'linear-gradient(145deg,#f7fcfd,#eaf5f7)', boxShadow:'0 24px 70px #00101dcc', color:'#17364d' });
      const close = doc.createElement('button');
      close.type = 'button';
      close.className = 'dpi-answer-dialog__close';
      close.setAttribute('aria-label', 'Fechar resultado e continuar');
      close.title = 'Fechar resultado';
      close.textContent = '×';
      Object.assign(close.style, { position:'sticky', float:'right', top:'0', zIndex:'2', width:'42px', height:'42px', margin:'-10px -8px 6px 10px', border:'1px solid #8cb8c5', borderRadius:'50%', background:'#fff', color:'#17364d', font:'700 26px/1 Arial,sans-serif', cursor:'pointer' });
      const dismiss = () => {
        const next = node.querySelector('button[onclick*="nextQuestion"],button[onclick*="caseRender"],button[onclick*="DpiGameRounds.next"],button[onclick*="nextAssociation"]');
        try { if (next && !next.disabled) next.click(); }
        finally { overlay.remove(); if (node.isConnected) node.remove(); }
      };
      close.addEventListener('click', dismiss);
      overlay.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(); });
      card.append(close, node);
      overlay.append(card);
      doc.body.append(overlay);
      close.focus({ preventScroll:true });
      const heading = node.querySelector('strong,b')?.textContent?.trim() || 'Vamos revisar esta resposta.';
      const explanation = [...node.querySelectorAll('p')].map(p => p.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,2).join('. ');
      speak([heading, explanation].filter(Boolean).join('. ').slice(0,650));
    };
    let lastSpokenPrompt = '';
    let lastSpokenQuestion = null;
    let narrationGeneration = 0;
    const scan = () => {
      scanTimer = 0;
      // The large inline bundle may install or replace its reader after this
      // module initializes; track the currently active function, not just the
      // one available at DOMContentLoaded.
      ensurePublicReaderTracked();
      const internal = doc.getElementById('internal');
      if (!internal) return;
      // Answer feedback takes precedence: never queue a question while its
      // explanation is opening or being narrated.
      const result = internal.querySelector(resultSelector);
      if (result) {
        ++narrationGeneration;
        openResult(result);
        return;
      }
      if (doc.querySelector('.dpi-answer-dialog')) return;
      const question = internal.querySelector('.dpi-round-question,.dpi-case-question,.question-text');
      const prompt = question?.textContent?.replace(/\s+/g, ' ').trim() || '';
      // An emptied/removed question ends the current presentation. Re-rendering
      // identical wording later is still a new question and must be readable.
      if (!prompt) {
        if (lastSpokenQuestion) ++narrationGeneration;
        lastSpokenQuestion = null;
        lastSpokenPrompt = '';
        lastPublicRead = null;
        return;
      }
      // A different rendered question must be narrated even when its wording repeats.
      if (prompt && (question !== lastSpokenQuestion || prompt !== lastSpokenPrompt)) {
        lastSpokenQuestion = question;
        lastSpokenPrompt = prompt;
        latestQuestionAt = now();
        const detectedAt = latestQuestionAt;
        const generation = ++narrationGeneration;
        keep(diagnostics.questions, {
          detectedAt: Math.round(latestQuestionAt),
          browserVoiceSpeaking: Boolean(root.speechSynthesis?.speaking),
          browserVoicePending: Boolean(root.speechSynthesis?.pending),
          neuralAssistantEnabled: Boolean(assistant()?.isEnabled?.())
        });
        root.setTimeout(() => {
          if (generation !== narrationGeneration || !question.isConnected || !internal.contains(question) ||
              internal.querySelector(resultSelector) || doc.querySelector('.dpi-answer-dialog') ||
              question.textContent.replace(/\s+/g, ' ').trim() !== prompt) return;
          // An inline read within the same rendering window takes priority.
          // Retain automatic narration for screens that do not call the reader.
          if (lastPublicRead?.question === question &&
              lastPublicRead.prompt === prompt &&
              now() - lastPublicRead.at >= 0 && now() - lastPublicRead.at <= 500) return;
          ensurePublicReaderTracked();
          const viaReader = typeof root.dpiReadQuestion === 'function';
          keep(diagnostics.narrationCalls, {
            at: Math.round(now()),
            msAfterQuestionDetected: Math.round(now() - detectedAt),
            path: viaReader ? 'public-question-reader' : 'assistant-fallback',
            browserVoiceSpeaking: Boolean(root.speechSynthesis?.speaking),
            browserVoicePending: Boolean(root.speechSynthesis?.pending)
          });
          const plantaoText = question.matches?.('.dpi-case-question') ? caseNarration(internal, question) : '';
          if (plantaoText && assistant()?.isEnabled?.()) speak(plantaoText);
          else if (viaReader) root.dpiReadQuestion();
          else speak(prompt);
        }, 180);
      }
    };
    // Coalesce frequent DOM changes without postponing narration indefinitely.
    // Preserve the existing 180 ms stability check before reading the prompt.
    const schedule = () => {
      if (scanTimer) return;
      scanTimer = root.setTimeout(scan, 32);
    };
    const internal = doc.getElementById('internal');
    if (internal && typeof root.MutationObserver === 'function') {
      new root.MutationObserver(schedule).observe(internal, { childList:true, subtree:true, characterData:true });
      schedule();
    }

    // The legacy inline handler points at a function scoped inside its script.
    // Route the visible case/question button through the public question reader.
    doc.addEventListener('click', event => {
      const trigger = event.target?.closest?.('#internal .dpi-case-trigger');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const question = doc.querySelector('#internal .dpi-case-question,#internal .question-text,#internal .dpi-round-question,#internal .miniStage > p');
      if (question && typeof root.dpiReadQuestion === 'function') {
        root.dpiReadQuestion();
        return;
      }
      const voice = assistant();
      const title = doc.querySelector('#internal .dpi-play-content h2')?.textContent?.trim() || 'Desafio DPI';
      const prompt = question?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const options = [...doc.querySelectorAll('#internal .option:not(:disabled),#internal .dpi-case-option:not(:disabled),#internal .dpi-round-option:not(:disabled)')]
        .slice(0, 4).map((button, index) => String.fromCharCode(65 + index) + ': ' + button.innerText.trim());
      const text = [title, prompt, ...options].filter(Boolean).join('. ');
      if (voice?.isEnabled?.() && text) voice.speak(text, voice.getPersona?.() || 'male', true);
    }, true);

    const NativeRecognition = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (typeof NativeRecognition !== 'function') return;
    const normalizeChoice = value => {
      const text = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.,!?;:]/g,' ').replace(/\s+/g,' ').trim();
      if (/^[abcd]$/.test(text)) return text;
      return text.match(/(?:^|\b)(?:alternativa|opcao|letra|resposta)(?: (?:e|eh|seria))? (?:a )?([abcd])$/)?.[1] || null;
    };
    const choiceButton = letter => {
      const index = letter.charCodeAt(0) - 97;
      for (const selector of ['#internal .option:not(:disabled)','#internal .dpi-case-option:not(:disabled)','#internal .dpi-round-option:not(:disabled)','#internal .dpi-target-dot:not(:disabled)']) {
        const options = [...doc.querySelectorAll(selector)].filter(button => !button.hidden && button.getAttribute('aria-hidden') !== 'true');
        if (options[index]) return options[index];
      }
      return null;
    };
    function VoiceRecognition() {
      const instance = new NativeRecognition();
      let handler = null;
      let attached = false;
      Object.defineProperty(instance, 'onresult', {
        configurable:true,
        get:() => handler,
        set:value => {
          handler = typeof value === 'function' ? value : null;
          if (!handler || attached || typeof instance.addEventListener !== 'function') return;
          attached = true;
          instance.addEventListener('result', event => {
            if (!handler) return;
            const deferred = [];
            const results = Array.from(event.results || [], item => {
              const transcript = String(item?.[0]?.transcript || '').trim();
              const choice = item?.isFinal ? normalizeChoice(transcript) : null;
              const button = choice && choiceButton(choice);
              if (button) deferred.push(button);
              return { 0:{ transcript:choice ? 'alternativa ' + choice : transcript }, isFinal:!!item?.isFinal && !button };
            });
            handler.call(instance, { resultIndex:Number(event.resultIndex)||0, results });
            if (deferred.length) root.setTimeout(() => deferred.forEach(button => { if (button.isConnected && !button.disabled) button.click(); }), 0);
          });
        }
      });
      return instance;
    }
    VoiceRecognition.prototype = NativeRecognition.prototype;
    try {
      Object.setPrototypeOf(VoiceRecognition, NativeRecognition);
      root.SpeechRecognition = VoiceRecognition;
      if (root.webkitSpeechRecognition === NativeRecognition) root.webkitSpeechRecognition = VoiceRecognition;
    } catch (error) { root.console?.warn?.('Respostas por voz indisponíveis neste navegador.', error); }
  }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', installQuestionAndResultFlow, { once:true });
  else installQuestionAndResultFlow();

  // Windows' cover launch can run inside a browser configuration that blocks
  // new tabs from a loopback address. Library references therefore navigate
  // the current tab in that route; Back returns to the same game screen.
  if (returningToDpiCover && typeof root.document.addEventListener === 'function') {
    root.document.addEventListener('click', event => {
      const link = event.target?.closest?.('.dpi-library-page a[href^="http"]');
      if (!link) return;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }, true);
  }

  if (!mode || !Object.prototype.hasOwnProperty.call(actions, mode)) return;
  root.document.documentElement.classList.add('dpi-route-pending');

  function showDpiModeMenu() {
    if (typeof root.shell !== 'function') return false;
    root.shell('Escolha como quer jogar', `<p class="dpi-game-intro">Escolha um caminho: estude no quiz, pratique nos minijogos ou conduza um caso no Plantão.</p><div class="dpi-choice-grid dpi-mode-choice-grid"><button type="button" class="dpi-choice-card" onclick="route('quiz')"><span>10 / 25 / 50</span><b>Quiz diagnóstico</b><small>Escolha uma rodada de 10, 25 ou 50 questões.</small></button><button type="button" class="dpi-choice-card" onclick="route('challenges')"><span>7</span><b>Desafios</b><small>Pratique em sete formatos de jogo.</small></button><button type="button" class="dpi-choice-card" onclick="route('plantao')"><span>🚨</span><b>Plantão DPI</b><small>Conduza casos e decisões clínicas.</small></button><button type="button" class="dpi-choice-card" onclick="achievements()"><span>✦</span><b>Minhas conquistas</b><small>Acompanhe pontos e progresso.</small></button></div>`);
    const internal = root.document.getElementById('internal');
    internal?.querySelectorAll('button').forEach(button => {
      if (!/VOLTAR\s+(?:À|A)\s+CAPA/i.test(button.textContent || '')) return;
      button.onclick = () => root.location.assign('/dpi-home.html');
    });
    return true;
  }
  root.dpiModeMenu = showDpiModeMenu;
  // The game keeps afterReg in a lexical let, so setting window.afterReg cannot
  // redirect the original guest/profile callbacks. Show the mode menu after
  // either identity path closes successfully.
  const showMenuAfterIdentity = () => {
    if (mode === 'start' && !root.document.querySelector('#register.on')) showDpiModeMenu();
  };
  const originalShowHome = root.showHome;
  const runIdentityAction = (action, receiver, args) => {
    const routedShowHome = root.showHome;
    if (returningToDpiCover && typeof originalShowHome === 'function') root.showHome = originalShowHome;
    try { return action.apply(receiver, args); }
    finally { if (returningToDpiCover && routedShowHome) root.showHome = routedShowHome; }
  };
  const originalContinueAsGuest = root.continueAsGuest;
  if (typeof originalContinueAsGuest === 'function') {
    root.continueAsGuest = function () {
      const result = runIdentityAction(originalContinueAsGuest, this, arguments);
      showMenuAfterIdentity();
      return result;
    };
  }
  const originalSaveProfile = root.saveProfile;
  if (typeof originalSaveProfile === 'function') {
    root.saveProfile = function () {
      const result = runIdentityAction(originalSaveProfile, this, arguments);
      if (typeof root.prof === 'function' && root.prof()) showMenuAfterIdentity();
      return result;
    };
  }
  const originalRoute = root.route;
  if (typeof originalRoute === 'function') {
    root.route = function (destination) {
      if (destination === 'modeMenu') return showDpiModeMenu();
      return originalRoute.apply(this, arguments);
    };
  }

  function startFromPresentation() {
    if (typeof root.prof !== 'function' || typeof root.profile !== 'function') return false;
    if (root.prof()) { return root.route ? root.route('modeMenu') : showDpiModeMenu(); }
    root.profile();
    if (root.document.querySelector('#register.on')) root.afterReg = 'modeMenu';
    return true;
  }
  function openPresentationFeature() {
    if (!['study', 'practice', 'evolve'].includes(presentationFeature)) {
      root.location.assign('/dpi-home.html');
      return true;
    }
    root.dpiFeatureDialog(presentationFeature);
    return true;
  }
  root.startFromPresentation = startFromPresentation;
  root.openPresentationFeature = openPresentationFeature;
  const originalCloseFeature = root.dpiCloseFeatureDialog;
  if (mode === 'feature' && returningToDpiCover && typeof originalCloseFeature === 'function') {
    root.dpiCloseFeatureDialog = function () {
      originalCloseFeature.apply(this, arguments);
      root.location.assign('/dpi-home.html');
    };
  }
  if (returningToDpiCover && typeof originalShowHome === 'function') {
    root.showHome = function () { root.location.assign('/dpi-home.html'); };
  }

  function ensurePlantaoScreen() {
    if (mode !== 'plantao' || typeof root.document.getElementById !== 'function') return false;
    const internal = root.document.getElementById('internal');
    if (internal?.classList.contains('on')) return true;
    if (typeof root.caseView !== 'function') return false;
    root.caseView();
    return Boolean(root.document.getElementById('internal')?.classList.contains('on'));
  }

  function dispatch(attempt) {
    const action = root[actions[mode]];
    if (typeof action === 'function') {
      try {
        action();
        ensurePlantaoScreen();
        root.document.documentElement.classList.remove('dpi-route-pending');
        return;
      } catch (error) {
        try { ensurePlantaoScreen(); } catch (fallbackError) { root.console.error('Falha ao abrir a tela do Plantão.', fallbackError); }
        root.document.documentElement.classList.remove('dpi-route-pending');
        root.console.error('Não foi possível abrir o modo DPI solicitado.', error);
        return;
      }
    }
    if (attempt < 80) return root.setTimeout(() => dispatch(attempt + 1), 50);
    try { if (ensurePlantaoScreen()) { root.document.documentElement.classList.remove('dpi-route-pending'); return; } } catch (error) { root.console.error('Falha ao abrir a tela do Plantão.', error); }
    root.document.documentElement.classList.remove('dpi-route-pending');
    root.console.error('A ação DPI não está disponível:', actions[mode]);
  }

  const start = () => root.setTimeout(() => dispatch(0), 0);
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(window);
