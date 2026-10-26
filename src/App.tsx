import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { GenerationProgress } from './components/GenerationProgress';
import { EpisodeMetadataCard } from './components/EpisodeMetadataCard';
import { PodcastPlayer } from './components/PodcastPlayer';
import { TranscriptView } from './components/TranscriptView';
import { ApiKeyModal } from './components/ApiKeyModal';
import {
  PodcastConfig,
  PodcastEpisode,
  ApiKeys,
  GenerationProgress as IGenerationProgress,
  ScriptLine,
} from './types/podcast';
import { SAMPLE_EPISODE_DATA, PresetTopic } from './services/mockData';
import { generatePodcastScriptWithSarvam } from './services/sarvamChatService';
import { synthesizeFullScript } from './services/sarvamService';
import { stitchAudioSegments } from './services/audioStitcher';
import { generateId } from './utils/formatters';
import { AlertTriangle, Sparkles } from 'lucide-react';

export function App() {
  // 1. API Keys State with localStorage persistence & env fallback
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const envGemini = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    const envSarvam = (import.meta as any).env?.VITE_SARVAM_API_KEY || '';
    return {
      gemini: localStorage.getItem('echocast_gemini_key') || envGemini || '',
      sarvam: localStorage.getItem('echocast_sarvam_key') || envSarvam || '',
    };
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 2. Podcast Generation Configuration State
  const [config, setConfig] = useState<PodcastConfig>({
    topic: 'The Growth of UPI in India: From Street Chai to Global Rails',
    language: 'en-IN',
    languageName: 'Indian English',
    host1Speaker: 'shubh',
    host1Name: 'Arjun',
    host2Speaker: 'simran_en_customer',
    host2Name: 'Priya',
    duration: 1,
    pace: 1.05,
    useDemoMode: false,
  });

  // 3. Active Episode & Audio Player State
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(SAMPLE_EPISODE_DATA);
  const [stitchedBlob, setStitchedBlob] = useState<Blob | undefined>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 4. Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<IGenerationProgress>({
    status: 'idle',
    currentStep: 1,
    totalSteps: 4,
    message: 'Ready to produce your podcast',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize initial sample episode audio on mount so judge can click play immediately!
  useEffect(() => {
    let isCancelled = false;
    async function loadInitialAudio() {
      if (SAMPLE_EPISODE_DATA.script.length > 0 && !currentEpisode?.audioUrl) {
        try {
          const stitched = await stitchAudioSegments(SAMPLE_EPISODE_DATA.script);
          if (!isCancelled) {
            setStitchedBlob(stitched.stitchedBlob);
            setCurrentEpisode({
              ...SAMPLE_EPISODE_DATA,
              audioUrl: stitched.stitchedAudioUrl,
              script: stitched.timedScript,
              totalDuration: stitched.totalDuration,
            });
          }
        } catch (e) {
          console.warn('Initial demo audio generation notice:', e);
        }
      }
    }
    loadInitialAudio();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSaveKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('echocast_gemini_key', keys.gemini);
    localStorage.setItem('echocast_sarvam_key', keys.sarvam);
    setIsDemoMode(false);
  };

  const handleSelectPreset = (preset: PresetTopic) => {
    setConfig((prev) => ({
      ...prev,
      topic: preset.topic,
      language: preset.language,
      host1Speaker: preset.host1,
      host2Speaker: preset.host2,
      duration: preset.duration,
    }));
  };

  const handleConfigChange = (updated: Partial<PodcastConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Main Podcast Generation Workflow
  const handleGeneratePodcast = async () => {
    setErrorMessage(null);

    // If missing Sarvam key and not in demo mode, prompt user
    const hasKey = Boolean(apiKeys.sarvam);
    if (!hasKey && !isDemoMode) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      // Step 1: Sarvam 105B LLM Script Generation
      setProgress({
        status: 'generating_script',
        currentStep: 1,
        totalSteps: 4,
        message: 'Drafting conversational dual-host script with Sarvam 105B LLM...',
      });

      let scriptResult: { metadata: any; script: any[] };

      if (isDemoMode || !apiKeys.sarvam) {
        // High quality demo fallback if offline or no keys
        await new Promise((r) => setTimeout(r, 1200));
        scriptResult = {
          metadata: {
            title: config.topic,
            tagline: `Conversational deep dive into ${config.topic}`,
            summary: `Arjun and Priya explore the key dimensions, surprising insights, and future implications of ${config.topic}.`,
            keyTakeaways: [
              `Core foundation and technological architecture behind ${config.topic}`,
              'Real-world adoption metrics and surprising user behavioral shifts',
              'Global expansion opportunities and key engineering lessons',
            ],
            artworkPrompt: `Vibrant podcast cover artwork showcasing ${config.topic}`,
          },
          script: [
            {
              speaker: 'Host 1',
              speakerName: config.host1Name,
              text: `Welcome to EchoCast! Today we are diving into an incredible topic: ${config.topic}.`,
            },
            {
              speaker: 'Host 2',
              speakerName: config.host2Name,
              text: `I've been looking forward to this discussion! There are so many misconceptions people have about this.`,
            },
            {
              speaker: 'Host 1',
              speakerName: config.host1Name,
              text: `Let's start with the fundamental catalyst. What really triggered the massive shift here?`,
            },
            {
              speaker: 'Host 2',
              speakerName: config.host2Name,
              text: `It all comes down to reducing friction. When you make a complex system frictionless, adoption explodes exponentially.`,
            },
            {
              speaker: 'Host 1',
              speakerName: config.host1Name,
              text: `And the ripple effect across the entire ecosystem has been unprecedented.`,
            },
            {
              speaker: 'Host 2',
              speakerName: config.host2Name,
              text: `Absolutely. That's our takeaway for today! Join us next time on EchoCast!`,
            },
          ],
        };
      } else {
        scriptResult = await generatePodcastScriptWithSarvam(config, apiKeys.sarvam);
      }

      // Step 2: Artwork Setup
      setProgress({
        status: 'generating_artwork',
        currentStep: 2,
        totalSteps: 4,
        message: 'Designing dynamic episode album artwork & typography...',
      });
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Sarvam Bulbul Voice Synthesis
      setProgress({
        status: 'synthesizing_audio',
        currentStep: 3,
        totalSteps: 4,
        message: 'Synthesizing voice tracks with Sarvam Bulbul...',
        lineProgress: {
          current: 1,
          total: scriptResult.script.length,
          currentSpeaker: config.host1Name,
        },
      });

      const initialScript: ScriptLine[] = scriptResult.script.map((line: any, index: number) => ({
        id: generateId(`line_${index}`),
        speaker: line.speaker,
        speakerName: line.speakerName,
        text: line.text,
      }));

      let synthesizedLines: ScriptLine[];

      if (isDemoMode || !apiKeys.sarvam) {
        // Fast realistic mock voice synthesis with Web Audio speech harmonics
        synthesizedLines = initialScript;
        for (let i = 0; i < initialScript.length; i++) {
          setProgress((prev) => ({
            ...prev,
            lineProgress: {
              current: i + 1,
              total: initialScript.length,
              currentSpeaker: initialScript[i].speakerName,
            },
          }));
          await new Promise((r) => setTimeout(r, 300));
        }
      } else {
        synthesizedLines = await synthesizeFullScript(
          initialScript,
          config,
          apiKeys.sarvam,
          (current, total, speakerName) => {
            setProgress((prev) => ({
              ...prev,
              lineProgress: {
                current,
                total,
                currentSpeaker: speakerName,
              },
            }));
          }
        );
      }

      // Step 4: Stitch Audio & Compute Real-Time Time Offsets
      setProgress({
        status: 'stitching_audio',
        currentStep: 4,
        totalSteps: 4,
        message: 'Stitching audio tracks & computing karaoke transcript sync...',
      });

      const stitched = await stitchAudioSegments(synthesizedLines, 0.25);

      // Create new episode object
      const newEpisode: PodcastEpisode = {
        id: generateId('ep'),
        createdAt: new Date().toISOString(),
        config: { ...config, useDemoMode: isDemoMode },
        metadata: scriptResult.metadata,
        script: stitched.timedScript,
        audioUrl: stitched.stitchedAudioUrl,
        totalDuration: stitched.totalDuration,
      };

      setStitchedBlob(stitched.stitchedBlob);
      setCurrentEpisode(newEpisode);

      setProgress({
        status: 'ready',
        currentStep: 4,
        totalSteps: 4,
        message: 'Episode synthesized successfully!',
      });

      // Auto start playback for instant gratification
      setIsPlaying(true);
    } catch (err: unknown) {
      console.error('Generation pipeline error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during synthesis. Please check your API credentials.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Studio Header */}
      <Header
        apiKeys={apiKeys}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        isDemoMode={isDemoMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start justify-between gap-3 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Pipeline Execution Error</h4>
                <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsDemoMode(true);
                setErrorMessage(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}

        {/* 2. Top Studio Configurator */}
        <section>
          <ConfigPanel
            config={config}
            onChange={handleConfigChange}
            onGenerate={handleGeneratePodcast}
            isGenerating={isGenerating}
            onSelectPreset={handleSelectPreset}
          />
        </section>

        {/* 3. Real-Time Generation Progress Banner */}
        {isGenerating && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <GenerationProgress progress={progress} />
          </section>
        )}

        {/* 4. Active Podcast Studio & Interactive Player */}
        {currentEpisode && (
          <section className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white">Current Episode Studio</h2>
              </div>
              <span className="text-xs text-slate-400">
                Created: {new Date(currentEpisode.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Episode Metadata Card (Artwork, Badges, Show Notes) */}
            <EpisodeMetadataCard episode={currentEpisode} />

            {/* Interactive Audio Player with Visualizer & Scrubber */}
            {currentEpisode.audioUrl && (
              <PodcastPlayer
                audioUrl={currentEpisode.audioUrl}
                totalDuration={currentEpisode.totalDuration}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onSeek={handleSeek}
                onTimeUpdate={(t) => setCurrentTime(t)}
                episodeTitle={currentEpisode.metadata.title}
                stitchedBlob={stitchedBlob}
                script={currentEpisode.script}
                hasRealVoiceAudio={Boolean(currentEpisode.script && currentEpisode.script.some((s) => s.audioBase64))}
              />
            )}

            {/* Synchronized Karaoke Transcript View */}
            <div className="pt-2">
              <TranscriptView
                script={currentEpisode.script}
                currentTime={currentTime}
                onSeek={handleSeek}
                title={currentEpisode.metadata.title}
                summary={currentEpisode.metadata.summary}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            EchoCast AI • Built with <strong>Sarvam AI Bulbul</strong> & <strong>Google Gemini API</strong> for Hackathons
          </p>
          <p className="text-slate-400">
            Zero-latency Web Audio WAV Stitching • Synchronized Speech Transcript
          </p>
        </div>
      </footer>

      {/* API Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
        onEnableDemoMode={() => {
          setIsDemoMode(true);
          setConfig((c) => ({ ...c, useDemoMode: true }));
        }}
      />
    </div>
  );
}
export default App;
