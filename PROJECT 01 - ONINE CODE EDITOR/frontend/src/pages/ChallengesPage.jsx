import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ByteMascot from '../components/mascot/ByteMascot';
import {
  Trophy, Play, RotateCcw, Send, CheckCircle2, XCircle,
  Sparkles, ChevronRight, Code2, Palette, LayoutDashboard,
  FileText, List, Table2, FormInput, CreditCard, Layers,
  Lock, Star, BookOpen, Zap, Eye, EyeOff, Filter
} from 'lucide-react';

// ─── Validation Engine ──────────────────────────────────────────────────────
// Runs in an iframe context to check user's DOM against requirements
const VALIDATOR_SCRIPT = `
(function() {
  function runValidation(rules) {
    var results = [];
    rules.forEach(function(rule) {
      var passed = false;
      var reason = '';
      try {
        switch (rule.type) {
          case 'element_exists': {
            var el = document.querySelector(rule.selector);
            passed = !!el;
            reason = passed ? '' : 'No element matching "' + rule.selector + '" found';
            break;
          }
          case 'has_text': {
            var el = document.querySelector(rule.selector);
            if (!el) { reason = 'Element "' + rule.selector + '" not found'; break; }
            var text = el.textContent || el.innerText || '';
            passed = text.trim().toLowerCase().indexOf(rule.value.toLowerCase()) !== -1;
            reason = passed ? '' : 'Text "' + rule.value + '" not found in element';
            break;
          }
          case 'element_count_min': {
            var els = document.querySelectorAll(rule.selector);
            passed = els.length >= rule.value;
            reason = passed ? '' : 'Found ' + els.length + ' elements, need at least ' + rule.value;
            break;
          }
          case 'attribute_exists': {
            var el = document.querySelector(rule.selector);
            passed = !!el;
            reason = passed ? '' : 'No element with attribute matching "' + rule.selector + '" found';
            break;
          }
          case 'all_have_attribute': {
            var els = document.querySelectorAll(rule.selector);
            if (els.length === 0) { reason = 'No "' + rule.selector + '" elements found'; break; }
            passed = Array.from(els).every(function(e) { return e.hasAttribute(rule.attribute); });
            reason = passed ? '' : 'Not all "' + rule.selector + '" elements have "' + rule.attribute + '" attribute';
            break;
          }
          case 'not_empty': {
            var el = document.querySelector(rule.selector);
            if (!el) { reason = 'Element "' + rule.selector + '" not found'; break; }
            var text = el.textContent || el.innerText || '';
            passed = text.trim().length > 0;
            reason = passed ? '' : 'Element is empty';
            break;
          }
          case 'class_exists_in_dom': {
            var el = document.querySelector(rule.selector);
            passed = !!el;
            reason = passed ? '' : 'No element with class "' + rule.selector + '" found in the HTML';
            break;
          }
          case 'css_rule_exists': {
            // Check all stylesheets for this selector/property
            var sheets = Array.from(document.styleSheets);
            var found = false;
            sheets.forEach(function(sheet) {
              try {
                var rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach(function(r) {
                  if (r.selectorText && r.selectorText.indexOf(rule.selector) !== -1) {
                    if (r.style && r.style[rule.property]) found = true;
                  }
                });
              } catch(e) {}
            });
            // Also check computed style on matching element
            if (!found) {
              var el = document.querySelector(rule.selector);
              if (el) {
                var cs = window.getComputedStyle(el);
                var val = cs.getPropertyValue(rule.property);
                if (val && val !== '' && val !== 'none' && val !== 'normal' && val !== 'auto') found = true;
              }
            }
            passed = found;
            reason = passed ? '' : 'CSS property "' + rule.property + '" not found for "' + rule.selector + '"';
            break;
          }
          case 'computed_style_check': {
            var el = document.querySelector(rule.selector);
            if (!el) { reason = 'Element "' + rule.selector + '" not found'; break; }
            var cs = window.getComputedStyle(el);
            var val = cs.getPropertyValue(rule.property);
            if (rule.check === 'not_zero') {
              var nums = (val || '').match(/\\d+(\\.\\d+)?/g) || [];
              passed = nums.some(function(n) { return parseFloat(n) > 0; });
              reason = passed ? '' : '"' + rule.property + '" is zero or not set on "' + rule.selector + '"';
            } else if (rule.check === 'not_default') {
              var isDefault = (!val || val === 'none' || val === 'auto' || val === 'normal'
                || val === 'rgba(0, 0, 0, 0)' || val === 'transparent' || val === '');
              passed = !isDefault;
              reason = passed ? '' : '"' + rule.property + '" is not set to a non-default value on "' + rule.selector + '"';
            } else if (rule.check === 'equals') {
              passed = val.trim().toLowerCase() === (rule.value || '').trim().toLowerCase();
              reason = passed ? '' : '"' + rule.property + '" equals "' + val + '", expected "' + rule.value + '"';
            }
            break;
          }
          default:
            passed = false;
            reason = 'Unknown validation type: ' + rule.type;
        }
      } catch(e) {
        passed = false;
        reason = 'Validation error: ' + e.message;
      }
      results.push({ description: rule.description, passed: passed, reason: reason });
    });
    return results;
  }

  window.__runValidation = runValidation;
})();
`;

