import React from 'react';
import { Radio, Key, Settings, CheckCircle2 } from 'lucide-react';
import { ApiKeys } from '../types/podcast';

interface HeaderProps {
  apiKeys: ApiKeys;
  onOpenSettings: () => void;
  isDemoMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiKeys,
  onOpenSettings,
  isDemoMode,
}) => {
  const hasGemini = Boolean(apiKeys.gemini);
  const hasSarvam = Boolean(apiKeys.sarvam);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                EchoCast<span className="text-indigo-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Bulbul v3
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Dual-Host Conversational Podcasts Powered by Sarvam & Gemini
            </p>
          </div>
        </div>

        {/* Right Nav & Status Pills */}
        <div className="flex items-center gap-3">
          {/* Gemini Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                hasGemini ? 'bg-blue-400 shadow-sm shadow-blue-400' : 'bg-slate-600'
              }`}
            />
            <span className="font-medium">Gemini 2.5</span>
            {hasGemini && <CheckCircle2 className="w-3 h-3 text-blue-400 ml-0.5" />}
          </div>

          {/* Sarvam Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                hasSarvam ? 'bg-orange-400 shadow-sm shadow-orange-400' : 'bg-slate-600'
              }`}
            />
            <span className="font-medium">Sarvam Bulbul</span>
            {hasSarvam && <CheckCircle2 className="w-3 h-3 text-orange-400 ml-0.5" />}
          </div>

          {/* Demo Mode Badge */}
          {isDemoMode && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
              Demo Active
            </span>
          )}

          {/* Settings / API Keys Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 hover:text-white transition-all shadow-sm text-xs font-semibold"
          >
            <Key className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">API Keys</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
