(() => {
  'use strict';
  const gamePath = './dpi-r18.1/ABRA-ESTA-PREVIA.html';
  const navigate = (mode, feature) => {
    try { window.localStorage.setItem('dpi-device-voice', '1'); } catch {}
    const url = new URL(gamePath, window.location.href);
    url.searchParams.set('mode', mode);
    url.searchParams.set('return', 'dpi');
    if (feature) url.searchParams.set('feature', feature);
    window.location.assign(url.href);
  };
  document.querySelectorAll('[data-launch]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.launch;
      if (mode === 'start') navigate('start');
      else if (['profile', 'settings', 'ranking', 'bank'].includes(mode)) navigate(mode);
    });
  });
  document.querySelectorAll('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      const feature = button.dataset.feature;
      if (feature === 'share') {
        const dialog = document.getElementById?.('dpi-share-dialog');
        if (dialog && !dialog.open) dialog.showModal();
        return;
      }
      if (['study', 'practice', 'evolve'].includes(feature)) navigate('feature', feature);
    });
  });
  const dialog = document.getElementById?.('dpi-share-dialog');
  const close = dialog?.querySelector('.dpi-share-close');
  const pageUrl = new URL('/', window.location.href).href;
  const title = 'Desafio DPI — EL-X VET';
  const message = 'Conhecimento veterinário em jogo. Venha aprender e jogar no Desafio DPI!';
  const wa = dialog?.querySelector('[data-share-whatsapp]');
  const email = dialog?.querySelector('[data-share-email]');
  const copy = dialog?.querySelector('[data-share-copy]');
  const native = dialog?.querySelector('[data-share-native]');
  if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(`${message} ${pageUrl}`)}`;
  if (email) email.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n${pageUrl}`)}`;
  if (navigator.share && native) {
    native.hidden = false;
    native.addEventListener('click', async () => {
      try { await navigator.share({ title, text: message, url: pageUrl }); }
      catch (error) { if (error.name !== 'AbortError') window.alert('Não foi possível abrir o compartilhamento do aparelho.'); }
    });
  }
  copy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      copy.textContent = 'Link copiado ✓';
    } catch {
      window.prompt('Copie o link do Desafio DPI:', pageUrl);
    }
  });
  close?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();
