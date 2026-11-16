const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8');
const updated=html.slice(html.indexOf('function narrateVisibleScreen('),html.indexOf("let lastNarrationKey=''"));
function fixture(kind){
 let calls=0;
 const question=['question','minigame'].includes(kind)?{textContent:'Pergunta A',matches:()=>kind==='question'}:null;
 const feedback=kind==='feedback'?{textContent:'Resposta correta',matches:()=>true,querySelector:()=>({textContent:'Explicação'})}:null;
 const internal={classList:{contains:()=>true},querySelector:s=>s.startsWith('.dpi-case-question')?question:s.startsWith('#caseFeedback')?feedback:null,querySelectorAll:()=>[]};
 const window={__dpiQuestionResultFlowInstalled:true};
 const read=new Function('window','document','say','conciseText','dpiGameKey',"let enabled=true,lastTutorialKey='',lastNarrationKey='',persona='male';"+updated+';return narrateVisibleScreen;')(window,{getElementById:()=>internal,querySelector:()=>null},()=>{calls++;return true},s=>s,()=> '');
 return {read,calls:()=>calls};
}
for(const kind of ['question','feedback']) test('automatic inline observer yields '+kind+' to the installed router',()=>{
 const f=fixture(kind);f.read();assert.equal(f.calls(),0);
});
test('explicit public reader can still narrate the complete question',()=>{
 const f=fixture('question');f.read(true);assert.equal(f.calls(),1);
});

test('legacy minigame prompts retain automatic narration when the router has no reader for them',()=>{const f=fixture('minigame');f.read();assert.equal(f.calls(),1)});

test('actual dpiReadQuestion entry bypasses only the automatic observer suppression',()=>{
 let calls=0;
 const q={textContent:'Pergunta atual',matches:()=>true};
 const internal={classList:{contains:()=>true},querySelector:s=>s.startsWith('.dpi-case-question')?q:null,querySelectorAll:()=>[]};
 const window={__dpiQuestionResultFlowInstalled:true};
 const assignment=html.match(/window\.dpiReadQuestion=\(\)=>\{[^\n]+/)[0];
 new Function('window','document','say','conciseText','dpiGameKey',"let enabled=true,lastTutorialKey='',lastNarrationKey='already read',persona='male';"+updated+';'+assignment)(window,{getElementById:()=>internal,querySelector:()=>null},()=>{calls++;return true},s=>s,()=> '');
 assert.equal(window.dpiReadQuestion(),'Pergunta atual');
 assert.equal(calls,1);
});
