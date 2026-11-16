const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('api/tts.js','utf8');
function fixture(options={}){
 const calls=[],headers={};let now=0,cleared=false;
 const env={ELX_TTS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-key',ELEVENLABS_VOICE_MALE:'fake-tom',ELEVENLABS_VOICE_FEMALE:'fake-fernanda',...options.env};
 const context={module:{exports:{}},process:{env},URL,AbortController,Buffer,Date:{now:()=>now},setTimeout:()=>1,clearTimeout:()=>{cleared=true},fetch:async(url,init)=>{
  calls.push({url,init});
  if(calls.length===1){now+=13;return{ok:!options.subscriptionStatus,status:options.subscriptionStatus||200,json:async()=>options.quota??{max_credit_limit_extension:0,character_count:100,character_limit:1000}};}
  now+=17;
  return{ok:!options.synthesisStatus,status:options.synthesisStatus||200,headers:{get:name=>name==='content-type'?(options.contentType||'audio/mpeg'):String(options.declaredBytes||3)},arrayBuffer:async()=>{now+=19;return Buffer.from([1,2,3]);}};
 }};
 vm.runInNewContext(source,context);
 const res={setHeader:(k,v)=>{headers[k]=v},status(n){this.code=n;return this},json(v){this.body=JSON.parse(JSON.stringify(v));return this},send(v){this.body=v;return this}};
 return{calls,headers,res,cleared:()=>cleared,run:async(body={text:'Pergunta',gender:'male'},req={})=>{await context.module.exports({method:'POST',headers:{origin:'https://preview.example',host:'preview.example'},body,...req},res);return res}};
}
for(const gender of ['male','female'])test('TTS backend selects '+gender+' and exposes stage timings without secrets',async()=>{
 const f=fixture();await f.run({text:'Pergunta',gender});
 assert.equal(f.res.code,200);assert.deepEqual(f.res.body,Buffer.from([1,2,3]));assert.equal(f.calls.length,2);
 assert.match(f.calls[1].url,new RegExp(gender==='male'?'fake-tom':'fake-fernanda'));
 assert.equal(JSON.parse(f.calls[1].init.body).model_id,'eleven_multilingual_v2');
 assert.equal(f.headers['Server-Timing'],'subscription;dur=13, synthesis_headers;dur=17, buffer;dur=19');
 assert.equal(f.headers['Cache-Control'],'no-store');assert.equal(f.cleared(),true);
 assert.doesNotMatch(JSON.stringify(f.headers),/fake-key|fake-tom|fake-fernanda|Pergunta/);
});
for(const [name,body,req,status] of [
 ['wrong method',{}, {method:'GET'},405],
 ['cross origin',{text:'Teste',gender:'male'},{headers:{origin:'https://other.example',host:'preview.example'}},403],
 ['empty text',{text:' ',gender:'male'},{},400],
 ['oversized text',{text:'x'.repeat(1001),gender:'male'},{},413],
 ['invalid persona',{text:'Teste',gender:'other'},{},400]
])test('TTS rejects '+name+' without provider requests',async()=>{const f=fixture();await f.run(body,req);assert.equal(f.res.code,status);assert.equal(f.calls.length,0)});
test('missing configuration stops before any provider request',async()=>{const f=fixture({env:{ELEVENLABS_API_KEY:''}});await f.run();assert.equal(f.res.code,503);assert.equal(f.calls.length,0)});
for(const quota of [
 {max_credit_limit_extension:1,character_count:100,character_limit:1000},
 {max_credit_limit_extension:0,character_count:999,character_limit:1000},
 {max_credit_limit_extension:0,character_count:null,character_limit:1000}
])test('unconfirmed included balance or enabled overage blocks synthesis: '+JSON.stringify(quota),async()=>{const f=fixture({quota});await f.run();assert.equal(f.res.code,429);assert.equal(f.calls.length,1);assert.equal(f.cleared(),true)});
test('subscription permission error is categorized before synthesis',async()=>{const f=fixture({subscriptionStatus:403});await f.run();assert.equal(f.res.code,502);assert.deepEqual(f.res.body,{error:'provider-permission-denied',providerStatus:403});assert.equal(f.calls.length,1)});
test('invalid voice response is categorized without leaking provider data',async()=>{const f=fixture({synthesisStatus:422});await f.run();assert.equal(f.res.code,502);assert.deepEqual(f.res.body,{error:'provider-model-or-voice-invalid',providerStatus:422});assert.equal(f.cleared(),true)});
test('non audio provider response is not delivered as speech',async()=>{const f=fixture({contentType:'application/json'});await f.run();assert.equal(f.res.code,502);assert.deepEqual(f.res.body,{error:'invalid-provider-response'})});
