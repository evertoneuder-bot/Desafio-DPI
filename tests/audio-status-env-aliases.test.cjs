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
  } finally { global.fetch = originalFetch; }
}));
