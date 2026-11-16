const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
for(const device of ['phone','desktop'])test('root redirects '+device+' preserving parameters without running legacy loader',async()=>{
 const assigned=[],fetched=[],written=[];
 const location={href:'https://preview.example/?mode=start&deviceVoice=0#cover',search:'?mode=start&deviceVoice=0',hash:'#cover',replace:url=>assigned.push(url)};
 const document={open(){},write:x=>written.push(x),close(){},getElementById:()=>({textContent:''})};
 const context={URL,window:{location,matchMedia:()=>({matches:device==='phone'})},document,fetch:async url=>{fetched.push(url);return{ok:true,text:async()=>''}}};
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))await vm.runInNewContext(m[1],context);
 for(let i=0;i<20;i++)await Promise.resolve();
 assert.deepEqual(assigned,['https://preview.example/dpi-home.html?mode=start&deviceVoice=0#cover']);
 assert.equal(fetched.length,0,'redirect must not also fetch legacy game');
 assert.equal(written.length,0,'legacy document.write must not race the cover');
});
