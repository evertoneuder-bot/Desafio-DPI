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

  // Keep neural server voices as the default; use device speech only when the
  // player explicitly chose it. Respect mute and any saved preference.
  const voiceRecoveryKey = 'dpi-free-voice-recovery-r42-13';
  function recoverFreeVoice() {
    try {
      const storage = root.localStorage;
      if (storage.getItem('dpi-casual-audio') === '0') return;
      if (storage.getItem('dpi-device-voice') == null && typeof root.dpiUseDeviceVoice === 'function') {
        root.dpiUseDeviceVoice(false);
        storage.setItem(voiceRecoveryKey, '1');
      }
      if (root.ELXAssistentes?.isEnabled?.() === false) root.ELXAssistentes.setEnabled?.(true);
    } catch (error) {
      root.console?.warn?.('Não foi possível recuperar as preferências de voz.', error);
    }
  }
  // The router is parsed before the inline voice engine. Wait until DOMContentLoaded
  // so the migration can call the real device-voice setter before marking success.
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', recoverFreeVoice, { once: true });
  } else {
    root.setTimeout(recoverFreeVoice, 0);
  }
  root.addEventListener?.('elx-voice-setting', event => {
    if (event.detail?.enabled) recoverFreeVoice();
  });

  // Keep the approved bibliography label visible in the legacy game shell
  // while the main cover and game are being converged on the shared design.
  function applyApprovedMobileShell() {
    const doc = root.document;
    const logo = doc.querySelector('.dpi-topline .dpi-hero-logo');
    if (logo) {
      logo.style.setProperty('display', 'block', 'important');
      logo.style.setProperty('width', 'auto', 'important');
      logo.style.setProperty('height', 'clamp(64px, 8vw, 92px)', 'important');
      logo.style.setProperty('max-width', 'min(48vw, 220px)', 'important');
      logo.style.setProperty('max-height', '92px', 'important');
      logo.style.setProperty('object-fit', 'contain', 'important');
      logo.style.setProperty('object-position', 'left center', 'important');
      logo.style.setProperty('flex', '0 1 auto', 'important');
    }
    const whatsapp = doc.querySelector('.footlinks a[href*="wa.me"]');
    if (whatsapp && !whatsapp.querySelector('.dpi-whatsapp-quote-request')) {
      whatsapp.dataset.elxQuote = 'true';
      whatsapp.setAttribute('aria-label', 'WhatsApp — solicitar orçamento de telerradiologia');
      for (const node of [...whatsapp.childNodes]) if (node.nodeType === 3) node.remove();
      const copy = doc.createElement('span');
      copy.className = 'dpi-whatsapp-copy';
      const title = doc.createElement('span');
      title.textContent = 'WhatsApp';
      const quote = doc.createElement('small');
      quote.className = 'dpi-whatsapp-quote-request';
      quote.textContent = 'Solicitar orçamento de telerradiologia';
      copy.append(title, quote);
      whatsapp.append(copy);
    }
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
        #elx-conversation>summary::before{content:none!important}
        #elx-conversation summary .elx-voice-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
        #elx-conversation .elx-voice-indicator{display:inline-flex;align-items:center;justify-content:center;background:none}
        #elx-conversation .elx-voice-indicator svg{width:23px;height:23px}
        #elx-conversation .voice-muted{display:none}
        #elx-conversation[data-voice-muted="true"] .voice-waves{display:none}
        #elx-conversation[data-voice-muted="true"] .voice-muted{display:block}
        .footlinks a svg{vertical-align:middle;flex-shrink:0}
        .footlinks a[data-elx-quote="true"]{display:inline-flex;align-items:center;gap:7px;max-width:100%}.dpi-whatsapp-copy{display:flex;flex-direction:column;gap:2px;line-height:1.15;white-space:normal}.dpi-whatsapp-quote-request{font-size:clamp(10px,1vw,12px);font-weight:600;opacity:.9;max-width:42vw}
        #elx-character-stage .elx-mascot-motion-persona[data-voice-pose="speaking"],.dpi-play-mascot[data-voice-pose="speaking"],.dpi-wordgame-coach img[data-voice-pose="speaking"]{animation:dpiNaturalSpeak .72s ease-in-out infinite alternate!important;transform-origin:50% 90%}
        #elx-character-stage .elx-mascot-motion-persona[data-voice-pose="listening"],.dpi-play-mascot[data-voice-pose="listening"],.dpi-wordgame-coach img[data-voice-pose="listening"]{animation:dpiNaturalListen 1.5s ease-in-out infinite alternate!important;transform-origin:50% 90%}
        #elx-character-stage .elx-mascot-motion-persona[data-voice-pose="celebrate"],#elx-character-stage .elx-mascot-motion-persona[data-voice-pose="greeting"],.dpi-play-mascot[data-voice-pose="celebrate"],.dpi-play-mascot[data-voice-pose="greeting"],.dpi-wordgame-coach img[data-voice-pose="celebrate"],.dpi-wordgame-coach img[data-voice-pose="greeting"]{animation:dpiNaturalGreet .6s ease-in-out 3!important}
        #elx-character-stage .elx-mascot-motion-persona[data-voice-pose="incorrect"],.dpi-play-mascot[data-voice-pose="incorrect"],.dpi-wordgame-coach img[data-voice-pose="incorrect"]{animation:dpiNaturalReassure .8s ease-in-out 2!important}
        @keyframes dpiNaturalSpeak{from{transform:translateY(0) rotate(-.5deg) scale(1)}to{transform:translateY(-3px) rotate(.7deg) scale(1.012)}}
        @keyframes dpiNaturalListen{from{transform:rotate(0)}to{transform:rotate(1.5deg) translateY(-1px)}}
        @keyframes dpiNaturalGreet{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(-1.5deg)}}
        @keyframes dpiNaturalReassure{0%,100%{transform:rotate(0)}35%{transform:rotate(-1.5deg)}70%{transform:rotate(1.5deg)}}
        @media(prefers-reduced-motion:reduce){#elx-character-stage .elx-mascot-motion-persona[data-voice-pose],.dpi-play-mascot[data-voice-pose],.dpi-wordgame-coach img[data-voice-pose]{animation:none!important}}
        .dpi-play-speech p,.dpi-speech>span,.dpi-wordgame-speech p{display:block;line-height:1.45!important;height:4.35em!important;min-height:4.35em!important;max-height:4.35em!important;overflow:hidden!important;overflow-wrap:anywhere;white-space:normal!important;scrollbar-width:none}
        .dpi-play-speech p[data-caption-overflow="true"],.dpi-speech>span[data-caption-overflow="true"],.dpi-wordgame-speech p[data-caption-overflow="true"]{-webkit-mask-image:linear-gradient(to bottom,transparent,#000 24%,#000);mask-image:linear-gradient(to bottom,transparent,#000 24%,#000)}
      `;
      doc.head.append(style);
    }

    if (root.__dpiTransientVoiceUiInstalled || typeof doc.querySelector !== 'function') return;
    root.__dpiTransientVoiceUiInstalled = true;

    // Speaker opens the existing compact controls; the microphone has its own button.
    let captionTimer = 0;
    let captionHideTimer = 0;
    let captionText = '', captionNode = null;
    const paintCaption = index => {
      if (!captionNode) return;
      captionNode.textContent = captionText.slice(0, index);
      captionNode.scrollTop = Math.max(0, captionNode.scrollHeight - captionNode.clientHeight);
      captionNode.dataset.captionOverflow = String(captionNode.scrollHeight > captionNode.clientHeight + 1);
    };
    root.addEventListener('elx-speech-progress', event => {
      if (event.detail?.text !== captionText) return;
      paintCaption(Math.min(captionText.length, Math.max(1, Number(event.detail.charIndex) || 0) + 35));
    });
    root.addEventListener('elx-speech-start', event => {
      const bubble = doc.querySelector('#internal .dpi-play-speech,#internal .dpi-wordgame-speech');
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
      captionText = text; captionNode = caption;
      let index = 0;
      if (event.detail?.audio) { paintCaption(Math.min(35, text.length)); return; }
      captionTimer = root.setInterval(() => {
        paintCaption(++index);
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
    const assistant = () => root.ELXAssistentes;
    const speak = text => {
      const voice = assistant();
      if (voice?.isEnabled?.() && text) voice.speak(text, voice.getPersona?.() || 'male', true);
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
      // Inline navigation handlers run first; only remove the old dialog here.
      // Calling the next action again would skip an unanswered question.
      const resultNavigation = 'button[onclick*="nextQuestion"],button[onclick*="returnToQuestion"],button[onclick*="caseRender"],button[onclick*="DpiGameRounds.next"],button[onclick*="nextAssociation"]';
      node.addEventListener('click', event => {
        const action = event.target?.closest?.('button');
        if (!action?.matches?.(resultNavigation)) return;
        overlay.remove();
        if (node.isConnected) node.remove();
      });
      card.append(close, node);
      overlay.append(card);
      doc.body.append(overlay);
      close.focus({ preventScroll:true });
      const heading = node.querySelector('strong,b')?.textContent?.trim() || 'Vamos revisar esta resposta.';
      const explanation = [...node.querySelectorAll('p')].map(p => p.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,2).join('. ');
      const narrateResult = () => {
        if (!node.isConnected) return;
        const prepared = root.DPIStaticVoice?.screen('', node.textContent);
        const clinical = node.querySelector('[data-dpi-explanation]')?.textContent?.trim();
        speak(prepared?.text || clinical || [heading, explanation].filter(Boolean).join('. ').slice(0,650));
      };
      if (root.DPIStaticVoice && !root.DPIStaticVoice.settled) root.DPIStaticVoice.ready.then(narrateResult);
      else narrateResult();
    };
    const scan = () => {
      scanTimer = 0;
      const internal = doc.getElementById('internal');
      if (!internal) return;
      const result = internal.querySelector(resultSelector);
      if (result) { openResult(result); return; }
    };
    const schedule = () => { root.clearTimeout(scanTimer); scanTimer = root.setTimeout(scan, 160); };
    const internal = doc.getElementById('internal');
    if (internal && typeof root.MutationObserver === 'function') {
      new root.MutationObserver(schedule).observe(internal, { childList:true, subtree:true, characterData:true });
      schedule();
    }

    // Prefer the shared case controller; retain the question reader only for older pages.
    doc.addEventListener('click', event => {
      const trigger = event.target?.closest?.('#internal .dpi-case-trigger');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof root.dpiRequestCase === 'function') { root.dpiRequestCase(); return; }
      const question = doc.querySelector('#internal .dpi-case-question,#internal .question-text,#internal .dpi-round-question,#internal .miniStage > p');
      if (question && typeof root.dpiReadQuestion === 'function') {
        root.dpiReadQuestion();
        return;
      }
      const voice = assistant();
      const title = doc.querySelector('#internal .dpi-play-content h2')?.textContent?.trim() || 'Desafio DPI';
      const prompt = question?.textContent?.replace(/\\s+/g, ' ').trim() || '';
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
      event.preventDefault();
      root.location.assign(link.href);
    }, true);
  }

  if (!mode || !Object.prototype.hasOwnProperty.call(actions, mode)) return;
  root.document.documentElement.classList.add('dpi-route-pending');

  function showDpiModeMenu() {
    if (typeof root.shell !== 'function') return false;
    root.shell('Escolha como quer jogar', `<p class="dpi-game-intro">Escolha um caminho: estude no quiz, pratique nos minijogos ou conduza um caso no Plantão.</p><div class="dpi-choice-grid dpi-mode-choice-grid"><button type="button" class="dpi-choice-card" onclick="route('quiz')"><span>10</span><b>Quiz diagnóstico</b><small>Questões objetivas do banco DPI.</small></button><button type="button" class="dpi-choice-card" onclick="route('challenges')"><span>7</span><b>Desafios</b><small>Pratique em sete formatos de jogo.</small></button><button type="button" class="dpi-choice-card" onclick="route('plantao')"><span>🚨</span><b>Plantão DPI</b><small>Conduza casos e decisões clínicas.</small></button><button type="button" class="dpi-choice-card" onclick="achievements()"><span>✦</span><b>Minhas conquistas</b><small>Acompanhe pontos e progresso.</small></button></div>`);
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
