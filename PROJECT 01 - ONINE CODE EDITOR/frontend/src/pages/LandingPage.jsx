import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Code2, Play, BookOpen,
  CheckCircle2, ArrowRight, Heart, Globe, Palette, Zap
} from 'lucide-react';
import ByteMascot from '../components/mascot/ByteMascot';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 border-b-2 border-[#E2E8F0]">
        {/* Subtle floating background elements */}
        <div className="absolute top-10 left-8 text-3xl animate-float opacity-60 select-none pointer-events-none">☁️</div>
        <div className="absolute top-24 right-16 text-2xl animate-float opacity-50 select-none pointer-events-none" style={{ animationDelay: '1.5s' }}>⭐</div>
        <div className="absolute bottom-12 left-1/4 text-2xl animate-float opacity-40 select-none pointer-events-none" style={{ animationDelay: '2.5s' }}>🪐</div>
        <div className="absolute top-1/3 right-1/4 text-2xl animate-float opacity-50 select-none pointer-events-none" style={{ animationDelay: '1s' }}>✨</div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 z-10">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 bg-[#5BC0EB]/15 text-[#0284C7] font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full border border-[#5BC0EB]/30">
              <Sparkles size={15} className="text-[#5BC0EB]" />
              <span>Beginner-Friendly Online Code Editor</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-[#182033] tracking-tight leading-[1.15]">
              Learn. Code. <span className="text-[#5BC0EB]">Create.</span>
            </h1>

            <p className="text-base sm:text-xl text-[#64748B] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Build and preview websites directly in your browser. Write HTML, CSS, and JavaScript — and see your results instantly. No setup required.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/workspace/new' : '/register'}
                className="btn-bouncy w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FFD166] to-[#FF9F68] text-[#182033] font-heading font-bold text-lg rounded-2xl shadow-[0_5px_0_#D97706] flex items-center justify-center gap-3 transition-all"
              >
                <Play size={20} fill="#182033" />
                <span>Start Coding</span>
              </Link>
              <Link
                to="/login"
                className="btn-bouncy w-full sm:w-auto px-7 py-4 bg-white text-[#182033] font-heading font-bold text-base rounded-2xl border-2 border-slate-300 shadow-[0_3px_0_#CBD5E1] flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
              >
                <span>Log In</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Feature badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 size={13} className="text-[#65D6B3]" /> Monaco Editor
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 size={13} className="text-[#65D6B3]" /> HTML · CSS · JS
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 size={13} className="text-[#65D6B3]" /> No Setup Required
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 size={13} className="text-[#65D6B3]" /> Save Projects
              </span>
            </div>
          </div>

          {/* Right Column: Mascot Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-sm flex items-center justify-center">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-[#5BC0EB]/15 blur-3xl rounded-full transform scale-90 pointer-events-none" />

              <ByteMascot
                mood="celebrate"
                size="hero"
                speech="Ready to build something awesome today?"
                className="z-10"
              />

              {/* Floating language badges */}
              <div className="absolute -top-4 -left-4 bg-white border-2 border-[#FF9F68] shadow-md px-3 py-1 rounded-xl text-xs font-heading font-bold text-[#FF9F68] animate-float flex items-center gap-1">
                <Globe size={12} /> HTML
              </div>
              <div className="absolute top-12 -right-4 bg-white border-2 border-[#5BC0EB] shadow-md px-3 py-1 rounded-xl text-xs font-heading font-bold text-[#5BC0EB] animate-float flex items-center gap-1" style={{ animationDelay: '1s' }}>
                <Palette size={12} /> CSS
              </div>
              <div className="absolute bottom-16 -left-6 bg-white border-2 border-[#FFD166] shadow-md px-3 py-1 rounded-xl text-xs font-heading font-bold text-[#D97706] animate-float flex items-center gap-1" style={{ animationDelay: '2s' }}>
                <Zap size={12} /> JavaScript
              </div>
              <div className="absolute bottom-4 -right-2 bg-white border-2 border-[#65D6B3] shadow-md px-3 py-1 rounded-xl text-xs font-heading font-bold text-[#059669] animate-float flex items-center gap-1" style={{ animationDelay: '1.5s' }}>
                💾 Save Projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#182033] mb-3">
            How <span className="text-[#5BC0EB]">CodeBuddy</span> Works
          </h2>
          <p className="text-slate-600 font-medium">
            Three simple steps to go from zero to a working website.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '✍️',
              title: 'Write Your Code',
              desc: 'Use the industry-standard Monaco editor with syntax highlighting for HTML, CSS, and JavaScript.',
              bg: 'bg-sky-50',
              border: 'border-[#5BC0EB]',
              stepColor: 'text-[#5BC0EB]',
            },
            {
              step: '02',
              icon: '▶️',
              title: 'Click Run',
              desc: 'Hit the Run button and see your webpage come to life instantly — right inside your browser.',
              bg: 'bg-amber-50',
              border: 'border-[#FFD166]',
              stepColor: 'text-[#D97706]',
            },
            {
              step: '03',
              icon: '💾',
              title: 'Save & Come Back',
              desc: 'Create an account to save your projects and continue working on them anytime.',
              bg: 'bg-emerald-50',
              border: 'border-[#65D6B3]',
              stepColor: 'text-[#059669]',
            },
          ].map((card) => (
            <div
              key={card.step}
              className={`p-6 rounded-3xl border-2 ${card.border} ${card.bg} transition-all hover:-translate-y-1 shadow-xs`}
            >
              <div className={`font-heading font-extrabold text-xs uppercase tracking-widest mb-2 ${card.stepColor}`}>
                Step {card.step}
              </div>
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-heading font-bold text-lg text-[#182033] mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 px-4 lg:px-8 bg-white border-y-2 border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-extrabold text-[#182033]">
              Everything You Need to <span className="text-[#9B6DFF]">Start Coding</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              A focused, distraction-free environment built for beginners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '💻',
                title: 'Real Monaco Editor',
                desc: 'The same editor that powers VS Code — with syntax highlighting, autocomplete, and bracket matching.',
                bg: 'bg-purple-50',
                border: 'border-[#9B6DFF]',
              },
              {
                icon: '⚡',
                title: 'Instant Live Preview',
                desc: 'See your webpage update immediately. Build interactive sites with HTML, CSS, and JavaScript.',
                bg: 'bg-amber-50',
                border: 'border-[#FFD166]',
              },
              {
                icon: '💾',
                title: 'Save Your Projects',
                desc: 'Create a free account and save unlimited projects. Continue coding from any device.',
                bg: 'bg-sky-50',
                border: 'border-[#5BC0EB]',
              },
              {
                icon: '🗂️',
                title: 'Multi-File Support',
                desc: 'Work with index.html, style.css, and script.js in separate tabs — just like a real IDE.',
                bg: 'bg-emerald-50',
                border: 'border-[#65D6B3]',
              },
              {
                icon: '🛡️',
                title: 'Safe Sandbox',
                desc: 'Your code runs in a secure isolated sandbox. Experiment freely without breaking anything.',
                bg: 'bg-pink-50',
                border: 'border-[#FF7EB6]',
              },
              {
                icon: '🤖',
                title: 'Byte, Your Coding Buddy',
                desc: 'Our friendly mascot cheers you on and gives helpful hints when your code has an error.',
                bg: 'bg-orange-50',
                border: 'border-[#FF9F68]',
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border-2 ${card.border} ${card.bg} transition-all hover:-translate-y-1 shadow-xs`}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-heading font-bold text-lg text-[#182033] mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-white to-[#F4F9FF]">
        <div className="max-w-2xl mx-auto space-y-6">
          <ByteMascot mood="happy" size="lg" speech="Let's write your first line of code!" />
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#182033]">
            Ready to Start Building?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Create your free account and start coding in seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-bouncy inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FFD166] to-[#FF9F68] text-[#182033] font-heading font-bold text-lg rounded-2xl shadow-[0_5px_0_#D97706] transition-all"
            >
              <Sparkles size={20} />
              <span>Create Free Account</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/workspace/new"
                className="btn-bouncy inline-flex items-center gap-2 px-7 py-4 bg-[#65D6B3] text-[#182033] font-heading font-bold text-base rounded-2xl shadow-[0_4px_0_#059669] transition-all"
              >
                <Play size={18} fill="#182033" />
                <span>Open Editor</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
