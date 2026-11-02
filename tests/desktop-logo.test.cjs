const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html', 'utf8');
const styleStart = html.indexOf('<style id="dpi-header-lockup-final">');
const styleEnd = html.indexOf('</style>', styleStart);
assert.ok(styleStart >= 0 && styleEnd > styleStart, 'desktop logo rules must remain discoverable');
const css = html.slice(styleStart, styleEnd);

test('a marca completa tem largura intrínseca suficiente para não recortar o SVG no desktop', () => {
  assert.match(css, /header \.brand-copy\{[^}]*width:\s*215px/);
  assert.match(css, /header \.brand-name\{[^}]*width:\s*100%/);
  assert.match(css, /header \.brand-descriptor\{[^}]*width:\s*100%/);
});

test('o mobile limita a marca sem esticar o arquivo original', () => {
  assert.match(css, /@media\s*\(max-width:390px\)[\s\S]*?header \.brand-copy\{[^}]*width:\s*min\(194px,/);
  assert.match(css, /header \.brand-symbol\{[^}]*background-size:\s*122px auto/);
});
