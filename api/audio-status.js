'use strict';

module.exports = function audioStatus(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  const activation = String(process.env.ELX_TTS_ENABLED ?? process.env.ELX_TTS_ATIVADO ?? '').trim().toLowerCase();
  const apiKey = String(process.env.ELEVENLABS_API_KEY || '').trim();
  const enabled = ['true', '1', 'sim', 'on'].includes(activation) && Boolean(apiKey);
  const femaleVoice = process.env.ELEVENLABS_VOICE_FEMALE || process.env.ELEVENLABS_VOZ_FEMININA || '';
  const maleVoice = process.env.ELEVENLABS_VOICE_MALE || process.env.ELEVENLABS_VOZ_MASCULINA || '';
  const femaleConfigured = enabled && Boolean(String(femaleVoice).trim());
  const maleConfigured = enabled && Boolean(String(maleVoice).trim());
  return res.status(200).json({
    configured: femaleConfigured || maleConfigured,
    femaleConfigured,
    maleConfigured
  });
};
