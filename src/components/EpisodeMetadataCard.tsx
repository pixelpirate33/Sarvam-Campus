import React from 'react';
import { PodcastEpisode } from '../types/podcast';
import { CoverArtGenerator } from './CoverArtGenerator';
import { Sparkles, Clock, Mic, CheckCircle2, Globe2, Radio } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface EpisodeMetadataCardProps {
  episode: PodcastEpisode;
}

export const EpisodeMetadataCard: React.FC<EpisodeMetadataCardProps> = ({ episode }) => {
  const { metadata, config, totalDuration } = episode;

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: 1:1 Album Artwork */}
        <div className="lg:col-span-4 flex justify-center">
          <CoverArtGenerator
            title={metadata.title}
            topic={config.topic}
            languageName={config.languageName}
            host1Name={config.host1Name}
            host2Name={config.host2Name}
            artworkPrompt={metadata.artworkPrompt}
          />
        </div>

        {/* Right column: Episode Details & Show Notes */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              EchoCast Studio
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Globe2 className="w-3 h-3 text-slate-400" />
              {config.languageName} ({config.language})
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatTime(totalDuration)}
            </span>
            {config.useDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Demo Mode
              </span>
            )}
          </div>

          {/* Episode Title & Tagline */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {metadata.title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-indigo-300/90 mt-1">
              {metadata.tagline}
            </p>
          </div>

          {/* Hosts Voice Profile Badges */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                <strong>Host 1 ({config.host1Name}):</strong> Sarvam <code className="text-indigo-300">{config.host1Speaker}</code>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong>Host 2 ({config.host2Name}):</strong> Sarvam <code className="text-emerald-300">{config.host2Speaker}</code>
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 text-slate-300 text-sm leading-relaxed">
            <p>{metadata.summary}</p>
          </div>

          {/* Key Takeaways */}
          {metadata.keyTakeaways && metadata.keyTakeaways.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Key Discussion Takeaways
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {metadata.keyTakeaways.map((takeaway, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/30 border border-slate-800/60 rounded-lg p-2.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
