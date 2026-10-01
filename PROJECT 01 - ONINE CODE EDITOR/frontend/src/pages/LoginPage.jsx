import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ByteMascot from '../components/mascot/ByteMascot';
import Navbar from '../components/common/Navbar';
import { LogIn, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if just registered
  const justRegistered = location.state?.registered;
  const registeredUsername = location.state?.username;

  // After login, go to where they were trying to go (or dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the backend server. Please ensure Django is running on http://localhost:8000.');
        return;
      }
      const errDetail =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (err.response?.data?.non_field_errors ? err.response.data.non_field_errors[0] : null) ||
        'Login failed. Please check your credentials!';
      setError(errDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-[#5BC0EB] shadow-2xl p-6 sm:p-8 relative">
          {/* Top Mascot Peek */}
          <div className="flex justify-center -mt-16 mb-2">
            <ByteMascot
              mood={error ? 'error' : justRegistered ? 'celebrate' : 'happy'}
              size="md"
              speech={
                error
                  ? "Oops, check your password!"
                  : justRegistered
                  ? "Account created! Now log in! 🎉"
                  : "Welcome back, coder!"
              }
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="font-heading text-2xl font-bold text-[#182033]">
              Welcome Back! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Log in to continue building your awesome projects.
            </p>
          </div>

          {/* Registration success banner */}
          {justRegistered && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>
                Account created for <strong>{registeredUsername}</strong>! Please log in to continue.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex or alex@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#5BC0EB] rounded-xl text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#5BC0EB] rounded-xl text-sm font-medium outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-bouncy w-full py-3 bg-[#FFD166] hover:bg-[#FF9F68] text-[#182033] font-heading font-bold text-sm rounded-xl shadow-[0_4px_0_#D97706] flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Log In to CodeBuddy</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#5BC0EB] hover:underline">
              Create one for free! 🚀
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
