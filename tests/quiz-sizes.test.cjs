const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html', 'utf8');
const start = html.indexOf('function startQuiz(n)');
const end = html.indexOf('function renderQ()', start);
assert.ok(start >= 0 && end > start, 'the quiz-size selection must remain discoverable');
const source = html.slice(start, end);

test('10, 25 e 50 iniciam exatamente a quantidade escolhida quando há questões suficientes', () => {
  for (const size of [10, 25, 50]) {
    const context = { state: {}, BANK: Array.from({ length: 325 }, (_, id) => ({ id })), renderQ() {} };
    vm.runInNewContext(source + `startQuiz(${size})`, context);
    assert.equal(context.state.n, size);
    assert.equal(context.state.qs.length, size);
  }
});

test('o menu diferencia visualmente as três durações de quiz', () => {
  const menuStart = html.indexOf('function quizMenu()');
  const menuEnd = html.indexOf('function startQuiz(n)', menuStart);
  const menu = html.slice(menuStart, menuEnd);
  for (const [size, label] of [[10, 'Questões rápidas'], [25, 'Desafio intermediário'], [50, 'Missão completa']]) {
    assert.match(menu, new RegExp(`data-quiz-size="${size}"`));
    assert.ok(menu.includes(label));
    assert.ok(menu.includes(`startQuiz(${size})`));
  }
});
