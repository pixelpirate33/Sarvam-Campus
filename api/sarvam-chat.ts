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

  const { messages, model, temperature, max_tokens, apiKey } = req.body || {};
  const token = apiKey || req.headers['api-subscription-key'] || process.env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY;

  if (!token) {
    return res.status(400).json({
      error: 'Missing Sarvam API Key. Please provide your Sarvam key in Settings or Vercel environment variables.',
    });
  }

  // Candidate models: sarvam-105b, sarvam-105b-conversations, sarvam-2b
  const requestedModel = model || 'sarvam-105b';

  const candidateEndpoints = [
    { url: 'https://api.sarvam.ai/v1/chat/completions', model: requestedModel },
    { url: 'https://api.sarvam.ai/v1/chat/completions', model: 'sarvam-105b-conversations' },
    { url: 'https://api.sarvam.ai/v2/chat/completions', model: 'sarvam-105b' },
  ];

  let lastError = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': String(token).trim(),
        },
        body: JSON.stringify({
          model: endpoint.model,
          messages: messages,
          temperature: temperature ?? 0.7,
          max_tokens: max_tokens ?? 2500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      const errJson = await response.json().catch(() => ({}));
      lastError = errJson;
      // If 401 Unauthorized, don't keep trying alternative endpoints
      if (response.status === 401) {
        return res.status(401).json(errJson);
      }
    } catch (err: any) {
      lastError = { error: err.message || 'Network error' };
    }
  }

  return res.status(500).json(lastError || { error: 'Failed to communicate with Sarvam Chat API' });
}
