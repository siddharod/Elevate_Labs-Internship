import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Check, X, Eye, EyeOff, User, Mail, FileText, Sparkles, Heart } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import Mascot from '../components/common/Mascot';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=MochiBunny',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CocoBear',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LunaCat',
  'https://api.dicebear.com/7.x/bottts/svg?seed=PippinPup',
  'https://api.dicebear.com/7.x/bottts/svg?seed=KikiFox',
  'https://api.dicebear.com/7.x/bottts/svg?seed=BaoPanda'
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || user?.username || '',
    bio: user?.bio || '',
    customStatus: user?.customStatus || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePicture || user?.avatar || PRESET_AVATARS[0]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwChange = (e) => setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg({ type: 'error', text: 'Please select an image file.' }); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: 'error', text: 'Image must be under 5MB.' }); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleGenerateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setAvatarPreview(url);
    setAvatarFile(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });

    try {
      let profilePictureUrl = avatarPreview;

      // Upload new avatar if file selected
      if (avatarFile) {
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('file', avatarFile, avatarFile.name);
        fd.append('type', 'image');
        fd.append('folder', 'avatars');
        const uploadRes = await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) profilePictureUrl = uploadRes.data.fileUrl;
        setUploadingAvatar(false);
      }

      const res = await api.put('/users/profile', {
        name: form.name.trim(),
        bio: form.bio.trim(),
        customStatus: form.customStatus.trim(),
        profilePicture: profilePictureUrl
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setAvatarFile(null);
        setAvatarPreview(res.data.user.profilePicture || res.data.user.avatar || '');
        setMsg({ type: 'success', text: 'Mochi profile saved with love! ✨' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false); setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword !== pwForm.confirmNew) { setPwMsg({ type: 'error', text: 'New passwords do not match!' }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters!' }); return; }

    setSavingPw(true);
    try {
      const res = await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      if (res.data.success) {
        setPwMsg({ type: 'success', text: 'Password securely changed! 🔒' });
        setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSavingPw(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 bg-cream/70 dark:bg-slate-800/80 border-2 border-pastelpurple/40 focus:border-coral rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-coral/20 text-darktext dark:text-cream placeholder-darktext/40 font-quicksand font-medium transition";
  const labelCls = "block text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple mb-1.5";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream via-softpink/30 to-sky/30 dark:from-slate-950 dark:via-deeppurple/20 dark:to-slate-900 p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-lg space-y-4">
        {/* Back btn */}
        <button onClick={() => navigate('/chat')}
          className="flex items-center space-x-2 text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple hover:text-coral transition bg-white/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-pastelpurple/30 shadow-xs">
          <ArrowLeft className="w-4 h-4" /><span>Back to MochiChat</span>
        </button>

        {/* Profile Edit Card */}
        <div className="cute-card p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-fredoka font-bold text-deeppurple dark:text-pastelpurple flex items-center gap-2">
                <span>My Profile</span>
                <Heart className="w-4 h-4 text-coral fill-coral animate-pulse" />
              </h2>
              <p className="text-xs font-quicksand text-darktext/60 dark:text-cream/60">Customize how friends see you</p>
            </div>
            <Mascot mood="happy" size="sm" />
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar src={avatarPreview} name={user?.username} size="xl" isOnline showBadge className="ring-4 ring-white dark:ring-slate-700 shadow-cute" />
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-coral hover:bg-coral-dark text-white rounded-full flex items-center justify-center shadow-cute transition hover:scale-110">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>

            {/* Presets */}
            <div className="mt-3 flex items-center gap-1.5">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => { setAvatarPreview(url); setAvatarFile(null); }}
                  className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition ${
                    avatarPreview === url ? 'border-coral scale-110 shadow-xs' : 'border-pastelpurple/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <button onClick={handleGenerateAvatar}
                className="w-7 h-7 rounded-xl bg-softpink text-coral flex items-center justify-center border-2 border-softpink-dark hover:scale-110 transition"
                title="Randomize avatar">
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {msg.text && (
            <div className={`mb-4 p-3 text-xs rounded-2xl flex items-center gap-2 font-fredoka font-medium ${msg.type === 'success' ? 'bg-mint/40 border-2 border-mint text-emerald-700 dark:text-emerald-300' : 'bg-coral/10 border-2 border-coral/30 text-coral'}`}>
              {msg.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-coral" />
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Your friendly nickname"
                  className={inputCls + ' pl-10'} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darktext/40 font-fredoka text-sm">@</span>
                <input value={user?.username} readOnly placeholder="username"
                  className={inputCls + ' pl-8 opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800'} />
              </div>
              <p className="text-[10px] font-quicksand text-darktext/50 dark:text-cream/50 mt-1">Username is your unique identifier.</p>
            </div>

            <div>
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-coral" />
                <input value={user?.email} readOnly className={inputCls + ' pl-10 opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800'} />
              </div>
            </div>

            <div>
              <label className={labelCls}>About You (Bio)</label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3 text-coral" />
                <textarea name="bio" value={form.bio} onChange={handleFormChange} rows={2}
                  maxLength={200} placeholder="Tell friends what you like, hobbies, favorite games..."
                  className={inputCls + ' pl-10 resize-none'} />
              </div>
              <p className="text-[10px] font-fredoka text-darktext/50 dark:text-cream/50 mt-1 text-right">{form.bio.length}/200</p>
            </div>

            <div>
              <label className={labelCls}>Mood / Custom Status</label>
              <input name="customStatus" value={form.customStatus} onChange={handleFormChange}
                maxLength={100} placeholder="e.g. Sipping boba 🧋, Listening to lo-fi 🎧"
                className={inputCls} />
            </div>

            <button type="submit" disabled={saving || uploadingAvatar}
              className="w-full py-3 px-4 cute-btn-primary font-fredoka font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition hover:scale-102">
              {(saving || uploadingAvatar) && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadingAvatar ? 'Uploading avatar...' : saving ? 'Saving changes...' : 'Save Profile ✨'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="cute-card p-6 sm:p-8">
          <h2 className="text-lg font-fredoka font-bold text-deeppurple dark:text-pastelpurple mb-4">Change Password</h2>

          {pwMsg.text && (
            <div className={`mb-4 p-3 text-xs rounded-2xl flex items-center gap-2 font-fredoka font-medium ${pwMsg.type === 'success' ? 'bg-mint/40 border-2 border-mint text-emerald-700 dark:text-emerald-300' : 'bg-coral/10 border-2 border-coral/30 text-coral'}`}>
              {pwMsg.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password', key: 'current' },
              { name: 'newPassword', label: 'New Password', key: 'new' },
              { name: 'confirmNew', label: 'Confirm New Password', key: 'confirm' }
            ].map(({ name, label, key }) => (
              <div key={name}>
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <input type={showPw[key] ? 'text' : 'password'} name={name}
                    value={pwForm[name]} onChange={handlePwChange}
                    placeholder="••••••••" className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-darktext/40 hover:text-coral transition">
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" disabled={savingPw}
              className="w-full py-2.5 px-4 bg-deeppurple hover:bg-deeppurple-light text-white font-fredoka font-semibold text-sm rounded-2xl shadow-cute disabled:opacity-50 flex items-center justify-center gap-2 transition hover:scale-102">
              {savingPw && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingPw ? 'Updating...' : 'Update Password 🔒'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="cute-card p-4 sm:p-5 flex items-center justify-between text-xs font-fredoka">
          <span className="text-darktext/60 dark:text-cream/60">MochiChat Member Since:</span>
          <span className="font-bold text-deeppurple dark:text-pastelpurple px-3 py-1 bg-pastelpurple/30 rounded-full">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
