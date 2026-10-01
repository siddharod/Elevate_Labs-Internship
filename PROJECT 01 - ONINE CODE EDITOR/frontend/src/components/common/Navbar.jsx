import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, LayoutDashboard, LogOut, Sparkles, Menu, X, Trophy } from 'lucide-react';
import ByteMascot from '../mascot/ByteMascot';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Editor', path: '/workspace/new', icon: Code2, requireAuth: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requireAuth: true },
    { name: 'Challenges', path: '/challenges', icon: Trophy, requireAuth: false },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#E2E8F0] px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={() => setMobileOpen(false)}>
          <ByteMascot mood="happy" size="sm" animated={false} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#182033] flex items-center gap-1">
              Code<span className="text-[#5BC0EB]">Buddy</span>
            </span>
          </div>
        </Link>

        {/* Center Navigation — Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks
            .filter(link => !link.requireAuth || isAuthenticated)
            .map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              const isChallenges = link.path === '/challenges';
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? isChallenges
                        ? 'bg-[#FFD166]/20 text-[#D97706]'
                        : 'bg-[#5BC0EB]/15 text-[#0284C7]'
                      : 'text-[#64748B] hover:text-[#182033] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon size={16} className={active ? (isChallenges ? 'text-[#FFD166]' : 'text-[#5BC0EB]') : ''} />
                  {link.name}
                </Link>
              );
          })}
        </nav>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Level/XP pill — desktop only */}
              <div className="hidden sm:flex items-center gap-2 bg-[#F4F9FF] border border-[#5BC0EB]/30 px-3 py-1 rounded-full">
                <span className="flex items-center justify-center bg-[#FFD166] text-[#182033] font-heading font-bold text-xs w-6 h-6 rounded-full">
                  {user.profile?.level || 1}
                </span>
                <span className="text-xs font-extrabold text-[#0284C7]">
                  {user.profile?.xp || 0} XP
                </span>
              </div>

              {/* User avatar / dashboard link */}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                title="Dashboard"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9B6DFF] to-[#5BC0EB] text-white font-bold flex items-center justify-center text-sm">
                  {(user.profile?.display_name || user.username)[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#182033] hidden md:inline">
                  {user.profile?.display_name || user.username}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-[#94A3B8] hover:text-[#FF7EB6] hover:bg-pink-50 rounded-xl transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-[#182033] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-bouncy px-4 py-2 text-sm font-bold bg-[#FFD166] hover:bg-[#FF9F68] text-[#182033] rounded-xl shadow-[0_3px_0_#D97706] flex items-center gap-1.5 transition-all"
              >
                <Sparkles size={15} />
                <span>Start Free</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle — always visible for nav links */}
          <button
            className="md:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] pt-3 pb-4 px-4 mt-2 space-y-1 animate-fade-in">
          {navLinks
            .filter(link => !link.requireAuth || isAuthenticated)
            .map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              const isChallenges = link.path === '/challenges';
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? isChallenges
                        ? 'bg-[#FFD166]/20 text-[#D97706]'
                        : 'bg-[#5BC0EB]/15 text-[#0284C7]'
                      : 'text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon size={17} />
                  {link.name}
                </Link>
              );
          })}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={17} />
              Log Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
