import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Sparkles, Sun, Moon, ArrowRight, Loader2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Mascot from '../components/common/Mascot';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(identifier.trim(), password);
      navigate('/chat');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-cream via-softpink/40 to-pastelpurple/30 dark:from-[#151221] dark:via-[#1c182b] dark:to-[#241d36] transition-colors relative overflow-hidden">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-skyblue/50 dark:bg-deeppurple/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[420px] h-[420px] rounded-full bg-softpink/60 dark:bg-coral/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[45%] left-[-5%] w-[300px] h-[300px] rounded-full bg-mintgreen/50 dark:bg-pastelpurple/10 blur-3xl pointer-events-none" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-2 border-pastelpurple/40 text-darktext dark:text-cream shadow-cute-sm hover:scale-105 active:scale-95 transition-all"
        title="Toggle Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-300 animate-spin-slow" />
        ) : (
          <Moon className="w-5 h-5 text-deeppurple" />
        )}
      </button>

      {/* Main Card Container */}
      <div className="w-full max-w-md cute-card p-7 sm:p-10 relative z-10 my-8">
        {/* Cute Mascot Greeting Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Mascot mood="happy" size="md" message="Welcome back! 💕" className="mb-2" />
          <h1 className="text-3xl font-extrabold font-fredoka text-darktext dark:text-cream mt-2 flex items-center gap-2">
            Hop In! <Heart className="w-5 h-5 text-coral fill-coral animate-pulse" />
          </h1>
          <p className="text-sm font-medium text-darktext/70 dark:text-cream/70 mt-1">
            Sign in to continue chatting with your friends
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-2xl flex items-center gap-2 animate-pop shadow-sm">
            <span className="text-base">😿</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username or Email Field */}
          <div>
            <label className="block text-xs font-bold text-darktext dark:text-cream mb-1.5 font-fredoka">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. cutebunny or you@example.com"
                className="cute-input w-full pl-10 pr-4 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-darktext dark:text-cream mb-1.5 font-fredoka">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cute-input w-full pl-10 pr-10 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darktext/40 hover:text-coral transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-coral rounded-lg cursor-pointer"
              />
              <span className="text-xs font-semibold text-darktext/70 dark:text-cream/70">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="cute-btn-primary w-full py-3.5 px-6 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 mt-5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Hopping into chat...</span>
              </>
            ) : (
              <>
                <span>Sign In & Chat</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-7 pt-5 border-t-2 border-pastelpurple/30 text-center">
          <p className="text-xs font-semibold text-darktext/70 dark:text-cream/70">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold font-fredoka text-coral hover:text-coral-dark hover:underline transition-colors"
            >
              Create Account for Free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
