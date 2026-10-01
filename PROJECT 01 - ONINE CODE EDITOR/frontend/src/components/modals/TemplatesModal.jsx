import React, { useState } from 'react';
import { X, LayoutTemplate, ArrowRight, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';

export const TemplatesModal = ({ isOpen, onClose, onLoadTemplate }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'HTML / CSS / JS'];

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleSelect = (template) => {
    if (window.confirm(`Load "${template.title}" template into your project?`)) {
      onLoadTemplate(template);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-4 border-[#FFD166] animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#FFFDF7] p-4 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFD166] text-[#182033] rounded-2xl shadow-xs">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#182033]">Beginner Starter Templates</h2>
              <p className="text-xs text-slate-500">Pick a fun project to learn from, tweak, and play!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#182033] text-[#FFD166] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-[#F8FAFC] border-2 border-slate-200 hover:border-[#5BC0EB] rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#5BC0EB]/20 text-[#0284C7]">
                    {t.category}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#182033] mb-1">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {t.description}
                </p>
              </div>

              <button
                onClick={() => handleSelect(t)}
                className="btn-bouncy w-full py-2 bg-white group-hover:bg-[#FFD166] text-[#182033] font-bold text-xs rounded-xl border border-slate-300 group-hover:border-[#D97706] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
