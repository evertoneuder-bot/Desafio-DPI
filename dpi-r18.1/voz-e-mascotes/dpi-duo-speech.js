/* Dupla Fernanda e Tom: planeja turnos sem duplicar conteúdo clínico. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DPIDuoSpeech=api})(typeof window==='object'?window:null,function(){
 let nextLead='female';
 const other=who=>who==='female'?'male':'female';
 function plan(text,first='female'){
  const source=String(text||'').trim();if(!source)return [];
  // Falas autorais de apresentação podem especificar o locutor com nome e dois-pontos.
  const explicit=source.split(/\n(?=(?:Tom|Fernanda):)/).map(s=>s.trim());
  if(explicit.every(s=>/^(Tom|Fernanda):\s*\S/.test(s)))return explicit.flatMap(line=>{const match=line.match(/^(Tom|Fernanda):\s*([\s\S]*)$/);return splitLong(match[2]).map(text=>({persona:match[1]==='Tom'?'male':'female',text}))});
  const options=source.search(/\bAlternativa A:/);
  let turns;
  if(options>0)turns=[{persona:first,text:source.slice(0,options).trim()},{persona:other(first),text:source.slice(options).trim()}];
  else {
   // Troca no fim de uma frase, nunca no meio de abreviação, número ou alternativa.
   const sentences=source.split(/(?<=[.!?])\s+/u).map(s=>s.trim()).filter(Boolean);
   if(source.length<100||sentences.length<2)turns=[{persona:first,text:source}];
   else {let best=1,distance=Infinity;for(let i=1;i<sentences.length;i++){const d=Math.abs(sentences.slice(0,i).join(' ').length-source.length*.48);if(d<distance){best=i;distance=d}}turns=[{persona:first,text:sentences.slice(0,best).join(' ')},{persona:other(first),text:sentences.slice(best).join(' ')}]}
  }
  return frontload(turns.flatMap(turn=>splitLong(turn.text).map(text=>({...turn,text}))));
 }
 function frontload(turns){
  const first=turns[0];if(!first||first.text.length<200)return turns;
  const boundaries=[...first.text.matchAll(/[,;:.!?]\s+/g)].filter(m=>m.index>=55&&m.index<=160);
  if(!boundaries.length)return turns;const end=boundaries.at(-1).index+1;
  return [{...first,text:first.text.slice(0,end)},{...first,text:first.text.slice(end).trim()},...turns.slice(1)];
 }
 function splitLong(text){
  const options=String(text).split(/(?=Alternativa [A-D]:)/).map(s=>s.trim()).filter(Boolean),chunks=[];
  for(const part of options){if(part.length<=850){chunks.push(part);continue}let buffer='';for(const word of part.split(/\s+/)){if(buffer&&buffer.length+word.length+1>800){chunks.push(buffer);buffer=''}buffer+=(buffer?' ':'')+word}if(buffer)chunks.push(buffer)}return chunks;
 }
 function next(text){const first=nextLead;nextLead=other(first);return plan(text,first)}
 return {plan,next,peek:text=>plan(text,nextLead),other};
});
