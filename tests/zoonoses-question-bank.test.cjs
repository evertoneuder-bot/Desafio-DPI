const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const questions = JSON.parse(fs.readFileSync(
  path.join(root, 'dpi-r18.1/biblioteca/biblioteca-veterinaria/perguntas.json'),
  'utf8',
));
const byId = new Map(questions.map((question) => [question.id, question]));

test('zoonoses question keys agree with their explanations and verified manual sections', () => {
  const expected = new Map([
    ['medicina_veterinaria_02', ['D', /p\. 8–10/]],
    ['medicina_veterinaria_04', ['B', /p\. 27–29/]],
    ['medicina_veterinaria_06', ['D', /p\. 10–11/]],
    ['medicina_veterinaria_08', ['B', /p\. 8–10/]],
    ['medicina_veterinaria_10', ['D', /p\. 11/]],
  ]);

  for (const [id, [answer, pagePattern]] of expected) {
    const question = byId.get(id);
    assert.ok(question, `missing ${id}`);
    assert.equal(question.resposta_correta, answer, `${id} answer key`);
    assert.match(question.referencia_pagina, pagePattern, `${id} source locator`);
    assert.ok(question.opcoes[answer], `${id} has no matching answer text`);
  }

  assert.match(byId.get('medicina_veterinaria_02').opcoes.D, /Identificar riscos/);
  assert.match(byId.get('medicina_veterinaria_04').explicacao, /alimentação.*hidratação.*higiene.*biossegurança/i);
  assert.match(byId.get('medicina_veterinaria_06').opcoes.D, /Seguir fluxo de vigilância/);
  assert.match(byId.get('medicina_veterinaria_08').opcoes.B, /direcionar medidas/);
  assert.match(byId.get('medicina_veterinaria_10').opcoes.D, /Normas técnicas/);
});
