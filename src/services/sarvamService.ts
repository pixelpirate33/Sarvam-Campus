import { ScriptLine, PodcastConfig } from '../types/podcast';

export interface SarvamTtsRequest {
  inputs: string[];
  target_language_code: string;
  speaker: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  speech_sample_rate?: number;
  enable_preprocessing?: boolean;
  model?: string;
}

export interface SarvamTtsResponse {
  audios: string[]; // Base64 encoded audio strings
}

/**
 * Validates Sarvam AI API key by making a minimal test call
 */
export async function testSarvamApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim() === '') return false;

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify({
        inputs: ['Hello'],
        target_language_code: 'en-IN',
        speaker: 'shubh',
        model: 'bulbul:v1'
      })
    });
    return response.ok;
  } catch (err) {
    console.warn('Sarvam API test failed', err);
    return false;
  }
}

/**
 * Synthesizes a single line of speech via Sarvam AI Bulbul endpoint
 * Routes through the /api/sarvam-tts serverless proxy on Vercel to prevent CORS blocks,
 * and falls back to direct API if running in an environment with direct proxy support.
 */
export async function synthesizeLineWithSarvam(
  text: string,
  speakerId: string,
  languageCode: string,
  pace: number,
  apiKey: string,
  retryCount = 2
): Promise<string> {
  const sanitizedText = text.replace(/[*#_~`[\]()]/g, '').trim();

  const payload = {
    text: sanitizedText,
    inputs: [sanitizedText],
    language_code: languageCode,
    target_language_code: languageCode,
    speaker: speakerId,
    pitch: 0,
    pace: Math.max(0.7, Math.min(1.5, pace)),
    loudness: 1.5,
    speech_sample_rate: 22050,
    output_audio_codec: 'wav',
    enable_preprocessing: true,
    model: 'bulbul:v3',
    apiKey: apiKey.trim(),
  };

  // 1. Try our Vercel Serverless Proxy endpoint first (bypasses browser CORS completely)
  try {
    const proxyResponse = await fetch('/api/sarvam-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify(payload),
    });

    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      if (data.audios && data.audios.length > 0 && data.audios[0]) {
        return data.audios[0];
      }
    } else if (proxyResponse.status !== 404) {
      const errorJson = await proxyResponse.json().catch(() => ({}));
      const message = errorJson.message || errorJson.error || errorJson.detail || `Sarvam TTS proxy error ${proxyResponse.status}`;
      throw new Error(message);
    }
  } catch (proxyErr: any) {
    if (proxyErr.message && !proxyErr.message.includes('404') && !proxyErr.message.includes('Failed to fetch')) {
      throw proxyErr;
    }
    // Proxy not available (e.g. static dev server), continue to direct call
  }

  // 2. Direct call to Sarvam AI REST endpoint
  const endpoint = 'https://api.sarvam.ai/text-to-speech';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429 && retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return synthesizeLineWithSarvam(text, speakerId, languageCode, pace, apiKey, retryCount - 1);
      }
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.message || errorJson.detail || errorJson.error || `Sarvam TTS returned HTTP ${response.status}`);
    }

    const data: SarvamTtsResponse = await response.json();
    if (!data.audios || data.audios.length === 0 || !data.audios[0]) {
      throw new Error('Sarvam API returned no audio content');
    }

    return data.audios[0];
  } catch (err: unknown) {
    if (retryCount > 0 && !(err instanceof Error && err.message.includes('401'))) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return synthesizeLineWithSarvam(text, speakerId, languageCode, pace, apiKey, retryCount - 1);
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Synthesizes an entire script iteratively, dispatching each host line to their configured speaker.
 * Provides real-time progress callbacks for the UI.
 */
export async function synthesizeFullScript(
  script: ScriptLine[],
  config: PodcastConfig,
  apiKey: string,
  onProgress?: (current: number, total: number, speakerName: string) => void
): Promise<ScriptLine[]> {
  const result: ScriptLine[] = [];
  const total = script.length;

  for (let i = 0; i < total; i++) {
    const line = script[i];
    const isHost1 = line.speaker === 'Host 1';
    const speakerId = isHost1 ? config.host1Speaker : config.host2Speaker;
    const speakerName = isHost1 ? config.host1Name : config.host2Name;

    if (onProgress) {
      onProgress(i + 1, total, speakerName);
    }

    // Call Sarvam API
    const base64Audio = await synthesizeLineWithSarvam(
      line.text,
      speakerId,
      config.language,
      config.pace,
      apiKey
    );

    result.push({
      ...line,
      speakerName,
      audioBase64: base64Audio
    });

    // Polite delay between requests to prevent rate limit spike
    if (i < total - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return result;
}
