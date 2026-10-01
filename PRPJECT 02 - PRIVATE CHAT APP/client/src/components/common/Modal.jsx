import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deeppurple/30 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full ${maxWidth} bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border-2 border-pastelpurple/40 dark:border-deeppurple/40 overflow-hidden transform transition-all animate-pop`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-softpink/40 via-pastelpurple/30 to-sky/30 dark:from-deeppurple/30 dark:to-slate-800/40 border-b border-pastelpurple/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="font-fredoka font-semibold text-lg text-deeppurple dark:text-pastelpurple">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-slate-800/80 text-darktext/70 hover:text-coral hover:bg-white dark:hover:bg-slate-800 shadow-sm transition hover:scale-105"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        <div className="p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
