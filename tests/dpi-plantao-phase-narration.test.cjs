'use strict';
// Regression guard for the approved twelve-phase Plantão narration contract.
// This is a static check; it does not assert end-to-end phase progression.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'dpi-r18.1', 'voz-e-mascotes', 'dpi-launch-router.js'), 'utf8');
const phases = [
  "AVALIAÇÃO INICIAL",
  "HISTÓRICO E TRIAGEM",
  "ESTABILIZAÇÃO E SEGURANÇA",
  "PERGUNTA CLÍNICA",
  "PLANO DE IMAGEM",
  "MODALIDADE E PROJEÇÕES",
  "AQUISIÇÃO E POSICIONAMENTO",
  "QUALIDADE TÉCNICA",
  "INTERPRETAÇÃO",
  "INTEGRAÇÃO DOS ACHADOS",
  "REAVALIAÇÃO E PRÓXIMA CONDUTA",
  "REGISTRO E COMUNICAÇÃO"
];

test('Plantão has exactly twelve ordered, distinct narration phase guides', () => {
  const block = source.match(/const phaseGuidance = \{([\s\S]*?)\n    \};/);
  assert.ok(block, 'phaseGuidance definition must exist');
  const actual = [...block[1].matchAll(/^\s*'([^']+)':/gm)].map(match => match[1]);
  assert.deepEqual(actual, phases);
});

test('Plantão narration is gated by known phase and rendered case question', () => {
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(phaseGuidance, phase\)/);
  assert.ok(source.includes("question.matches?.('.dpi-case-question') ? caseNarration(internal, question) : ''"));
  assert.ok(source.includes("'Etapa do plantão: ' + phase + '.'"));
});
