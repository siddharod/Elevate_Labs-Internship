import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ByteMascot from '../components/mascot/ByteMascot';
import Navbar from '../components/common/Navbar';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, confirmPassword);
      // After registration, redirect to login (per requirements)
      navigate('/login', { state: { registered: true, username } });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the backend server. Please ensure Django is running on http://localhost:8000.');
        return;
      }
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your information!';
      if (data) {
        if (data.username) msg = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.password) msg = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.email) msg = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.non_field_errors) msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        else if (data.error) msg = data.error;
        else if (typeof data === 'string') msg = data;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-[#9B6DFF] shadow-2xl p-6 sm:p-8 relative">
          {/* Mascot peek */}
          <div className="flex justify-center -mt-16 mb-2">
            <ByteMascot
              mood={error ? 'thinking' : 'celebrate'}
              size="md"
              speech="Your coding adventure starts here!"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="font-heading text-2xl font-bold text-[#182033]">
              Join CodeBuddy! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create your free account and start creating magic.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Choose a Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. StarCoder"
                className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#9B6DFF] rounded-xl text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coder@example.com"
                className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#9B6DFF] rounded-xl text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#9B6DFF] rounded-xl text-sm font-medium outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#9B6DFF] rounded-xl text-sm font-medium outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-bouncy w-full py-3 bg-[#65D6B3] hover:bg-[#34d399] text-[#182033] font-heading font-bold text-sm rounded-xl shadow-[0_4px_0_#059669] flex items-center justify-center gap-2 cursor-pointer transition-all mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Setting up your world...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create My Free Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#9B6DFF] hover:underline">
              Log in here!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
