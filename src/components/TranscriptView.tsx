import React, { useEffect, useRef, useState } from 'react';
import { ScriptLine } from '../types/podcast';
import { formatTime, copyToClipboard, formatTranscriptMarkdown } from '../utils/formatters';
import { Copy, Check, Play, Sparkles, ArrowDown } from 'lucide-react';

interface TranscriptViewProps {
  script: ScriptLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  title: string;
  summary: string;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  script,
  currentTime,
  onSeek,
  title,
  summary,
}) => {
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Find index of currently active line
  const activeIndex = script.findIndex((line) => {
    if (line.startTime === undefined || line.endTime === undefined) return false;
    return currentTime >= line.startTime && currentTime < line.endTime;
  });

  // Auto-scroll when active line changes
  useEffect(() => {
    if (autoScroll && activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex, autoScroll]);

  const handleCopy = async () => {
    const md = formatTranscriptMarkdown(title, summary, script);
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Transcript Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Synchronized Transcript
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {script.length} turns
              </span>
            </h3>
            <p className="text-xs text-slate-400">Click any dialogue line to jump audio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              autoScroll
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is paused'}
          >
            <ArrowDown className={`w-3.5 h-3.5 ${autoScroll ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Follow Voice</span>
          </button>

          {/* Copy markdown button */}
          <button
            onClick={handleCopy}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Copy full script as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Scrollable Dialogue List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent max-h-[520px]"
      >
        {script.map((line, index) => {
          const isActive = index === activeIndex;
          const isHost1 = line.speaker === 'Host 1';

          return (
            <div
              key={line.id || index}
              ref={isActive ? activeLineRef : null}
              onClick={() => line.startTime !== undefined && onSeek(line.startTime)}
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-950/70 via-indigo-900/40 to-slate-900 border-indigo-500/70 shadow-lg shadow-indigo-950/40 translate-x-1'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Active Indicator Glow Bar */}
              {isActive && (
                <div className="absolute -left-1 top-3 bottom-3 w-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-400" />
              )}

              {/* Speaker Metadata Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isHost1
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                        : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/50'
                    }`}
                  >
                    {line.speakerName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {line.speakerName}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isHost1
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {line.speaker}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {line.startTime !== undefined && (
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {formatTime(line.startTime)}
                    </span>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 transition-opacity"
                    title="Play from here"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>

              {/* Dialogue Text */}
              <p
                className={`text-sm leading-relaxed transition-colors ${
                  isActive
                    ? 'text-white font-medium drop-shadow-sm'
                    : 'text-slate-300 group-hover:text-slate-200'
                }`}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
