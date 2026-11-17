const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'ABRIR-PREVIA-INTEGRADA.html'), 'utf8');

test('preview launcher offers the seven legacy minigames and three new game modules', () => {
  const legacy = ['Relâmpago', 'Alvo', 'Eliminação', 'Associação', 'Caça-palavras', 'Forca clínica', 'Palavras cruzadas'];
  for (const name of legacy) assert.ok(html.includes(`<li>${name}</li>`), `missing legacy game: ${name}`);

  const routes = [
    'avaliacao/questoes.html',
    'avaliacao/olhar.html',
    'avaliacao/Detetive_da_Imagem_PREVIA.html',
  ];
  for (const route of routes) {
    assert.ok(fs.existsSync(path.join(root, route)), `missing game module: ${route}`);
    assert.ok(html.includes(`href="${route}"`), `missing launcher route: ${route}`);
  }
  assert.match(html, /7 minijogos/);
  assert.match(html, /3 modalidades/);
});

test('legacy arena keeps its original layout and uses the supported entry route', () => {
  const route = 'dpi-r18.1/ABRA-ESTA-PREVIA.html?mode=start&amp;return=dpi';
  assert.ok(html.includes(route));
  const original = fs.readFileSync(path.join(root, 'dpi-r18.1/ABRA-ESTA-PREVIA.html'), 'utf8');
  assert.match(original, /function challenges\(\)/);
  assert.match(original, /miniLightning\(\)/);
  assert.match(original, /miniWordSearch\(\)/);
});
