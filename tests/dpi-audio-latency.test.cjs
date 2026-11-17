'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createPlayback } = require('../dpi-r18.1/voz-e-mascotes/dpi-audio-playback.js');
class FakeAudio {
  constructor(){this.listeners={};this.paused=false;}
  setAttribute(){}
  addEventListener(event,listener){(this.listeners[event] ||= []).push(listener);}
  fire(event){for(const listener of this.listeners[event]||[])listener();}
  play(){this.fire('canplay');this.fire('playing');return Promise.resolve();}
  pause(){this.paused=true;}
}
test('records independent non-sensitive timing for subsequent audio turns',async()=>{
  const audio=new FakeAudio();
  const p=createPlayback(()=>audio);
  await p.play('blob:local-one',1,1);
  await p.play('blob:local-two',1,1);
  const measurements=p.timingSnapshot();
  assert.deepEqual(measurements.map(x=>x.turn),[1,2]);
  assert.deepEqual(measurements.map(x=>x.persona),['female','female']);
  assert(measurements.every(x=>x.playingMs>=0&&x.canplayMs>=0));
  assert(measurements.every(x=>!('src' in x)&&!('text' in x)));
  p.cancel();
  assert.equal(p.timingSnapshot().length,2);
});

const fs = require('node:fs');
const vm = require('node:vm');
test('correlates safe TTS Server-Timing metrics with browser playback turn',async()=>{
  const listeners={};
  const fakeURL={
    createObjectURL:blob=>'blob:private-audio',
    revokeObjectURL:()=>{}
  };
  const fakeWindow={
    document:{body:{dataset:{}},getElementById:()=>null,addEventListener(){}},
    URL:fakeURL,location:{href:'https://preview.test/'},
    performance:{now:(()=>{let n=100;return()=>++n})()},
    addEventListener:(name,fn)=>(listeners[name] ||= []).push(fn),
    dispatchEvent(){},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail}},
    Audio:FakeAudio,ELXAssistentes:{isEnabled:()=>false},
    fetch:async()=>({status:200,headers:{get:()=> 'subscription;dur=4.2, synthesis_headers;dur=850, buffer;dur=12.5'},blob:async()=>new Blob(['audio'])})
  };
  const source=fs.readFileSync(require.resolve('../dpi-r18.1/voz-e-mascotes/dpi-audio-playback.js'),'utf8');
  vm.runInNewContext(source,{window:fakeWindow,URL,Date,Promise,WeakMap,Map,Set,Math,Number,String,Object,JSON});
  const response=await fakeWindow.fetch('/api/tts',{method:'POST'});
  const blob=await response.blob();
  const url=fakeWindow.URL.createObjectURL(blob);
  const playback=fakeWindow.ELXVoicePlayback;
  await playback.play(url,1,1);
  const [turn]=playback.timingSnapshot();
  assert.equal(turn.turn,1);
  assert.equal(turn.api.status,200);
  assert.equal(turn.attribution.serverReportedMs,866.7);
  assert(turn.attribution.networkAndServerMs>=0);
  assert.equal(turn.attribution.playbackAfterReadyMs,turn.playingMs);
  assert.equal(turn.attribution.totalRequestToPlayingMs,
    Math.round((turn.api.requestToPlaybackMs+turn.playingMs)*10)/10);
  assert(!('text' in turn.attribution)&&!('url' in turn.attribution));

  assert.deepEqual({...turn.api.serverTiming},{subscription:4.2,synthesis_headers:850,buffer:12.5});
  assert(turn.api.responseMs>=0&&turn.api.blobReadMs>=0);
  assert(!('src' in turn)&&!('text' in turn)&&!('url' in turn.api));
  assert.equal(JSON.parse(fakeWindow.document.body.dataset.dpiAudioTiming)[0].api.serverTiming.synthesis_headers,850);
});