const test = require('node:test');
const assert = require('node:assert/strict');
const audioStatus = require('../api/audio-status');
const tts = require('../api/tts');
const envKeys = ['ELX_TTS_ENABLED','ELX_TTS_ATIVADO','ELEVENLABS_API_KEY','ELEVENLABS_VOICE_FEMALE','ELEVENLABS_VOICE_MALE','ELEVENLABS_VOZ_FEMININA','ELEVENLABS_VOZ_MASCULINA','ELEVENLABS_TTS_MODEL'];
function withEnv(values, callback) {
  const original = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  Object.assign(process.env, values);
  return Promise.resolve().then(callback).finally(() => {
    for (const key of envKeys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });
}
function response() {
  return { headers: {}, statusCode: 200, body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; }
  };
}
test('audio status accepts the Portuguese Vercel variable names', () => withEnv({
  ELX_TTS_ATIVADO: 'true', ELEVENLABS_API_KEY: 'test-key',
  ELEVENLABS_VOZ_FEMININA: 'female-id', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, () => {
  const res = response(); audioStatus({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { configured: true, femaleConfigured: true, maleConfigured: true });
}));
test('audio status remains disabled without the explicit activation flag', () => withEnv({
  ELEVENLABS_API_KEY: 'test-key',
  ELEVENLABS_VOZ_FEMININA: 'female-id', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, () => {
  const res = response(); audioStatus({ method: 'GET' }, res);
  assert.deepEqual(res.body, { configured: false, femaleConfigured: false, maleConfigured: false });
}));
test('TTS accepts Portuguese voice aliases and synthesizes only after quota preflight', () => withEnv({
  ELX_TTS_ATIVADO: '1', ELEVENLABS_API_KEY: 'test-key',
  ELEVENLABS_VOZ_FEMININA: 'female-id', ELEVENLABS_TTS_MODEL: 'eleven_multilingual_v2'
}, async () => {
  const originalFetch = global.fetch, calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/user/subscription')) return { ok: true, json: async () => ({ max_credit_limit_extension: 0, character_count: 10, character_limit: 1000 }) };
    return { ok: true, headers: { get: name => name === 'content-type' ? 'audio/mpeg' : name === 'content-length' ? '3' : null }, arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer };
  };
  try {
    const res = response();
    await tts({ method: 'POST', headers: {}, body: { text: 'Pergunta curta', gender: 'female' } }, res);
    assert.equal(res.statusCode, 200); assert.equal(res.headers['Content-Type'], 'audio/mpeg');
    assert.match(res.headers['Server-Timing'], /^subscription;dur=\d+, synthesis_headers;dur=\d+, buffer;dur=\d+$/);
    assert.doesNotMatch(res.headers['Server-Timing'], /test-key|female-id|Pergunta curta/);
    assert.equal(calls.length, 2); assert.match(calls[1].url, /female-id/);
  } finally { global.fetch = originalFetch; }
}));
test('TTS refuses exhausted quota without calling synthesis', () => withEnv({
  ELX_TTS_ATIVADO: 'true', ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, async () => {
  const originalFetch = global.fetch, calls = [];
  global.fetch = async url => { calls.push(String(url)); return { ok: true, json: async () => ({ max_credit_limit_extension: 1, character_count: 100, character_limit: 1000 }) }; };
  try {
    const res = response();
    await tts({ method: 'POST', headers: {}, body: { text: 'Pergunta curta', gender: 'male' } }, res);
    assert.equal(res.statusCode, 429);
    assert.deepEqual(res.body, { error: 'provider-quota-or-rate-limit' }); assert.equal(calls.length, 1);
    assert.match(res.headers['Server-Timing'], /^subscription;dur=\d+$/);
  } finally { global.fetch = originalFetch; }
}));

test('TTS reports provider failure timings without private data', () => withEnv({
  ELX_TTS_ATIVADO: 'true', ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async url => {
    calls++;
    if (String(url).includes('/user/subscription')) {
      return { ok: true, json: async () => ({ max_credit_limit_extension: 0, character_count: 3, character_limit: 1000 }) };
    }
    return { ok: false, status: 429 };
  };
  try {
    const res = response();
    await tts({ method: 'POST', headers: {}, body: { text: 'Olá', gender: 'male' } }, res);
    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { error: 'provider-quota-or-rate-limit', providerStatus: 429 });
    assert.match(res.headers['Server-Timing'], /^subscription;dur=\d+, synthesis_headers;dur=\d+$/);
    assert.doesNotMatch(res.headers['Server-Timing'], /test-key|male-id|Olá/);
    assert.equal(calls, 2);
  } finally { global.fetch = originalFetch; }
}));
test('TTS reports subscription preflight failures without synthesis', () => withEnv({
  ELX_TTS_ATIVADO: 'true', ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return { ok: false, status: 429 }; };
  try {
    const res = response();
    await tts({ method: 'POST', headers: {}, body: { text: 'Olá', gender: 'male' } }, res);
    assert.equal(res.statusCode, 502);
    assert.match(res.headers['Server-Timing'], /^subscription;dur=\d+$/);
    assert.equal(calls, 1);
  } finally { global.fetch = originalFetch; }
}));

test('TTS fails closed if subscription omits overage policy without synthesizing', () => withEnv({
  ELX_TTS_ATIVADO: 'true', ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_VOZ_MASCULINA: 'male-id'
}, async () => {
  const originalFetch = global.fetch;
  let requests = 0;
  global.fetch = async () => {
    requests++;
    return { ok: true, json: async () => ({ character_count: 10, character_limit: 1000 }) };
  };
  try {
    const res = response();
    await tts({method:'POST', headers:{}, body:{text:'Olá', gender:'male'}}, res);
    assert.equal(res.statusCode,429);
    assert.deepEqual(res.body,{error:'provider-quota-or-rate-limit'});
    assert.equal(requests,1);
  } finally { global.fetch = originalFetch; }
}));

test('TTS rejects null and missing credit usage rather than treating it as free balance', () => withEnv({
  ELX_TTS_ATIVADO:'true', ELEVENLABS_API_KEY:'test-key', ELEVENLABS_VOZ_MASCULINA:'male-id'
}, async () => {
  const originalFetch = global.fetch;
  try {
    for (const current of [null, undefined, '', -1]) {
      let requests = 0;
      global.fetch = async () => {
        requests++;
        return { ok:true, json: async () => ({
          max_credit_limit_extension:0, character_count:current, character_limit:1000
        }) };
      };
      const res = response();
      await tts({method:'POST',headers:{},body:{text:'Olá',gender:'male'}},res);
      assert.equal(res.statusCode,429);
      assert.deepEqual(res.body,{error:'provider-quota-or-rate-limit'});
      assert.equal(requests,1);
    }
  } finally {global.fetch=originalFetch;}
}));
test('TTS rejects missing total balance rather than allowing synthesis', () => withEnv({
  ELX_TTS_ATIVADO:'true', ELEVENLABS_API_KEY:'test-key', ELEVENLABS_VOZ_MASCULINA:'male-id'
}, async () => {
  const originalFetch = global.fetch;
  try {
    for (const total of [null, undefined, '']) {
      let requests=0;
      global.fetch = async () => { requests++; return {ok:true,json:async()=>({
        max_credit_limit_extension:0,character_count:5,character_limit:total
      })}; };
      const res=response();
      await tts({method:'POST',headers:{},body:{text:'Olá',gender:'male'}},res);
      assert.equal(res.statusCode,429);
      assert.equal(requests,1);
    }
  } finally {global.fetch=originalFetch;}
}));

test('TTS Server-Timing separates credit preflight, synthesis response and audio buffering', () => withEnv({
  ELX_TTS_ATIVADO:'true', ELEVENLABS_API_KEY:'test-key', ELEVENLABS_VOZ_MASCULINA:'male-id'
}, async () => {
  const originalFetch=global.fetch, originalNow=Date.now;
  let ms=1000;
  Date.now=()=>ms;
  global.fetch=async url => {
    if (String(url).includes('/user/subscription')) {
      ms+=40;
      return {ok:true,json:async()=>{ms+=10;return {
        max_credit_limit_extension:0,character_count:2,character_limit:1000
      };}};
    }
    ms+=120;
    return {ok:true,headers:{get:key=>key==='content-type'?'audio/mpeg':key==='content-length'?'3':null},
      arrayBuffer:async()=>{ms+=70;return Uint8Array.from([1,2,3]).buffer;}};
  };
  try {
    const res=response();
    await tts({method:'POST',headers:{},body:{text:'Olá',gender:'male'}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.headers['Server-Timing'],'subscription;dur=50, synthesis_headers;dur=120, buffer;dur=70');
    assert.doesNotMatch(res.headers['Server-Timing'],/test-key|male-id|Olá/);
  } finally {Date.now=originalNow;global.fetch=originalFetch;}
}));

test('TTS rejects whitespace-only subscription fields without invoking synthesis', () => withEnv({
  ELX_TTS_ATIVADO:'true', ELEVENLABS_API_KEY:'test-key', ELEVENLABS_VOZ_MASCULINA:'male-id'
}, async () => {
  const originalFetch = global.fetch;
  try {
    for (const field of ['max_credit_limit_extension','character_count','character_limit']) {
      let calls = 0;
      global.fetch = async () => {
        calls++;
        return {ok:true,json:async()=>({
          max_credit_limit_extension:0,
          character_count:10,
          character_limit:1000,
          [field]:'   '
        })};
      };
      const res = response();
      await tts({method:'POST', headers:{}, body:{text:'Olá',gender:'male'}},res);
      assert.equal(res.statusCode,429);
      assert.deepEqual(res.body,{error:'provider-quota-or-rate-limit'});
      assert.equal(calls,1);
    }
  } finally {global.fetch=originalFetch;}
}));
