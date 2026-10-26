export default async function handler(req: any, res: any) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api-subscription-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, language_code, target_language_code, speaker, pace, model, apiKey } = req.body || {};
  const token = apiKey || req.headers['api-subscription-key'] || process.env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY;

  if (!token) {
    return res.status(400).json({
      error: 'Missing Sarvam API Key. Please provide it in Settings or configure VITE_SARVAM_API_KEY in Vercel.',
    });
  }

  const cleanText = (text || '').replace(/[*#_~`[\]()]/g, '').trim();
  const lang = language_code || target_language_code || 'en-IN';

  const payload = {
    text: cleanText,
    inputs: [cleanText],
    language_code: lang,
    target_language_code: lang,
    speaker: speaker || 'shubh',
    model: model || 'bulbul:v3',
    pace: pace ? Math.max(0.7, Math.min(1.5, Number(pace))) : 1.0,
    speech_sample_rate: 22050,
    output_audio_codec: 'wav',
    enable_preprocessing: true,
  };

  try {
    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': String(token).trim(),
      },
      body: JSON.stringify(payload),
    });

    if (!sarvamResponse.ok) {
      const errorJson = await sarvamResponse.json().catch(() => ({}));
      return res.status(sarvamResponse.status).json(errorJson);
    }

    const data = await sarvamResponse.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Sarvam serverless proxy error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to communicate with Sarvam AI endpoint',
    });
  }
}
