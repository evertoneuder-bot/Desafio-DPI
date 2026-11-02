(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports){module.exports=factory();return}
 const api=factory();root.DPISpeechPlan=api;root.DPISpeechStream=api.createPlayer({synthesize:text=>root.DPIBrowserVoice.synthesize(text),createURL:blob=>URL.createObjectURL(blob),revokeURL:url=>URL.revokeObjectURL(url)});
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function cleanSpeech(text){
  return String(text||'').replace(/\[(?:sirene|música|aplausos|efeito sonoro)[^\]]*\]/gi,' ')
   .replace(/\b(?:figura|ícone|imagem)\s+(?:de|da|do)\s+sirene\s*[.,;:]?/gi,' ')
   .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,' ').replace(/[*_`#|]/g,' ').replace(/\s+/g,' ').trim();
 }
 function speechPlan(value){
  const text=cleanSpeech(value),pattern=/(?:\b(?:opção|alternativa)\s+([A-D])\b\s*[.:)–-]|\b([A-D])\s*[:)])\s*/gi;
  const marks=[...text.matchAll(pattern)],plan=[];
  if(!marks.length)return /^(?:boa\b|parab[eé]ns\b|acertou\b|correto\b|muito bem\b|rodada conclu[ií]da\b|voc[eê] ganhou\b|pontos? conquistados?\b)/i.test(text)?[{pause:1500},{text}]:[{text}];
  const intro=text.slice(0,marks[0].index).trim(),opening=intro.match(/^(.*?)(\b(?:as opções são|as alternativas são)\b\s*:?)(.*)$/i);
  if(opening){const question=opening[1].trim(),optionsIntro=(opening[2]+opening[3]).trim();if(question)plan.push({text:question},{pause:1500});if(optionsIntro)plan.push({text:optionsIntro},{pause:1500})}
  else if(intro){plan.push({text:intro},{pause:1500})}
  marks.forEach((m,i)=>{
   const letter=(m[1]||m[2]).toUpperCase(),end=marks[i+1]?.index??text.length;
   let body=text.slice(m.index+m[0].length,end).replace(/^\s*[A-D]\s*[.:)–-]\s*/i,'').replace(/^[\s:–-]+/,'').replace(/[;\s]+$/,'').trim();
   if(i)plan.push({pause:1500});plan.push({text:'Alternativa '+letter+'.'},{pause:2000});if(body)plan.push({text:body});
  });return plan;
 }
 function chunkText(text){
  const words=String(text||'').trim().split(/\s+/),chunks=[];let part='';
  for(const word of words){const limit=[48,90,150][chunks.length]||240;if(part&&(part.length+word.length+1>limit||(part.length>limit*.55&&/[.!?;:]$/.test(part)))){chunks.push(part);part=''}part+=(part?' ':'')+word}
  if(part)chunks.push(part);return chunks;
 }
 function createPlayer({synthesize,createURL,revokeURL,setTimer=setTimeout,clearTimer=clearTimeout}){
  let epoch=0,interrupt=null;
  const aborted=()=>Object.assign(new Error('Fala cancelada'),{name:'AbortError'});
  function cancel(){epoch++;interrupt?.();interrupt=null}
  async function speak(text,{audio,volume=1,speed=1,isCurrent=()=>true,getVolume=()=>volume,getSpeed=()=>speed,onStart=()=>{},onProgress=()=>{}}){
   cancel();const token=epoch,plan=speechPlan(text),chunks=plan.flatMap(p=>p.pause?[p]:chunkText(p.text).map(text=>({text})));let offset=0,first=true;const pending=new Map();
   const check=()=>{if(token!==epoch||!isCurrent())throw aborted()};
   const prepare=p=>p?.text?Promise.resolve().then(()=>synthesize(p.text)).then(blob=>({blob}),error=>({error})):null;
   const prepareAt=i=>{if(!pending.has(i))pending.set(i,prepare(chunks[i]));return pending.get(i)};if(chunks[0]?.text)prepareAt(0);
   for(let i=0;i<chunks.length;i++){
    check();if(chunks[i].pause){await new Promise((resolve,reject)=>{const timer=setTimer(resolve,chunks[i].pause);interrupt=()=>{clearTimer(timer);reject(aborted())}});check();interrupt=null;continue;}
    const {blob,error}=await prepareAt(i);pending.delete(i);check();if(error)throw error;
    const url=createURL(blob);audio.src=url;audio.volume=getVolume();audio.playbackRate=getSpeed();audio.preservesPitch=true;
    try{
     await new Promise((resolve,reject)=>{
      interrupt=()=>{audio.pause();reject(aborted())};
      audio.onplaying=()=>{if(token!==epoch||!isCurrent()){interrupt?.();return}if(first){first=false;onStart(text,audio)}onProgress(offset);const j=chunks.findIndex((p,j)=>j>i&&p.text);if(j>=0)prepareAt(j)};
      audio.ontimeupdate=()=>{if(token===epoch&&isCurrent()&&audio.duration>0)onProgress(offset+Math.floor(chunks[i].text.length*audio.currentTime/audio.duration))};
      audio.onended=resolve;audio.onerror=()=>reject(new Error('Falha ao reproduzir trecho de voz'));
      try{Promise.resolve(audio.play()).catch(reject)}catch(e){reject(e)}
     });
    }finally{if(token===epoch)interrupt=null;revokeURL(url)}
    check();offset+=chunks[i].text.length+1;
   }
  }
  return {speak,cancel};
 }
 return {chunkText,cleanSpeech,speechPlan,createPlayer};
});
