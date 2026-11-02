(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports){module.exports=factory();return}
 const api=factory();
 const configureDefaults=()=>{api.removeTutorOption(document.getElementById('rc'));api.applyDeviceVoiceDefault(root.localStorage,root.dpiUseDeviceVoice)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',configureDefaults,{once:true});else configureDefaults();
 const form=document.getElementById('register');if(!form)return;
 const store=api.createStore({getItem:key=>root.localStorage.getItem(key),setItem:(key,value)=>root.localStorage.setItem(key,value)},id=>document.getElementById(id));
 form.addEventListener('input',()=>store.save());form.addEventListener('change',()=>store.save());
 for(const key of ['profile','editProfile']){const original=root[key];if(typeof original==='function')root[key]=function(){const value=original.apply(this,arguments);if(form.classList.contains('on')){store.restore();root.toggleVet?.()}return value}}
 root.addEventListener('pagehide',()=>{if(form.classList.contains('on'))store.save()});
 if(form.classList.contains('on')){store.restore();root.toggleVet?.()}
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const ids=['rn','rc','remail','rwhatsapp','rphone','rcrmv','ruf','rconsent'],key='dpiProfileDraftV1';
 function applyDeviceVoiceDefault(storage,setDeviceVoice){let saved,migrated;try{saved=storage?.getItem('dpi-device-voice');migrated=storage?.getItem('dpi-device-voice-migrated-v1')}catch{return}if(migrated!=='1'){if(saved==null||saved==='1'){try{storage?.setItem('dpi-device-voice','0')}catch{}setDeviceVoice?.(false)}try{storage?.setItem('dpi-device-voice-migrated-v1','1')}catch{}}else if(saved==null){try{storage?.setItem('dpi-device-voice','0')}catch{}setDeviceVoice?.(false)}}
 function removeTutorOption(select){if(!select?.options)return false;const tutor=Array.from(select.options).find(option=>option.value==='client');if(!tutor)return false;tutor.remove?.();return true}
 function createStore(storage,field){return{
  save(){try{const values={};for(const id of ids){const node=field(id);if(node)values[id]=node.type==='checkbox'?!!node.checked:node.value}storage.setItem(key,JSON.stringify(values));return true}catch{return false}},
  restore(){try{const values=JSON.parse(storage.getItem(key)||'null');if(!values||typeof values!=='object')return false;for(const id of ids){const node=field(id);if(!node||!Object.hasOwn(values,id))continue;if(node.type==='checkbox')node.checked=values[id]===true;else if(typeof values[id]==='string')node.value=values[id]}return true}catch{return false}}
 }}
 return{createStore,applyDeviceVoiceDefault,removeTutorOption};
});
