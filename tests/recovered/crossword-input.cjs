const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync(__dirname+'/../../dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8'),a=s.indexOf('function cwType('),b=s.indexOf('function cwKeydown(',a);
const c={window:{_cwActiveEntry:{word:'AB',r:0,c:0,dr:0,dc:1}},document:{getElementById:()=>null},cwCellCoords:()=>({r:0,c:0}),cwEntryHas:()=>true};vm.runInNewContext(s.slice(a,b),c);
const accented={value:'á'};c.cwType(accented,{});assert.equal(accented.value,'A','Normalizar acentos e caixa antes de verificar a palavra');
const blank={value:''};assert.doesNotThrow(()=>c.cwType(blank,{}));assert.equal(blank.value,'');
const symbol={value:'!'};assert.doesNotThrow(()=>c.cwType(symbol,{}));assert.equal(symbol.value,'');
console.log('Entrada da cruzadinha normaliza acentos/caixa e aceita apagar ou ignorar símbolos sem erro.');
