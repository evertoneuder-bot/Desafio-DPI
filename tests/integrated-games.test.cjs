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

test('the isolated quiz resolves the three bundled question banks and exposes item evidence', () => {
  const quiz = fs.readFileSync(path.join(root, 'avaliacao/questoes.html'), 'utf8');
  const banks = [
    ['dpi-integrado.json', 40],
    ['qual-exame-qual-projecao.json', 50],
    ['telerradiologia-clinica.json', 10],
  ];

  for (const [file, expectedCount] of banks) {
    const jsonPath = path.join(root, 'dados/novos-desafios', file);
    assert.ok(fs.existsSync(jsonPath), `missing bundled bank: ${file}`);
    assert.ok(quiz.includes(`../dados/novos-desafios/${file}`), `quiz path does not resolve to ${file}`);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.equal(data.cases.length, expectedCount, `unexpected count in ${file}`);
    assert.equal(new Set(data.cases.map((item) => item.id)).size, expectedCount, `duplicate IDs in ${file}`);
    for (const item of data.cases) {
      assert.equal(item.alternatives.length, 4, `${file}:${item.id} must have four alternatives`);
      assert.ok(item.alternatives.some((alternative) => alternative.id === item.correct_id), `${file}:${item.id} has no matching answer key`);
      assert.ok(item.references.length > 0, `${file}:${item.id} has no source metadata`);
      assert.notEqual(item.review_status, 'validado', `${file}:${item.id} is not approved for release`);
    }
  }

  assert.match(quiz, /clinical_context/);
  assert.match(quiz, /Fontes e revisão do item/);
  assert.match(quiz, /Todas permanecem preliminares/);
});

test('the image challenge dataset remains blocked until licensed images and review are present', () => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'dados/novos-desafios/desafio-do-olhar.json'), 'utf8'));
  assert.equal(data.cases.length, 50);
  assert.ok(data.cases.every((item) => item.review_status === 'bloqueado_sem_imagem_autorizada'));
  assert.ok(data.cases.every((item) => !Array.isArray(item.images) || item.images.length === 0));
});
