const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const resultEvents=[];
const listeners={},classes=new Set(),stage={dataset:{},classList:{add(...xs){xs.forEach(x=>classes.add(x))},remove(...xs){xs.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)}}},results=[];
let scan,timer;
const node=()=>({dataset:{},setAttribute(){},appendChild(){},addEventListener(){}});
stage.querySelector=()=>({src:'approved.png',replaceWith(){}});stage.addEventListener=()=>{};
const document={getElementById:()=>stage,createElement:node,head:{append(){}},body:{},addEventListener(){},querySelectorAll:()=>results};
const window={dispatchEvent:e=>resultEvents.push(e),DPI2DArtwork:{create:()=>'<svg></svg>'},addEventListener(t,f){(listeners[t]??=[]).push(f)},ELXAssistentes:{getPersona:()=> 'female'}};
vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),{window,document,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},MutationObserver:class{constructor(f){scan=f}observe(){}},queueMicrotask:f=>f(),setTimeout:fn=>{timer=fn;return 1},clearTimeout(){}});
const emit=(type,detail={})=>listeners[type].forEach(f=>f({detail}));
emit('elx-speech-start',{persona:'female'});assert.equal(stage.dataset.motionState,'speaking');assert(classes.has('is-speaking'));
emit('elx-speech-paused');assert.equal(stage.dataset.motionState,'idle');assert(!classes.has('is-speaking'));
emit('elx-user-speaking');assert.equal(stage.dataset.motionState,'listening');emit('elx-user-speech-end');assert.equal(stage.dataset.motionState,'idle');
scan();assert(!classes.has('is-incorrect'));results.push({matches:()=>true});scan();assert(classes.has('is-correct'));assert.equal(stage.dataset.motionState,'celebrate');
console.log('Motion lifecycle: speech, pause, listening and committed result passed.');

// Speech lifecycle cannot erase a committed reaction; it resumes after the reaction.
emit('elx-speech-start',{persona:'female'});assert.equal(stage.dataset.motionState,'celebrate');
emit('elx-mascot-react',{pose:'greeting',who:'female'});assert.equal(stage.dataset.motionState,'celebrate');
timer();assert.equal(stage.dataset.motionState,'speaking');
emit('elx-mascot-react',{pose:'incorrect',who:'female'});emit('elx-speech-end');assert.equal(stage.dataset.motionState,'incorrect');
timer();assert.equal(stage.dataset.motionState,'idle');
// A reused feedback node can change its result and must react again.
results[0].matches=()=>false;scan();assert.equal(stage.dataset.motionState,'incorrect');
console.log('Motion priorities: reaction survives speech events, resumes speech, reused feedback updates.');

assert.equal(resultEvents.length,2);assert.equal(resultEvents[0].detail.correct,true);assert.equal(resultEvents[1].detail.correct,false);console.log('Committed results are emitted once, including reused feedback nodes.');
