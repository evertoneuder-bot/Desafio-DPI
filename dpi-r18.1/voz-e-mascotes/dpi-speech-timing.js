/* Só mudanças do jogo podem iniciar nova narração; legendas e relógios não a atrasam. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DPISpeechTiming=api})(typeof window==='object'?window:null,function(){
 const ignored='.dpi-play-speech,#elx-character-stage,.dpi-round-timer,.dpi-practice-timer,#lgTime,#caseTimer,.timer';
 function relevant(records,root){return records.some(record=>{const node=record.target?.nodeType===3?record.target.parentElement:record.target;return node===root||!!node&&!node.closest?.(ignored)})}
 return {relevant};
});
