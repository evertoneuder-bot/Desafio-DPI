// Auditoria estrutural e de elegibilidade; não substitui conferência científica dos PDFs.
import {readFileSync} from 'node:fs';
const files=['dpi-integrado','qual-exame-qual-projecao','telerradiologia-clinica','desafio-do-olhar'];
let failures=0;
const globalIds=new Set();
const globalQuestions=new Map();
const normalizeQuestion=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const normalizedAlternative=x=>normalizeQuestion(x?.text);
const reviewed=c=>c.review_status==='validado'&&c.scientific_review_1?.status==='aprovado'&&c.scientific_review_2?.status==='aprovado'&&c.editorial_review?.status==='aprovado';
const sources=c=>Array.isArray(c.references)&&c.references.length>0&&c.references.every(r=>r?.verified===true&&nonempty(r.title)&&nonempty(r.locator));
const imageValid=i=>nonempty(i?.path)&&/^\.\.\/assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(i.path)&&!i.path.slice('../assets/'.length).split('/').includes('..')&&nonempty(i.source)&&nonempty(i.license_or_permission)&&i.anonymized===true&&nonempty(i.reference_diagnosis);
for(const file of files){
 const data=JSON.parse(readFileSync(new URL('../dados/novos-desafios/'+file+'.json',import.meta.url),'utf8'));
 const cases=data.cases||[],ids=new Set();
 let longest=0,tiedLongest=0,duplicateAlternatives=0,invalid=0,declaredValidated=0,eligible=0,withImages=0,unverifiedValidated=0,missingRationales=0,duplicateAcrossBanks=0,duplicateQuestions=0;
 for(const c of cases){
  const a=c.alternatives||[];
  const valid=nonempty(c.id)&&!ids.has(c.id)&&nonempty(c.question)&&a.length===4&&a.every(x=>['A','B','C','D'].includes(x?.id)&&nonempty(x?.text))&&new Set(a.map(x=>x.id)).size===4&&a.some(x=>x.id===c.correct_id)&&Array.isArray(c.references)&&c.references.length>0;
  const alternativeTexts=a.map(normalizedAlternative);
  const alternativesDistinct=a.length===4&&alternativeTexts.every(Boolean)&&new Set(alternativeTexts).size===4;
  if(!alternativesDistinct)duplicateAlternatives++;
  if(!valid||!alternativesDistinct)invalid++;
  if(a.some(x=>!nonempty(x?.rationale)))missingRationales++;
  const repeatedId=globalIds.has(c.id);
  if(repeatedId)duplicateAcrossBanks++;
  globalIds.add(c.id);
  const normalized=normalizeQuestion(c.question);
  const repeatedQuestion=Boolean(normalized&&globalQuestions.has(normalized));
  if(repeatedQuestion)duplicateQuestions++;
  else if(normalized)globalQuestions.set(normalized,c.id);
  ids.add(c.id);
  const visual=file==='desafio-do-olhar';
  const uniqueAcrossBanks=!repeatedId&&!repeatedQuestion;
  const imageOK=!visual||(Array.isArray(c.images)&&c.images.length===1&&c.images.every(imageValid));
  if(c.review_status==='validado')declaredValidated++;
  if(Array.isArray(c.images)&&c.images.length)withImages++;
  if(valid&&alternativesDistinct&&uniqueAcrossBanks&&reviewed(c)&&sources(c)&&imageOK&&a.every(x=>nonempty(x.rationale)))eligible++;
  if(c.review_status==='validado'&&!(valid&&alternativesDistinct&&uniqueAcrossBanks&&reviewed(c)&&sources(c)&&imageOK&&a.every(x=>nonempty(x.rationale))))unverifiedValidated++;
  if(a.length===4){
   const lengths=a.map(x=>String(x.text||'').trim().length);
   const max=Math.max(...lengths);
   const winners=lengths.filter(n=>n===max).length;
   const correctLength=String(a.find(x=>x.id===c.correct_id)?.text||'').trim().length;
   if(correctLength===max){if(winners===1)longest++;else tiedLongest++;}
  }
 }
 console.log(JSON.stringify({file,total:cases.length,invalid,duplicateAlternatives,missingRationales,duplicateAcrossBanks,duplicateQuestions,declaredValidated,eligible,unverifiedValidated,withImages,correctIsUniquelyLongest:longest,correctTiedForLongest:tiedLongest,percentUniquelyLongest:cases.length?Math.round(longest*100/cases.length):0}));
 if(invalid||missingRationales||duplicateAcrossBanks||duplicateQuestions||unverifiedValidated)failures++;
}
if(failures)process.exitCode=1;
