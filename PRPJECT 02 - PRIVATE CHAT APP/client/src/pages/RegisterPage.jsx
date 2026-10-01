import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AtSign, Mail, Lock, Eye, EyeOff, Sparkles, Sun, Moon, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Mascot from '../components/common/Mascot';

const PRESET_AVATARS = [
  { id: 'bunny', label: 'Bunny', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bunny&backgroundColor=ffd5dc' },
  { id: 'kitty', label: 'Kitty', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kitty&backgroundColor=c0aede' },
  { id: 'panda', label: 'Panda', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Panda&backgroundColor=b6e3f4' },
  { id: 'bear', label: 'Bear', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bear&backgroundColor=d1d4f9' },
  { id: 'fox', label: 'Fox', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fox&backgroundColor=ffe4ec' }
];

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: '' };
    if (password.length < 6) return { score: 1, text: 'Too short (min 6)', color: 'bg-rose-400' };
    const hasNum = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    if (password.length >= 8 && hasNum && hasSpecial) return { score: 3, text: 'Super cute & strong! ✨', color: 'bg-emerald-400' };
    return { score: 2, text: 'Good password 👍', color: 'bg-amber-400' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        profilePicture: selectedAvatar
      });
      navigate('/chat');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-cream via-softpink/40 to-pastelpurple/30 dark:from-[#151221] dark:via-[#1c182b] dark:to-[#241d36] transition-colors relative overflow-hidden">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] rounded-full bg-softpink/60 dark:bg-deeppurple/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] rounded-full bg-skyblue/50 dark:bg-coral/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[300px] h-[300px] rounded-full bg-mintgreen/50 dark:bg-pastelpurple/10 blur-3xl pointer-events-none" />

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
      <div className="w-full max-w-xl cute-card p-6 sm:p-10 relative z-10 my-8">
        {/* Cute Mascot Greeting Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Mascot mood="wave" size="md" message="Join the party! 🎉" className="mb-2" />
          <h1 className="text-3xl font-extrabold font-fredoka text-darktext dark:text-cream mt-2 flex items-center gap-2">
            Create an Account <Sparkles className="w-5 h-5 text-coral fill-coral/30" />
          </h1>
          <p className="text-sm font-medium text-darktext/70 dark:text-cream/70 mt-1 max-w-sm">
            Fast, private, cartoon-themed chats with your best friends!
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
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-darktext dark:text-cream mb-2 font-fredoka uppercase tracking-wider">
              Choose Your Cute Avatar 🎀
            </label>
            <div className="flex items-center justify-center gap-3 p-2 bg-softpink/30 dark:bg-slate-800/50 rounded-2xl border-2 border-pastelpurple/40">
              {PRESET_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative p-1 rounded-2xl transition-all duration-200 ${
                      isSelected
                        ? 'ring-4 ring-coral scale-110 shadow-cute-sm bg-white dark:bg-slate-700'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-10 h-10 rounded-xl object-cover" />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-bold text-darktext dark:text-cream mb-1 font-fredoka">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex River"
                  className="cute-input w-full pl-10 pr-3 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                  required
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-darktext dark:text-cream mb-1 font-fredoka">
                Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alexriver"
                  className="cute-input w-full pl-10 pr-3 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-bold text-darktext dark:text-cream mb-1 font-fredoka">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="cute-input w-full pl-10 pr-3 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-darktext dark:text-cream mb-1 font-fredoka">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="cute-input w-full pl-10 pr-10 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-darktext/40 hover:text-coral transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1 flex-1 bg-pastelpurple/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-darktext/60 dark:text-cream/60">
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-darktext dark:text-cream mb-1 font-fredoka">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-deeppurple/50 dark:text-pastelpurple/50" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={`cute-input w-full pl-10 pr-10 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40 ${
                    confirmPassword && !passwordsMatch ? 'border-rose-400 focus:border-rose-500' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-darktext/40 hover:text-coral transition"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <div className="mt-1 flex items-center gap-1">
                  {passwordsMatch ? (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match!
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-500">
                      Passwords don't match yet
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="cute-btn-primary w-full py-3.5 px-6 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating your cute space...</span>
              </>
            ) : (
              <>
                <span>Sign Up & Hop In!</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 pt-5 border-t-2 border-pastelpurple/30 text-center">
          <p className="text-xs font-semibold text-darktext/70 dark:text-cream/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold font-fredoka text-coral hover:text-coral-dark hover:underline transition-colors"
            >
              Log in here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
