const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8');
function fixture(){
 const context={window:{},URL,Map,Set,Math};
 vm.createContext(context);
 for(const p of ['dados/banco-dpi-adicional.js','voz-e-mascotes/dpi-bank-extension.js','voz-e-mascotes/dpi-round-engine.js'])vm.runInContext(fs.readFileSync('dpi-r18.1/'+p,'utf8'),context);
 context.BANK=context.window.DPIBankExtension.merge(JSON.parse(html.match(/const DPI_BANCO_BASE=(\[[^\n]+\]);/)[1]),context.window.DPI_QUESTOES_ADICIONAIS).bank;
 let lastShell='',tick;
 const elements=new Map();
 Object.assign(context,{document:{getElementById:id=>{if(!elements.has(id))elements.set(id,{style:{},parentElement:{setAttribute(){}}});return elements.get(id)},querySelectorAll:()=>[]},clearInterval(){},clearTimeout(){},setInterval:fn=>{tick=fn;return 1},shell:(title,body)=>{lastShell=body},patientStage:()=>'',vitalHeartIcon:()=>'',vitalGradient:()=>'',wordEscape:s=>String(s||''),livelyFx(){},dpiConfirmAnswer:async()=>true});
 vm.runInContext(html.slice(html.indexOf('const CASE_TRACKS='),html.indexOf('\nfunction achievements()')),context);
 return {c:context,run:s=>vm.runInContext(s,context),body:()=>lastShell,tick:()=>tick()};
}
for(const track of ['cranio','pelve','membro','respiratorio','reprodutivo','misto'])test('Plantão '+track+' reaches decision 12 with distinct answers and one submission per decision',async()=>{
 const f=fixture();f.run(`caseStart('${track}')`);
 const deck=f.c.window._caseDeck;
 assert.equal(deck.length,12);
 assert.equal(new Set(deck.map(q=>q.resposta_correta_extenso)).size,12);
 for(let i=0;i<12;i++){
  assert.match(f.body(),new RegExp('DECISÃO '+(i+1)+' '));
  assert.equal(f.c.window._caseTime,120);
  await f.run('caseStep(window._caseCorrectIndex)');
  assert.equal(f.c.window._caseIndex,i+1);
  await f.run('caseStep(window._caseCorrectIndex)');assert.equal(f.c.window._caseIndex,i+1);
  f.run('caseRender()');
 }
 assert.match(f.body(),/Você concluiu as 12 decisões/);
 assert.equal(f.c.window._caseVitality,100);
});
test('Plantão timeout submits once and zero vitality ends the simulation',()=>{
 const f=fixture();f.run("caseStart('misto')");
 for(let decision=0;decision<3;decision++){
  for(let i=0;i<120;i++)f.tick();
  assert.equal(f.c.window._caseIndex,decision+1);
  f.tick();assert.equal(f.c.window._caseIndex,decision+1);
  f.run('caseRender()');
 }
 assert.equal(f.c.window._caseVitality,0);
 assert.match(f.body(),/Desfecho de óbito simulado/);
});
test('Plantão correctness follows displayed answer text after option reordering',()=>{
 const f=fixture();const q=f.c.BANK[0];
 f.c.q=q;f.c.opts=[q.alternativa_d,q.alternativa_c,q.alternativa_b,q.alternativa_a];
 const i=f.run('caseCorrectIndex(q,opts)');assert.equal(f.c.opts[i],q.resposta_correta_extenso);
});

test('short thematic rounds report their actual completed decision count',async()=>{
 for(const [track,count] of [['cranio',4],['pelve',9]]){
  const f=fixture();f.run(`BANK=BANK.filter(q=>CASE_TRACKS['${track}'].match.test(caseNormalize(q.tema+' '+q.subtema)));caseStart('${track}')`);
  for(let i=0;i<count;i++){await f.run('caseStep(window._caseCorrectIndex)');f.run('caseRender()');}
  assert.match(f.body(),new RegExp('Você concluiu as '+count+' decisões'));
  assert.doesNotMatch(f.body(),/Você concluiu as 12 decisões/);
 }
});

for(const track of ['cranio','pelve'])test('Plantão '+track+' keeps every distinct thematic answer and fills only with shared fundamentals',()=>{
 const f=fixture();
 const primary=f.run(`BANK.filter(q=>CASE_TRACKS['${track}'].match.test(caseNormalize(q.tema+' '+q.subtema)))`);
 const answers=new Set(primary.map(q=>f.c.caseNormalize(q.resposta_correta_extenso)));
 const allowed=new Set(['DPI-VET-001','DPI-VET-271','DPI-VET-273','DPI-VET-220','DPI-VET-221','DPI-VET-222','DPI-VET-237','DPI-VET-239']);
 for(let round=0;round<20;round++){
  f.run(`caseStart('${track}')`);const deck=f.c.window._caseDeck;
  assert.equal(deck.length,12);
  const picked=new Set(deck.map(q=>f.c.caseNormalize(q.resposta_correta_extenso)));
  assert.equal(picked.size,12);
  for(const answer of answers)assert.ok(picked.has(answer),'thematic answer must remain');
  for(const q of deck)assert.ok(primary.some(p=>p.id===q.id)||allowed.has(q.id),'unrelated supplement');
 }
});

test('supplementation leaves complete tracks unchanged and does not create an empty theme',()=>{
 const f=fixture();
 for(const track of ['membro','respiratorio','reprodutivo','misto']){
  f.c.track=track;
  const before=f.run("[...new Map(BANK.filter(q=>CASE_TRACKS[track].match.test(caseNormalize(q.tema+' '+q.subtema))).map(q=>[caseNormalize(q.resposta_correta_extenso||q.id),q])).values()].map(q=>q.id)");
  assert.deepEqual(Array.from(f.run('casePoolForTrack(track).map(q=>q.id)')),Array.from(before));
 }
 f.run("BANK=BANK.filter(q=>!CASE_TRACKS.cranio.match.test(caseNormalize(q.tema+' '+q.subtema)))");
 assert.equal(f.run("casePoolForTrack('cranio').length"),0);
});
