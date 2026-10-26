import React, { useState } from 'react';
import { ApiKeys } from '../types/podcast';
import { Key, ShieldCheck, ExternalLink, X, Check, AlertCircle } from 'lucide-react';
import { testSarvamApiKey } from '../services/sarvamService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  onEnableDemoMode: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  onEnableDemoMode,
}) => {
  const [sarvamKey, setSarvamKey] = useState(apiKeys.sarvam);
  const [isTestingSarvam, setIsTestingSarvam] = useState(false);
  const [sarvamStatus, setSarvamStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKeys({
      sarvam: sarvamKey.trim(),
    });
    onClose();
  };

  const handleTestSarvam = async () => {
    if (!sarvamKey) return;
    setIsTestingSarvam(true);
    setSarvamStatus('idle');
    const isValid = await testSarvamApiKey(sarvamKey);
    setIsTestingSarvam(false);
    setSarvamStatus(isValid ? 'valid' : 'invalid');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sarvam AI Configuration</h2>
              <p className="text-xs text-slate-400">100% powered by Sarvam (105B LLM + Bulbul TTS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Fields */}
        <div className="space-y-4 py-5">
          {/* Sarvam AI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Sarvam AI API Subscription Key
              </label>
              <div className="flex items-center gap-2">
                {sarvamKey && (
                  <button
                    onClick={handleTestSarvam}
                    disabled={isTestingSarvam}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline disabled:opacity-50"
                  >
                    {isTestingSarvam ? 'Testing...' : 'Test Connection'}
                  </button>
                )}
                <a
                  href="https://dashboard.sarvam.ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  Get Sarvam Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <input
              type="password"
              value={sarvamKey}
              onChange={(e) => {
                setSarvamKey(e.target.value);
                setSarvamStatus('idle');
              }}
              placeholder="sarvam_live_..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
            />
            {sarvamStatus === 'valid' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Sarvam endpoint connected successfully!</span>
              </div>
            )}
            {sarvamStatus === 'invalid' && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Could not verify key with Sarvam. Check your subscription credentials.</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              One single key powers both the <strong>Sarvam 105B LLM</strong> (conversational scriptwriting) and <strong>Sarvam Bulbul TTS</strong> (voice synthesis).
            </p>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Your key is saved in your browser&apos;s <code className="text-slate-300">localStorage</code> and routed securely via the Vercel serverless proxy to Sarvam AI.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onEnableDemoMode();
              onClose();
            }}
            className="w-full sm:w-auto text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            Try Demo Mode (No Key Needed)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none text-xs px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none text-xs font-semibold px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30 transition-all"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
