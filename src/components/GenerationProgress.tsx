import React from 'react';
import { GenerationProgress as IGenerationProgress } from '../types/podcast';
import { Sparkles, Mic, FileText, Music, Image as ImageIcon } from 'lucide-react';

interface GenerationProgressProps {
  progress: IGenerationProgress;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  const steps = [
    { id: 1, label: 'Sarvam 105B LLM Script', icon: FileText },
    { id: 2, label: 'Album Artwork Prompt', icon: ImageIcon },
    { id: 3, label: 'Sarvam Bulbul Voice Synthesis', icon: Mic },
    { id: 4, label: 'Audio Stitching & Timing', icon: Music },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Production Pipeline in Progress</h3>
            <p className="text-xs text-indigo-300">{progress.message}</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Step {progress.currentStep} of {progress.totalSteps}
        </span>
      </div>

      {/* Visual Step Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isComplete = progress.currentStep > step.id;
          const isCurrent = progress.currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isComplete
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                  : isCurrent
                  ? 'bg-slate-800 border-indigo-400 shadow-lg shadow-indigo-500/20 text-white'
                  : 'bg-slate-800/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${isCurrent ? 'animate-bounce text-indigo-400' : ''}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Step 0{step.id}
                </span>
              </div>
              <div className="text-xs font-medium leading-snug line-clamp-1">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-sm"
            style={{
              width: `${(progress.currentStep / progress.totalSteps) * 100}%`,
            }}
          />
        </div>

        {/* Detailed voice line progress */}
        {progress.lineProgress && (
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Synthesizing: <strong>{progress.lineProgress.currentSpeaker}</strong>
            </span>
            <span>
              Line {progress.lineProgress.current} / {progress.lineProgress.total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
