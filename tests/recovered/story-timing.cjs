const assert=require('node:assert/strict');
const fs=require('node:fs');
const root='../../';
const timing=require(root+'dpi-r18.1/voz-e-mascotes/dpi-speech-timing.js');
const ignored={closest:()=>true},question={closest:()=>null},container={};
assert.equal(timing.relevant([{target:ignored}],container),false);
assert.equal(timing.relevant([{target:{nodeType:3,parentElement:ignored}}],container),false);
assert.equal(timing.relevant([{target:question}],container),true);
(async()=>{
const load=async path=>import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(require('node:path').resolve(__dirname,root+path),'utf8')).toString('base64'));
const {CharacterStateMachine,TRIGGERS,STATES}=await load('assets/fsm/character-state-machine.js');
const actor=new CharacterStateMachine({persona:'Tom',random:()=>.5});
actor.trigger(TRIGGERS.NEW_QUESTION,{questionId:1});actor.setBoolean('speaking',true);
for(let i=0;i<150;i++)actor.update(.1);
assert.equal(actor.questionElapsed,0);assert.equal(actor.state,STATES.IDLE_QUIZ);
actor.setBoolean('speaking',false);for(let i=0;i<102;i++)actor.update(.1);
assert.equal(actor.state,STATES.THINKING);
let renderer=fs.readFileSync(require('node:path').resolve(__dirname,root+'assets/fsm/sprite-renderer.js'),'utf8').replace(/^import .*\n/,'');
const {SpriteRenderer}=await import('data:text/javascript;base64,'+Buffer.from(renderer).toString('base64'));
const clip={src:'sprite',stageWidth:400,stageHeight:480,frames:[{x:0,y:0,w:400,h:480,anchorX:200,anchorY:465,duration:1}]};
const draws=[];for(const persona of ['male','female']){let call;const canvas={dataset:{persona},width:800,height:960,getContext:()=>({drawImage:(...args)=>call=args})};const r=new SpriteRenderer(canvas,{IDLE_QUIZ:clip});r.images.set('sprite',{});r.drawClip('IDLE_QUIZ',0,1);draws.push(call);}
assert.equal(draws[1][7],draws[0][7]/2);assert.equal(draws[1][8],draws[0][8]/2);
assert.equal(draws[1][6]+465,draws[0][6]+930);
console.log('OK: legendas não adiam fala; reflexão aguarda silêncio; Fernanda mede 50% com base dos pés preservada.');
})().catch(e=>{console.error(e);process.exitCode=1});
