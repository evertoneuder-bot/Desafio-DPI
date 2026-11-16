const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('dpi-r18.1/ABRA-ESTA-PREVIA.html', 'utf8');
const notify = html.match(/function notify\(type,detail\)\{[^\n]+/)[0];
function emitter() {
  const events = [];
  class CustomEvent { constructor(type, options) { this.type=type; Object.assign(this, options); } }
  const window = { CustomEvent, dispatchEvent: e => events.push(e) };
  const document = { dispatchEvent: e => events.push(e) };
  return { events, emit: new Function('window','document','CustomEvent','generation', 'let speechEventSerial=6,activeSpeechEventId=null;'+notify+';return notify;')(window,document,CustomEvent,7) };
}
test('speech events identify each playback turn for late-event rejection', () => {
  const {events,emit}=emitter(); emit('elx-speech-start',{persona:'male',text:'Pergunta'});
  assert.equal(events[0].detail.speechId,7);
});
test('speech events reach document captions and window mascots through one bubbling event', () => {
  const {events,emit}=emitter(); emit('elx-speech-end',{speechId:6});
  assert.equal(events.length,1); assert.equal(events[0].bubbles,true); assert.equal(events[0].detail.speechId,6);
});
const vm = require('node:vm');
function guardedBus() {
  const window = new EventTarget(); window.ELXAssistentes = {};
  const sourcePath='dpi-r18.1/voz-e-mascotes/dpi-speech-events.js';
  vm.runInNewContext(fs.existsSync(sourcePath)?fs.readFileSync(sourcePath,'utf8'):'', {window, Number});
  const seen=[];
  for(const type of ['elx-speech-start','elx-speech-progress','elx-speech-end','elx-speech-paused']) window.addEventListener(type,e=>seen.push([type,e.detail]));
  const emit=(type,detail)=>{const e=new Event(type);e.detail=detail;window.dispatchEvent(e)};
  return {seen,emit};
}
test('late starts, progress and ends cannot replace or stop the current narrator', () => {
  const {seen,emit}=guardedBus();
  emit('elx-speech-start',{speechId:2,persona:'male'});
  emit('elx-speech-start',{speechId:4,persona:'female'});
  emit('elx-speech-end',{speechId:2});
  emit('elx-speech-progress',{speechId:2,charIndex:30});
  emit('elx-speech-start',{speechId:2,persona:'male'});
  emit('elx-speech-end'); // legacy duplicate audio listener
  assert.equal(seen.length,2);
  emit('elx-speech-progress',{speechId:4,charIndex:8});
  emit('elx-speech-end',{speechId:4});
  emit('elx-speech-start',{speechId:4}); // already ended
  assert.equal(seen.length,4);
});
test('buffering playing events do not restart captions and mute closes one active speech', () => {
  const {seen,emit}=guardedBus();
  emit('elx-speech-start',{speechId:5});emit('elx-speech-start',{speechId:5});
  emit('elx-speech-paused',{speechId:5});emit('elx-speech-end',{speechId:5});
  assert.deepEqual(seen.map(x=>x[0]),['elx-speech-start','elx-speech-paused']);
  emit('elx-speech-start',{speechId:6});assert.equal(seen.length,3);
});
test('legacy recording listeners cannot change persona behind the assistant owner',()=>{
  const from=html.indexOf('  let currentAudio = null;');
  const to=html.indexOf("  window.addEventListener('elx-speech-start'",from);
  const audio=new EventTarget(), stage={dataset:{activePersona:'female'}};
  new Function('window','document','stage',html.slice(from,to))({ELXAssistentes:{},dispatchEvent(){}},{getElementById:id=>id==='voiceEverton'?audio:null},stage);
  audio.dispatchEvent(new Event('play'));
  assert.equal(stage.dataset.activePersona,'female');
});
test('a completed device utterance cannot restart animation or invoke completion twice',()=>{
  const from=html.indexOf('function sayDevice('),to=html.indexOf('\nfunction sayResolved',from);
  const events=[];let utterance,done=0;
  class Utterance{constructor(text){this.text=text;utterance=this}}
  const sayDevice=new Function('window','document','SpeechSynthesisUtterance','notify',`
    let generation=0,started=false,introStarted=false,active=null,speechState=null,restoreVolume=null,deviceSpeechCleanup=null,introSpoken=false;
    const enabled=true,persona='male',speed=1,volume=1,music=null;
    const synth={speak(){}},stop=()=>{generation++},duck=()=>{},preferred=()=>null,available=()=>[{}];
    ${html.slice(from,to)}; return sayDevice;
  `)({SpeechSynthesisUtterance:Utterance},{getElementById:()=>null},Utterance,(type)=>events.push(type));
  sayDevice('Pergunta','male',false,()=>done++);
  utterance.onstart();utterance.onend();utterance.onstart();utterance.onend();
  assert.equal(done,1);assert.deepEqual(events,['elx-speech-start','elx-speech-end']);
});

test('two personas in one speech generation receive distinct event identities',()=>{
 const {events,emit}=emitter();emit('elx-speech-start',{persona:'male'});emit('elx-speech-start',{persona:'female'});emit('elx-speech-end');
 assert.deepEqual(events.map(e=>e.detail.speechId),[7,8,8]);
});
