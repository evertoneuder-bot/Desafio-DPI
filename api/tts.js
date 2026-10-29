'use strict';

const MAX_TEXT_LENGTH = 1000;
const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const PROVIDER_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
const SUBSCRIPTION_URL = 'https://api.elevenlabs.io/v1/user/subscription';

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
  if (!host) return false;
  try { return new URL(origin).host.toLowerCase() === String(host).toLowerCase(); }
  catch { return false; }
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

module.exports = async function tts(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method-not-allowed' });
  }

  if (!sameOrigin(req)) return json(res, 403, { error: 'origin-not-allowed' });

  const body = readBody(req);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const gender = body?.gender;
  if (!text) return json(res, 400, { error: 'text-required' });
  if (text.length > MAX_TEXT_LENGTH) return json(res, 413, { error: 'text-too-long' });
  if (gender !== 'female' && gender !== 'male') return json(res, 400, { error: 'invalid-voice' });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env[gender === 'female' ? 'ELEVENLABS_VOICE_FEMALE' : 'ELEVENLABS_VOICE_MALE'];
  if (process.env.ELX_TTS_ENABLED !== 'true' || !apiKey || !voiceId) {
    return json(res, 503, { error: 'tts-key-not-configured' });
  }

  const modelId = process.env.ELEVENLABS_TTS_MODEL || 'eleven_multilingual_v2';
  const url = `${PROVIDER_URL}${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    // Never allow usage-based overages. Only request speech when the provider
    // confirms that overages are disabled and the included character balance
    // can cover this utterance. The text-length check is deliberately
    // conservative for models that charge fewer credits per character.
    const subscriptionResponse = await fetch(SUBSCRIPTION_URL, {
      method: 'GET',
      headers: { 'xi-api-key': apiKey, 'Accept': 'application/json' },
      signal: controller.signal
    });
    if (!subscriptionResponse.ok) {
      const providerStatus = Number(subscriptionResponse.status) || 0;
      const error = providerStatus === 401 ? 'provider-auth-failed'
        : providerStatus === 403 ? 'provider-permission-denied'
        : providerStatus === 402 || providerStatus === 429 ? 'provider-quota-or-rate-limit'
        : 'provider-access-failed';
      // Report only the status category; never expose the provider's response
      // body or account diagnostics.
      return json(res, 502, { error, providerStatus });
    }
    const subscription = await subscriptionResponse.json().catch(() => null);
    const overageLimit = subscription?.max_credit_limit_extension;
    const characterCount = Number(subscription?.character_count);
    const characterLimit = Number(subscription?.character_limit);
    if (Number(overageLimit) !== 0 || !Number.isFinite(characterCount) ||
        !Number.isFinite(characterLimit) || characterLimit <= 0 ||
        characterCount + text.length > characterLimit) {
      return json(res, 429, { error: 'provider-quota-or-rate-limit' });
    }

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }),
      signal: controller.signal
    });

    if (!upstream.ok) {
      const providerStatus = Number(upstream.status) || 0;
      const error = providerStatus === 401 ? 'provider-auth-failed'
        : providerStatus === 403 ? 'provider-permission-denied'
        : providerStatus === 402 || providerStatus === 429 ? 'provider-quota-or-rate-limit'
        : providerStatus === 400 || providerStatus === 422 ? 'provider-model-or-voice-invalid'
        : 'provider-access-failed';
      // Return only a stable category and HTTP status. Never forward the
      // provider's raw error body, which can contain sensitive diagnostics.
      return json(res, 502, { error, providerStatus });
    }
    const contentType = upstream.headers.get('content-type') || '';
    const declaredBytes = Number(upstream.headers.get('content-length') || 0);
    if (!contentType.toLowerCase().startsWith('audio/') || declaredBytes > MAX_AUDIO_BYTES) {
      return json(res, 502, { error: 'invalid-provider-response' });
    }
    const audio = Buffer.from(await upstream.arrayBuffer());
    if (!audio.length || audio.length > MAX_AUDIO_BYTES) {
      return json(res, 502, { error: 'invalid-provider-response' });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', String(audio.length));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(audio);
  } catch {
    return json(res, 502, { error: 'provider-access-failed' });
  } finally {
    clearTimeout(timer);
  }
};
