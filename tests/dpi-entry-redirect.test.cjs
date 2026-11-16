const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');

for(const device of ['phone','phone-coarse','desktop'])test('root routes '+device+' to the correct entry while preserving parameters',async()=>{
 const assigned=[];
 const location={href:'https://preview.example/?mode=start&deviceVoice=0#cover',search:'?mode=start&deviceVoice=0',hash:'#cover',replace:url=>assigned.push(url)};
 const context={URL,window:{location,matchMedia:()=>({matches:device!=='desktop'})}};
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))await vm.runInNewContext(m[1],context);
 const route=device==='phone'?'dpi-home.html':'dpi-r18.1/ABRA-ESTA-PREVIA.html';
 assert.deepEqual(assigned,[`https://preview.example/${route}?mode=start&deviceVoice=0#cover`]);
});
