const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../../index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
for(const tail of ['?_vercel_share=abc123#quiz','?mode=quiz&x=1','']){let destination;vm.runInNewContext(script,{URL,window:{location:{href:'https://preview.example/'+tail,search:tail.split('#')[0],hash:tail.includes('#')?'#quiz':'',replace:v=>destination=String(v)}}});assert.equal(destination,'https://preview.example/dpi-home.html'+tail);}
console.log('Entrada preserva parâmetros de compartilhamento, modo e fragmento.');
