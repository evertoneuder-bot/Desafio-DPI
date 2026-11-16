(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports){module.exports=factory();return;}
 const {createClient}=factory(),url=new URL('./dpi-browser-voice-worker.js',document.currentScript.src);
 const client=createClient(()=>new Worker(url,{type:'module'}));
 root.DPIBrowserVoice={available:typeof Worker==='function'&&typeof WebAssembly==='object',synthesize:text=>client.synthesize(text),cancel:()=>client.cancel(),warmup:()=>client.warmup()};
 const prepare=()=>{if(root.DPIBrowserVoice.available)client.warmup().catch(()=>{})};
 // Provisional local engine remains available for rollback; approved speech is primary.
 client.progress=value=>root.dispatchEvent(new CustomEvent('elx-local-voice-progress',{detail:value}));
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function createClient(makeWorker,{setTimer=setTimeout,clearTimer=clearTimeout}={}){
  let worker=null,next=0,warming=null;const pending=new Map(),cache=new Map();let cacheBytes=0;
  function failAll(error){for(const item of pending.values()){clearTimer(item.timer);item.reject(error)}pending.clear();worker?.terminate();worker=null;}
  const api={progress:null,warmup(){return warming||(warming=api.synthesize('Olá.',true).finally(()=>{warming=null}))},cancel(){if(pending.size&&![...pending.values()].every(item=>item.warmup)){const error=new Error('Fala cancelada');error.name='AbortError';failAll(error)}},synthesize(text,warmup=false){return new Promise((resolve,reject)=>{
   text=String(text);if(cache.has(text)){resolve(cache.get(text));return}const id=++next;
   try{
    if(!worker){worker=makeWorker();const owner=worker;worker.onmessage=event=>{if(worker!==owner)return;const data=event.data||{},item=pending.get(data.id);if(!item)return;if(data.progress){api.progress?.(data.progress);return}clearTimer(item.timer);pending.delete(data.id);if(data.error||!data.blob?.size)item.reject(new Error('Não foi possível gerar a voz local'));else{if(data.blob.size<=8*1024*1024){while(cache.size&&(cache.size>=24||cacheBytes+data.blob.size>16*1024*1024)){const key=cache.keys().next().value;cacheBytes-=cache.get(key).size;cache.delete(key)}cache.set(item.text,data.blob);cacheBytes+=data.blob.size}item.resolve(data.blob)}};worker.onerror=()=>{if(worker===owner)failAll(new Error('Falha no processamento da voz local'))};}
    const timer=setTimer(()=>failAll(new Error('Tempo de preparação da voz local esgotado')),120000);pending.set(id,{resolve,reject,timer,text,warmup});worker.postMessage({id,text:String(text)});
   }catch(error){failAll(error);reject(error)}
  })}};return api;
 }
 return {createClient};
});
