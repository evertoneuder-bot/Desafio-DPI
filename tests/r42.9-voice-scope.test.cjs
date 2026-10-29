const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('narração da pergunta usa os auxiliares de voz exportados entre scripts', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../dpi-r18.1/ABRA-ESTA-PREVIA.html'), 'utf8');
  const marker = 'function narrateVisibleScreen(){';
  const start = html.lastIndexOf('<script', html.indexOf(marker));
  const end = html.indexOf('</script>', html.indexOf(marker));
  const voiceScript = html.slice(start, end);

  assert.match(voiceScript, /const gameKey=dpiGameKey\(root\)/);
  assert.match(voiceScript, /dpiGameInstructions\(\)/);
  assert.match(voiceScript, /requestAnimationFrame\(dpiGuideControls\)/);
  const router = fs.readFileSync(path.resolve(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');
  assert.match(router, /root\.dpiGameKey\s*=/);
  assert.match(router, /root\.dpiGuideControls\s*=/);
});
