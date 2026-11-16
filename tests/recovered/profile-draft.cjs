const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../../dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8');
assert(html.includes('src="./voz-e-mascotes/dpi-profile-draft.js"'),'Cadastro deve carregar o rascunho automático');
const api=require('../../dpi-r18.1/voz-e-mascotes/dpi-profile-draft.js');
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
const fields={rn:{value:'Euder'},remail:{value:'teste@example.com'},rc:{value:'vet'},rconsent:{type:'checkbox',checked:true}};
const store=api.createStore(storage,id=>fields[id]);assert(store.save());fields.rn.value='';fields.remail.value='';assert(store.restore());assert.equal(fields.rn.value,'Euder');assert.equal(fields.remail.value,'teste@example.com');
const blocked=api.createStore({getItem(){throw Error()},setItem(){throw Error()}},()=>null);assert.equal(blocked.save(),false);assert.equal(blocked.restore(),false);
console.log('Cadastro restaura campos e tolera armazenamento indisponível.');
