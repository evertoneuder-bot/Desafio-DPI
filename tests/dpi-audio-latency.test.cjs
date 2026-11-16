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
