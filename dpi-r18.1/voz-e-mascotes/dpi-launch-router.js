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

  // The voice engine and the conversation UI live in separate IIFEs. Export
  // these helpers on window so the engine's calls resolve across that scope.
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
    const logoUrl = '/assets/marca-elx-oficial-escura.png';
    if (typeof doc.querySelectorAll === 'function') {
      for (const logo of doc.querySelectorAll('.dpi-hero-logo,.headerbrand')) {
        logo.src = logoUrl;
        logo.style?.setProperty('content', `url("${logoUrl}")`, 'important');
      }
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
        .app>header .brandbar{min-height:64px!important;height:64px!important;gap:12px!important}
        .app>header .headerbrand{display:block!important;width:auto!important;height:auto!important;max-width:min(132px,34vw)!important;max-height:56px!important;object-fit:contain!important;object-position:center!important;border-radius:0!important;padding:0!important;background:transparent!important;filter:drop-shadow(0 0 8px #21d8ff55)!important}
        .dpi-answer-dialog{position:fixed;inset:0;z-index:10060;display:grid;place-items:center;padding:18px;background:#001522b8;backdrop-filter:blur(5px)}
        .dpi-answer-dialog__card{position:relative;width:min(100%,620px);max-height:min(82dvh,760px);overflow:auto;padding:24px 20px 20px;border:1px solid #64cedd;border-radius:20px;background:linear-gradient(145deg,#f7fcfd,#eaf5f7);box-shadow:0 24px 70px #00101dcc;color:#17364d}
        .dpi-answer-dialog__close{position:sticky;float:right;top:0;z-index:2;width:42px;height:42px;margin:-12px -10px 4px 10px;border:1px solid #8cb8c5;border-radius:50%;background:#fff;color:#17364d;font:700 26px/1 Arial,sans-serif;cursor:pointer}
        .dpi-answer-dialog__close:focus-visible{outline:3px solid #00a9bb;outline-offset:2px}
        .dpi-answer-dialog .feedback,.dpi-answer-dialog .dpi-case-feedback,.dpi-answer-dialog .dpi-round-result{margin:0!important;max-height:none!important}
        @media(max-width:640px){.utility{grid-template-columns:repeat(2,minmax(0,1fr))!important;height:auto!important}.utility button{min-height:46px!important;font-size:10px!important;padding:5px 3px!important}.utility b{display:inline-block!important;margin:0 5px 0 0!important;vertical-align:middle!important;font-size:16px!important}}
        html.dpi-start-route #home{display:none!important}
        .dpi-siren-interstitial{width:auto!important;overflow:hidden!important}
        .elx-logo-mark{background-image:url('/assets/marca-elx-oficial-escura.png')!important;background-size:125px auto!important;background-position:center top!important;background-repeat:no-repeat!important}
        .dpi-game-hub{width:min(100% - 24px,980px);margin:clamp(14px,3vw,28px) auto;padding:clamp(14px,2.5vw,24px);border:1px solid #16718a;border-radius:20px;background:linear-gradient(145deg,#062d45,#031a2c 70%);box-shadow:0 14px 32px #00111b66;color:#f4fbff}
        .dpi-game-hub__intro{margin:0 0 14px}.dpi-game-hub__eyebrow{margin:0 0 5px;color:#79d9ea;font-size:11px;font-weight:900;letter-spacing:.14em}.dpi-game-hub__intro h2{margin:0;color:#f5fbff;font-size:clamp(21px,3.4vw,30px);line-height:1.2}.dpi-game-hub__intro p:last-child{margin:7px 0 0;color:#b5d1dc;font-size:14px;line-height:1.4}
        .dpi-game-hub__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.dpi-game-hub__card{min-width:0;min-height:100px;display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--hub-line);border-radius:15px;background:linear-gradient(135deg,var(--hub-a),var(--hub-b));color:#fff;text-align:left;cursor:pointer;box-shadow:inset 0 0 14px #ffffff12;transition:filter .18s,transform .18s}.dpi-game-hub__card[data-game-action="quiz"]{--hub-line:#19dd91;--hub-a:#007a56;--hub-b:#005039}.dpi-game-hub__card[data-game-action="challenges"]{--hub-line:#12d1ff;--hub-a:#07578a;--hub-b:#043b67}.dpi-game-hub__card[data-game-action="plantao"]{--hub-line:#d34dff;--hub-a:#63108b;--hub-b:#3c0a68}.dpi-game-hub__card[data-game-action="achievements"]{--hub-line:#ffab29;--hub-a:#9a4a00;--hub-b:#753500}
        .dpi-game-hub__icon{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border:1px solid #e2faff;border-radius:11px;background:#021b2a66}.dpi-game-hub__icon svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.dpi-game-hub__copy{min-width:0;display:grid;gap:4px}.dpi-game-hub__copy b{font-size:16px;line-height:1.2}.dpi-game-hub__copy small{color:#e0f1f6;font-size:12px;line-height:1.35}.dpi-game-hub__card:hover,.dpi-game-hub__card:focus-visible{outline:2px solid #f6fdff;outline-offset:1px;filter:brightness(1.12)}.dpi-game-hub__card:active{transform:translateY(1px)}
        .dpi-game-hub__back{display:block;margin:12px auto 0;padding:7px 10px;border:0;background:transparent;color:#a9d3df;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
        .dpi-quick-modes{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 12px;padding:10px 12px;border:1px solid #b5d5df;border-radius:13px;background:#eaf5f7;color:#173b4e}.dpi-quick-modes span{margin-right:auto;font-size:13px;font-weight:750}.dpi-quick-modes button{min-height:38px;padding:7px 13px;border:1px solid #7daebb;border-radius:10px;background:#fff;color:#10415a;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.dpi-quick-modes button:hover,.dpi-quick-modes button:focus-visible{outline:2px solid #0aa7be;outline-offset:1px}
        @media(max-width:600px){.dpi-game-hub{width:calc(100% - 20px);margin:12px auto;padding:13px;border-radius:16px}.dpi-game-hub__grid{gap:8px}.dpi-game-hub__card{min-height:88px;gap:9px;padding:10px}.dpi-game-hub__icon{width:38px;height:38px;flex-basis:38px}.dpi-game-hub__icon svg{width:21px;height:21px}.dpi-game-hub__copy b{font-size:14px}.dpi-game-hub__copy small{font-size:11px}}
        @media(max-width:350px){.dpi-game-hub__grid{grid-template-columns:minmax(0,1fr)}.dpi-game-hub__card{min-height:70px}}
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
        @media(max-width:600px){
          html.dpi-player-route,html.dpi-player-route body{height:100%;overflow:hidden!important}
          body.dpi-player-route .app{height:100dvh!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
          body.dpi-player-route .app>header{height:64px!important;min-height:64px!important;flex:0 0 64px!important;overflow:visible!important}
          body.dpi-player-route .app>header .brandbar{height:64px!important;min-height:64px!important}
          body.dpi-player-route .app>header .utility{display:none!important}
          body.dpi-player-route .app>footer{display:none!important}
          body.dpi-player-route .app>main{height:calc(100dvh - 64px)!important;min-height:0!important;flex:1 1 auto!important;overflow:hidden!important;margin:0!important;padding:0!important}
          body.dpi-player-route #internal{height:100%!important;min-height:0!important;overflow:hidden!important}
          body.dpi-player-route #elx-conversation{position:fixed!important;top:5px!important;right:8px!important;bottom:auto!important;left:auto!important;z-index:10040!important}
          .dpi-play-app,.dpi-wordgame-page{height:100%!important;max-height:100%!important;min-height:0!important;margin:0!important;padding:0 8px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
          .dpi-play-topbar,.dpi-wordgame-top{display:none!important}
          .dpi-play-layout,.dpi-wordgame-layout{height:100%!important;min-height:0!important;max-height:100%!important;flex:1 1 auto!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:68px minmax(0,1fr)!important;gap:6px!important;padding:0!important;overflow:hidden!important}
          .dpi-play-coach,.dpi-wordgame-coach{position:relative!important;height:68px!important;min-height:68px!important;max-height:68px!important;grid-template-columns:62px minmax(0,1fr)!important;grid-template-rows:1fr!important;align-items:center!important;padding:4px 8px!important;overflow:hidden!important}
          .dpi-play-coach-label,.dpi-wordgame-coach-label{position:absolute!important;left:76px!important;top:3px!important;font-size:8px!important}
          .dpi-play-coach #elx-character-stage,.dpi-wordgame-coach #elx-character-stage{grid-column:1!important;grid-row:1!important;width:58px!important;height:58px!important;min-height:0!important;max-height:58px!important;overflow:visible!important}
          body:not(.elx-portal-on) .dpi-play-coach #elx-character-stage.is-dpi-coach,body:not(.elx-portal-on) .dpi-wordgame-coach #elx-character-stage.is-dpi-coach{position:relative!important;inset:auto!important;width:58px!important;height:58px!important;min-height:58px!important;max-height:58px!important;margin:0!important;z-index:3!important}
          body:not(.elx-portal-on) .dpi-play-coach #elx-character-stage.is-dpi-coach .elx-approved-mascot-pair,body:not(.elx-portal-on) .dpi-wordgame-coach #elx-character-stage.is-dpi-coach .elx-approved-mascot-pair{width:58px!important;height:58px!important;max-height:58px!important}
          .dpi-play-coach .dpi-play-mascot,.dpi-wordgame-coach .dpi-play-mascot{display:none!important}
          .dpi-play-speech,.dpi-wordgame-coach .dpi-play-speech{grid-column:2!important;grid-row:1!important;max-height:58px!important;overflow:hidden!important}
          .dpi-play-content,.dpi-wordgame-main{height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important}
          .dpi-play-content .dpi-game-panel,.dpi-wordgame-main .dpi-game-panel{height:100%!important;max-height:100%!important;min-height:0!important;padding:9px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
          .dpi-play-content .dpi-game-panel .dpi-game-eyebrow{margin:0 0 3px!important}
          .dpi-play-content .dpi-game-panel>h2{font-size:19px!important;line-height:1.15!important;margin:0 0 5px!important}
          .dpi-play-content .dpi-help-actions,.dpi-wordgame-main .dpi-help-actions{flex:0 0 auto!important;display:flex!important;flex-wrap:nowrap!important;gap:5px!important;margin:3px 0 6px!important}
          .dpi-play-content .dpi-help-action,.dpi-wordgame-main .dpi-help-action{min-height:32px!important;padding:4px 7px!important;font-size:10px!important;white-space:nowrap!important}
          .dpi-play-content .dpi-game-panel .question-text,.dpi-play-content .dpi-game-panel .dpi-case-question{font-size:14px!important;line-height:1.25!important;margin:5px 0 7px!important}
          .dpi-play-content .dpi-game-panel .option,.dpi-play-content .dpi-game-panel .dpi-case-option{flex:0 1 auto!important;min-height:42px!important;margin:3px 0!important;padding:7px 9px!important;font-size:13px!important;line-height:1.25!important}
          .dpi-play-content .dpi-game-panel .navrow{display:none!important}
          .dpi-play-content .dpi-game-panel .muted{font-size:11px!important;margin:4px 0!important}
          .dpi-play-content .dpi-game-panel .dpi-surrender-footer{margin:4px 0 0!important;padding:4px 0 0!important}
          .dpi-play-footer,.dpi-wordgame-footer{display:none!important}
        }
        @media(max-width:600px) and (max-height:700px){
          .dpi-play-layout,.dpi-wordgame-layout{grid-template-rows:56px minmax(0,1fr)!important;gap:4px!important}
          .dpi-play-coach,.dpi-wordgame-coach{height:56px!important;min-height:56px!important;max-height:56px!important}
          .dpi-play-coach #elx-character-stage,.dpi-wordgame-coach #elx-character-stage{width:48px!important;height:48px!important;max-height:48px!important}
          body:not(.elx-portal-on) .dpi-play-coach #elx-character-stage.is-dpi-coach,body:not(.elx-portal-on) .dpi-wordgame-coach #elx-character-stage.is-dpi-coach{width:48px!important;height:48px!important;min-height:48px!important;max-height:48px!important}
          body:not(.elx-portal-on) .dpi-play-coach #elx-character-stage.is-dpi-coach .elx-approved-mascot-pair,body:not(.elx-portal-on) .dpi-wordgame-coach #elx-character-stage.is-dpi-coach .elx-approved-mascot-pair{width:48px!important;height:48px!important;max-height:48px!important}
          .dpi-play-coach-label,.dpi-wordgame-coach-label{left:64px!important;font-size:7px!important}
          .dpi-play-content .dpi-game-panel,.dpi-wordgame-main .dpi-game-panel{padding:6px!important}
          .dpi-play-content .dpi-game-panel .dpi-game-eyebrow{display:none!important}
          .dpi-play-content .dpi-game-panel>h2{font-size:17px!important;margin-bottom:3px!important}
          .dpi-play-content .dpi-game-panel .question-text,.dpi-play-content .dpi-game-panel .dpi-case-question{font-size:13px!important;margin:3px 0 5px!important}
          .dpi-play-content .dpi-game-panel .option,.dpi-play-content .dpi-game-panel .dpi-case-option{min-height:38px!important;padding:5px 7px!important;font-size:12px!important;line-height:1.2!important}
          .dpi-play-content .dpi-game-panel .muted{display:none!important}
        }
        /* Phone game shell: keep brand and contact links present while allowing
           each route to grow naturally and scroll only when its content needs it. */
        @media(max-width:600px){
          #elx-conversation>summary{width:48px!important;height:48px!important;min-height:48px!important;justify-content:center!important;gap:0!important;padding:0!important;border:1px solid #5dbfd0!important;border-radius:14px!important;background:#062b43!important;box-shadow:0 5px 16px #00111b99!important}
          #elx-conversation>summary::before{content:none!important}
          #elx-conversation .elx-voice-indicator{width:27px!important;height:27px!important;display:grid!important;place-items:center!important}
          #elx-conversation .elx-voice-indicator svg{width:25px!important;height:25px!important;fill:none!important;stroke:#d9f9ff!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}
          #elx-conversation .elx-voice-indicator .speaker-waves{display:block!important}
          #elx-conversation .elx-voice-indicator .speaker-muted{display:none!important}
          #elx-conversation>summary[data-voice-enabled="false"] .speaker-waves{display:none!important}
          #elx-conversation>summary[data-voice-enabled="false"] .speaker-muted{display:block!important;stroke:#ff9385!important}
          #elx-conversation .elx-voice-label{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
        }
        @media(min-width:601px){#elx-conversation>summary::before{content:none!important}#elx-conversation .elx-voice-indicator svg{width:24px;height:24px;fill:none;stroke:#d9f9ff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#elx-conversation .speaker-waves{display:block}#elx-conversation .speaker-muted{display:none}#elx-conversation>summary[data-voice-enabled="false"] .speaker-waves{display:none}#elx-conversation>summary[data-voice-enabled="false"] .speaker-muted{display:block;stroke:#ff9385}#elx-conversation .elx-voice-label{display:none!important}}
          html.dpi-player-route,html.dpi-player-route body{height:100dvh!important;min-height:100dvh!important;overflow:hidden!important}
          body.dpi-player-route .app{height:100dvh!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
          body.dpi-player-route .app>header{position:relative!important;top:auto!important;z-index:30!important;height:64px!important;min-height:64px!important;flex:0 0 64px!important;overflow:visible!important}
          body.dpi-player-route .app>header .brandbar{height:64px!important;min-height:64px!important}
          body.dpi-player-route .app>header .utility{display:none!important}
          body.dpi-player-route .app>footer{position:relative!important;inset:auto!important;z-index:30!important;display:block!important;flex:0 0 auto!important;min-height:56px!important;padding:3px 8px max(4px,env(safe-area-inset-bottom))!important;background:#031a2c!important;border-top:1px solid #08738d!important}
          body.dpi-player-route .app>footer .footlinks{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;min-height:42px!important}
          body.dpi-player-route .app>footer .footlinks a{min-height:40px!important;display:flex!important;align-items:center!important;justify-content:center!important}
          body.dpi-player-route .app>footer>small{display:none!important}
          body.dpi-player-route .app>main{height:auto!important;min-height:0!important;flex:1 1 auto!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:contain!important;-webkit-overflow-scrolling:touch!important;margin:0!important;padding:0!important}
          body.dpi-player-route #internal{height:auto!important;min-height:100%!important;overflow:visible!important}
          body.dpi-player-route #internal.on{display:block!important}
          .dpi-play-app,.dpi-wordgame-page{height:auto!important;min-height:100%!important;max-height:none!important;overflow:visible!important;display:flex!important;flex-direction:column!important;padding:0 8px 8px!important}
          .dpi-play-layout,.dpi-wordgame-layout{height:auto!important;min-height:0!important;max-height:none!important;flex:1 0 auto!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:max-content max-content!important;gap:6px!important;padding:0!important;overflow:visible!important}
          .dpi-play-coach,.dpi-wordgame-coach{position:relative!important;height:68px!important;min-height:68px!important;max-height:68px!important;grid-template-columns:62px minmax(0,1fr)!important;grid-template-rows:1fr!important;align-items:center!important;padding:4px 8px!important;overflow:hidden!important}
          .dpi-play-content,.dpi-wordgame-main{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
          .dpi-play-content .dpi-game-panel,.dpi-wordgame-main .dpi-game-panel{height:auto!important;max-height:none!important;min-height:0!important;overflow:visible!important;display:flex!important;flex-direction:column!important}
          body.dpi-voice-off .dpi-play-layout,body.dpi-voice-off .dpi-wordgame-layout{grid-template-rows:max-content!important;gap:0!important;padding-top:0!important}
          body.dpi-voice-off .dpi-play-coach,body.dpi-voice-off .dpi-wordgame-coach{display:none!important}
          body.dpi-voice-off .dpi-play-content,body.dpi-voice-off .dpi-wordgame-main{grid-row:1!important;grid-column:1!important;width:100%!important;max-width:none!important}
          .dpi-play-footer,.dpi-wordgame-footer{display:flex!important}
        }
      `;
      doc.head.append(style);
    }

    // Replace the status copy in the header with the speaker state icon. Keep
    // text available to assistive technology through the summary's label.
    function syncSpeakerIcon() {
      if (typeof doc.querySelector !== 'function') return;
      const summary = doc.querySelector('#elx-conversation > summary');
      const indicator = summary?.querySelector('.elx-voice-indicator');
      if (!summary || !indicator || typeof doc.createElementNS !== 'function') return;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = doc.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('focusable', 'false');
      const path = (className, d) => {
        const node = doc.createElementNS(ns, 'path');
        node.setAttribute('class', className);
        node.setAttribute('d', d);
        return node;
      };
      const enabled = !!root.ELXAssistentes?.isEnabled?.();
      svg.append(path('speaker-body', 'M3.5 9v6h4.2l5.1 4V5l-5.1 4H3.5Z'));
      svg.append(path('speaker-waves', 'M16 9a5 5 0 0 1 0 6m2.5-9a8.5 8.5 0 0 1 0 12'));
      svg.append(path('speaker-muted', 'm16 9 5 6m0-6-5 6'));
      indicator.replaceChildren(svg);
      summary.dataset.voiceEnabled = String(enabled);
      summary.title = enabled ? 'Assistente de voz ativado' : 'Assistente de voz desativado';
      summary.setAttribute('aria-label', enabled ? 'Voz ativada. Abrir assistente de voz' : 'Voz desativada. Abrir assistente de voz');
    }
    syncSpeakerIcon();
    root.addEventListener?.('elx-voice-setting', syncSpeakerIcon);

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
  function installAnswerDialog() {
    const doc = root.document;
    if (!doc || root.__dpiAnswerDialogObserver || typeof root.MutationObserver !== 'function') return;
    const selector = '.feedback.ok,.feedback.no,.dpi-case-feedback.is-correct,.dpi-case-feedback.is-wrong,.dpi-round-result.is-correct,.dpi-round-result.is-wrong';
    const openFeedback = node => {
      if (!node?.isConnected || node.dataset.dpiDialogOpen || !node.matches(selector)) return;
      node.dataset.dpiDialogOpen = 'true';
      const overlay = doc.createElement('div');
      overlay.className = 'dpi-answer-dialog'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Resultado da resposta');
      const card = doc.createElement('div'); card.className = 'dpi-answer-dialog__card';
      const close = doc.createElement('button'); close.type = 'button'; close.className = 'dpi-answer-dialog__close'; close.setAttribute('aria-label','Fechar resultado e continuar'); close.title = 'Fechar resultado'; close.textContent = '×';
      close.addEventListener('click', () => {
        const next = node.querySelector('button[onclick*="nextQuestion"],button[onclick*="caseRender"],button[onclick*="DpiGameRounds.next"],button[onclick*="nextAssociation"]');
        if (next) next.click(); else { overlay.remove(); node.remove(); }
      });
      card.append(close,node); overlay.append(card); doc.body.append(overlay); close.focus({preventScroll:true});
    };
    const scan = node => { if (node.nodeType !== 1) return; openFeedback(node); node.querySelectorAll?.(selector).forEach(openFeedback); };
    const observer = new root.MutationObserver(records => records.forEach(record => { scan(record.target); record.addedNodes.forEach(scan); }));
    observer.observe(doc.body,{childList:true,subtree:true}); root.__dpiAnswerDialogObserver = observer;
  }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => { applyApprovedMobileShell(); installAnswerDialog(); }, { once: true });
  else { applyApprovedMobileShell(); installAnswerDialog(); }

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
  if (['start', 'quiz', 'challenges', 'plantao'].includes(mode)) {
    root.document.documentElement.classList.add('dpi-player-route');
    root.document.body?.classList.add('dpi-player-route');
  }
  if (returningToDpiCover && mode === 'start') root.document.documentElement.classList.add('dpi-start-route');

  function startFromPresentation() {
    if (typeof root.prof !== 'function' || typeof root.profile !== 'function') return false;
    if (root.prof()) { root.quizMenu?.(); return true; }
    root.profile();
    if (root.document.querySelector('#register.on')) root.afterReg = 'quiz';
    return true;
  }
  function showDpiGameHub() {
    const doc = root.document;
    const internal = doc.getElementById?.('internal');
    if (!internal) return false;
    doc.getElementById?.('home')?.classList.remove('on');
    internal.classList.add('on');
    internal.innerHTML = `<section class="dpi-game-hub" aria-labelledby="dpi-game-hub-title">
      <header class="dpi-game-hub__intro"><p class="dpi-game-hub__eyebrow">EL-X VET · DESAFIO DPI</p><h2 id="dpi-game-hub-title">Escolha como quer jogar</h2><p>Quiz para estudar, desafios para praticar e Plantão para conduzir casos.</p></header>
      <div class="dpi-game-hub__grid" aria-label="Modos de jogo">
        <button class="dpi-game-hub__card" type="button" data-game-action="quiz"><span class="dpi-game-hub__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/></svg></span><span class="dpi-game-hub__copy"><b>Quiz diagnóstico</b><small>Questões do banco DPI, em rodadas de 10, 25 ou 50.</small></span></button>
        <button class="dpi-game-hub__card" type="button" data-game-action="challenges"><span class="dpi-game-hub__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg></span><span class="dpi-game-hub__copy"><b>Desafios</b><small>Entre nos sete formatos de minijogos.</small></span></button>
        <button class="dpi-game-hub__card" type="button" data-game-action="plantao"><span class="dpi-game-hub__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z"/><path d="M12 9v6m-3-3h6"/></svg></span><span class="dpi-game-hub__copy"><b>Plantão DPI</b><small>Casos encadeados, decisões e vitalidade do paciente.</small></span></button>
        <button class="dpi-game-hub__card" type="button" data-game-action="achievements"><span class="dpi-game-hub__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v4m-4 3h8m-7-3h6l2 3H7l2-3Z"/></svg></span><span class="dpi-game-hub__copy"><b>Minhas conquistas</b><small>Acompanhe pontuação, ranking e progresso.</small></span></button>
      </div><button class="dpi-game-hub__back" type="button" data-game-action="presentation">Voltar à apresentação</button>
    </section>`;
    if (!root.__dpiGameHubClickInstalled) {
      root.__dpiGameHubClickInstalled = true;
      internal.addEventListener('click', event => {
        const button = event.target?.closest?.('[data-game-action]');
        if (!button) return;
        const destination = button.dataset.gameAction;
        if (destination === 'presentation') { root.location.assign('../index.html'); return; }
        const functions = { quiz: 'quizMenu', challenges: 'challenges', plantao: 'launchPlantao', achievements: 'achievements' };
        const action = root[functions[destination]];
        if (typeof action === 'function') action.call(root);
      });
    }
    return true;
  }
  root.dpiShowGameHub = showDpiGameHub;
  const originalShell = root.shell;
  if (typeof originalShell === 'function') {
    root.shell = function (title, body) {
      let content = String(body || '');
      if (String(title) === 'Quiz diagnóstico') {
        content = `<nav class="dpi-quick-modes" aria-label="Outros modos de jogo"><span>Quer explorar outro modo?</span><button type="button" onclick="challenges()">Desafios</button><button type="button" onclick="launchPlantao()">Plantão DPI</button></nav>${content}`;
      }
      const result = originalShell.call(this, title, content);
      const footerAction = root.document.querySelector?.('.dpi-play-footer .btn.secondary');
      if (footerAction) footerAction.textContent = '↩ MODOS DE JOGO';
      return result;
    };
  }
  const originalRoute = root.route;
  root.route = function (destination) {
    if (destination === 'dpi-game-hub') return showDpiGameHub();
    if (typeof originalRoute === 'function') return originalRoute.apply(this, arguments);
    return false;
  };
  function routeStartToQuizWhenComplete(name) {
    const original = root[name];
    if (typeof original !== 'function' || original.__dpiStartQuizWrapped) return;
    const wrapped = function () {
      const result = original.apply(this, arguments);
      if (!root.document.querySelector('#register.on')) root.quizMenu?.();
      return result;
    };
    wrapped.__dpiStartQuizWrapped = true;
    root[name] = wrapped;
  }
  routeStartToQuizWhenComplete('continueAsGuest');
  routeStartToQuizWhenComplete('saveProfile');
  function openPresentationFeature() {
    if (!['study', 'practice', 'evolve'].includes(presentationFeature)) {
      root.location.assign('../index.html');
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
      root.location.assign('../index.html');
    };
  }
  const originalShowHome = root.showHome;
  if (returningToDpiCover && mode === 'start') {
    root.showHome = showDpiGameHub;
  } else if (returningToDpiCover && typeof originalShowHome === 'function') {
    root.showHome = function () { root.location.assign('../index.html'); };
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
