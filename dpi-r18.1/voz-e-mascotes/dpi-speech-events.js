/* One playback identity for captions and mascots. No visual changes. */
(function (root) {
  'use strict';
  let latest = -1;
  let active = null;
  const guard = event => {
    // The legacy cover can render its prompt as a bare text node, while the
    // caption listener expects a span it can update when speech starts.
    // Normalize that one existing bubble before the event reaches captions.
    if (event.type === 'elx-speech-start') {
      const doc = root.document;
      const cover = doc?.querySelector?.('#home .dpi-speech');
      if (cover && !cover.querySelector('span')) {
        const speaker = cover.querySelector('b');
        const prompt = [...cover.childNodes]
          .filter(node => node !== speaker && node.nodeType === 3)
          .map(node => node.textContent || '')
          .join(' ').trim();
        const lineBreak = doc.createElement('br');
        const caption = doc.createElement('span');
        caption.textContent = prompt;
        cover.replaceChildren(...(speaker ? [speaker, lineBreak, caption] : [lineBreak, caption]));
      }
    }
    const id = event.detail?.speechId;
    // The assistant owns approved recordings too. Ignore legacy duplicate
    // play/pause notifications which cannot identify their playback.
    if (!Number.isSafeInteger(id)) {
      if (root.ELXAssistentes) event.stopImmediatePropagation();
      return;
    }
    if (event.type === 'elx-speech-start') {
      if (id <= latest) { event.stopImmediatePropagation(); return; }
      latest = id;
      active = id;
    } else {
      if (id !== active) { event.stopImmediatePropagation(); return; }
      if (event.type !== 'elx-speech-progress') active = null;
    }
  };
  for (const type of ['elx-speech-start', 'elx-speech-progress', 'elx-speech-end', 'elx-speech-paused']) {
    root.addEventListener(type, guard, true);
  }
})(window);
