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
        // Create clean silent buffer for timeline pacing without any beep-boop synthesizer noise
        const mockDuration = Math.max(3.5, (line.text.split(/\s+/).length / 2.6));
        const cleanBuffer = createCleanAudioBuffer(ctx, mockDuration);
        decodedBuffers.push(cleanBuffer);
      }
    } catch (err) {
      console.warn(`Could not decode audio segment for "${line.text.slice(0, 25)}...", using clean buffer`, err);
      const mockDuration = Math.max(3.5, (line.text.split(/\s+/).length / 2.6));
      const cleanBuffer = createCleanAudioBuffer(ctx, mockDuration);
      decodedBuffers.push(cleanBuffer);
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
 * Creates clean studio buffer without any oscillator beep boop noise.
 * Generates imperceptible high-fidelity studio acoustic presence.
 */
export function createCleanAudioBuffer(
  ctx: AudioContext,
  durationSeconds: number
): AudioBuffer {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Studio room presence at -65dB (completely silent to human ear, avoids audio pops)
  for (let i = 0; i < numSamples; i++) {
    data[i] = (Math.random() - 0.5) * 0.0001;
  }

  return buffer;
}
