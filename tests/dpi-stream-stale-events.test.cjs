const test=require('node:test');
const assert=require('node:assert/strict');
const {createPlayer}=require('../dpi-r18.1/voz-e-mascotes/dpi-speech-stream.js');
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve()};
test('late playing from Tom cannot reset Fernanda caption after turn transition',async()=>{
 const turns=['Tom apresenta.','Fernanda explica.'],events=[];
 const audio={pause(){},play(){this.onplaying();return Promise.resolve()}};
 const player=createPlayer({synthesize:()=>Promise.resolve({size:1}),createURL:()=>'',revokeURL(){},chunker:()=>turns});
 const task=player.speak('dupla',{audio,onChunkStart:(text,a,index)=>events.push(index)});
 await flush();const latePlaying=audio.onplaying,lateProgress=audio.ontimeupdate;
 audio.onended();await flush();assert.deepEqual(events,[0,1]);
 latePlaying();lateProgress();assert.deepEqual(events,[0,1]);
 audio.onended();await task;
});
test('buffering playing event does not duplicate the same turn',async()=>{
 let starts=0;const audio={pause(){},play(){this.onplaying();return Promise.resolve()}};
 const player=createPlayer({synthesize:()=>Promise.resolve({size:1}),createURL:()=>'',revokeURL(){}});
 const task=player.speak('Pergunta curta.',{audio,onChunkStart:()=>starts++});await flush();audio.onplaying();assert.equal(starts,1);audio.onended();await task;
});
