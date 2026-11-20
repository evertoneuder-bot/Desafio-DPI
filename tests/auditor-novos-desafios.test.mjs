// Regressão da barreira de homologação: não confundir rascunhos com itens aprovados.
// Executar: node --test tests/auditor-novos-desafios.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const auditor=fileURLToPath(new URL('../scripts/auditar-novos-desafios.mjs',import.meta.url));
function run(args=[]){
 const result=spawnSync(process.execPath,[auditor,...args],{cwd:root,encoding:'utf8'});
 assert.equal(result.error,undefined,result.error?.message);
 const rows=result.stdout.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
 return {result,rows};
}
test('modo normal informa elegibilidade sem afirmar homologação',()=>{
 const {rows}=run();
 assert.equal(rows.length,4);
 for(const row of rows){
  assert.ok(Number.isInteger(row.total));
  assert.ok(Number.isInteger(row.eligible));
  assert.ok(row.eligible<=row.total);
  assert.ok(row.missingEvidence>=0);
 }
});
test('modo rigoroso reprova enquanto existirem itens sem elegibilidade',()=>{
 const {result,rows}=run(['--require-eligible']);
 assert.equal(rows.length,5);
 const missing=rows.slice(0,4).some(row=>
  row.total===0||row.eligible!==row.total||row.invalid>0||
  row.missingRationales>0||row.duplicateAcrossBanks>0||
  row.duplicateQuestions>0||row.invalidImages>0||row.unverifiedValidated>0);
 assert.equal(rows[4].mode,'homologacao');
 if(missing){
  assert.notEqual(result.status,0);
  assert.equal(rows[4].result,'reprovado');
 }else{
  assert.equal(result.status,0);
  assert.equal(rows[4].result,'aprovado');
 }
});
