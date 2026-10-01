import React from 'react';

const EMOJI_CATEGORIES = {
  'Smileys & Emotion': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪',
    '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁',
    '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗'
  ],
  'Gestures & People': [
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏',
    '🙌', '👐', '🤲', '🙏', '💪', '🧠', '🫀', '👀', '👁️', '👄'
  ],
  'Hearts & Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐',
    '🌟', '💫', '🔥', '💥', '💯', '💢', '💬', '💭', '💤', '🎉'
  ],
  'Activities & Objects': [
    '☕', '🍕', '🍔', '🍟', '🍩', '🎂', '🍻', '🥂', '🍾', '⚽',
    '🏀', '🏈', '🎾', '🎮', '🎧', '🎸', '📱', '💻', '💡', '⏰'
  ]
};

export const EmojiPickerModal = ({ isOpen, onSelectEmoji, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 left-0 z-40 w-72 sm:w-80 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {category}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPickerModal;
