'use strict';

module.exports = function audioStatus(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  const enabled = String(process.env.ELX_TTS_ENABLED || '').trim() === 'true' && Boolean(String(process.env.ELEVENLABS_API_KEY || '').trim());
  const femaleConfigured = enabled && Boolean(String(process.env.ELEVENLABS_VOICE_FEMALE || '').trim());
  const maleConfigured = enabled && Boolean(String(process.env.ELEVENLABS_VOICE_MALE || '').trim());
  return res.status(200).json({
    configured: femaleConfigured || maleConfigured,
    femaleConfigured,
    maleConfigured
  });
};
