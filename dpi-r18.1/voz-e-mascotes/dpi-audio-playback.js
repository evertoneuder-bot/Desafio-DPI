(function(root,factory){
  const api=factory();
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
})(typeof window==='object'?window:null,function(){
  'use strict';
  const silence='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==';
  function createPlayback(createAudio,report=()=>{}){
    let audio=null,pending=false,prepared=false,revision=0,phase='idle';
    function emit(state){phase=state;report({state});}
    function element(){if(!audio){audio=createAudio();audio.setAttribute('playsinline','');audio.preload='auto';audio.addEventListener?.('ended',()=>{if(audio.ended&&phase==='playing')emit('ended');});audio.addEventListener?.('pause',()=>{if(audio.paused&&phase==='playing')emit('paused');});}return audio;}
    async function attempt(){
      const current=revision;
      try{await element().play();if(current===revision){prepared=true;pending=false;emit('playing');}return true;}
      catch(error){if(current!==revision)return false;if(error?.name==='NotAllowedError'){pending=true;emit('blocked');return false;}pending=false;emit('error');throw error;}
    }
    function activate(){
      if(pending)return attempt();
      if(prepared)return Promise.resolve(true);
      const target=element();prepared=true;target.src=silence;
      const current=revision;
      // play() is invoked synchronously inside the trusted click handler.
      return Promise.resolve(target.play()).then(()=>{if(current===revision&&target.src===silence)target.pause();return true;},()=>{prepared=false;return false;});
    }
    function cancel(){revision++;pending=false;const interrupted=['playing','loading','blocked','paused'].includes(phase);if(interrupted)phase='idle';if(audio){audio.pause();audio.onplaying=null;audio.onended=null;audio.onerror=null;}if(interrupted)emit('stopped');}
    function play(src,volume,speed){revision++;const target=element();target.src=src;target.volume=volume;target.muted=false;target.playbackRate=speed;target.preservesPitch=true;pending=false;emit('loading');return attempt();}
    return {element,activate,play,cancel,pending:()=>pending};
  }
  return {createPlayback};
});
