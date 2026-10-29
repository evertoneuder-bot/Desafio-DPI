const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('modo de jogo mobile mantém cabeçalho e rodapé e rola conteúdo longo dentro da área central', () => {
  const router = fs.readFileSync(path.resolve(__dirname, '../dpi-r18.1/voz-e-mascotes/dpi-launch-router.js'), 'utf8');
  assert.match(router, /dpi-player-route/);
  assert.match(router, /document\.body\?\.classList\.add\('dpi-player-route'\)/);
  assert.match(router, /body\.dpi-player-route \.app>header \.utility\{display:none/);
  assert.match(router, /body\.dpi-player-route \.app>footer\{position:relative!important;inset:auto!important;z-index:30!important;display:block!important/);
  assert.match(router, /body\.dpi-player-route \.app>main\{[^}]*overflow-y:auto!important/);
  assert.match(router, /body\.dpi-player-route #internal\{[^}]*overflow:visible!important/);
  assert.match(router, /dpi-play-coach[^}]*height:68px/);
  assert.match(router, /body:not\(\.elx-portal-on\) \.dpi-play-coach #elx-character-stage\.is-dpi-coach,body:not\(\.elx-portal-on\) \.dpi-wordgame-coach #elx-character-stage\.is-dpi-coach\{position:relative!important;inset:auto!important;width:58px!important;height:58px!important/);
  assert.match(router, /\.dpi-play-content \.dpi-game-panel,\.dpi-wordgame-main \.dpi-game-panel\{[^}]*overflow:visible!important/);
  assert.match(router, /body\.dpi-voice-off \.dpi-play-content,body\.dpi-voice-off \.dpi-wordgame-main\{grid-row:1!important/);
});
