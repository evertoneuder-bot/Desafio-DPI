let engine;
self.onmessage=async event=>{
 const {id,text}=event.data||{};
 try{
  if(typeof text!=='string'||!text.trim())throw Error('Texto ausente');
  engine=engine||await import('./browser-piper/vendor/engine.js');
  const spoken=text.replace(/\bEL-X VET\b/gi,'Éli xis vét').replace(/\bDPI\b/g,'Dê Pê I');
  const blob=await engine.predict({text:spoken,voiceId:'pt_BR-faber-medium'},p=>self.postMessage({id,progress:{loaded:p.loaded,total:p.total}}));
  self.postMessage({id,blob});
 }catch{self.postMessage({id,error:true})}
};
