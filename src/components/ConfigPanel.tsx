import React, { useState } from 'react';
import { PodcastConfig } from '../types/podcast';
import {
  SUPPORTED_LANGUAGES,
  SARVAM_VOICES,
  PRESET_TOPICS,
  PresetTopic,
} from '../services/mockData';
import {
  Sparkles,
  Radio,
  Mic,
  Clock,
  Languages,
  Sliders,
  ChevronDown,
  Wand2,
} from 'lucide-react';

interface ConfigPanelProps {
  config: PodcastConfig;
  onChange: (updated: Partial<PodcastConfig>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onSelectPreset: (preset: PresetTopic) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  onSelectPreset,
}) => {
  const handleLanguageChange = (langCode: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (!lang) return;

    onChange({
      language: lang.code,
      languageName: lang.name,
      host1Speaker: lang.popularSpeakers.male,
      host2Speaker: lang.popularSpeakers.female,
    });
  };

  const maleVoices = SARVAM_VOICES.filter((v) => v.gender === 'male');
  const femaleVoices = SARVAM_VOICES.filter((v) => v.gender === 'female');

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-7">
      {/* 1. Hero Input Field */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            Episode Topic & Research Prompt
          </label>
          <span className="text-xs text-slate-400">
            Natural two-host banter powered by Gemini & Sarvam
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={config.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder="e.g., The Growth of UPI in India: From Street Chai to Global Rails, or Why Silk Road Failed..."
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm leading-relaxed transition-all resize-none shadow-inner"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Auto-scripting</span>
          </div>
        </div>
      </div>

      {/* 2. Hackathon Demo Presets */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          Quick Hackathon Demo Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="text-left p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all group shadow-sm"
            >
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                {preset.category}
              </div>
              <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                {preset.topic}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Core Voice & Format Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-800">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-400" />
            Sarvam Indic Language
          </label>
          <div className="relative">
            <select
              value={config.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-10"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Duration Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            Target Episode Length
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => onChange({ duration: 1 })}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                config.duration === 1
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Min
            </button>
            <button
              type="button"
              onClick={() => onChange({ duration: 3 })}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                config.duration === 3
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3 Min
            </button>
            <button
              type="button"
              onClick={() => onChange({ duration: 5 })}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                config.duration === 5
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5 Min
            </button>
          </div>
        </div>

        {/* Speed / Pace slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Speaking Pace
            </label>
            <span className="text-xs font-mono text-indigo-400">{config.pace}x</span>
          </div>
          <input
            type="range"
            min={0.85}
            max={1.3}
            step={0.05}
            value={config.pace}
            onChange={(e) => onChange({ pace: parseFloat(e.target.value) })}
            className="w-full h-2 mt-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* 4. Host 1 & Host 2 Voice Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Host 1 Card */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Host 1 (Lead Anchor)
              </span>
            </div>
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Host Name</label>
              <input
                type="text"
                value={config.host1Name}
                onChange={(e) => onChange({ host1Name: e.target.value })}
                placeholder="e.g. Arjun"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sarvam Voice</label>
              <select
                value={config.host1Speaker}
                onChange={(e) => onChange({ host1Speaker: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {maleVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Host 2 Card */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Host 2 (Co-Host / Analyst)
              </span>
            </div>
            <Mic className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Host Name</label>
              <input
                type="text"
                value={config.host2Name}
                onChange={(e) => onChange({ host2Name: e.target.value })}
                placeholder="e.g. Priya"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sarvam Voice</label>
              <select
                value={config.host2Speaker}
                onChange={(e) => onChange({ host2Speaker: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {femaleVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Big Launch Action Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !config.topic.trim()}
          className="w-full group relative py-4 px-8 rounded-2xl font-bold text-white text-base shadow-2xl shadow-indigo-600/30 transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99]"
        >
          {/* Subtle animated light gleam */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span>
              {isGenerating
                ? 'Synthesizing Studio Podcast Episode...'
                : 'Generate Dual-Host Podcast Episode'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
