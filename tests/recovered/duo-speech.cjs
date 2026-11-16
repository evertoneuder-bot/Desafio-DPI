const assert=require('node:assert/strict'),duo=require('../../dpi-r18.1/voz-e-mascotes/dpi-duo-speech.js');
const text='A medida é 10.5 mm e deve ser correlacionada com o protocolo técnico. Esse achado isolado não determina a causa e exige avaliação do conjunto de imagens.';
for(const first of ['male','female']){const plan=duo.plan(text,first);assert.equal(plan.map(t=>t.text).join(' '),text);assert.equal(plan[0].persona,first);assert.equal(plan.at(-1).persona,duo.other(first));}
const q='Qual alternativa está correta? Alternativa A: Primeiro texto. Alternativa B: Segundo texto. Alternativa C: Terceiro texto. Alternativa D: Quarto texto.';
const p=duo.plan(q,'male');assert.equal(p[0].persona,'male');assert(p.slice(1).every(t=>t.persona==='female'));assert.equal(p.map(t=>t.text).join(' '),q);
const intro=duo.plan('Tom: Oi! Eu sou o Tom.\nFernanda: E eu sou a Fernanda.');assert.deepEqual(intro.map(t=>t.persona),['male','female']);assert.equal(intro.map(t=>t.text).join(' '),'Oi! Eu sou o Tom. E eu sou a Fernanda.');
const before=duo.peek(q);assert.deepEqual(duo.peek(q),before);const actual=duo.next(q);assert.deepEqual(actual,before);assert.notEqual(duo.next('Uma dica breve.')[0].persona,actual[0].persona);
assert.deepEqual(duo.plan(''),[]);assert.equal(duo.plan('Uma dica breve.').length,1);
console.log('Duo: text conserved, decimals preserved, intro identities fixed, question/options split, lead alternation and prefetch peek passed.');
