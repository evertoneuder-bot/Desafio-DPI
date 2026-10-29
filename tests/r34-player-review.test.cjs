const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dpi-r18.1/ABRA-ESTA-PREVIA.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dpi-r18.1/voz-e-mascotes/dpi-rounds.css'), 'utf8');
const rounds = fs.readFileSync(path.join(root, 'dpi-r18.1/voz-e-mascotes/dpi-game-rounds.js'), 'utf8');

test('correct and incorrect answers open a dismissible dialog with a close control', () => {
  const router = fs.readFileSync(path.join(root, 'dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');
  assert.match(rounds, /class="dpi-round-result \' \+ \(correct \? \'is-correct\' : \'is-wrong\'\)/);
  assert.match(router, /\.dpi-answer-dialog/);
  assert.match(router, /aria-label','Fechar resultado e continuar'/);
  assert.match(router, /node\.querySelector\('button\[onclick\*="nextQuestion"\]/);
  assert.match(css, /\.dpi-round-result\.is-wrong\{[^}]*background:[^}]*!important/s);
});

test('application header displays the original vector logo at natural proportions', () => {
  const router = fs.readFileSync(path.join(root, 'dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');
  assert.match(router, /const logoUrl = '\/assets\/marca-elx-vet-vetor\.svg'/);
  assert.match(router, /\.app>header \.headerbrand\{[^}]*object-fit:contain!important/s);
  assert.match(router, /max-height:56px!important/);
  assert.match(router, /height:64px!important/);
});

test('Quiz incorrect explanation uses explicit white high-contrast text', () => {
  assert.match(html, /#internal \.feedback\.no\{[^}]*background:[^}]*#681b30/s);
  assert.match(html, /#internal \.feedback\.no \*\{color:#fff!important;opacity:1!important/s);
  assert.match(html, /#internal \.feedback\.no \.stamp\{background:#fff!important;color:#8d263c!important/s);
});

test('Dica dialog has visible responsive overlay and readable content styles', () => {
  assert.match(html, /function dpiShowHintDialog\(text\)/);
  assert.match(html, /document\.body\.appendChild\(overlay\)/);
  assert.match(html, /\.dpi-hint-overlay[^}]*display:grid!important/s);
  assert.match(html, /\.dpi-hint-dialog p[^}]*line-height:1\.65!important/s);
});

test('Plantão siren moves outside the animated game shell and fits viewport height', () => {
  assert.match(html, /document\.body\?\.appendChild\)document\.body\.appendChild\(siren\)/);
  assert.match(html, /siren\?\.remove\?\.\(\);caseView\(\)/);
  assert.match(css, /\.dpi-siren-interstitial-beacon\{width:min\(34vw,280px,34dvh\)!important/);
  assert.match(html, /@media\(max-height:480px\)\{\.dpi-siren-interstitial/);
});

test('DPI bibliography uses link lists and reversible local archive controls', () => {
  assert.match(html, /<ul class="dpi-library-linklist">\$\{articles\}<\/ul>/);
  assert.match(html, /<ul class="dpi-library-linklist">\$\{rules\}<\/ul>/);
  assert.match(html, /DPI_LIBRARY_ARCHIVE_KEY='elx-dpi-library-inactive-v1'/);
  assert.ok(html.includes("toggle.textContent='Materiais inativos ('+items.length+')'"));
  assert.match(html, /BAIXAR LISTA DE INATIVOS/);
  assert.match(html, /RESTAURAR/);
  assert.match(html, /Ocultar este material nesta instalação/);
});
