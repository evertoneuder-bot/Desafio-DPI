'use strict';
exports.patchEngine=source=>{
 const before='k = await f(`${u}/${n}`, m), y = await _.InferenceSession.create(await k.arrayBuffer())';
 if(!source.includes(before))throw Error('Piper inference source changed');
 return source.replace('let h, _;','let h, _; const dpiSessions = Object.create(null);').replace(before,'y = await (dpiSessions[e.voiceId] ||= (async()=>{const k=await f(`${u}/${n}`,m);return _.InferenceSession.create(await k.arrayBuffer())})().catch(error=>{delete dpiSessions[e.voiceId];throw error}))');
};
