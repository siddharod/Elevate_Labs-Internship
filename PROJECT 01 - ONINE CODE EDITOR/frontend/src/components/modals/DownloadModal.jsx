import React from 'react';
import { X, Download, Archive, FileCode } from 'lucide-react';
import { downloadSingleFile, downloadProjectZip } from '../../utils/downloadHelper';

export const DownloadModal = ({ isOpen, onClose, projectName, files, activeFile }) => {
  if (!isOpen) return null;

  const handleZip = async () => {
    await downloadProjectZip(projectName, files);
    onClose();
  };

  const handleFile = () => {
    if (activeFile) {
      downloadSingleFile(activeFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-4 border-[#5BC0EB] animate-fade-in">
        {/* Header */}
        <div className="bg-[#F4F9FF] p-4 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#5BC0EB] text-white rounded-2xl shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#182033]">Download Code 💾</h2>
              <p className="text-xs text-slate-500">Take your project home with you!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <button
            onClick={handleZip}
            className="btn-bouncy w-full p-4 bg-[#F8FAFC] hover:bg-[#5BC0EB]/10 border-2 border-slate-200 hover:border-[#5BC0EB] rounded-2xl flex items-center gap-3 text-left transition-all group"
          >
            <div className="p-3 bg-[#5BC0EB] text-white rounded-xl shadow-xs">
              <Archive size={20} />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-[#182033]">
                Full Project ZIP
              </div>
              <div className="text-xs text-slate-500">
                Contains all {files.length} project files ({projectName}.zip)
              </div>
            </div>
          </button>

          {activeFile && (
            <button
              onClick={handleFile}
              className="btn-bouncy w-full p-4 bg-[#F8FAFC] hover:bg-[#FFD166]/15 border-2 border-slate-200 hover:border-[#FFD166] rounded-2xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="p-3 bg-[#FFD166] text-[#182033] rounded-xl shadow-xs">
                <FileCode size={20} />
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-[#182033]">
                  Current File Only
                </div>
                <div className="text-xs text-slate-500">
                  Download "{activeFile.filename}"
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
