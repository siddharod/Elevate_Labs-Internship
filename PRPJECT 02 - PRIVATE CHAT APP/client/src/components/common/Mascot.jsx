import React from 'react';

/**
 * Mochi - The Cute Cartoon Mascot of MochiChat
 * @param {'happy' | 'wave' | 'idle' | 'sleeping' | 'thinking' | 'celebrate'} mood
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} size
 * @param {string} message - Optional cute speech bubble text
 * @param {string} className - Additional CSS classes
 */
export const Mascot = ({
  mood = 'happy',
  size = 'md',
  message = '',
  className = '',
  animate = true
}) => {
  const sizeMap = {
    xs: { w: 40, h: 40 },
    sm: { w: 64, h: 64 },
    md: { w: 96, h: 96 },
    lg: { w: 140, h: 140 },
    xl: { w: 190, h: 190 },
  };

  const { w, h } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {message && (
        <div className="mb-2 relative bg-white dark:bg-slate-800 text-darktext dark:text-cream px-3 py-1.5 rounded-2xl shadow-cute-sm border-2 border-pastelpurple text-xs font-bold font-fredoka animate-pop tracking-wide max-w-[200px] text-center">
          {message}
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-pastelpurple" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-white dark:border-t-slate-800" />
        </div>
      )}

      {/* SVG Cartoon Mascot */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${animate ? 'animate-float' : ''} drop-shadow-md`}
      >
        <defs>
          {/* Soft gradients */}
          <linearGradient id="bodyGrad" x1="80" y1="40" x2="80" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF8F0" />
            <stop offset="1" stopColor="#FFE4EC" />
          </linearGradient>
          <linearGradient id="earGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FFE4EC" />
            <stop offset="1" stopColor="#FFB3C1" />
          </linearGradient>
          <linearGradient id="coralGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFA6B5" />
            <stop offset="1" stopColor="#FF8C9E" />
          </linearGradient>
          <filter id="shadowFilter" x="0" y="0" width="160" height="160" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6551A3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Shadow under mascot */}
        <ellipse cx="80" cy="150" rx="42" ry="7" fill="#6551A3" fillOpacity="0.12" />

        {/* Left Ear */}
        <g className="origin-bottom transform hover:rotate-3 transition-transform">
          <ellipse cx="50" cy="46" rx="14" ry="34" transform="rotate(-15 50 46)" fill="url(#bodyGrad)" stroke="#E9DDFB" strokeWidth="2.5" />
          <ellipse cx="50" cy="48" rx="8" ry="24" transform="rotate(-15 50 48)" fill="url(#earGrad)" opacity="0.8" />
        </g>

        {/* Right Ear */}
        <g className={`origin-bottom transform transition-transform ${mood === 'wave' ? 'animate-wave' : ''}`}>
          <ellipse cx="110" cy="46" rx="14" ry="34" transform="rotate(15 110 46)" fill="url(#bodyGrad)" stroke="#E9DDFB" strokeWidth="2.5" />
          <ellipse cx="110" cy="48" rx="8" ry="24" transform="rotate(15 110 48)" fill="url(#earGrad)" opacity="0.8" />
        </g>

        {/* Main Chubby Body */}
        <rect
          x="28"
          y="56"
          width="104"
          height="88"
          rx="44"
          fill="url(#bodyGrad)"
          stroke="#E9DDFB"
          strokeWidth="3"
        />

        {/* Belly patch */}
        <ellipse cx="80" cy="110" rx="32" ry="22" fill="#FFFFFF" opacity="0.75" />

        {/* Cute Rosy Blushing Cheeks */}
        <ellipse cx="44" cy="98" rx="10" ry="6" fill="#FF8C9E" opacity="0.55" />
        <ellipse cx="116" cy="98" rx="10" ry="6" fill="#FF8C9E" opacity="0.55" />

        {/* Eyes based on Mood */}
        {mood === 'sleeping' || mood === 'idle' ? (
          // Happy closed sleeping/crescent eyes
          <g stroke="#353047" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M52 88 Q60 96 68 88" />
            <path d="M92 88 Q100 96 108 88" />
          </g>
        ) : mood === 'celebrate' ? (
          // Starry celebration eyes
          <g fill="#FF8C9E">
            <path d="M60 80 L62 86 L68 88 L62 90 L60 96 L58 90 L52 88 L58 86 Z" />
            <path d="M100 80 L102 86 L108 88 L102 90 L100 96 L98 90 L92 88 L98 86 Z" />
          </g>
        ) : (
          // Sparkling cartoon eyes that blink
          <g className="animate-blink">
            {/* Left Eye */}
            <ellipse cx="60" cy="88" rx="6.5" ry="9" fill="#353047" />
            <circle cx="58" cy="84" r="3" fill="#FFFFFF" />
            <circle cx="63" cy="91" r="1.5" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="100" cy="88" rx="6.5" ry="9" fill="#353047" />
            <circle cx="98" cy="84" r="3" fill="#FFFFFF" />
            <circle cx="103" cy="91" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Cute Little Button Nose */}
        <ellipse cx="80" cy="93" rx="4" ry="3" fill="#FF8C9E" />

        {/* Mouth */}
        {mood === 'happy' || mood === 'celebrate' || mood === 'wave' ? (
          // Joyful open cute smile with tongue
          <g>
            <path
              d="M72 96 C72 104, 88 104, 88 96"
              fill="#FF8C9E"
              stroke="#353047"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M75 99 C77 97, 83 97, 85 99"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </g>
        ) : mood === 'thinking' ? (
          // Curious "o" mouth
          <circle cx="80" cy="101" r="3.5" fill="#FF8C9E" stroke="#353047" strokeWidth="2" />
        ) : (
          // Sweet gentle cat smile :3
          <path
            d="M74 97 Q80 102 80 97 Q80 102 86 97"
            stroke="#353047"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Paws */}
        {mood === 'wave' ? (
          <>
            {/* Left paw resting */}
            <ellipse cx="48" cy="126" rx="9" ry="8" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
            {/* Right waving paw */}
            <g className="animate-wave origin-[118px_110px]">
              <ellipse cx="124" cy="98" rx="10" ry="11" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
              <circle cx="122" cy="95" r="2.5" fill="#FFB3C1" />
              <circle cx="127" cy="98" r="2" fill="#FFB3C1" />
            </g>
          </>
        ) : mood === 'celebrate' ? (
          <>
            {/* Both paws up celebrating */}
            <ellipse cx="36" cy="80" rx="9" ry="9" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
            <ellipse cx="124" cy="80" rx="9" ry="9" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
          </>
        ) : (
          <>
            {/* Little front resting paws */}
            <ellipse cx="62" cy="128" rx="9" ry="7" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
            <ellipse cx="98" cy="128" rx="9" ry="7" fill="#FFF8F0" stroke="#E9DDFB" strokeWidth="2.5" />
          </>
        )}

        {/* Small floating sparkles/stars for mood celebration/happy */}
        {(mood === 'celebrate' || mood === 'happy') && (
          <g fill="#FF8C9E" opacity="0.8">
            <path d="M22 60 L24 64 L28 65 L24 66 L22 70 L20 66 L16 65 L20 64 Z" transform="scale(0.8)" />
            <path d="M140 50 L142 54 L146 55 L142 56 L140 60 L138 56 L134 55 L138 54 Z" transform="scale(0.7)" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default Mascot;
