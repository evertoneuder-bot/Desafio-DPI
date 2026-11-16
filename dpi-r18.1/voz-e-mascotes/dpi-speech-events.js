/* One playback identity for captions and mascots. No visual changes. */
(function (root) {
  'use strict';
  let latest = -1;
  let active = null;
  const guard = event => {
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
