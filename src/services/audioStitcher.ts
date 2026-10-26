import { ScriptLine } from '../types/podcast';
import { base64ToArrayBuffer, audioBufferToWavBlob } from '../utils/wavHelper';

let audioContextInstance: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContextInstance || audioContextInstance.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContextInstance = new AudioContextClass();
  }
  if (audioContextInstance.state === 'suspended') {
    audioContextInstance.resume();
  }
  return audioContextInstance;
}

export interface StitchedResult {
  stitchedBlob: Blob;
  stitchedAudioUrl: string;
  totalDuration: number;
  timedScript: ScriptLine[];
}

/**
 * Stitches multiple audio segments sequentially with realistic conversational inter-speaker pauses.
 * Returns exact start and end timestamps for synchronized transcript karaoke highlighting.
 */
export async function stitchAudioSegments(
  scriptLines: ScriptLine[],
  pauseBetweenSpeakersSeconds = 0.25
): Promise<StitchedResult> {
  const ctx = getAudioContext();
  const decodedBuffers: (AudioBuffer | null)[] = [];

  // Step 1: Decode all segment audios
  for (const line of scriptLines) {
    try {
      if (line.audioBase64) {
        const arrayBuffer = base64ToArrayBuffer(line.audioBase64);
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        decodedBuffers.push(audioBuffer);
      } else if (line.audioBlobUrl) {
        const response = await fetch(line.audioBlobUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        decodedBuffers.push(audioBuffer);
      } else {
        // Fallback: Generate procedural conversational audio for missing voice segments
        const mockDuration = Math.max(3, (line.text.split(/\s+/).length / 2.5));
        const syntheticBuffer = createSyntheticVoiceBuffer(ctx, line.speaker, mockDuration);
        decodedBuffers.push(syntheticBuffer);
      }
    } catch (err) {
      console.warn(`Failed to decode audio for line: "${line.text.slice(0, 30)}...", generating fallback buffer`, err);
      const mockDuration = Math.max(3, (line.text.split(/\s+/).length / 2.5));
      const fallbackBuffer = createSyntheticVoiceBuffer(ctx, line.speaker, mockDuration);
      decodedBuffers.push(fallbackBuffer);
    }
  }

  // Determine standard sample rate and channel count
  const sampleRate = decodedBuffers[0]?.sampleRate || 22050;
  const numChannels = 1; // Mono for voice podcast is optimal and lightweight

  // Step 2: Calculate total length and exact line timing offsets
  const pauseSamples = Math.floor(pauseBetweenSpeakersSeconds * sampleRate);
  let totalSamples = 0;
  const timedScript: ScriptLine[] = [];
  let currentTimeSeconds = 0;

  for (let i = 0; i < scriptLines.length; i++) {
    const buffer = decodedBuffers[i]!;
    const lineDuration = buffer.duration;
    const startTime = currentTimeSeconds;
    const endTime = startTime + lineDuration;

    timedScript.push({
      ...scriptLines[i],
      duration: lineDuration,
      startTime: Number(startTime.toFixed(2)),
      endTime: Number(endTime.toFixed(2))
    });

    totalSamples += buffer.length;
    currentTimeSeconds += lineDuration;

    // Add inter-turn pause except after the last line
    if (i < scriptLines.length - 1) {
      totalSamples += pauseSamples;
      currentTimeSeconds += pauseBetweenSpeakersSeconds;
    }
  }

  // Step 3: Stitch together into a single AudioBuffer
  const compositeBuffer = ctx.createBuffer(numChannels, totalSamples, sampleRate);
  const compositeChannelData = compositeBuffer.getChannelData(0);

  let currentSampleOffset = 0;
  for (let i = 0; i < decodedBuffers.length; i++) {
    const buffer = decodedBuffers[i]!;
    const srcData = buffer.getChannelData(0);

    // Copy segment samples
    for (let s = 0; s < srcData.length; s++) {
      compositeChannelData[currentSampleOffset + s] = srcData[s];
    }
    currentSampleOffset += srcData.length;

    // Insert gentle natural silence padding between speakers
    if (i < decodedBuffers.length - 1) {
      for (let p = 0; p < pauseSamples; p++) {
        // Extremely subtle studio noise floor (-60dB dither) for realistic studio acoustic presence
        compositeChannelData[currentSampleOffset + p] = (Math.random() - 0.5) * 0.0003;
      }
      currentSampleOffset += pauseSamples;
    }
  }

  // Step 4: Encode to WAV Blob and create persistent URL
  const stitchedBlob = audioBufferToWavBlob(compositeBuffer);
  const stitchedAudioUrl = URL.createObjectURL(stitchedBlob);

  return {
    stitchedBlob,
    stitchedAudioUrl,
    totalDuration: compositeBuffer.duration,
    timedScript
  };
}

/**
 * Creates rich harmonic synthetic voice tones for demo mode or audio fallbacks.
 * Uses speech formant frequencies so Host 1 sounds like a deeper male voice
 * and Host 2 sounds like a higher melodic female voice with natural prosody envelopes.
 */
export function createSyntheticVoiceBuffer(
  ctx: AudioContext,
  speaker: 'Host 1' | 'Host 2',
  durationSeconds: number
): AudioBuffer {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Fundamental frequency & formants
  // Host 1: Male fundamental ~130Hz
  // Host 2: Female fundamental ~220Hz
  const isHost1 = speaker === 'Host 1';
  const baseFreq = isHost1 ? 125 : 210;
  const formant1 = isHost1 ? 500 : 700;
  const formant2 = isHost1 ? 1500 : 2000;

  // Generate speech-like modulated pulse train
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Speech syllable rhythm modulation (~4 syllables per second)
    const syllableSwell = Math.max(0, Math.sin(t * Math.PI * 4.2)) * (0.6 + 0.4 * Math.sin(t * 1.8));

    // Pitch inflection (intonation curve)
    const pitchVibrato = 1 + 0.05 * Math.sin(t * 8) + 0.08 * Math.sin(t * 1.5);
    const f0 = baseFreq * pitchVibrato;

    // Harmonic synthesis with formants
    const harm1 = Math.sin(2 * Math.PI * f0 * t) * 0.4;
    const harm2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25;
    const harmFormant1 = Math.sin(2 * Math.PI * formant1 * t) * 0.15;
    const harmFormant2 = Math.sin(2 * Math.PI * formant2 * t) * 0.08;

    // Envelope attack/release
    let envelope = 1;
    if (t < 0.1) envelope = t / 0.1;
    else if (t > durationSeconds - 0.2) envelope = Math.max(0, (durationSeconds - t) / 0.2);

    data[i] = (harm1 + harm2 + harmFormant1 + harmFormant2) * syllableSwell * envelope * 0.6;
  }

  return buffer;
}
