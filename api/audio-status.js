'use strict';

module.exports = function audioStatus(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  const enabled = process.env.ELX_TTS_ENABLED === 'true' && Boolean(process.env.ELEVENLABS_API_KEY);
  const femaleConfigured = enabled && Boolean(process.env.ELEVENLABS_VOICE_FEMALE);
  const maleConfigured = enabled && Boolean(process.env.ELEVENLABS_VOICE_MALE);
  return res.status(200).json({
    configured: femaleConfigured || maleConfigured,
    femaleConfigured,
    maleConfigured
  });
};
