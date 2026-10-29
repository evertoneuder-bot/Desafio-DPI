const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = (dir) => fs.readdirSync(path.join(root, dir), {withFileTypes:true}).flatMap(x => x.isDirectory() ? files(path.posix.join(dir,x.name)) : [path.posix.join(dir,x.name)]);

test('entrega DPI é individual e não contém rotas ou logos de outras áreas', () => {
  for (const omitted of ['rx-vet.html','direito-audiencia.html','assets/portal.css','assets/vet.css']) assert.equal(fs.existsSync(path.join(root,omitted)),false,omitted);
  assert.ok(fs.existsSync(path.join(root,'index.html')));
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/max-width: 600px/);
  const app = fs.readFileSync(path.join(root,'dpi-home.html'),'utf8');
  assert.match(app,/EL-X VET/);
  assert.match(app,/DESAFIO DPI/);
  assert.doesNotMatch(app,/HSL|HSR|Helder Soares|direito-audiencia/i);
  const runtime = fs.readFileSync(path.join(root,'dpi-r18.1/ABRA-ESTA-PREVIA.html'),'utf8');
  assert.doesNotMatch(runtime,/Helder Soares Advocacia/);
  const hosting = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
  assert.equal((hosting.rewrites || []).some(route => route.source === '/' && route.destination === '/dpi-r18.1/ABRA-ESTA-PREVIA.html'),false);
  assert.match(app,/data-launch="start"/);
});

test('a biblioteca entregue é clínica veterinária e preserva o banco editorial DPI', () => {
  const lib = path.join(root,'dpi-r18.1/biblioteca/biblioteca-veterinaria');
  assert.ok(fs.statSync(path.join(lib,'CATALOGO-BIBLIOTECA-DPI.md')).size > 0);
  assert.ok(fs.statSync(path.join(lib,'bibliografia-dpi.json')).size > 0);
  assert.ok(fs.statSync(path.join(lib,'Manual_Zoonoses_MS.pdf')).size > 0);
  const bank = JSON.parse(fs.readFileSync(path.join(root,'dpi-r18.1/dados/banco-dpi-300.json'),'utf8'));
  assert.equal(bank.length,300);
});

test('imagens externas do jogo apontam a arquivos presentes e o rig só carrega mascotes DPI', () => {
  const runtime = fs.readFileSync(path.join(root,'dpi-r18.1/ABRA-ESTA-PREVIA.html'),'utf8');
  const refs = new Set([...runtime.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)|url\(["']?(\/assets\/[^)"']+)/g)].map(m => m[1] || m[2]));
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root,ref.slice(1))), `asset sem arquivo: ${ref}`);
  const rig = fs.readFileSync(path.join(root,'dpi-r18.1/voz-e-mascotes/elx-rig.js'),'utf8');
  assert.match(rig,/const configs=\{"health"/);
  assert.doesNotMatch(rig,/"law"\s*:\s*\{|"sports"\s*:\s*\{|"field"\s*:\s*\{/);
});
