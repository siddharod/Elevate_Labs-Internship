import React from 'react';

export const ByteMascot = ({
  mood = 'happy',
  size = 'md',
  speech = '',
  speechDirection = 'top',
  className = '',
  animated = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    hero: 'w-48 h-48 md:w-60 md:h-60',
  };

  // Expression colors and paths based on mood
  const getEyeExpression = () => {
    switch (mood) {
      case 'happy':
      case 'celebrate':
        return (
          <>
            <path d="M 37 45 Q 40 40 43 45" stroke="#65D6B3" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 57 45 Q 60 40 63 45" stroke="#65D6B3" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'thinking':
        return (
          <>
            <circle cx="40" cy="42" r="4.5" fill="#65D6B3" />
            <ellipse cx="60" cy="46" rx="4.5" ry="3" fill="#65D6B3" />
          </>
        );
      case 'error':
        return (
          <>
            <line x1="36" y1="41" x2="44" y2="49" stroke="#FF7EB6" strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="41" x2="36" y2="49" stroke="#FF7EB6" strokeWidth="3" strokeLinecap="round" />
            <line x1="56" y1="41" x2="64" y2="49" stroke="#FF7EB6" strokeWidth="3" strokeLinecap="round" />
            <line x1="64" y1="41" x2="56" y2="49" stroke="#FF7EB6" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'coding':
        return (
          <>
            {/* Glowing matrix coder eyes */}
            <text x="35" y="47" fill="#65D6B3" fontSize="8" fontWeight="bold" fontFamily="monospace">&lt;&gt;</text>
            <text x="55" y="47" fill="#65D6B3" fontSize="8" fontWeight="bold" fontFamily="monospace">{}</text>
          </>
        );
      case 'idle':
      default:
        return (
          <>
            <ellipse cx="40" cy="44" rx="4.5" ry="5.5" fill="#65D6B3" />
            <circle cx="42" cy="42" r="1.8" fill="#FFFFFF" />
            <ellipse cx="60" cy="44" rx="4.5" ry="5.5" fill="#65D6B3" />
            <circle cx="62" cy="42" r="1.8" fill="#FFFFFF" />
          </>
        );
    }
  };

  const getMouthExpression = () => {
    switch (mood) {
      case 'happy':
      case 'celebrate':
        return <path d="M 44 54 Q 50 61 56 54" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" fill="none" />;
      case 'thinking':
        return <ellipse cx="50" cy="55" rx="3" ry="2" fill="#FFD166" />;
      case 'error':
        return <path d="M 44 57 Q 50 52 56 57" stroke="#FF7EB6" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case 'coding':
        return <line x1="45" y1="55" x2="55" y2="55" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" />;
      case 'idle':
      default:
        return <path d="M 46 54 Q 50 57 54 54" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {speech && (
        <div
          className={`mb-2 bg-white text-[#182033] px-3.5 py-1.5 rounded-2xl shadow-md border-2 border-[#5BC0EB] text-xs md:text-sm font-semibold max-w-xs text-center z-10 animate-fade-in ${
            speechDirection === 'left' ? '-translate-x-4' : ''
          }`}
        >
          {speech}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
        </div>
      )}

      {/* Robot SVG */}
      <div className={`${sizeMap[size] || sizeMap.md} ${animated ? 'animate-float' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Antenna */}
          <line x1="50" y1="24" x2="50" y2="12" stroke="#FF9F68" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx="50"
            cy="10"
            r="6"
            fill={mood === 'celebrate' ? '#FF7EB6' : '#FFD166'}
            stroke="#FF9F68"
            strokeWidth="2"
            className={animated ? 'animate-pulse' : ''}
          />

          {/* Ears/Side Bolts */}
          <rect x="14" y="38" width="6" height="18" rx="3" fill="#9B6DFF" />
          <rect x="80" y="38" width="6" height="18" rx="3" fill="#9B6DFF" />

          {/* Head Shape */}
          <rect
            x="20"
            y="24"
            width="60"
            height="50"
            rx="16"
            fill="#5BC0EB"
            stroke="#3AA1CC"
            strokeWidth="3"
          />

          {/* Dark Glass Screen */}
          <rect x="28" y="32" width="44" height="32" rx="10" fill="#182033" />

          {/* Eyes & Mouth Expressions */}
          {getEyeExpression()}
          {getMouthExpression()}

          {/* Rosy Cheeks */}
          <circle cx="34" cy="52" r="2.5" fill="#FF7EB6" opacity="0.8" />
          <circle cx="66" cy="52" r="2.5" fill="#FF7EB6" opacity="0.8" />

          {/* Body Peek */}
          <path
            d="M 33 74 L 67 74 L 63 88 L 37 88 Z"
            fill="#9B6DFF"
            stroke="#7A4EE0"
            strokeWidth="2.5"
          />
          <circle cx="50" cy="81" r="3.5" fill="#FFD166" />
        </svg>
      </div>
    </div>
  );
};

export default ByteMascot;
