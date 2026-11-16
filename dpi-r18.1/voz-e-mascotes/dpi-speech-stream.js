(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports){module.exports=factory();return}
 const api=factory();root.DPISpeechStream=api.createPlayer({synthesize:text=>root.DPIBrowserVoice.synthesize(text),createURL:blob=>URL.createObjectURL(blob),revokeURL:url=>URL.revokeObjectURL(url)});root.DPISpeechStream.createPlayer=api.createPlayer;
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function chunkText(text){
  const words=String(text||'').trim().split(/\s+/),chunks=[];let part='';
  for(const word of words){const limit=[48,220,300][chunks.length]||240;if(part&&(part.length+word.length+1>limit||(part.length>limit*.55&&/[.!?;:]$/.test(part)))){chunks.push(part);part=''}part+=(part?' ':'')+word}
  if(part)chunks.push(part);return chunks;
 }
 function createPlayer({synthesize,createURL,revokeURL,chunker=chunkText}){
  let epoch=0,interrupt=null;
  const aborted=()=>Object.assign(new Error('Fala cancelada'),{name:'AbortError'});
  function cancel(){epoch++;interrupt?.();interrupt=null}
  async function speak(text,{audio,volume=1,speed=1,isCurrent=()=>true,getVolume=()=>volume,getSpeed=()=>speed,onStart=()=>{},onChunkStart=()=>{},onProgress=()=>{}}){
   cancel();const token=epoch,chunks=chunker(text);let offset=0,first=true,next=null;
   const check=()=>{if(token!==epoch||!isCurrent())throw aborted()};
   const prepare=(t,index)=>Promise.resolve().then(()=>synthesize(t,index)).then(blob=>({blob}),error=>({error}));
   let prepared=chunks.length?prepare(chunks[0],0):null;
   for(let i=0;i<chunks.length;i++){
    const {blob,error}=await prepared;check();if(error)throw error;
    const url=createURL(blob);audio.src=url;audio.volume=getVolume();audio.playbackRate=getSpeed();audio.preservesPitch=true;
    let finished=false,announced=false;
    try{
     await new Promise((resolve,reject)=>{
      interrupt=()=>{audio.pause();reject(aborted())};
      audio.onplaying=()=>{if(finished||token!==epoch)return;if(!isCurrent()){reject(aborted());return}if(announced)return;announced=true;if(first){first=false;onStart(text,audio)}onChunkStart(chunks[i],audio,i);onProgress(offset);if(i+1<chunks.length&&!next)next=prepare(chunks[i+1],i+1)};
      audio.ontimeupdate=()=>{if(!finished&&token===epoch&&isCurrent()&&audio.duration>0)onProgress(offset+Math.floor(chunks[i].length*audio.currentTime/audio.duration))};
      audio.onended=()=>{if(!finished&&token===epoch&&isCurrent())resolve()};audio.onerror=()=>{if(!finished&&token===epoch)reject(new Error('Falha ao reproduzir trecho de voz'))};
      try{Promise.resolve(audio.play()).catch(reject)}catch(e){reject(e)}
     });
    }finally{finished=true;if(token===epoch)interrupt=null;revokeURL(url)}
    check();offset+=chunks[i].length+1;prepared=next;next=null;
   }
  }
  return {speak,cancel};
 }
 return {chunkText,createPlayer};
});
