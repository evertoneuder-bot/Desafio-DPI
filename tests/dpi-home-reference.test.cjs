const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('a raiz mantém o carregamento web e direciona automaticamente apenas telefones à capa mobile', () => {
  const html = read('index.html');
  assert.match(html, /matchMedia\('\(max-width: 600px\)'\)/);
  const hosting = JSON.parse(read('vercel.json'));
  assert.equal((hosting.rewrites || []).some(route => route.source === '/' && route.destination === '/dpi-r18.1/ABRA-ESTA-PREVIA.html'), false);
  assert.match(html, /location\.replace\('\/dpi-home\.html'\)/);
  for (const part of ['part01.txt','part02.txt','part08.txt']) assert.ok(html.includes(part));
  assert.ok(fs.existsSync(path.join(root, 'dpi-home.html')));
});

test('a capa aprovada mantém logo original e mascotes, usa fundo radiográfico real e não antecipa jogos', () => {
  const html = read('dpi-home.html');
  const css = read('assets/dpi-home.css');
  assert.equal((html.match(/marca-elx-oficial-escura\.png/g) || []).length, 2);
  assert.match(html, /class="dpi-hero-mascot everton"/);
  assert.match(html, /class="dpi-hero-mascot fernanda"/);
  assert.match(css, /url\("\.\/clinic-background\.webp"\)/);
  assert.ok(fs.statSync(path.join(root,'assets/clinic-background.webp')).size > 100000);
  assert.doesNotMatch(html, /class="dpi-action (?:quiz|challenges|plantao|achievements)"/);
  assert.match(html, /data-launch="start"/);
  assert.match(html, /COMEÇAR/);
});

test('Estude, Pratique, Evolua e Compartilhe são controles clicáveis; Compartilhe oferece só ações de envio', () => {
  const html = read('dpi-home.html');
  for (const feature of ['study','practice','evolve','share']) assert.match(html, new RegExp(`<button[^>]*data-feature="${feature}"`));
  const js = read('assets/dpi-home.js');
  for (const target of ["navigate('feature', feature)","setItem('dpi-device-voice', '1')",'data-share-whatsapp','data-share-email','data-share-copy','navigator.share']) assert.ok(js.includes(target));
  assert.match(js, /new URL\('\/', window\.location\.href\)/);
});

test('o roteador pede cadastro no início, segue ao menu do jogo e devolve recursos informativos à capa', () => {
  const router = read('dpi-r18.1/voz-e-mascotes/dpi-launch-router.js');
  assert.match(router, /start:\s*'startFromPresentation'/);
  assert.ok(router.includes("root.profile();\n    if (root.document.querySelector('#register.on')) root.afterReg = 'home';"));
  assert.match(router, /feature:\s*'openPresentationFeature'/);
  assert.match(router, /root\.location\.assign\('\.\.\/index\.html'\)/);
  assert.match(router, /root\.dpiFeatureDialog\(presentationFeature\)/);
});

test('o clique de Começar abre a rota de identificação, não começa direto um desafio', () => {
  const source = read('assets/dpi-home.js');
  const handlers = new Map();
  const startButton = { dataset: { launch: 'start' }, addEventListener: (event, handler) => handlers.set('start', handler) };
  const assigned = [];
  const context = { document: { querySelectorAll: selector => selector === '[data-launch]' ? [startButton] : [], getElementById: () => null }, window: { location: { href: 'https://preview.example/dpi-home.html', assign: href => assigned.push(href) } }, URL, navigator: {} };
  vm.runInNewContext(source, context);
  handlers.get('start')();
  const route = new URL(assigned[0]);
  assert.equal(route.searchParams.get('mode'), 'start');
  assert.equal(route.searchParams.get('return'), 'dpi');
  assert.equal(route.searchParams.has('feature'), false);
});


test('a rota start configura a identificação e a rota de recurso abre a função apropriada', () => {
  const source = read('dpi-r18.1/voz-e-mascotes/dpi-launch-router.js');
  function contextFor(search) {
    const classes = new Set();
    const assigned = [];
    let registrationOpen = false;
    let homeOpened = false;
    let featureOpened = '';
    const root = {
      URLSearchParams,
      location: { search, assign: url => assigned.push(url) },
      document: {
        readyState: 'complete',
        documentElement: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } },
        querySelector: selector => selector === '#register.on' && registrationOpen ? {} : null,
        getElementById: () => null
      },
      console,
      setTimeout: callback => callback(),
      addEventListener() {},
      dispatchEvent() {},
      CustomEvent: function(type, options) { this.type = type; this.detail = options?.detail; },
      profile() { registrationOpen = true; },
      prof() { return null; },
      showHome() { homeOpened = true; },
      dpiFeatureDialog(kind) { featureOpened = kind; },
      dpiCloseFeatureDialog() {},
    };
    root.window = root;
    vm.runInNewContext(source, root);
    return { root, classes, assigned, get homeOpened() { return homeOpened; }, get featureOpened() { return featureOpened; } };
  }
  const start = contextFor('?mode=start&return=dpi');
  assert.equal(start.root.afterReg, 'home');
  assert.equal(start.homeOpened, false);
  assert.equal(start.classes.has('dpi-route-pending'), false);
  const feature = contextFor('?mode=feature&feature=evolve&return=dpi');
  assert.equal(feature.featureOpened, 'evolve');
  feature.root.dpiCloseFeatureDialog();
  assert.deepEqual(feature.assigned, ['../index.html']);
});
