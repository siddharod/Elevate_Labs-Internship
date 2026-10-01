import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, FileCode, Check } from 'lucide-react';
import api from '../../services/api';

export const HistoryModal = ({ isOpen, onClose, projectId, onRestoreVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/projects/${projectId}/history/`);
          setVersions(res.data);
          if (res.data.length > 0) {
            setSelectedVersion(res.data[0]);
          }
        } catch (err) {
          console.error('Failed to load version history:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleRestore = async (versionNumber) => {
    if (!window.confirm(`Are you sure you want to restore Version ${versionNumber}? Your current work will be safely preserved as a backup snapshot.`)) {
      return;
    }
    setRestoring(true);
    try {
      const res = await api.post(`/projects/${projectId}/restore/${versionNumber}/`);
      onRestoreVersion(res.data.project);
      onClose();
    } catch (err) {
      alert('Failed to restore version: ' + (err.response?.data?.error || err.message));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-[#5BC0EB] animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#F4F9FF] p-4 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFD166] text-[#182033] rounded-2xl shadow-xs">
              <History size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#182033]">Project Version History</h2>
              <p className="text-xs text-slate-500">Inspect past saves and travel back in time safely!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
          {/* Versions List */}
          <div className="w-full md:w-1/2 border border-slate-200 rounded-2xl p-2 space-y-2 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading time machine... ⏳</div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No previous versions saved yet.</div>
            ) : (
              versions.map((v) => {
                const isSelected = selectedVersion?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#5BC0EB]/15 border-[#5BC0EB] text-[#0284C7]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs font-heading">
                        Version {v.version_number}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium truncate text-slate-600">
                      "{v.message}"
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Version Details & Restore Action */}
          <div className="w-full md:w-1/2 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
            {selectedVersion ? (
              <div>
                <h3 className="font-heading font-bold text-[#182033] text-sm mb-1">
                  Version {selectedVersion.version_number} Details
                </h3>
                <p className="text-xs text-slate-500 mb-3 font-mono">
                  Saved: {new Date(selectedVersion.created_at).toLocaleString()}
                </p>

                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-600 mb-2">Files in this snapshot:</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedVersion.files?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono bg-white p-1.5 rounded-lg border border-slate-200">
                        <FileCode size={13} className="text-[#5BC0EB]" />
                        <span>{f.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-12">
                Select a version on the left to inspect.
              </div>
            )}

            {selectedVersion && (
              <button
                onClick={() => handleRestore(selectedVersion.version_number)}
                disabled={restoring}
                className="btn-bouncy w-full py-2.5 px-4 bg-[#65D6B3] hover:bg-[#4ade80] text-[#182033] font-heading font-bold text-sm rounded-xl shadow-[0_3px_0_#10B981] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw size={16} />
                <span>{restoring ? 'Restoring...' : `Restore to Version ${selectedVersion.version_number}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
