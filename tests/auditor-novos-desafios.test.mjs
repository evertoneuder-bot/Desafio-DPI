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
 const {result,rows}=run();
 assert.equal(rows.length,4);
 for(const row of rows){
  assert.ok(Number.isInteger(row.total));
  assert.ok(Number.isInteger(row.eligible));
  assert.ok(row.eligible<=row.total);
  assert.ok(row.missingEvidence>=0);
  assert.ok(row.eligible>=0);
  assert.ok(row.unverifiedValidated<=row.declaredValidated);
 }
 const structuralFailure=rows.some(row=>row.invalid>0||row.missingRationales>0||row.duplicateAcrossBanks>0||row.duplicateQuestions>0||row.invalidImages>0||row.unverifiedValidated>0||row.lengthBiasReviewRequired);
 assert.equal(result.status===0,!structuralFailure,'status do processo deve refletir falhas estruturais mesmo no modo normal');
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

test('filas editoriais identificam exatamente os registros problemáticos',()=>{
 const {rows}=run();
 for(const row of rows){
  const q=row.editorialQueue;
  assert.ok(q&&typeof q==='object');
  for(const [field,count] of [
   ['duplicateIdIds',row.duplicateAcrossBanks],
   ['duplicateQuestionIds',row.duplicateQuestions],
   ['missingRationaleIds',row.missingRationales],
   ['longestCorrectIds',row.correctIsUniquelyLongest],
   ['missingEvidenceIds',row.missingEvidence],
   ['invalidImageIds',row.invalidImages]
  ]){
   assert.ok(Array.isArray(q[field]),field);
   assert.equal(q[field].length,count,`${row.file}: ${field}`);
   assert.ok(q[field].every(id=>typeof id==='string'&&id.trim()),field);
   assert.equal(new Set(q[field]).size,q[field].length,`${row.file}: IDs repetidos em ${field}`);
  }
  const expected=row.total>=10&&row.percentUniquelyLongest>=50;
  assert.equal(row.lengthBiasReviewRequired,expected,row.file);
 }
});
