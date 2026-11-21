// Auditoria estrutural e de elegibilidade; não substitui conferência científica dos PDFs.
import {readFileSync, existsSync} from 'node:fs';
const files=['dpi-integrado','qual-exame-qual-projecao','telerradiologia-clinica','desafio-do-olhar'];
let failures=0;
// Modo de homologação: rascunhos podem ser estruturalmente válidos, mas não aprovados.
const requireEligible=process.argv.includes('--require-eligible');
const globalIdCounts=new Map();
const globalQuestionCounts=new Map();
const normalizeQuestion=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const normalizeId=x=>String(x||'').trim().toLowerCase();
const normalizedAlternative=x=>normalizeQuestion(x?.text);
const reviewed=c=>c.review_status==='validado'&&c.scientific_review_1?.status==='aprovado'&&c.scientific_review_2?.status==='aprovado'&&c.editorial_review?.status==='aprovado';
const sources=c=>Array.isArray(c.references)&&c.references.length>0&&c.references.every(r=>r?.verified===true&&nonempty(r.title)&&nonempty(r.locator));
// Evidência rastreável por item: metadados "verified" e flags de revisão não bastam.
// O relatório externo ainda precisa ser conferido manualmente contra os PDFs.
const validReviewDate=value=>{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const [year,month,day]=value.split('-').map(Number);
 const date=new Date(Date.UTC(year,month-1,day));
 return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
};
const evidence=c=>{
 const e=c.scientific_evidence;
 return Boolean(e&&nonempty(e.drive_file_id)&&/^[a-f0-9]{64}$/i.test(String(e.sha256||''))&&
 Number.isInteger(e.pdf_page)&&e.pdf_page>0&&nonempty(e.support_summary)&&
 validReviewDate(e.first_pass?.date)&&e.first_pass?.status==='aprovado'&&
 validReviewDate(e.second_pass?.date)&&e.second_pass?.status==='aprovado'&&
 e.second_pass.date>=e.first_pass.date&&
 nonempty(e.audit_report_path)&&/^docs\/novos-desafios\/[a-zA-Z0-9_./-]+\.md$/.test(e.audit_report_path)&&
 !e.audit_report_path.split('/').includes('..')&&
 existsSync(new URL('../'+e.audit_report_path,import.meta.url)));
};
// Precompute global occurrences so duplicates invalidate every occurrence,
// regardless of which bank happens to be processed first.
for(const file of files){
 const data=JSON.parse(readFileSync(new URL('../dados/novos-desafios/'+file+'.json',import.meta.url),'utf8'));
 for(const c of data.cases||[]){
  if(nonempty(c.id)){const id=normalizeId(c.id);globalIdCounts.set(id,(globalIdCounts.get(id)||0)+1);}
  const key=normalizeQuestion(c.question);
  if(key)globalQuestionCounts.set(key,(globalQuestionCounts.get(key)||0)+1);
 }
}
const imageValid=i=>nonempty(i?.path)&&/^\.\.\/assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(i.path)&&!i.path.slice('../assets/'.length).split('/').includes('..')&&nonempty(i.source)&&nonempty(i.license_or_permission)&&i.anonymized===true&&nonempty(i.reference_diagnosis)&&existsSync(new URL('../expansao-dpi/'+i.path,import.meta.url));
for(const file of files){
 const data=JSON.parse(readFileSync(new URL('../dados/novos-desafios/'+file+'.json',import.meta.url),'utf8'));
 const cases=data.cases||[],ids=new Set();
 let longest=0,tiedLongest=0,duplicateAlternatives=0,invalid=0,declaredValidated=0,eligible=0,withImages=0,unverifiedValidated=0,missingRationales=0,duplicateAcrossBanks=0,duplicateQuestions=0,invalidImages=0,missingEvidence=0;
 for(const c of cases){
  const a=c.alternatives||[];
  const valid=nonempty(c.id)&&!ids.has(normalizeId(c.id))&&nonempty(c.question)&&a.length===4&&a.every(x=>['A','B','C','D'].includes(x?.id)&&nonempty(x?.text))&&new Set(a.map(x=>x.id)).size===4&&a.some(x=>x.id===c.correct_id)&&Array.isArray(c.references)&&c.references.length>0;
  const alternativeTexts=a.map(normalizedAlternative);
  const alternativesDistinct=a.length===4&&alternativeTexts.every(Boolean)&&new Set(alternativeTexts).size===4;
  if(!alternativesDistinct)duplicateAlternatives++;
  if(!valid||!alternativesDistinct)invalid++;
  if(a.some(x=>!nonempty(x?.rationale)))missingRationales++;
  const repeatedId=nonempty(c.id)&&(globalIdCounts.get(normalizeId(c.id))||0)>1;
  if(repeatedId)duplicateAcrossBanks++;
  const normalized=normalizeQuestion(c.question);
  const repeatedQuestion=Boolean(normalized&&(globalQuestionCounts.get(normalized)||0)>1);
  if(repeatedQuestion)duplicateQuestions++;
  ids.add(normalizeId(c.id));
  const visual=file==='desafio-do-olhar';
  const uniqueAcrossBanks=!repeatedId&&!repeatedQuestion;
  const imageOK=!visual||(Array.isArray(c.images)&&c.images.length>=1&&c.images.every(imageValid));
  if(!imageOK)invalidImages++;
  if(c.review_status==='validado')declaredValidated++;
  if(!evidence(c))missingEvidence++;
  if(Array.isArray(c.images)&&c.images.length)withImages++;
  if(valid&&alternativesDistinct&&uniqueAcrossBanks&&reviewed(c)&&sources(c)&&evidence(c)&&imageOK&&a.every(x=>nonempty(x.rationale)))eligible++;
  if(c.review_status==='validado'&&!(valid&&alternativesDistinct&&uniqueAcrossBanks&&reviewed(c)&&sources(c)&&evidence(c)&&imageOK&&a.every(x=>nonempty(x.rationale))))unverifiedValidated++;
  if(a.length===4){
   const lengths=a.map(x=>String(x.text||'').trim().length);
   const max=Math.max(...lengths);
   const winners=lengths.filter(n=>n===max).length;
   const correctLength=String(a.find(x=>x.id===c.correct_id)?.text||'').trim().length;
   if(correctLength===max){if(winners===1)longest++;else tiedLongest++;}
  }
 }
 console.log(JSON.stringify({file,total:cases.length,invalid,duplicateAlternatives,missingRationales,duplicateAcrossBanks,duplicateQuestions,invalidImages,missingEvidence,declaredValidated,eligible,unverifiedValidated,withImages,correctIsUniquelyLongest:longest,correctTiedForLongest:tiedLongest,percentUniquelyLongest:cases.length?Math.round(longest*100/cases.length):0}));
 if(invalid||missingRationales||duplicateAcrossBanks||duplicateQuestions||invalidImages||unverifiedValidated||(requireEligible&&(cases.length===0||eligible!==cases.length)))failures++;
}
if(requireEligible)console.log(JSON.stringify({mode:'homologacao',result:failures?'reprovado':'aprovado',note:'Elegibilidade estrutural não substitui conferência humana das páginas dos PDFs.'}));
if(failures)process.exitCode=1;
