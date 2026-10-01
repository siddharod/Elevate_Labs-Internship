import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ByteMascot from '../components/mascot/ByteMascot';
import Editor from '@monaco-editor/react';
import {
  Share2, Copy, GitFork, Play, Eye, Calendar,
  Check, FileCode, ArrowLeft, Loader2
} from 'lucide-react';

export const SharedProjectPage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remixing, setRemixing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await api.get(`/share/${shareId}/`);
        setProject(res.data);
      } catch (err) {
        console.error('Failed to load shared project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [shareId]);

  const handleRemix = async () => {
    if (!isAuthenticated) {
      alert('Please log in or sign up to remix this project into your workspace!');
      navigate('/login');
      return;
    }
    setRemixing(true);
    try {
      const res = await api.post(`/share/${shareId}/remix/`);
      navigate(`/workspace/${res.data.project_id}`);
    } catch (err) {
      alert('Failed to remix project: ' + (err.response?.data?.error || err.message));
    } finally {
      setRemixing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <ByteMascot mood="thinking" size="md" />
            <p className="text-sm font-bold text-slate-500">Unpacking shared creation... ⏳</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm space-y-4">
            <ByteMascot mood="error" size="lg" speech="Oh no! We couldn't find this shared project." />
            <h2 className="font-heading text-xl font-bold text-[#182033]">Project Not Found</h2>
            <Link to="/" className="btn-bouncy inline-block px-5 py-2.5 bg-[#5BC0EB] text-white font-bold rounded-xl text-xs">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const files = project.snapshot_files || [];
  const currentFile = files[activeFileIndex] || files[0];

  // Assemble HTML/CSS/JS preview
  const htmlContent = files.find((f) => f.filename.endsWith('.html'))?.content || '';
  const cssContent = files.find((f) => f.filename.endsWith('.css'))?.content || '';
  const jsContent = files.filter((f) => f.filename.endsWith('.js')).map((f) => f.content).join('\n');

  const previewDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>
          try { ${jsContent} } catch(e) { console.error(e); }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Shared Project Info Header */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {project.snapshot_language}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={13} />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Eye size={13} />
                {project.views_count} views
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#182033]">
              {project.snapshot_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Created by <span className="font-bold text-[#5BC0EB]">@{project.author_username}</span> (Read-Only Snapshot)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="btn-bouncy px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleRemix}
              disabled={remixing}
              className="btn-bouncy px-5 py-2.5 bg-gradient-to-r from-[#9B6DFF] to-[#5BC0EB] text-white font-heading font-bold text-sm rounded-xl shadow-[0_3px_0_#7C3AED] flex items-center gap-2 cursor-pointer transition-all"
            >
              {remixing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GitFork size={16} />
              )}
              <span>Remix &amp; Fork 🚀</span>
            </button>
          </div>
        </div>

        {/* Code & Preview Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* Code Viewer Panel */}
          <div className="lg:col-span-6 bg-[#182033] rounded-3xl overflow-hidden flex flex-col border-2 border-slate-700 shadow-md">
            {/* File Tabs */}
            <div className="bg-[#0F172A] border-b border-slate-700 px-3 py-1 flex items-center gap-1 overflow-x-auto">
              {files.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFileIndex(i)}
                  className={`px-3 py-1 text-xs font-mono rounded-t-lg transition-colors cursor-pointer ${
                    activeFileIndex === i
                      ? 'bg-[#182033] text-[#FFD166] border-t-2 border-[#5BC0EB]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.filename}
                </button>
              ))}
            </div>

            {/* Monaco Viewer (Read Only) */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={currentFile?.language || 'javascript'}
                value={currentFile?.content || ''}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                }}
              />
            </div>
          </div>

          {/* Live Preview / Output */}
          <div className="lg:col-span-6 bg-white rounded-3xl overflow-hidden flex flex-col border-2 border-slate-200 shadow-md">
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Play size={14} className="text-[#65D6B3]" fill="#65D6B3" />
                <span>Live Interactive Sandbox</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sandboxed iframe</span>
            </div>

            <div className="flex-1 bg-white">
              {project.snapshot_language === 'html' || project.snapshot_language === 'javascript' ? (
                <iframe
                  title="Shared Project Preview"
                  sandbox="allow-scripts allow-modals"
                  srcDoc={previewDoc}
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-[#182033] text-slate-300 font-mono text-xs">
                  <p>Click "Remix &amp; Fork" to run this {project.snapshot_language} code in your own workspace!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SharedProjectPage;
