const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dpi-r18.1', 'ABRA-ESTA-PREVIA.html'), 'utf8');
const slice = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start) + start.length));

test('capa preserva identidade oficial, mascotes e elimina cartões de jogos antes da entrada', () => {
  const cover = slice('id="home" class="view on dpi-cover"', '<section id="internal"');
  const router = fs.readFileSync(path.join(__dirname, '..', 'dpi-r18.1', 'voz-e-mascotes', 'dpi-launch-router.js'), 'utf8');
  assert.match(router, /const logoUrl = '\/assets\/marca-elx-vet-vetor\.svg'/);
  assert.match(router, /querySelectorAll\('\.dpi-hero-logo,\.headerbrand'\)/);
  assert.match(cover, /dpi-everton/);
  assert.match(cover, /dpi-fernanda/);
  assert.doesNotMatch(cover, /class="dpi-game-card/);
  assert.match(cover, /dpi-v40-pathway/);
  assert.match(html, /function beginDpi\(\)\{afterReg='challenges';if\(!prof\(\)\).*?route\('challenges'\)\}/);
});

test('shell remove a faixa redundante e mantém fala do mascote transitória', () => {
  assert.doesNotMatch(html, /internal\.innerHTML=.*?dpi-play-topbar/);
  assert.match(html, /<div class="dpi-play-speech" hidden>/);
  assert.match(html, /document\.addEventListener\('elx-speech-end'.*?bubble\.hidden=true/s);
  assert.match(html, /body\.dpi-voice-off \.dpi-play-layout\{grid-template-columns:minmax\(0,1fr\)!important\}/);
});

test('uma só caixa de voz no cabeçalho tem toggle e X acessível', () => {
  assert.match(html, /class="elx-conversation-close" aria-label="Fechar janela" title="Fechar janela"/);
  assert.match(html, /data-elx-voice-toggle/);
  assert.match(html, /appendChild\(box\)/);
  assert.doesNotMatch(html, /appendChild\(b\)\}\s*document\.getElementById\('dpi-read-question'\)/);
  assert.match(html, /function placeConversation\(\)\{[^}]*right='8px'/);
});

test('pergunta e alternativas são lidas com fala do aparelho quando a voz do servidor não está ativa', () => {
  assert.match(html, /<p class="question-text"><b>\$\{q\.pergunta\}<\/b><\/p>/);
  assert.match(html, /window\.dpiReadQuestion\?\.\(\)/);
  assert.match(html, /let deviceVoice=read\('dpi-device-voice'\)!=='0'/);
  assert.match(html, /if\(deviceVoice\|\|!neuralStatus\?\.configured\)return sayDevice/);
  assert.match(html, /const options=\[\.\.\.root\.querySelectorAll\('\.option/);
});

test('Pratique apresenta dez modalidades em uma questão demonstrativa, com pular e desistir sem pontuação', () => {
  const practice = slice('function dpiPracticeDemo(){', 'function dpiFeatureDialog(kind){');
  for (const name of ['Quiz diagnóstico', 'Relâmpago', 'Alvo', 'Eliminação', 'Associação', 'Forca', 'Caça-palavras', 'Palavras cruzadas', 'Feche o diagnóstico', 'Plantão DPI']) assert.ok(practice.includes(name), name);
  assert.match(practice, /Pular esta modalidade/);
  assert.match(practice, /Desistir da demonstração/);
  assert.doesNotMatch(practice, /state\.score/);
});

test('Estude e Evolua são informativos e Compartilhe oferece envio ou cópia do link', () => {
  const block = slice('function dpiFeatureDialog(kind){', 'function shareDpi(){');
  assert.match(block, /study:[\s\S]*?actions:\[\]/);
  assert.match(block, /evolve:[\s\S]*?actions:\[\]/);
  const share = slice('function shareDpi(){', 'function startWithGoogle(){');
  assert.match(share, /wa\.me/);
  assert.match(share, /mailto:/);
  assert.match(share, /dpiCopyShareLink/);
  assert.match(share, /navigator\.share/);
});

test('dica genérica do banco é trocada por pista clínica da explicação e caso só aparece ao pedir', () => {
  assert.match(html, /const generic=\/\^\(considere\|releia\|observe\|pense/);
  assert.match(html, /function dpiRequestCase\(\)/);
  assert.match(html, /onclick="dpiRequestCase\(\)">◖ Ouvir caso/);
  assert.match(html, /Caso didático hipotético/);
});
