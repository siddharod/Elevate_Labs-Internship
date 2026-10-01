import React, { useState } from 'react';

const sizeMap = {
  xs: 'w-7 h-7 text-[10px] rounded-xl',
  sm: 'w-9 h-9 text-xs rounded-2xl',
  md: 'w-11 h-11 text-sm rounded-2xl',
  lg: 'w-14 h-14 text-base rounded-3xl',
  xl: 'w-20 h-20 text-2xl rounded-4xl'
};

const badgeSizeMap = {
  xs: 'w-2 h-2 -bottom-0.5 -right-0.5',
  sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
  md: 'w-3 h-3 -bottom-0.5 -right-0.5',
  lg: 'w-3.5 h-3.5 bottom-0 right-0',
  xl: 'w-5 h-5 bottom-1 right-1'
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  isOnline = false,
  showBadge = false,
  className = '',
  onClick
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n) => {
    if (!n) return '🐱';
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Cute playful dicebear styles (fun-emoji, bottts, lorelei, adventurer)
  const effectiveSrc =
    !imgError && src
      ? src
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffd5dc,d1d4f9,c0aede,b6e3f4`;

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none flex-shrink-0 transition-transform hover:scale-105 active:scale-95 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`${sizeMap[size] || sizeMap.md} flex items-center justify-center font-bold font-fredoka bg-gradient-to-br from-softpink via-pastelpurple to-skyblue text-deeppurple ring-2 ring-white dark:ring-slate-800 shadow-cute-sm overflow-hidden`}
      >
        <img
          src={effectiveSrc}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {showBadge && (
        <span
          className={`absolute ${badgeSizeMap[size] || badgeSizeMap.md} rounded-full ring-2 ring-white dark:ring-slate-900 ${
            isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-300 dark:bg-slate-600'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </span>
      )}
    </div>
  );
};

export default Avatar;
