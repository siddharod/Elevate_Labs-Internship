import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ByteMascot from '../components/mascot/ByteMascot';
import {
  Plus, Clock, ChevronRight, Trash2, Copy, AlertTriangle, X, Loader2
} from 'lucide-react';

// ─── Inline Delete Confirmation Dialog ───────────────────────────────────────
const DeleteDialog = ({ projectName, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-3xl border-2 border-red-200 shadow-2xl p-6 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg text-[#182033]">Delete Project?</h3>
          <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-6 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono">
        "{projectName}"
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Error Toast ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onClose }) => (
  <div className="fixed top-20 right-4 z-50 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 max-w-sm animate-fade-in">
    <AlertTriangle size={16} className="flex-shrink-0" />
    <span className="text-sm font-bold flex-1">{message}</span>
    <button onClick={onClose} className="p-0.5 hover:text-red-900"><X size={14} /></button>
  </div>
);

// ─── DashboardPage ────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/');
      setData(res.data);
    } catch (err) {
      setError('Failed to load your dashboard. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateNewProject = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await api.post('/projects/', {
        name: 'My Web Project',
        language: 'html',
      });
      navigate(`/workspace/${res.data.id}`);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      setCreating(false);
    }
  };

  const handleDuplicateProject = async (projId) => {
    try {
      await api.post(`/projects/${projId}/duplicate/`);
      fetchDashboard();
    } catch {
      setError('Failed to duplicate project.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteTarget.id}/`);
      setDeleteTarget(null);
      fetchDashboard();
    } catch {
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const displayName =
    data?.user?.display_name ||
    user?.profile?.display_name ||
    user?.username ||
    'Coder';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}
      {deleteTarget && (
        <DeleteDialog
          projectName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#5BC0EB]/20 via-[#9B6DFF]/15 to-[#FFD166]/20 border-2 border-[#5BC0EB]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
              {getGreeting()}, {displayName}!
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#182033]">
              Ready to build something? 🚀
            </h1>
            <p className="text-sm text-[#475569] font-medium max-w-md">
              Pick up where you left off or start a brand new project.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <ByteMascot mood="happy" size="lg" speech={`Level ${data?.user?.level || 1}!⭐`} />
            <button
              onClick={handleCreateNewProject}
              disabled={creating}
              className="btn-bouncy px-5 py-3 bg-gradient-to-r from-[#5BC0EB] to-[#9B6DFF] text-white font-heading font-bold text-sm rounded-xl shadow-[0_3px_0_#7C3AED] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-70"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-[#5BC0EB]/30 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">🧩</span>
              <span className="font-heading font-extrabold text-2xl text-[#182033]">
                {data?.stats?.projects_count ?? 0}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B]">My Projects</span>
          </div>
          <div className="bg-white border-2 border-[#9B6DFF]/30 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">🚀</span>
              <span className="font-heading font-extrabold text-2xl text-[#182033]">
                {data?.stats?.coding_sessions ?? 0}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B]">Coding Sessions</span>
          </div>
          <div className="bg-white border-2 border-[#FFD166]/50 rounded-2xl p-4 sm:p-5 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">⭐</span>
              <span className="font-heading font-extrabold text-2xl text-[#182033]">
                {data?.user?.level ?? 1}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B]">Current Level</span>
          </div>
        </div>

        {/* Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-[#182033]">
              My Projects
            </h2>
            <button
              onClick={handleCreateNewProject}
              disabled={creating}
              className="text-xs font-bold text-[#5BC0EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              New Project
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#5BC0EB]" />
              <span className="text-sm text-slate-400 font-medium">Loading your projects...</span>
            </div>
          ) : !data?.recent_projects || data.recent_projects.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <ByteMascot mood="idle" size="md" />
              <h3 className="font-heading font-bold text-xl text-[#182033]">No projects yet!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Create your first project and start building websites with HTML, CSS, and JavaScript.
              </p>
              <button
                onClick={handleCreateNewProject}
                disabled={creating}
                className="btn-bouncy px-6 py-3 bg-[#FFD166] hover:bg-[#FF9F68] text-[#182033] font-heading font-bold text-sm rounded-xl shadow-[0_3px_0_#D97706] inline-flex items-center gap-2 cursor-pointer"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.recent_projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border-2 border-slate-200 hover:border-[#5BC0EB] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌐</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                          HTML · CSS · JS
                        </span>
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-[#182033] group-hover:text-[#0284C7] transition-colors truncate mb-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mb-4">
                      <Clock size={11} />
                      Updated {new Date(proj.updated_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-[#9B6DFF] hover:bg-purple-50 rounded-lg transition-colors"
                        title="Duplicate project"
                        aria-label="Duplicate project"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: proj.id, name: proj.name })}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete project"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <Link
                      to={`/workspace/${proj.id}`}
                      className="btn-bouncy px-4 py-2 bg-[#FFD166] text-[#182033] font-bold text-xs rounded-xl shadow-[0_2px_0_#D97706] flex items-center gap-1 hover:bg-[#FF9F68] transition-colors"
                    >
                      <span>Open</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
