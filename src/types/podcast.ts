export type SpeakerRole = 'Host 1' | 'Host 2';

export interface ScriptLine {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  audioBase64?: string;
  audioBlobUrl?: string;
  duration?: number; // duration in seconds
  startTime?: number; // cumulative start timestamp in seconds
  endTime?: number;   // cumulative end timestamp in seconds
}

export interface EpisodeMetadata {
  title: string;
  tagline: string;
  summary: string;
  keyTakeaways: string[];
  artworkPrompt?: string;
  coverArtUrl?: string;
}

export interface PodcastEpisode {
  id: string;
  createdAt: string;
  config: PodcastConfig;
  metadata: EpisodeMetadata;
  script: ScriptLine[];
  audioUrl?: string;
  totalDuration: number;
}

export interface PodcastConfig {
  topic: string;
  language: string;
  languageName: string;
  host1Speaker: string;
  host1Name: string;
  host2Speaker: string;
  host2Name: string;
  duration: 1 | 3 | 5;
  pace: number;
  useDemoMode?: boolean;
}

export type GenerationStatus = 
  | 'idle' 
  | 'generating_script' 
  | 'generating_artwork' 
  | 'synthesizing_audio' 
  | 'stitching_audio' 
  | 'ready' 
  | 'error';

export interface GenerationProgress {
  status: GenerationStatus;
  currentStep: number;
  totalSteps: number;
  message: string;
  subMessage?: string;
  lineProgress?: {
    current: number;
    total: number;
    currentSpeaker: string;
  };
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  recommendedRole: 'Host 1' | 'Host 2';
  description: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  popularSpeakers: {
    male: string;
    female: string;
  };
}

export interface ApiKeys {
  sarvam: string;
  gemini?: string;
}
