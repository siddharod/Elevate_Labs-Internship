import React, { useState } from 'react';
import {
  Play, Save, Share2, Download, Sparkles, History,
  Settings, LayoutTemplate, Check, Loader2, AlertCircle, Bug, RefreshCw
} from 'lucide-react';

export const TopToolbar = ({
  projectName,
  onRenameProject,
  saveStatus, // 'saved', 'saving', 'unsaved'
  runStatus = 'Ready', // 'Ready', 'Running...', 'Preview Updated'
  onSave,
  onRun,
  isRunning,
  onBeautify,
  onOpenTemplates,
  onOpenHistory,
  onOpenShare,
  onOpenDownload,
  onOpenSettings,
  onOpenDebug,
  language = 'html',
  onLanguageChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== projectName) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  const getSaveBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#9B6DFF] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            <Loader2 size={12} className="animate-spin" />
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Check size={13} strokeWidth={3} />
            Saved ✓
          </span>
        );
      case 'unsaved':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertCircle size={13} />
            Unsaved Changes
          </span>
        );
    }
  };

  const getRunStatusBadge = () => {
    switch (runStatus) {
      case 'Running...':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#6366F1] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 animate-pulse">
            <Loader2 size={11} className="animate-spin" />
            Running...
          </span>
        );
      case 'Preview Updated':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Check size={11} strokeWidth={3} />
            Preview Updated
          </span>
        );
      case 'Ready':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Ready
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-b-2 border-[#E2E8F0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left: Project Title & Status Badges */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="text-lg font-heading font-bold text-[#182033] bg-[#F8FAFC] border-2 border-[#5BC0EB] rounded-lg px-2.5 py-0.5 outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-heading font-bold text-[#182033] hover:text-[#5BC0EB] flex items-center gap-1.5 group cursor-pointer"
            title="Click to rename project"
          >
            <span>{projectName}</span>
            <span className="text-xs text-slate-400 group-hover:text-[#5BC0EB]">✏️</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {getSaveBadge()}
          {getRunStatusBadge()}
          <div className="flex items-center gap-1.5 bg-[#182033] px-2 py-1 rounded-xl shadow-xs border border-[#334155]">
            <span className="text-[11px] font-bold text-[#FFD166] hidden md:inline">Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-[#0F172A] text-[#65D6B3] font-heading font-extrabold text-xs px-2.5 py-1 rounded-lg border border-[#475569] focus:border-[#5BC0EB] outline-none cursor-pointer"
              title="Select coding language (HTML, CSS, JavaScript only)"
            >
              <option value="html">🌐 HTML</option>
              <option value="css">🎨 CSS</option>
              <option value="javascript">⚡ JavaScript</option>
            </select>
          </div>
        </div>
      </div>

      {/* Center: THE BIG RUN BUTTON (Prominent CTA) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="btn-bouncy flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-base text-[#182033] bg-gradient-to-r from-[#65D6B3] via-[#FFD166] to-[#FF9F68] hover:opacity-95 shadow-[0_4px_0_#D97706] active:translate-y-1 active:shadow-none cursor-pointer transition-all"
          title="Run Code (Ctrl + Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 size={18} className="animate-spin text-[#182033]" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={18} fill="#182033" className="text-[#182033]" />
              <span>RUN</span>
              <kbd className="hidden md:inline text-[10px] bg-white/70 text-[#182033] px-1.5 py-0.5 rounded font-sans font-extrabold">
                Ctrl+↵
              </kbd>
            </>
          )}
        </button>

        {/* Manual Save */}
        <button
          onClick={onSave}
          className="btn-bouncy flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#182033] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-slate-300 shadow-xs cursor-pointer"
          title="Save Project (Ctrl + S)"
        >
          <Save size={15} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Right: Actions Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onBeautify}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#9B6DFF] hover:bg-purple-50 transition-colors"
          title="Beautify / Format Code"
        >
          <Sparkles size={17} />
        </button>

        <button
          onClick={onOpenDebug}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#FF7EB6] hover:bg-pink-50 transition-colors"
          title="Debugger Panel"
        >
          <Bug size={17} />
        </button>

        <button
          onClick={onOpenTemplates}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#5BC0EB] hover:bg-sky-50 transition-colors"
          title="Starter Templates"
        >
          <LayoutTemplate size={17} />
        </button>

        <button
          onClick={onOpenHistory}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#FF9F68] hover:bg-amber-50 transition-colors"
          title="Project Version History"
        >
          <History size={17} />
        </button>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#9B6DFF] hover:bg-[#8B5CF6] shadow-[0_3px_0_#7C3AED] transition-all cursor-pointer"
          title="Share Project"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>

        <button
          onClick={onOpenDownload}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#0284C7] hover:bg-sky-50 transition-colors"
          title="Download Project ZIP"
        >
          <Download size={17} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#182033] hover:bg-[#F8FAFC] transition-colors"
          title="Editor Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </div>
  );
};

export default TopToolbar;
