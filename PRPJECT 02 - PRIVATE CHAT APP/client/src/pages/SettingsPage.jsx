import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Shield, Wifi, Palette, Upload, X, Check, Loader2, Sparkles, Image } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import Mascot from '../components/common/Mascot';
import api from '../api/axios';

const PRESET_BACKGROUNDS = [
  { label: 'Default', value: '', emoji: '✨', color: 'from-cream to-softpink/30' },
  { label: 'Pastel Sunset', value: 'linear-gradient(135deg, #FFE4EC 0%, #E9DDFB 50%, #DDF2FF 100%)', emoji: '🌅', color: 'from-softpink via-pastelpurple to-sky' },
  { label: 'Mint Forest', value: 'linear-gradient(135deg, #DDF5E8 0%, #DDF2FF 100%)', emoji: '🌿', color: 'from-mint to-sky' },
  { label: 'Lavender Dream', value: 'linear-gradient(135deg, #E9DDFB 0%, #FFE4EC 100%)', emoji: '💜', color: 'from-pastelpurple to-softpink' },
  { label: 'Cherry Blossom', value: 'linear-gradient(135deg, #FFE4EC 0%, #FFF8F0 50%, #FFE4EC 100%)', emoji: '🌸', color: 'from-softpink to-cream' },
  { label: 'Midnight Magic', value: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', emoji: '🌙', color: 'from-slate-900 to-purple-900' },
  { label: 'Ocean Wave', value: 'linear-gradient(135deg, #DDF2FF 0%, #E9DDFB 100%)', emoji: '🌊', color: 'from-sky to-pastelpurple' },
  { label: 'Sunny Day', value: 'linear-gradient(135deg, #FFF8F0 0%, #DDF5E8 100%)', emoji: '☀️', color: 'from-cream to-mint' },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isSocketConnected } = useSocket();
  const { activeConversation } = useChat();

  const [bgMsg, setBgMsg] = useState({ type: '', text: '' });
  const [savingBg, setSavingBg] = useState(false);
  const [selectedBg, setSelectedBg] = useState(() => localStorage.getItem('chat_wallpaper') || '');
  const [customBgUrl, setCustomBgUrl] = useState('');
  const bgFileRef = useRef(null);

  const applyBackground = async (bgValue) => {
    localStorage.setItem('chat_wallpaper', bgValue);
    setSelectedBg(bgValue);

    if (activeConversation) {
      setSavingBg(true);
      setBgMsg({ type: '', text: '' });
      try {
        const res = await api.put(`/conversations/${activeConversation._id}/background`, { chatBackground: bgValue });
        if (res.data.success) {
          setBgMsg({ type: 'success', text: 'Wallpaper applied to active chat! 🎨' });
        }
      } catch {
        setBgMsg({ type: 'error', text: 'Failed to update conversation background.' });
      } finally {
        setSavingBg(false);
      }
    } else {
      setBgMsg({ type: 'success', text: 'Default chat wallpaper saved! Open a chat to preview.' });
    }
  };

  const handleBgFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setBgMsg({ type: 'error', text: 'Please select an image.' }); return; }
    setSavingBg(true); setBgMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      fd.append('type', 'image');
      fd.append('folder', 'backgrounds');
      const uploadRes = await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (uploadRes.data.success) {
        await applyBackground(`url(${uploadRes.data.fileUrl})`);
        setCustomBgUrl(uploadRes.data.fileUrl);
      }
    } catch {
      setBgMsg({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setSavingBg(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream via-softpink/30 to-sky/30 dark:from-slate-950 dark:via-deeppurple/20 dark:to-slate-900 p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-lg space-y-4">
        <button onClick={() => navigate('/chat')}
          className="flex items-center space-x-2 text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple hover:text-coral transition bg-white/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-pastelpurple/30 shadow-xs">
          <ArrowLeft className="w-4 h-4" /><span>Back to MochiChat</span>
        </button>

        {/* Settings Card */}
        <div className="cute-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-fredoka font-bold text-deeppurple dark:text-pastelpurple flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-coral" />
                Settings
              </h2>
              <p className="text-xs font-quicksand text-darktext/60 dark:text-cream/60">Customize your MochiChat experience</p>
            </div>
            <Mascot mood="celebrate" size="sm" />
          </div>

          <div className="space-y-8">
            {/* Theme Toggle */}
            <div>
              <h3 className="text-xs font-fredoka font-bold text-deeppurple/70 dark:text-pastelpurple/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> Appearance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'light', icon: <Sun className="w-5 h-5 text-amber-400" />, label: 'Light Mode', desc: 'Bright & cheerful', emoji: '☀️' },
                  { val: 'dark', icon: <Moon className="w-5 h-5 text-indigo-400" />, label: 'Dark Mode', desc: 'Cozy & mysterious', emoji: '🌙' }
                ].map(({ val, icon, label, desc, emoji }) => (
                  <button key={val} onClick={() => setTheme(val)}
                    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition ${
                      theme === val
                        ? 'border-coral bg-softpink/30 dark:bg-deeppurple/30 shadow-cute'
                        : 'border-pastelpurple/30 hover:border-coral/40 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}>
                    <span className="text-xl">{emoji}</span>
                    {icon}
                    <span className={`text-xs font-fredoka font-bold ${theme === val ? 'text-coral' : 'text-darktext dark:text-cream'}`}>{label}</span>
                    <span className="text-[10px] font-quicksand text-darktext/50 dark:text-cream/50">{desc}</span>
                    {theme === val && <Check className="w-3.5 h-3.5 text-coral stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Background */}
            <div>
              <h3 className="text-xs font-fredoka font-bold text-deeppurple/70 dark:text-pastelpurple/70 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Image className="w-3.5 h-3.5" /> Chat Background
              </h3>
              <p className="text-[10px] font-quicksand text-darktext/50 dark:text-cream/50 mb-3">
                {activeConversation
                  ? `Applies to: ${activeConversation.groupName || 'active chat'} + saves as default`
                  : 'Open a conversation, then pick a background to apply.'}
              </p>

              {bgMsg.text && (
                <div className={`mb-3 p-3 text-xs rounded-2xl flex items-center gap-2 font-fredoka font-medium ${
                  bgMsg.type === 'success'
                    ? 'bg-mint/40 border-2 border-mint text-emerald-700 dark:text-emerald-300'
                    : 'bg-coral/10 border-2 border-coral/30 text-coral'
                }`}>
                  {bgMsg.type === 'success' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                  {bgMsg.text}
                </div>
              )}

              {/* Preset swatches */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.label}
                    onClick={() => applyBackground(bg.value)}
                    disabled={savingBg}
                    className={`relative h-14 rounded-2xl overflow-hidden border-2 transition hover:scale-105 ${
                      selectedBg === bg.value ? 'border-coral shadow-cute scale-105' : 'border-pastelpurple/30 hover:border-coral/40'
                    }`}
                    style={bg.value ? { background: bg.value } : {}}
                    title={bg.label}
                  >
                    {!bg.value && (
                      <div className="w-full h-full bg-gradient-to-br from-cream to-softpink/30 flex items-center justify-center">
                        <X className="w-4 h-4 text-darktext/30" />
                      </div>
                    )}
                    {selectedBg === bg.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="w-5 h-5 text-white drop-shadow font-bold" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
                      <span className="text-base">{bg.emoji}</span>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 text-[9px] text-center font-fredoka bg-black/25 text-white py-0.5">
                      {bg.label}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom URL */}
              <div className="flex gap-2 mb-2">
                <input
                  value={customBgUrl}
                  onChange={(e) => setCustomBgUrl(e.target.value)}
                  placeholder="Paste image URL for custom background..."
                  className="flex-1 px-3 py-2 text-xs font-quicksand bg-cream/70 dark:bg-slate-800/80 border-2 border-pastelpurple/40 rounded-2xl focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 text-darktext dark:text-cream"
                />
                <button
                  onClick={() => applyBackground(`url(${customBgUrl})`)}
                  disabled={!customBgUrl.trim() || savingBg}
                  className="px-3 py-2 bg-coral hover:bg-coral-dark text-white text-xs font-fredoka font-semibold rounded-2xl disabled:opacity-50 transition shadow-xs"
                >
                  Apply
                </button>
              </div>

              {/* File upload */}
              <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgFileUpload} />
              <button
                onClick={() => bgFileRef.current?.click()}
                disabled={savingBg}
                className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-pastelpurple/40 dark:border-deeppurple/40 rounded-2xl text-xs font-fredoka text-deeppurple/60 dark:text-pastelpurple/60 hover:border-coral/50 hover:text-coral hover:bg-softpink/20 transition disabled:opacity-50"
              >
                {savingBg ? <Loader2 className="w-4 h-4 animate-spin text-coral" /> : <Upload className="w-4 h-4" />}
                Upload your own background image
              </button>
            </div>

            {/* Network Status */}
            <div>
              <h3 className="text-xs font-fredoka font-bold text-deeppurple/70 dark:text-pastelpurple/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5" /> Connection Status
              </h3>
              <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition ${
                isSocketConnected
                  ? 'bg-mint/20 border-mint/50'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                    isSocketConnected ? 'bg-mint/60' : 'bg-amber-100 dark:bg-amber-950/60'
                  }`}>
                    {isSocketConnected ? '🟢' : '🟡'}
                  </div>
                  <div>
                    <p className="text-xs font-fredoka font-bold text-darktext dark:text-cream">
                      Real-Time Socket
                    </p>
                    <p className="text-[11px] font-quicksand text-darktext/60 dark:text-cream/60">
                      {isSocketConnected ? 'Live pipeline active — messages fly instantly!' : 'Connecting to server...'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-[11px] font-fredoka font-bold rounded-full ${
                  isSocketConnected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600'
                }`}>
                  {isSocketConnected ? 'Connected ✨' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-xs font-fredoka font-bold text-deeppurple/70 dark:text-pastelpurple/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Security
              </h3>
              <div className="p-4 bg-pastelpurple/20 dark:bg-deeppurple/20 border-2 border-pastelpurple/30 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-pastelpurple/40 dark:bg-deeppurple/40 text-xl flex items-center justify-center">
                  🔐
                </div>
                <div>
                  <p className="text-xs font-fredoka font-bold text-deeppurple dark:text-pastelpurple">JWT + bcrypt</p>
                  <p className="text-[11px] font-quicksand text-darktext/60 dark:text-cream/60">
                    Your password is securely hashed. Channels are authenticated via JWT tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="cute-card p-4 flex items-center justify-between text-xs font-fredoka">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐰</span>
            <span className="font-bold text-deeppurple dark:text-pastelpurple">MochiChat</span>
          </div>
          <span className="text-darktext/50 dark:text-cream/50">v2.0 • Built with ♥</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
