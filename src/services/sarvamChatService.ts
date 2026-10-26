import { EpisodeMetadata, PodcastConfig, ScriptLine } from '../types/podcast';

export interface SarvamScriptResponse {
  metadata: EpisodeMetadata;
  script: Omit<ScriptLine, 'id'>[];
}

export async function generatePodcastScriptWithSarvam(
  config: PodcastConfig,
  apiKey: string
): Promise<SarvamScriptResponse> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Sarvam API key is required. Please add your key in Settings or activate Demo Mode.');
  }

  const turnsTarget = config.duration === 1 ? '5 to 7 turns (approx 1 minute of spoken dialogue)' :
                      config.duration === 3 ? '12 to 15 turns (approx 3 minutes of spoken dialogue)' :
                      '18 to 22 turns (approx 5 minutes of spoken dialogue)';

  const prompt = `You are an elite podcast producer and scriptwriter for a top-charting tech & culture podcast called "EchoCast".
Your task is to write a dynamic, natural, conversational two-host podcast episode about: "${config.topic}".

HOST SPECIFICATIONS:
- Host 1 (${config.host1Name}): The lead anchor. Energetic, curious, introduces topics with punchy hooks, asks provocative questions.
- Host 2 (${config.host2Name}): The expert analyst. Sharp, witty, brings unexpected analogies, statistics, and counter-perspectives.

LANGUAGE REQUIREMENTS (STRICT):
- Target Language: ${config.languageName} (Language Code: ${config.language}).
- CRITICAL: Write the ENTIRE conversational script, episode title, tagline, synopsis, and key takeaways in the specified language!
  - If language is 'hi-IN' (Hindi): Write strictly in conversational Hindi (Devanagari script, e.g. "नमस्ते दोस्तों, आज के इस एपिसोड में...").
  - If language is 'ta-IN' (Tamil): Write strictly in natural spoken Tamil (Tamil script).
  - If language is 'te-IN' (Telugu): Write strictly in natural spoken Telugu (Telugu script).
  - If language is 'bn-IN' (Bengali): Write strictly in natural spoken Bengali (Bengali script).
  - If language is 'mr-IN' (Marathi): Write strictly in natural spoken Marathi (Marathi script).
  - If language is 'kn-IN' (Kannada): Write strictly in natural spoken Kannada (Kannada script).
  - If language is 'ml-IN' (Malayalam): Write strictly in natural spoken Malayalam (Malayalam script).
  - If language is 'gu-IN' (Gujarati): Write strictly in natural spoken Gujarati (Gujarati script).
  - If language is 'pa-IN' (Punjabi): Write strictly in natural spoken Punjabi (Gurmukhi script).
  - If language is 'en-IN' (Indian English): Write in fluent, natural Indian English with contemporary broadcast cadence.

PACING & RULES:
- Write exactly ${turnsTarget}.
- Alternate naturally between Host 1 and Host 2.
- Each line should be 1 to 3 spoken sentences.
- Do NOT include bracketed cues like [laughs] or [intro music].

OUTPUT FORMAT:
Respond ONLY with a valid, raw JSON object (strictly no markdown formatting, no backticks, no comments) adhering to this schema:
{
  "title": "A captivating, punchy episode title",
  "tagline": "A snappy one-sentence hook",
  "summary": "A 2-3 sentence engaging synopsis of the episode",
  "keyTakeaways": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "artworkPrompt": "A visual description for modern podcast album artwork",
  "script": [
    {
      "speaker": "Host 1",
      "speakerName": "${config.host1Name}",
      "text": "Opening hook dialogue..."
    },
    {
      "speaker": "Host 2",
      "speakerName": "${config.host2Name}",
      "text": "Engaging response dialogue..."
    }
  ]
}`;

  const payload = {
    model: 'sarvam-105b',
    messages: [
      {
        role: 'system',
        content: 'You are an AI podcast producer that outputs exclusively raw JSON objects adhering strictly to the user schema.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2800,
    apiKey: apiKey.trim(),
  };

  let rawContent = '';

  // 1. Try our Vercel Serverless Proxy endpoint first (bypasses browser CORS completely)
  try {
    const proxyResponse = await fetch('/api/sarvam-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify(payload),
    });

    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      rawContent = data.choices?.[0]?.message?.content || '';
    } else if (proxyResponse.status !== 404) {
      const errorJson = await proxyResponse.json().catch(() => ({}));
      const message = errorJson.message || errorJson.error || errorJson.detail || `Sarvam Chat error ${proxyResponse.status}`;
      throw new Error(message);
    }
  } catch (proxyErr: any) {
    if (proxyErr.message && !proxyErr.message.includes('404') && !proxyErr.message.includes('Failed to fetch')) {
      throw proxyErr;
    }
    // Proxy not available (e.g. static dev server), continue to direct call
  }

  // 2. Direct call to Sarvam AI REST endpoint if proxy was not used
  if (!rawContent) {
    const directResponse = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: payload.messages,
        temperature: 0.7,
        max_tokens: 2800,
      }),
    });

    if (!directResponse.ok) {
      const errorData = await directResponse.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Sarvam Chat API returned HTTP ${directResponse.status}`);
    }

    const data = await directResponse.json();
    rawContent = data.choices?.[0]?.message?.content || '';
  }

  if (!rawContent) {
    throw new Error('Sarvam AI returned an empty response. Please verify your query or API key.');
  }

  // Clean backticks or markdown code fences if model enclosed them
  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```$/i, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    // Attempt to extract JSON from surrounding text if any
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(cleanJson.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error('Failed to parse structured script from Sarvam LLM response.');
    }
  }

  return {
    metadata: {
      title: parsed.title || config.topic,
      tagline: parsed.tagline || 'An AI-powered conversational deep dive with Sarvam AI',
      summary: parsed.summary || 'An insightful exploration of ' + config.topic,
      keyTakeaways: parsed.keyTakeaways || [],
      artworkPrompt: parsed.artworkPrompt || `Podcast cover artwork for ${config.topic}`,
    },
    script: (parsed.script || []).map((line: any) => ({
      speaker: (line.speaker === 'Host 2' ? 'Host 2' : 'Host 1') as 'Host 1' | 'Host 2',
      speakerName: line.speakerName || (line.speaker === 'Host 2' ? config.host2Name : config.host1Name),
      text: (line.text || '').trim(),
    })),
  };
}
