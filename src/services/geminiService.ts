import { EpisodeMetadata, PodcastConfig, ScriptLine } from '../types/podcast';

export interface GeminiScriptResponse {
  metadata: EpisodeMetadata;
  script: Omit<ScriptLine, 'id'>[];
}

export async function generatePodcastScriptWithGemini(
  config: PodcastConfig,
  apiKey: string
): Promise<GeminiScriptResponse> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is required. Please add your key in Settings or activate Demo Mode.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

  const turnsTarget = config.duration === 1 ? '5 to 7 turns (approx 1 minute of speech)' :
                      config.duration === 3 ? '12 to 15 turns (approx 3 minutes of speech)' :
                      '18 to 22 turns (approx 5 minutes of speech)';

  const systemPrompt = `You are an elite podcast producer and scriptwriter for a top-charting tech & culture podcast called "EchoCast".
Your task is to write a dynamic, natural, conversational two-host podcast episode about: "${config.topic}".

HOST SPECIFICATIONS:
- Host 1 (${config.host1Name}): The lead host. Energetic, curious, introduces topics with punchy hooks, asks provocative questions.
- Host 2 (${config.host2Name}): The co-host & expert analyst. Sharp, witty, brings unexpected analogies, statistics, and counter-perspectives.

LANGUAGE REQUIREMENTS:
- Primary Language Code: ${config.language} (${config.languageName}).
- If ${config.language} is 'en-IN', write in fluent, natural Indian English with contemporary broadcast cadence.
- If ${config.language} is an Indian regional language (e.g., 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN'), write in authentic, spoken conversational language as spoken by native podcast hosts (natural vocabulary, avoiding stilted textbook phrasing).

PACING & LENGTH:
- Write exactly ${turnsTarget}.
- Alternate naturally between Host 1 and Host 2.
- Each line should be 1 to 3 spoken sentences (concise, punchy, conversational, no monologues).
- Do NOT include sound effects or bracketed notes like [laughs] or [intro music] in the dialogue text, because this text is sent directly to text-to-speech engines.

OUTPUT FORMAT:
Respond ONLY with a valid, raw JSON object (without markdown code blocks, backticks, or other text) adhering strictly to this schema:
{
  "title": "A captivating, punchy episode title",
  "tagline": "A snappy one-sentence hook",
  "summary": "A 2-3 sentence engaging synopsis of the episode",
  "keyTakeaways": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "artworkPrompt": "A detailed visual description for modern podcast cover art (specifying themes, color palette, lighting, retro-futuristic or minimalist tech style)",
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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3072,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Gemini API error (${response.status}: ${response.statusText})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textOutput = candidate?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error('Gemini API returned an empty response. Please verify the prompt or try again.');
    }

    // Clean any backticks or markdown wrapper if present
    const cleanJson = textOutput.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      metadata: {
        title: parsed.title || config.topic,
        tagline: parsed.tagline || 'An AI-powered conversational deep dive',
        summary: parsed.summary || 'An insightful exploration of ' + config.topic,
        keyTakeaways: parsed.keyTakeaways || [],
        artworkPrompt: parsed.artworkPrompt || `Podcast cover artwork for ${config.topic}`
      },
      script: parsed.script.map((line: { speaker?: string; speakerName?: string; text: string }) => ({
        speaker: (line.speaker === 'Host 2' ? 'Host 2' : 'Host 1') as 'Host 1' | 'Host 2',
        speakerName: line.speakerName || (line.speaker === 'Host 2' ? config.host2Name : config.host1Name),
        text: line.text.trim()
      }))
    };
  } catch (err: unknown) {
    console.error('Error generating script with Gemini:', err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}
