import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Smile, Paperclip, Mic, X, Check, Image as ImageIcon,
  StopCircle, Sparkles, Heart
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import api from '../../api/axios';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','🥺','🥳','💖','✨',
  '👍','🎉','🌸','🐰','🐱','🐼','🐻','🦊','🍕','🍦',
  '⭐','🔥','👏','🙏','👋','💬','🎀','🍀','🎈','🍰'
];

export const MessageInput = () => {
  const {
    sendMessage, sendTyping, replyTo, setReplyTo,
    editingMessage, setEditingMessage, submitEdit
  } = useChat();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const typingRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const emojiRef = useRef(null);

  // Populate text when editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      inputRef.current?.focus();
    } else {
      setText('');
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);
    sendTyping(true);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => sendTyping(false), 2000);
  };

  const handleSend = async (e) => {
    e?.preventDefault();

    if (editingMessage) {
      if (!text.trim()) return;
      submitEdit(editingMessage._id, text.trim());
      setText('');
      return;
    }

    // Send voice blob
    if (audioBlob) {
      await uploadAndSend(audioBlob, 'voice');
      setAudioBlob(null);
      return;
    }

    if (!text.trim() && !filePreview) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    sendTyping(false);

    if (text.trim()) {
      sendMessage({ text: text.trim(), type: 'text' });
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setText('');
  };
  const cancelReply = () => setReplyTo(null);

  // ─── FILE UPLOAD ────────────────────────────────────────────────────────
  const uploadAndSend = async (fileOrBlob, forceType) => {
    try {
      setUploading(true);
      setUploadProgress(10);
      const fd = new FormData();

      let fileToUpload = fileOrBlob;
      let fileName = fileOrBlob.name || `voice_${Date.now()}.webm`;
      let mimeType = fileOrBlob.type || 'audio/webm';
      let type = forceType;

      if (!type) {
        if (mimeType.startsWith('image/')) type = 'image';
        else if (mimeType.startsWith('audio/')) type = 'voice';
        else type = 'file';
      }

      if (forceType === 'voice' && fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
        fileToUpload = new File([fileOrBlob], fileName, { type: mimeType });
      }

      fd.append('file', fileToUpload, fileName);
      fd.append('type', type);
      fd.append('folder', type === 'voice' ? 'voices' : type === 'image' ? 'images' : 'files');

      setUploadProgress(40);
      const res = await api.post('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          setUploadProgress(Math.min(90, Math.round((e.loaded / e.total) * 90)))
      });

      setUploadProgress(100);
      if (res.data.success) {
        await sendMessage({
          type,
          fileUrl: res.data.fileUrl,
          fileName: res.data.fileName,
          fileType: res.data.fileType,
          fileSize: res.data.fileSize,
          voiceDuration: type === 'voice' ? recordingSeconds : 0,
          text: text.trim() || ''
        });
        setFilePreview(null);
        setText('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const url = URL.createObjectURL(file);
      setFilePreview({ file, previewUrl: url, type: 'image', name: file.name, size: file.size });
    } else {
      setFilePreview({ file, type: 'file', name: file.name, size: file.size });
    }
  };

  const sendFilePreview = async () => {
    if (!filePreview) return;
    await uploadAndSend(filePreview.file);
  };

  const cancelFilePreview = () => {
    if (filePreview?.previewUrl) URL.revokeObjectURL(filePreview.previewUrl);
    setFilePreview(null);
  };

  // ─── VOICE RECORDING ────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };

      mr.start();
      setRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (err) {
      alert('Microphone access denied or not supported.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordTimerRef.current);
    setRecording(false);
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    clearInterval(recordTimerRef.current);
    setRecording(false);
    setRecordingSeconds(0);
    setAudioBlob(null);
    chunksRef.current = [];
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const formatSize = (b) =>
    b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  return (
    <div className="border-t-2 border-pastelpurple/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md relative select-none">
      {/* Reply Preview */}
      {replyTo && !editingMessage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-softpink/40 dark:bg-slate-800/80 border-b border-pastelpurple/30 animate-pop">
          <div className="flex-1 border-l-4 border-coral pl-2.5 min-w-0">
            <p className="text-[10px] font-extrabold font-fredoka text-coral">{replyTo.senderName}</p>
            <p className="text-xs text-darktext/70 dark:text-cream/70 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={cancelReply}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-darktext/40 hover:text-coral transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 animate-pop">
          <div className="flex-1 min-w-0 pl-1">
            <p className="text-[10px] font-extrabold font-fredoka text-amber-600 dark:text-amber-400">Editing Message</p>
            <p className="text-xs text-darktext/70 dark:text-cream/70 truncate">{editingMessage.content}</p>
          </div>
          <button
            onClick={cancelEdit}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-amber-900/40 text-amber-600 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* File Preview */}
      {filePreview && !uploading && (
        <div className="px-4 py-2.5 bg-softpink/30 dark:bg-slate-800/70 border-b border-pastelpurple/30 flex items-center gap-3 animate-pop">
          {filePreview.previewUrl ? (
            <img src={filePreview.previewUrl} alt="Preview" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-coral" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center font-bold text-xs">
              FILE
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold font-fredoka text-darktext dark:text-cream truncate">{filePreview.name}</p>
            <p className="text-[10px] font-semibold text-darktext/50 dark:text-cream/50">{formatSize(filePreview.size)}</p>
          </div>
          <button
            onClick={sendFilePreview}
            className="cute-btn-primary p-2.5 rounded-2xl flex items-center justify-center"
            title="Send attachment"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={cancelFilePreview}
            className="p-2 rounded-2xl text-darktext/40 hover:text-coral hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Blob Preview */}
      {audioBlob && !recording && (
        <div className="px-4 py-2.5 bg-softpink/30 dark:bg-slate-800/70 border-b border-pastelpurple/30 flex items-center gap-3 animate-pop">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-coral to-coral-light text-white flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold font-fredoka text-darktext dark:text-cream">Voice Note Ready 🎤</p>
            <p className="text-[10px] font-medium text-darktext/50 dark:text-cream/50">Duration: {fmtTime(recordingSeconds)}</p>
          </div>
          <button
            onClick={() => uploadAndSend(audioBlob, 'voice')}
            disabled={uploading}
            className="cute-btn-primary p-2.5 rounded-2xl flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setAudioBlob(null);
              setRecordingSeconds(0);
            }}
            className="p-2 rounded-2xl text-darktext/40 hover:text-coral hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="px-4 py-1.5 bg-softpink/50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-coral">
            <div className="w-full h-1.5 bg-pastelpurple/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="flex-shrink-0 text-[10px]">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-20 left-3 z-50 bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-cute-lg border-2 border-pastelpurple/50 grid grid-cols-6 gap-2 w-72 animate-pop select-none"
        >
          <div className="col-span-6 pb-1 border-b border-pastelpurple/30 flex items-center justify-between">
            <span className="text-[11px] font-extrabold font-fredoka text-coral flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Cute Emojis
            </span>
            <button onClick={() => setShowEmoji(false)} className="text-darktext/40 hover:text-coral">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => {
                setText((p) => p + em);
                inputRef.current?.focus();
              }}
              className="text-2xl hover:scale-130 transition-transform p-1 rounded-xl hover:bg-softpink/40 dark:hover:bg-slate-700 flex items-center justify-center"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Row */}
      <div className="flex items-center gap-2 p-3">
        {/* Emoji Trigger */}
        <button
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          className={`p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
            showEmoji
              ? 'text-coral bg-softpink dark:bg-slate-800'
              : 'text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800'
          }`}
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Attachment Controls */}
        {!recording && !audioBlob && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.webm"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-2xl text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Send image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-2xl text-darktext/60 dark:text-cream/60 hover:text-deeppurple hover:bg-pastelpurple/40 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Attach document"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Voice Recording Active Banner */}
        {recording && (
          <div className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold font-fredoka text-rose-600 dark:text-rose-400">
                Recording audio: {fmtTime(recordingSeconds)}
              </span>
            </div>
            <button
              type="button"
              onClick={cancelRecording}
              className="p-1 text-rose-400 hover:text-rose-600 transition"
              title="Cancel recording"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Text Input */}
        {!recording && !audioBlob && (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Edit your cute message...' : 'Type a message...'}
            className="cute-input flex-1 px-4 py-2.5 text-sm font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
          />
        )}

        {/* Action Button: Send / Stop Recording / Start Mic */}
        {(text.trim() || editingMessage || filePreview || audioBlob) ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={uploading}
            className="cute-btn-primary p-3 rounded-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Send"
          >
            {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        ) : recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-cute transition-transform hover:scale-105 active:scale-95"
            title="Stop recording"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="p-3 rounded-2xl text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            title="Record voice note"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
