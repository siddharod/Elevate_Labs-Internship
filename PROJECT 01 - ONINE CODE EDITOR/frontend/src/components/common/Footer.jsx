import React from 'react';
import { Link } from 'react-router-dom';
import ByteMascot from '../mascot/ByteMascot';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-[#E2E8F0] pt-10 pb-8 px-4 lg:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <ByteMascot mood="celebrate" size="sm" animated={false} />
          <div>
            <div className="font-heading font-bold text-xl text-[#182033]">
              Code<span className="text-[#5BC0EB]">Buddy</span>
            </div>
            <p className="text-xs text-[#64748B] max-w-xs">
              A beginner-friendly code editor. Build websites directly in your browser.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-sm font-bold text-[#64748B]">
          <Link to="/" className="hover:text-[#182033] transition-colors">Home</Link>
          <Link to="/register" className="hover:text-[#5BC0EB] transition-colors">Register</Link>
          <Link to="/login" className="hover:text-[#9B6DFF] transition-colors">Login</Link>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <ShieldCheck size={15} className="text-[#65D6B3]" />
          <span>Safe · Educational · Free</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-slate-100 mt-8 pt-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CodeBuddy. Made with{' '}
        <Heart size={11} className="inline text-[#FF7EB6]" /> for learners everywhere.
      </div>
    </footer>
  );
};

export default Footer;
