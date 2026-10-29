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
    achievements: 'achievements'
  };
  const returningToDpiCover = params.get('return') === 'dpi';

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

  const originalShowHome = root.showHome;
  if (returningToDpiCover && typeof originalShowHome === 'function') {
    root.showHome = function () {
      root.location.assign('../dpi-home.html');
    };
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