// ─── Category Config ─────────────────────────────────────────────────────────
const CATEGORY_META = {
  html:   { label: 'HTML',    icon: Code2,          color: '#FF7EB6', bg: '#fff0f7' },
  css:    { label: 'CSS',     icon: Palette,        color: '#9B6DFF', bg: '#f5f0ff' },
  layout: { label: 'Layout',  icon: LayoutDashboard, color: '#5BC0EB', bg: '#f0faff' },
  forms:  { label: 'Forms',   icon: FormInput,      color: '#65D6B3', bg: '#f0fdf8' },
  cards:  { label: 'Cards',   icon: CreditCard,     color: '#FFD166', bg: '#fffbf0' },
};

const DIFF_META = {
  Beginner:     { color: '#22c55e', bg: '#f0fdf4', label: '🌱 Beginner' },
  Easy:         { color: '#F59E0B', bg: '#fffbeb', label: '⭐ Easy' },
  Intermediate: { color: '#9B6DFF', bg: '#f5f0ff', label: '⭐⭐ Intermediate' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ChallengesPage = () => {
  const { isAuthenticated, refreshUser } = useAuth();

  // Data
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [filterDiff, setFilterDiff] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Workspace state
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [validationResults, setValidationResults] = useState([]);

  const iframeRef = useRef(null);
  const validationResolverRef = useRef(null);

  // ── Fetch Challenges ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const res = await api.get('/challenges/');
        setChallenges(res.data);
        if (res.data.length > 0) {
          selectChallenge(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  // ── Listen for validation results from iframe ───────────────────────────────
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'CB_VALIDATION_RESULT') {
        if (validationResolverRef.current) {
          validationResolverRef.current(event.data.results);
          validationResolverRef.current = null;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ── Challenge selection ─────────────────────────────────────────────────────
  const selectChallenge = useCallback((c) => {
    setActiveChallenge(c);
    setCode(c.starter_code || '');
    setSubmitResult(null);
    setValidationResults([]);
    setShowPreview(false);
    setPreviewKey(k => k + 1);
  }, []);

  // ── Build preview HTML ──────────────────────────────────────────────────────
  const buildPreviewDoc = useCallback((userCode, withValidation = false, rules = []) => {
    let doc = userCode || '';

    // If it's not a full HTML doc, wrap it
    if (!/<html[\s>]/i.test(doc)) {
      doc = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n</head>\n<body>\n${doc}\n</body>\n</html>`;
    }

    const validationCode = withValidation ? `
<script>
${VALIDATOR_SCRIPT}
// Wait for DOM to fully render
window.addEventListener('load', function() {
  setTimeout(function() {
    try {
      var rules = ${JSON.stringify(rules)};
      var results = window.__runValidation(rules);
      window.parent.postMessage({ type: 'CB_VALIDATION_RESULT', results: results }, '*');
    } catch(e) {
      window.parent.postMessage({ type: 'CB_VALIDATION_RESULT', results: [], error: e.message }, '*');
    }
  }, 300);
});
</script>` : '';

    // Inject before </body>
    const bodyClose = doc.toLowerCase().lastIndexOf('</body>');
    if (bodyClose !== -1) {
      doc = doc.slice(0, bodyClose) + validationCode + doc.slice(bodyClose);
    } else {
      doc = doc + validationCode;
    }

    return doc;
  }, []);

  // ── Run (preview only) ──────────────────────────────────────────────────────
  const handleRun = () => {
    setShowPreview(true);
    setPreviewKey(k => k + 1);
    setSubmitResult(null);
    setValidationResults([]);
  };

  // ── Submit: validate in iframe, then record progress ────────────────────────
  const handleSubmit = async () => {
    if (!activeChallenge) return;
    if (!isAuthenticated) {
      alert('Log in or create a free account to submit challenges and earn XP! 🌟');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
    setValidationResults([]);

    const rules = activeChallenge.validation_rules || [];

    // 1. Render user code in iframe with validation script
    setShowPreview(true);
    setPreviewKey(k => k + 1);

    // 2. Wait for iframe to post results back
    try {
      const results = await new Promise((resolve, reject) => {
        validationResolverRef.current = resolve;
        // Re-render with validation script
        setTimeout(() => {
          // Force re-render with validation
          setPreviewKey(k => k + 1);
        }, 50);
        // Timeout after 5s
        setTimeout(() => {
          if (validationResolverRef.current) {
            validationResolverRef.current = null;
            reject(new Error('Validation timeout'));
          }
        }, 5000);
      });

      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      const allPassed = passedCount === totalCount && totalCount > 0;

      setValidationResults(results);
      setSubmitResult({
        passed: allPassed,
        passedCount,
        totalCount,
        xpAwarded: 0,
      });

      // 3. Record result in backend
      try {
        const res = await api.post(`/challenges/${activeChallenge.slug}/submit/`, {
          code,
          passed_count: passedCount,
          total_count: totalCount,
          all_passed: allPassed,
        });

        setSubmitResult(prev => ({
          ...prev,
          xpAwarded: res.data.xp_awarded || 0,
        }));

        // Update local challenge state to mark as passed
        if (allPassed) {
          setChallenges(prev =>
            prev.map(c => c.id === activeChallenge.id ? { ...c, user_passed: true } : c)
          );
          setActiveChallenge(prev => ({ ...prev, user_passed: true }));
          if (refreshUser) refreshUser();
        }
      } catch (err) {
        // Backend error doesn't invalidate the result — just log it
        console.warn('Failed to record submission:', err);
      }

      // Confetti!
      if (allPassed) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      }
    } catch (err) {
      setSubmitResult({
        passed: false,
        passedCount: 0,
        totalCount: rules.length,
        error: err.message === 'Validation timeout'
          ? 'Validation timed out. Make sure your HTML is valid and try again.'
          : 'An error occurred during validation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset code ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (!activeChallenge) return;
    if (!window.confirm('Reset code to the starter template? Your changes will be lost.')) return;
    setCode(activeChallenge.starter_code || '');
    setSubmitResult(null);
    setValidationResults([]);
    setShowPreview(false);
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredChallenges = challenges.filter(c => {
    const diffOk = filterDiff === 'All' || c.difficulty === filterDiff;
    const catOk = filterCat === 'All' || c.category === filterCat;
    return diffOk && catOk;
  });

  const completedCount = challenges.filter(c => c.user_passed).length;

  // ── Derive iframe src doc ───────────────────────────────────────────────────
  const iframeSrc = activeChallenge
    ? buildPreviewDoc(code, isSubmitting || !!submitResult, activeChallenge.validation_rules)
    : '';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cb-bg-cream)' }}>
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #9B6DFF15 0%, #FFD16620 50%, #65D6B315 100%)',
          borderBottom: '2px solid #e2e8f0',
        }} className="px-4 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-full mb-2 shadow-sm border border-purple-100">
                <Sparkles size={12} className="text-yellow-400" />
                <span>Byte's Coding Arena</span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-[#182033] mb-1">
                HTML &amp; CSS Challenges 🏆
              </h1>
              <p className="text-sm text-slate-500 max-w-xl">
                Practice real web development skills through hands-on challenges. Write HTML &amp; CSS, see the live preview, and get instant feedback — all in your browser!
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="text-center bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-200">
                  <div className="font-heading text-2xl font-bold text-[#9B6DFF]">
                    {completedCount}/{challenges.length}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">Completed</div>
                </div>
              )}
              <ByteMascot
                mood={submitResult?.passed ? 'celebrate' : 'happy'}
                size="md"
                speech={
                  submitResult?.passed
                    ? 'Amazing work! 🌟'
                    : activeChallenge
                    ? 'Try the challenge!'
                    : 'Pick a challenge!'
                }
              />
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
          {/* ────── Left: Challenge List ──────────────────────────────────── */}
          <div className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 flex flex-col gap-3">
            {/* Filters */}
            <div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
              >
                <Filter size={13} />
                <span>Filter Challenges</span>
                <ChevronRight size={13} className={`transition-transform ${showFilters ? 'rotate-90' : ''}`} />
              </button>

              {showFilters && (
                <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3 animate-fade-in">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Difficulty</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'Beginner', 'Easy', 'Intermediate'].map(d => (
                        <button
                          key={d}
                          onClick={() => setFilterDiff(d)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            filterDiff === d
                              ? 'bg-[#9B6DFF] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', ...Object.keys(CATEGORY_META)].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilterCat(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            filterCat === cat
                              ? 'bg-[#5BC0EB] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'All' ? 'All' : CATEGORY_META[cat]?.label || cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Challenge Cards */}
            <div className="text-xs font-bold text-slate-500 px-1">
              {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1 pb-2">
                {filteredChallenges.map(c => {
                  const isSelected = activeChallenge?.id === c.id;
                  const catMeta = CATEGORY_META[c.category] || CATEGORY_META.html;
                  const diffMeta = DIFF_META[c.difficulty] || DIFF_META.Beginner;
                  const CatIcon = catMeta.icon;

                  return (
                    <div
                      key={c.id}
                      id={`challenge-card-${c.slug}`}
                      onClick={() => selectChallenge(c)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-white border-[#9B6DFF] shadow-md shadow-purple-100'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: catMeta.bg }}
                          >
                            <CatIcon size={12} style={{ color: catMeta.color }} />
                          </div>
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{ background: diffMeta.bg, color: diffMeta.color }}
                          >
                            {diffMeta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {c.user_passed && (
                            <span title="Completed!" className="text-emerald-500">
                              <CheckCircle2 size={15} />
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-amber-500">
                            +{c.xp_reward} XP
                          </span>
                        </div>
                      </div>

                      <h3 className="font-heading font-bold text-sm text-[#182033] leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {c.description}
                      </p>

                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#9B6DFF]">
                          <ChevronRight size={11} />
                          <span>Currently selected</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ────── Right: Workspace ───────────────────────────────────────── */}
          {activeChallenge ? (
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Challenge Title Row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const catMeta = CATEGORY_META[activeChallenge.category] || CATEGORY_META.html;
                      const diffMeta = DIFF_META[activeChallenge.difficulty] || DIFF_META.Beginner;
                      const CatIcon = catMeta.icon;
                      return (
                        <>
                          <span
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: diffMeta.bg, color: diffMeta.color }}
                          >
                            {diffMeta.label}
                          </span>
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: catMeta.bg, color: catMeta.color }}
                          >
                            <CatIcon size={10} />
                            {catMeta.label}
                          </span>
                          <span className="text-[11px] font-bold text-amber-500">
                            +{activeChallenge.xp_reward} XP
                          </span>
                          {activeChallenge.user_passed && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} />
                              Completed!
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-[#182033]">
                    {activeChallenge.title}
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    id="challenge-reset-btn"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>
                  <button
                    id="challenge-run-btn"
                    onClick={handleRun}
                    className="btn-bouncy flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#182033] bg-[#65D6B3] rounded-xl shadow-[0_3px_0_#059669] hover:bg-[#34d399] transition-all cursor-pointer"
                  >
                    <Play size={13} fill="#182033" />
                    Run
                  </button>
                  <button
                    id="challenge-submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-bouncy flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#9B6DFF] rounded-xl shadow-[0_3px_0_#6d28d9] hover:bg-[#7c3aed] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Instructions + Editor + Preview ──────────────────────── */}
              <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
                {/* Left column: Instructions */}
                <div className="w-full xl:w-[280px] flex-shrink-0 flex flex-col gap-3">
                  {/* Problem Statement */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-[#9B6DFF]" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Problem</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {activeChallenge.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <List size={14} className="text-[#5BC0EB]" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Requirements</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        {(activeChallenge.validation_rules || []).length} checks
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(activeChallenge.validation_rules || []).map((rule, idx) => {
                        const result = validationResults[idx];
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-2 rounded-xl text-xs transition-all ${
                              result
                                ? result.passed
                                  ? 'bg-emerald-50 border border-emerald-200'
                                  : 'bg-red-50 border border-red-200'
                                : 'bg-slate-50 border border-slate-100'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {result ? (
                                result.passed ? (
                                  <CheckCircle2 size={13} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={13} className="text-red-500" />
                                )
                              ) : (
                                <div className="w-3 h-3 rounded-full border-2 border-slate-300 mt-0.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={
                                result
                                  ? result.passed
                                    ? 'text-emerald-800 font-semibold'
                                    : 'text-red-800 font-semibold'
                                  : 'text-slate-600'
                              }>
                                {rule.description}
                              </span>
                              {result && !result.passed && result.reason && (
                                <div className="text-[10px] text-red-500 mt-0.5 italic">
                                  {result.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Instructions detail */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Step-by-Step
                      </div>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                        {activeChallenge.instructions}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Right column: Editor + Preview */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  {/* Editor */}
                  <div className="flex flex-col flex-1 bg-[#1E293B] rounded-2xl overflow-hidden border border-[#334155]" style={{ minHeight: 320 }}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border-b border-[#334155]">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 ml-1">index.html</span>
                      <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Zap size={10} className="text-yellow-400" />
                        HTML Editor
                      </div>
                    </div>
                    <div className="flex-1" style={{ minHeight: 280 }}>
                      <Editor
                        height="100%"
                        language="html"
                        value={code}
                        theme="vs-dark"
                        onChange={(val) => {
                          setCode(val || '');
                          setSubmitResult(null);
                          setValidationResults([]);
                        }}
                        options={{
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          minimap: { enabled: false },
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          padding: { top: 10, bottom: 10 },
                          wordWrap: 'on',
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 240 }}>
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Eye size={13} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Live Preview</span>
                        {showPreview && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">Sandboxed iframe</span>
                        <button
                          onClick={() => setShowPreview(v => !v)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1"
                        >
                          {showPreview ? <EyeOff size={11} /> : <Eye size={11} />}
                          {showPreview ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {showPreview ? (
                      <div className="flex-1 relative bg-white" style={{ minHeight: 200 }}>
                        <iframe
                          key={`${previewKey}-${isSubmitting}`}
                          ref={iframeRef}
                          title="Challenge Preview"
                          sandbox="allow-scripts"
                          srcDoc={iframeSrc}
                          className="w-full h-full border-none"
                          style={{ minHeight: 200 }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center py-8 text-slate-300">
                        <div className="text-center">
                          <Eye size={28} className="mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-semibold">Click <strong>Run</strong> to see your preview</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Result */}
                  {submitResult && (
                    <div
                      id="challenge-result-panel"
                      className={`rounded-2xl border-2 p-4 animate-fade-in ${
                        submitResult.error
                          ? 'bg-yellow-50 border-yellow-300'
                          : submitResult.passed
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      {submitResult.error ? (
                        <div className="flex items-center gap-2 text-yellow-800 font-bold text-sm">
                          <span>⚠️</span>
                          <span>{submitResult.error}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            {submitResult.passed ? (
                              <>
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                  <Trophy size={18} className="text-white" />
                                </div>
                                <div>
                                  <div className="font-heading font-bold text-lg text-emerald-900">
                                    Challenge Passed! 🎉
                                  </div>
                                  <div className="text-xs text-emerald-600">
                                    {submitResult.passedCount}/{submitResult.totalCount} requirements completed
                                    {submitResult.xpAwarded > 0 && (
                                      <span className="ml-2 font-bold text-amber-600">
                                        +{submitResult.xpAwarded} XP earned!
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                                  <Star size={18} className="text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-heading font-bold text-lg text-orange-900">
                                    Almost there! 💪
                                  </div>
                                  <div className="text-xs text-orange-600">
                                    {submitResult.passedCount}/{submitResult.totalCount} requirements completed
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round((submitResult.passedCount / Math.max(submitResult.totalCount, 1)) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${(submitResult.passedCount / Math.max(submitResult.totalCount, 1)) * 100}%`,
                                  background: submitResult.passed ? '#10b981' : '#f97316',
                                }}
                              />
                            </div>
                          </div>

                          {/* Failed requirements */}
                          {!submitResult.passed && validationResults.filter(r => !r.passed).length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                                Missing requirements:
                              </div>
                              {validationResults
                                .filter(r => !r.passed)
                                .map((r, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-xs text-orange-800">
                                    <XCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{r.description}</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ByteMascot mood="happy" size="lg" speech="Pick a challenge to start!" />
                <h3 className="font-heading text-xl font-bold text-slate-400 mt-4">
                  Select a challenge to begin
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Choose from the list on the left to start coding!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChallengesPage;
