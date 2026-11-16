(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports){module.exports=factory();return}
 const api=factory();
 const form=document.getElementById('register');if(!form)return;
 const store=api.createStore({getItem:key=>root.localStorage.getItem(key),setItem:(key,value)=>root.localStorage.setItem(key,value)},id=>document.getElementById(id));
 form.addEventListener('input',()=>store.save());form.addEventListener('change',()=>store.save());
 const originalSave=root.saveProfile;if(typeof originalSave==='function')root.saveProfile=function(){const result=originalSave.apply(this,arguments);if(!form.classList.contains('on')){try{root.localStorage.removeItem('dpiProfileDraftV1')}catch{}}return result};
 for(const key of ['profile','editProfile']){const original=root[key];if(typeof original==='function')root[key]=function(){const value=original.apply(this,arguments);if(form.classList.contains('on')){store.restore();root.toggleVet?.()}return value}}
 root.addEventListener('pagehide',()=>{if(form.classList.contains('on'))store.save()});
 if(form.classList.contains('on')){store.restore();root.toggleVet?.()}
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const ids=['rn','rc','remail','rwhatsapp','rphone','rcrmv','ruf','rconsent'],key='dpiProfileDraftV1';
 function createStore(storage,field){return{
  save(){try{const values={};for(const id of ids){const node=field(id);if(node)values[id]=node.type==='checkbox'?!!node.checked:node.value}storage.setItem(key,JSON.stringify(values));return true}catch{return false}},
  restore(){try{const values=JSON.parse(storage.getItem(key)||'null');if(!values||typeof values!=='object')return false;for(const id of ids){const node=field(id);if(!node||!Object.hasOwn(values,id))continue;if(node.type==='checkbox')node.checked=values[id]===true;else if(typeof values[id]==='string')node.value=values[id]}return true}catch{return false}}
 }}
 return{createStore};
});
