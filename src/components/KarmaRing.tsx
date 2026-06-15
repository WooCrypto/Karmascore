import { useEffect, useState } from 'react';
import { Aura } from '../types';

interface KarmaRingProps {
  score: number;
  aura: Aura;
  size?: number;
}

export default function KarmaRing({ score, aura, size = 180 }: KarmaRingProps) {
  const [val, setVal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage within the 0 - 1000 range
  const percentage = Math.max(0, Math.min(1, score / 1000));
  const targetOffset = circumference - percentage * circumference;

  useEffect(() => {
    // Ultra-smooth easeOutExpo mathematical easing function
    const easeOutExpo = (t: number) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    setIsAnimating(false);
    
    // Tiny delay to ensure classes trigger entrance keyframes correctly
    const resetTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 50);

    const startVal = 0;
    const endVal = score;
    const duration = 1600; // 1.6s
    const startTime = performance.now();

    let animationFrameId: number;

    const updateScore = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentVal = Math.floor(startVal + (endVal - startVal) * easedProgress);
      setVal(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateScore);
      } else {
        setVal(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(updateScore);

    return () => {
      clearTimeout(resetTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aura.color} />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Gray Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#grad-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          style={{
            filter: `drop-shadow(0 0 12px ${aura.color}dd)`,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)',
          }}
        />
      </svg>

      {/* Internal Value Text Overlay with elegant css transition helper */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span 
          className="text-white text-5xl font-extrabold tracking-tight select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ 
            fontFamily: "'Syne', sans-serif",
            transform: isAnimating ? 'scale(1)' : 'scale(0.75)',
            opacity: isAnimating ? 1 : 0,
            textShadow: isAnimating 
              ? `0 0 20px ${aura.color}bf, 0 0 10px ${aura.color}45` 
              : `0 0 0px ${aura.color}00`
          }}
        >
          {val}
        </span>
        <span 
          className="text-xs uppercase tracking-widest font-mono mt-1 text-slate-400 transition-all duration-700 ease-out"
          style={{ 
            letterSpacing: '0.2em',
            transform: isAnimating ? 'translateY(0)' : 'translateY(6px)',
            opacity: isAnimating ? 1 : 0,
            transitionDelay: '300ms'
          }}
        >
          Karma
        </span>
      </div>
    </div>
  );
}
