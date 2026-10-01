import React from 'react';
import { X, Settings, Moon, Sun, Type, Sliders, Eye, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-[#65D6B3] animate-fade-in">
        {/* Header */}
        <div className="bg-[#F4F9FF] p-4 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#65D6B3] text-[#182033] rounded-2xl shadow-xs">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#182033]">Editor Preferences</h2>
              <p className="text-xs text-slate-500">Tune CodeBuddy to your favorite setup!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Editor Theme:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSetting('theme', 'codebuddy-dark')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border-2 transition-all ${
                  settings.theme === 'codebuddy-dark'
                    ? 'border-[#5BC0EB] bg-[#182033] text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon size={14} className="text-[#FFD166]" />
                <span>CodeBuddy Dark</span>
              </button>
              <button
                onClick={() => updateSetting('theme', 'codebuddy-light')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border-2 transition-all ${
                  settings.theme === 'codebuddy-light'
                    ? 'border-[#9B6DFF] bg-white text-[#9B6DFF] shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sun size={14} className="text-[#FF9F68]" />
                <span>CodeBuddy Light</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Editor Font Size:</label>
              <span className="text-xs font-mono font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[13, 15, 17, 19, 21].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.fontSize === size
                      ? 'bg-[#5BC0EB] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Size & Word Wrap */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tab Size:</label>
              <div className="flex gap-1.5">
                {[2, 4].map((spaces) => (
                  <button
                    key={spaces}
                    onClick={() => updateSetting('tabSize', spaces)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.tabSize === spaces
                        ? 'bg-[#9B6DFF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {spaces} spaces
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Word Wrap:</label>
              <button
                onClick={() => updateSetting('wordWrap', settings.wordWrap === 'on' ? 'off' : 'on')}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.wordWrap === 'on'
                    ? 'bg-[#65D6B3] text-[#182033] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {settings.wordWrap === 'on' ? 'Enabled ✓' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Minimap & Animations */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Code Minimap:</label>
              <button
                onClick={() => updateSetting('minimap', !settings.minimap)}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.minimap
                    ? 'bg-[#FFD166] text-[#182033] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {settings.minimap ? 'Shown' : 'Hidden'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mascot Animations:</label>
              <button
                onClick={() => updateSetting('animations', !settings.animations)}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.animations
                    ? 'bg-[#FF7EB6] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {settings.animations ? 'Active ✨' : 'Reduced Motion'}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between">
            <button
              onClick={resetSettings}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="btn-bouncy px-4 py-1.5 bg-[#182033] text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
