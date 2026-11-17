(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(!root?.document)return;
  const report=detail=>{
    const message=detail.state==='blocked'?'O navegador bloqueou o áudio. Toque novamente em TESTAR VOZ E EFEITOS para ouvir a fala já carregada.':detail.state==='playing'?'Áudio em reprodução. Confira o volume de mídia do aparelho.':detail.state==='loading'?'Carregando a voz…':detail.state==='ended'?'Reprodução concluída.':detail.state==='paused'?'Reprodução pausada.':detail.state==='stopped'?'Reprodução interrompida.':'Não foi possível reproduzir o áudio neste aparelho. Tente novamente.';
    const label=root.document.getElementById('dpi-audio-test-status');
    if(label)label.textContent=message;
    if(detail.state==='blocked'||detail.state==='error')root.dispatchEvent(new CustomEvent('elx-voice-unavailable',{detail:{reason:'audio-playback-'+detail.state,message}}));
  };
  root.ELXVoicePlayback=api.createPlayback(()=>new root.Audio(),report);
  root.document.addEventListener('click',event=>{
    if(!event.isTrusted||!root.ELXAssistentes?.isEnabled?.())return;
    // Retrying an already downloaded utterance must consume this tap instead
    // of generating another one and losing the browser's media activation.
    const pending=root.ELXVoicePlayback.pending();
    root.ELXVoicePlayback.activate().catch(()=>{});
    if(pending&&event.target.closest?.('button[onclick="testAV()"]')){
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
})(typeof window==='object'?window:null,function(root){
  'use strict';
  const silence='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==';
  const apiBlobTiming=new WeakMap(),apiUrlTiming=new Map(),nativeFetch=root?.fetch?.bind(root),nativeCreateURL=root?.URL?.createObjectURL?.bind(root.URL),nativeRevokeURL=root?.URL?.revokeObjectURL?.bind(root.URL);
  const metricNames=new Set(['subscription','synthesis_headers','buffer']);
  const parseServerTiming=value=>Object.fromEntries(String(value||'').split(',').map(part=>{const m=part.trim().match(/^([a-z_]+);dur=([0-9.]+)$/i);return m&&metricNames.has(m[1])?[m[1],Math.round(Number(m[2])*10)/10]:null}).filter(Boolean));
  if(nativeFetch)root.fetch=async function(input,init){
    let target='';try{target=new URL(typeof input==='string'?input:input.url,root.location?.href).pathname}catch{}
    if(target!=='/api/tts')return nativeFetch(input,init);
    const requestAt=typeof root.performance?.now==='function'?root.performance.now():Date.now();
    const response=await nativeFetch(input,init),headersAt=typeof root.performance?.now==='function'?root.performance.now():Date.now();
    const meta={requestAt,responseMs:Math.round((headersAt-requestAt)*10)/10,status:response.status,serverTiming:parseServerTiming(response.headers?.get?.('Server-Timing'))};
    const readBlob=response.blob.bind(response);
    response.blob=async function(){const started=typeof root.performance?.now==='function'?root.performance.now():Date.now();const blob=await readBlob();const ended=typeof root.performance?.now==='function'?root.performance.now():Date.now();apiBlobTiming.set(blob,{...meta,blobReadMs:Math.round((ended-started)*10)/10});return blob};
    return response;
  };
  if(nativeCreateURL)root.URL.createObjectURL=function(blob){const url=nativeCreateURL(blob),meta=apiBlobTiming.get(blob);if(meta)apiUrlTiming.set(url,meta);return url};
  if(nativeRevokeURL)root.URL.revokeObjectURL=function(url){apiUrlTiming.delete(url);return nativeRevokeURL(url)};
  function createPlayback(createAudio,report=()=>{}){
    let audio=null,pending=false,prepared=false,revision=0,phase='idle';
    let context=null,gainNode=null,compressor=null,persona='female';
    // Bounded diagnostics: never store a transcript, voice ID or audio URL.
    const timingHistory=[];
    let timingSequence=0, currentTiming=null;
    const publishTimings=()=>{const snapshot=timingSnapshot();if(root?.document?.body?.dataset)root.document.body.dataset.dpiAudioTiming=JSON.stringify(snapshot)};
    const now=()=>typeof root?.performance?.now==='function'?root.performance.now():Date.now();
    function recordTiming(mark,entry){
      if(!entry||entry.revision!==revision||entry[mark]!=null)return;
      entry[mark]=Math.round((now()-entry.startedAt)*10)/10;
      const detail={turn:entry.turn,persona:entry.persona,stage:mark,elapsedMs:entry[mark]};
      publishTimings();
      if(typeof root?.dispatchEvent==='function'&&typeof root?.CustomEvent==='function'){
        root.dispatchEvent(new root.CustomEvent('elx-audio-timing',{detail}));
      }
    }
    function timingSnapshot(){return timingHistory.map(({turn,persona,canplayMs,playingMs,failedMs,api})=>({turn,persona,canplayMs,playingMs,failedMs,api:api?{status:api.status,responseMs:api.responseMs,blobReadMs:api.blobReadMs,requestToPlaybackMs:api.requestToPlaybackMs,serverTiming:api.serverTiming}:null,attribution:api?{requestToPlaybackMs:api.requestToPlaybackMs,networkAndServerMs:Math.round((api.responseMs+api.blobReadMs)*10)/10,serverReportedMs:Math.round(Object.values(api.serverTiming||{}).reduce((sum,n)=>sum+n,0)*10)/10,playbackAfterReadyMs:playingMs==null?null:playingMs,totalRequestToPlayingMs:playingMs==null?null:Math.round((api.requestToPlaybackMs+playingMs)*10)/10}:null}));}
    function emit(state){phase=state;report({state});}
    function updateGain(){if(!gainNode||!context)return;const gain=persona==='male'?1.55:1;try{gainNode.gain.setTargetAtTime(gain,context.currentTime,.025)}catch{gainNode.gain.value=gain}}
    function setPersona(value){persona=value==='male'?'male':'female';updateGain()}
    function ensureAudioGraph(target){
      const AudioContextType=root?.AudioContext||root?.webkitAudioContext;
      if(!AudioContextType)return;
      if(!gainNode){
        try{
          context=new AudioContextType();
          const source=context.createMediaElementSource(target);
          gainNode=context.createGain();compressor=context.createDynamicsCompressor();
          compressor.threshold.value=-6;compressor.knee.value=8;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.25;
          source.connect(gainNode);gainNode.connect(compressor);compressor.connect(context.destination);updateGain();
        }catch{context=null;gainNode=null;compressor=null;return}
      }
      if(context?.state==='suspended')context.resume()?.catch?.(()=>{});
    }
    function element(){if(!audio){audio=createAudio();audio.setAttribute('playsinline','');audio.preload='auto';audio.addEventListener?.('canplay',()=>recordTiming('canplayMs',currentTiming));audio.addEventListener?.('playing',()=>recordTiming('playingMs',currentTiming));audio.addEventListener?.('ended',()=>{if(audio.ended&&phase==='playing')emit('ended');});audio.addEventListener?.('pause',()=>{if(audio.paused&&phase==='playing')emit('paused');});}return audio;}
    if(root?.addEventListener){
      root.addEventListener('elx-audio-persona',event=>setPersona(event.detail?.persona));
      root.addEventListener('elx-persona-setting',event=>setPersona(event.detail?.persona));
    }
    async function attempt(){
      const current=revision;
      try{await element().play();if(current===revision){prepared=true;pending=false;emit('playing');}return true;}
      catch(error){if(current!==revision)return false;recordTiming('failedMs',currentTiming);if(error?.name==='NotAllowedError'){pending=true;emit('blocked');return false;}pending=false;emit('error');throw error;}
    }
    function activate(){
      if(pending)return attempt();
      if(prepared)return Promise.resolve(true);
      const target=element();ensureAudioGraph(target);prepared=true;target.src=silence;
      const current=revision;
      // play() is invoked synchronously inside the trusted click handler.
      return Promise.resolve(target.play()).then(()=>{if(current===revision&&target.src===silence)target.pause();return true;},()=>{prepared=false;return false;});
    }
    function cancel(){revision++;currentTiming=null;pending=false;const interrupted=['playing','loading','blocked','paused'].includes(phase);if(interrupted)phase='idle';if(audio){audio.pause();audio.onplaying=null;audio.onended=null;audio.onerror=null;}if(interrupted)emit('stopped');}
    function play(src,volume,speed){revision++;const startedAt=now(),api=apiUrlTiming.get(src);currentTiming={turn:++timingSequence,persona,revision,startedAt,api:api?{...api,requestToPlaybackMs:Math.round((startedAt-api.requestAt)*10)/10}:null};timingHistory.push(currentTiming);if(timingHistory.length>40)timingHistory.shift();publishTimings();const target=element();target.src=src;target.volume=volume;target.muted=false;target.playbackRate=speed;target.preservesPitch=true;pending=false;emit('loading');return attempt();}
    return {element,activate,play,cancel,pending:()=>pending,setPersona,timingSnapshot};
  }
  return {createPlayback};
});
