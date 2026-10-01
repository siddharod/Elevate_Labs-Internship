import React, { useState } from 'react';
import {
  FileCode, Plus, Trash2, Edit2, Copy, ChevronRight,
  ChevronDown, Folder, File, Sparkles
} from 'lucide-react';

const getFileLanguageIcon = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
      return { label: 'HTML', color: 'bg-orange-500 text-white', icon: '🌐' };
    case 'css':
      return { label: 'CSS', color: 'bg-sky-500 text-white', icon: '🎨' };
    case 'js':
    case 'javascript':
      return { label: 'JS', color: 'bg-yellow-400 text-slate-900', icon: '⚡' };
    case 'py':
      return { label: 'PY', color: 'bg-blue-600 text-yellow-300', icon: '🐍' };
    case 'json':
      return { label: 'JSON', color: 'bg-emerald-600 text-white', icon: '📋' };
    default:
      return { label: ext?.toUpperCase() || 'FILE', color: 'bg-slate-400 text-white', icon: '📄' };
  }
};

export const FileExplorer = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
  projectName,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editFilename, setEditFilename] = useState('');

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    const clean = newFilename.trim();
    if (clean) {
      onCreateFile(clean);
      setNewFilename('');
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = (fileId) => {
    const clean = editFilename.trim();
    if (clean) {
      onRenameFile(fileId, clean);
      setEditingFileId(null);
    }
  };

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r-2 border-[#E2E8F0] flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#64748B] uppercase tracking-wider">
          <Folder size={14} className="text-[#5BC0EB]" />
          <span>Explorer</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded-lg text-[#64748B] hover:text-[#5BC0EB] hover:bg-white transition-colors"
          title="Create New File"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Project Root Folder */}
      <div className="p-2 overflow-y-auto flex-1 text-sm">
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#182033] bg-white rounded-lg border border-slate-200 shadow-2xs mb-2">
          <Folder size={15} fill="#FFD166" stroke="#D97706" />
          <span className="truncate">{projectName}</span>
        </div>

        {/* Create File Input Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="mb-2 px-2">
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              placeholder="e.g. style.css, script.js"
              autoFocus
              onBlur={() => setIsCreating(false)}
              className="w-full text-xs font-mono px-2 py-1 bg-white border-2 border-[#5BC0EB] rounded-md outline-none"
            />
          </form>
        )}

        {/* Files List */}
        <div className="space-y-1">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const badge = getFileLanguageIcon(file.filename);

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#5BC0EB]/15 text-[#0284C7] font-bold border-l-4 border-[#5BC0EB]'
                    : 'text-[#475569] hover:bg-white hover:text-[#182033]'
                }`}
              >
                {editingFileId === file.id ? (
                  <input
                    type="text"
                    value={editFilename}
                    onChange={(e) => setEditFilename(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(file.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-mono px-1.5 py-0.5 bg-white border border-[#5BC0EB] rounded outline-none w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{badge.icon}</span>
                    <span className="font-mono text-xs truncate">{file.filename}</span>
                    {file.is_main && (
                      <span className="text-[9px] px-1 py-0.2 bg-[#FFD166]/40 text-[#B45309] font-bold rounded">
                        MAIN
                      </span>
                    )}
                  </div>
                )}

                {/* File hover actions */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFileId(file.id);
                      setEditFilename(file.filename);
                    }}
                    className="p-0.5 text-slate-400 hover:text-[#5BC0EB]"
                    title="Rename File"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateFile(file.id);
                    }}
                    className="p-0.5 text-slate-400 hover:text-[#9B6DFF]"
                    title="Duplicate File"
                  >
                    <Copy size={12} />
                  </button>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-red-500"
                      title="Delete File"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info / Tip */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white/50 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Sparkles size={13} className="text-[#FFD166]" />
        <span>Select a file to start coding!</span>
      </div>
    </aside>
  );
};

export default FileExplorer;
