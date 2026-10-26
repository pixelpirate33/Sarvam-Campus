import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import { formatTime, triggerDownload } from '../utils/formatters';
import { AudioVisualizer } from './AudioVisualizer';
import { ScriptLine } from '../types/podcast';
import { speakScriptLine, stopWebSpeech } from '../services/webSpeechFallback';

interface PodcastPlayerProps {
  audioUrl: string;
  totalDuration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
  episodeTitle: string;
  stitchedBlob?: Blob;
  script?: ScriptLine[];
  hasRealVoiceAudio?: boolean;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  audioUrl,
  totalDuration,
  currentTime,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  episodeTitle,
  stitchedBlob,
  script = [],
  hasRealVoiceAudio = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const lastSpokenIndexRef = useRef<number>(-1);

  // Sync isPlaying with HTML5 audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => console.warn('Audio play request failed:', err));
    } else {
      audio.pause();
      stopWebSpeech();
      lastSpokenIndexRef.current = -1;
    }
  }, [isPlaying]);

  // If in fallback speech mode (no Sarvam audio yet), speak lines with native browser human speech
  useEffect(() => {
    if (!isPlaying || hasRealVoiceAudio || script.length === 0) return;

    const activeIndex = script.findIndex(
      (line) =>
        line.startTime !== undefined &&
        line.endTime !== undefined &&
        currentTime >= line.startTime &&
        currentTime < line.endTime
    );

    if (activeIndex !== -1 && activeIndex !== lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = activeIndex;
      const line = script[activeIndex];
      speakScriptLine(line.text, line.speaker);
    }
  }, [currentTime, isPlaying, hasRealVoiceAudio, script]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle keyboard shortcuts (space for play/pause, arrows for scrub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause();
        else onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, totalDuration]);

  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(totalDuration, currentTime + seconds));
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
    onSeek(nextTime);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onSeek(newTime);
  };

  const handleDownloadWav = () => {
    if (stitchedBlob) {
      triggerDownload(stitchedBlob, `${episodeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.wav`);
    } else if (audioUrl) {
      fetch(audioUrl)
        .then((res) => res.blob())
        .then((blob) => {
          triggerDownload(blob, `${episodeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.wav`);
        });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: episodeTitle,
          text: `Check out this AI podcast episode generated with Sarvam Bulbul: ${episodeTitle}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            onTimeUpdate(audioRef.current.currentTime);
          }
        }}
        onEnded={() => onPause()}
        preload="auto"
      />

      {/* Real-Time Audio Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} />

      {/* Scrubbing Bar & Timestamp */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none transition-all"
          />
        </div>
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[11px] font-sans text-slate-400">Space to play/pause</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Playback rate speed pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          {speedOptions.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center Primary Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Skip Back 10s */}
          <button
            onClick={() => handleSkip(-10)}
            title="Rewind 10 seconds (Left Arrow)"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={() => (isPlaying ? onPause() : onPlay())}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip Forward 10s */}
          <button
            onClick={() => handleSkip(10)}
            title="Fast Forward 10 seconds (Right Arrow)"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Volume & Export */}
        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Download Composite WAV */}
          <button
            onClick={handleDownloadWav}
            title="Download Composite Audio (WAV)"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Download WAV</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share Episode"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            {shared ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
