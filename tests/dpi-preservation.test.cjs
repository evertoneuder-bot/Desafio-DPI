const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const vm=require('node:vm');
const html=fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
test('all 300 approved base questions remain byte-for-byte identical to 42f5ae4',()=>{
 const bank=html.match(/const DPI_BANCO_BASE=(\[[^\n]+\]);/)[1];
 assert.equal(JSON.parse(bank).length,300);
 assert.equal(hash(bank),'27538788f2d9480456a2827a80d91be976ef2176faa91470d592b848fedaa302');
});
test('every inline stylesheet remains identical to the recovered candidate baseline',()=>{
 assert.equal(hash([...html.matchAll(/<style\b[^>]*>.*?<\/style>/gis)].map(m=>m[0]).join('\n')),'010bfaba82fbe301a3496267b0eeb2844a22ba145ab8a8feaa5653b94bfdcbbf');
});
test('gameplay, registration, scoring, review, ranking and legacy minigames retain the recovered candidate code',()=>{
 const start=html.indexOf('function enterGame('),end=html.indexOf('</script>',start);
 assert.ok(start>0&&end>start);
 // Authorized exceptions: actual completion count and sparse-track supplementation.
 const originalPool="function casePoolForTrack(trackId){const track=CASE_TRACKS[trackId]||CASE_TRACKS.misto;const pool=BANK.filter(q=>track.match.test(caseNormalize((q.tema||'')+' '+(q.subtema||''))));return [...new Map(pool.map(q=>[caseNormalize(q.resposta_correta_extenso||q.id),q])).values()]}\n";
 const gameplay=html.slice(start,end).replace(/function casePoolForTrack\([\s\S]*?(?=function caseStageForQuestion)/,originalPool).replace("'Você concluiu as '+window._caseDeck.length+' decisões com vitalidade simulada em '","'Você concluiu as 12 decisões com vitalidade simulada em '");
 assert.equal(hash(gameplay),'9e0fbb61004d10060f9e9311d7b0108533b35ef5985a89d8697e71d0800757de');
});
test('all inline executable scripts compile without syntax errors',()=>{
 for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
  if(/type=["']application\//.test(m[1]))continue;
  new vm.Script(m[2],{filename:'inline-'+i+'.js'});
 }
});

test('the executed bank includes all 325 unique questions: 300 base plus 25 additions',()=>{
 const context={window:{},URL};vm.createContext(context);
 for(const relative of ['dados/banco-dpi-adicional.js','voz-e-mascotes/dpi-bank-extension.js']){
  const marker='<script src="./'+relative+'"></script>';
  assert.ok(html.indexOf(marker)>0&&html.indexOf(marker)<html.indexOf('const DPI_BANCO_BASE='),'extension must load before bank assembly');
  vm.runInContext(fs.readFileSync('dpi-r18.1/'+relative,'utf8'),context);
 }
 const start=html.indexOf('const DPI_BANCO_BASE='),end=html.indexOf('\nif(DPI_BANCO_EXPANDIDO.rejected',start);
 assert.ok(end>start);
 vm.runInContext(html.slice(start,end),context);
 assert.deepEqual(JSON.parse(JSON.stringify(context.window.DPI_BANK_STATS)),{base:300,adicionadas:25,rejeitadas:0,duplicadas:0,total:325});
 assert.equal(vm.runInContext('new Set(BANK.map(q=>q.id)).size',context),325);
 assert.equal(vm.runInContext('BANK.filter(q=>q.ativo!==false).length',context),325);
});
