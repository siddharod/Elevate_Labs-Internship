import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ByteMascot from '../components/mascot/ByteMascot';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  BookOpen, CheckCircle, Sparkles, Play, Award,
  ChevronRight, ArrowLeft, Lightbulb, Check
} from 'lucide-react';

export const LearningPage = () => {
  const { isAuthenticated, refreshUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('html');
  const [activeLesson, setActiveLesson] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get('/learning/lessons/');
        setLessons(res.data);
        const first = res.data.find((l) => l.track === selectedTrack) || res.data[0];
        if (first) {
          setActiveLesson(first);
          setUserCode(first.starter_code);
        }
      } catch (err) {
        console.error('Failed to load lessons:', err);
      }
    };
    fetchLessons();
  }, [selectedTrack]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setUserCode(lesson.starter_code);
    setOutput('');
    setCompletedSuccess(false);
  };

  const handleRunTryIt = () => {
    if (activeLesson.track === 'html' || activeLesson.track === 'css') {
      setOutput('Rendered code in preview! ✨');
    } else if (activeLesson.track === 'javascript') {
      try {
        const logs = [];
        const mockLog = (...args) => logs.push(args.join(' '));
        const runFn = new Function('console', userCode);
        runFn({ log: mockLog, warn: mockLog, error: mockLog });
        setOutput(logs.join('\n') || 'Code ran smoothly with no output!');
      } catch (e) {
        setOutput(`Error: ${e.message}`);
      }
    } else if (activeLesson.track === 'python') {
      api.post('/execute/', { language: 'python', code: userCode })
        .then((res) => {
          setOutput(res.data.stdout || res.data.stderr || 'No output produced.');
        })
        .catch((err) => {
          setOutput(`Execution failed: ${err.message}`);
        });
    }
  };

  const handleCompleteLesson = async () => {
    if (!isAuthenticated) {
      alert('Log in or sign up to save progress and earn XP badges!');
      return;
    }
    setCompleting(true);
    try {
      await api.post(`/learning/lessons/${activeLesson.slug}/complete/`);
      setCompletedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const tracks = [
    { id: 'html', label: 'HTML Foundations', icon: '🌐', color: 'text-orange-500' },
    { id: 'css', label: 'CSS Styling Magic', icon: '🎨', color: 'text-sky-500' },
    { id: 'javascript', label: 'JavaScript Spells', icon: '⚡', color: 'text-yellow-500' },
    { id: 'python', label: 'Python Adventure', icon: '🐍', color: 'text-emerald-500' },
  ];

  const filteredLessons = lessons.filter((l) => l.track === selectedTrack);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Track Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-xs">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#182033] flex items-center gap-2">
              <BookOpen size={24} className="text-[#5BC0EB]" />
              <span>Learn &amp; Code Adventures 🚀</span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive, bite-sized lessons with live practice and Byte the robot companion.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTrack === t.id
                    ? 'bg-[#182033] text-[#FFD166] shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lessons Nav List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-heading font-bold text-sm text-slate-600 px-1">
              Lessons in this Track ({filteredLessons.length})
            </h2>
            <div className="space-y-2">
              {filteredLessons.map((l) => {
                const isActive = activeLesson?.id === l.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => handleSelectLesson(l)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-white border-[#5BC0EB] shadow-md scale-[1.01]'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          Lesson {l.order}
                        </span>
                        {l.completed && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle size={13} /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-sm text-[#182033]">
                        {l.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#9B6DFF]">
                        +{l.xp_reward} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Byte Companion Card */}
            <div className="bg-gradient-to-br from-[#FFFDF7] to-[#F4F9FF] border-2 border-[#9B6DFF]/30 p-5 rounded-3xl flex items-center gap-4 shadow-xs mt-4">
              <ByteMascot mood="happy" size="md" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-[#182033] mb-1">Byte's Pro Tip:</p>
                <p>Don't be afraid to experiment! Code never breaks the screen—try changing the numbers or text!</p>
              </div>
            </div>
          </div>

          {/* Lesson Content & Interactive Try-It Editor */}
          <div className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col space-y-5">
            {activeLesson ? (
              <>
                {/* Lesson Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#0284C7] bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {activeLesson.track} Track • Lesson {activeLesson.order}
                    </span>
                    <span className="text-xs font-bold text-[#9B6DFF] bg-purple-50 px-3 py-1 rounded-full">
                      ⭐ {activeLesson.xp_reward} Coding XP
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl font-extrabold text-[#182033] mb-2">
                    {activeLesson.title}
                  </h2>
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold mb-3 flex items-start gap-2">
                    <Lightbulb size={16} className="text-[#FF9F68] shrink-0 mt-0.5" />
                    <span><strong>Concept:</strong> {activeLesson.concept}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {activeLesson.explanation}
                  </p>
                </div>

                {/* Try It Live Playground */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-[#182033] flex items-center gap-1.5">
                      <span>Interactive Try-It Sandbox</span>
                      <Sparkles size={14} className="text-[#FFD166]" />
                    </h3>
                    <button
                      onClick={handleRunTryIt}
                      className="btn-bouncy px-4 py-1.5 bg-[#FFD166] hover:bg-[#FF9F68] text-[#182033] font-bold text-xs rounded-xl shadow-[0_2px_0_#D97706] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play size={13} fill="#182033" />
                      <span>Run Code</span>
                    </button>
                  </div>

                  {/* Monaco Editor Mini */}
                  <div className="h-48 border-2 border-[#182033] rounded-2xl overflow-hidden shadow-xs">
                    <Editor
                      height="100%"
                      language={activeLesson.track === 'html' ? 'html' : activeLesson.track === 'css' ? 'css' : activeLesson.track}
                      value={userCode}
                      theme="vs-dark"
                      onChange={(val) => setUserCode(val || '')}
                      options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 8, bottom: 8 },
                      }}
                    />
                  </div>

                  {/* Live Output */}
                  {output && (
                    <div className="p-3 bg-[#182033] text-slate-200 rounded-xl font-mono text-xs border border-slate-700">
                      <span className="text-[10px] text-slate-400 block mb-1">Output Result:</span>
                      <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                  )}

                  {/* Hint Box */}
                  {activeLesson.hint && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      💡 <strong>Hint:</strong> {activeLesson.hint}
                    </div>
                  )}
                </div>

                {/* Completion Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Finished trying this lesson?
                  </span>
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completing || completedSuccess}
                    className={`btn-bouncy px-6 py-2.5 font-heading font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                      completedSuccess
                        ? 'bg-[#65D6B3] text-[#182033] shadow-[0_3px_0_#10B981]'
                        : 'bg-[#9B6DFF] hover:bg-[#8B5CF6] text-white shadow-[0_3px_0_#7C3AED]'
                    }`}
                  >
                    {completedSuccess ? (
                      <>
                        <Check size={16} />
                        <span>Completed! (+{activeLesson.xp_reward} XP)</span>
                      </>
                    ) : (
                      <>
                        <Award size={16} />
                        <span>{completing ? 'Awarding XP...' : 'Complete & Earn XP'}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm">
                Select a lesson on the left to begin learning!
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LearningPage;
