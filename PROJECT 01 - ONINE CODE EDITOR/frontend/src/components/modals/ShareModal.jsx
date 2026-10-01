import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Code } from 'lucide-react';
import api from '../../services/api';

export const ShareModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/share/project/${projectId}/`);
      setShareData(res.data);
    } catch (err) {
      alert('Failed to generate share link: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = shareData ? `${window.location.origin}/share/${shareData.share_id}` : '';
  const embedCode = shareData
    ? `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0" allow="scripts"></iframe>`
    : '';

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border-4 border-[#9B6DFF] animate-fade-in">
        {/* Header */}
        <div className="bg-[#F4F9FF] p-4 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#9B6DFF] text-white rounded-2xl shadow-xs">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#182033]">Share Your Project 🚀</h2>
              <p className="text-xs text-slate-500">Show your creations to family, teachers &amp; friends!</p>
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
        <div className="p-6 space-y-5">
          {!shareData ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-sm text-slate-600">
                Generate a safe, read-only snapshot link for <strong>"{projectName}"</strong>.
                Anyone with the link can view your code, run the live preview, and remix it!
              </p>
              <button
                onClick={handleGenerateShare}
                disabled={loading}
                className="btn-bouncy px-6 py-3 bg-[#9B6DFF] hover:bg-[#8B5CF6] text-white font-heading font-bold text-sm rounded-xl shadow-[0_4px_0_#7C3AED] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Share2 size={16} />
                <span>{loading ? 'Creating Magic Link...' : 'Create Share Link 🚀'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Share Link Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Public Share Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl, setCopiedLink)}
                    className="btn-bouncy px-3.5 py-2 bg-[#5BC0EB] text-white font-bold text-xs rounded-xl shadow-[0_2px_0_#0284c7] flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Embed Code Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Embed into another website (iframe):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedCode}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(embedCode, setCopiedEmbed)}
                    className="btn-bouncy px-3.5 py-2 bg-[#FFD166] text-[#182033] font-bold text-xs rounded-xl shadow-[0_2px_0_#d97706] flex items-center gap-1.5"
                  >
                    {copiedEmbed ? <Check size={14} /> : <Code size={14} />}
                    <span>{copiedEmbed ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Preview Button */}
              <div className="pt-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Open Shared Page in New Tab</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
