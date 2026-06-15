import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Aura } from '../types';
import { getAura } from '../constants';

interface AuraToastProps {
  prevAura: Aura | null;
  currAura: Aura | null;
  triggerKey: number; // Increment this to force trigger
  onClose: () => void;
}

export default function AuraToastNotification({ prevAura, currAura, triggerKey, onClose }: AuraToastProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; r: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (currAura && prevAura && currAura.name !== prevAura.name) {
      setVisible(true);

      // Play elegant celebratory audio chime using AudioContext
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          
          // Sound pattern: 3 rising notes (triad) for ascending, descending of lesser octave for shift
          const isUpgrade = currAura.min > prevAura.min;
          const rootFreq = isUpgrade ? 440 : 220; // A4 for upgrade, A3 for down
          const notes = isUpgrade ? [rootFreq, rootFreq * 1.25, rootFreq * 1.5] : [rootFreq * 1.5, rootFreq * 1.25, rootFreq]; 
          
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
            osc.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(ctx.currentTime + idx * 0.15);
            osc.stop(ctx.currentTime + idx * 0.15 + 0.5);
          });
        }
      } catch (err) {
        console.warn('Audio Context block or unsupported:', err);
      }

      // Generate colorful floating particles matching the target Aura design theme
      const generated: typeof particles = [];
      const isUp = currAura.min > prevAura.min;
      const count = isUp ? 35 : 15;
      
      for (let i = 0; i < count; i++) {
        generated.push({
          id: i,
          x: (Math.random() - 0.5) * 380, // wide scatter
          y: (Math.random() - 0.5) * 220,
          r: Math.random() * 5 + 3,
          color: Math.random() > 0.4 ? currAura.color : (prevAura ? prevAura.color : '#a78bfa'),
          delay: Math.random() * 0.35,
        });
      }
      setParticles(generated);

      // Auto dismiss after 7.5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 7500);

      return () => clearTimeout(timer);
    }
  }, [prevAura, currAura, triggerKey]);

  if (!visible || !currAura || !prevAura) return null;

  const isUpgrade = currAura.min > prevAura.min;
  const highlightColor = currAura.color;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center p-4">
      
      {/* 1. Backdrop Glow Burst Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => {
          setVisible(false);
          onClose();
        }}
      />

      {/* 2. Full-Screen Floating Celebration Particles */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0.8, 0], 
              scale: [0, 1.2, 0.8, 0],
              x: p.x, 
              y: p.y - 120, // push upwards
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: Math.random() * 1.5 + 1.8, 
              delay: p.delay,
              ease: [0.1, 0.8, 0.3, 1] 
            }}
            style={{
              position: 'absolute',
              width: p.r,
              height: p.r,
              borderRadius: p.r > 5 ? '1px' : '50%',
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}40`,
            }}
          />
        ))}
      </div>

      {/* 3. The Central Level Up Toast Panel */}
      <motion.div
        initial={{ scale: 0.85, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-slate-950/95 border border-white/[0.08] p-6 sm:p-8 rounded-3xl w-full max-w-md pointer-events-auto text-center"
        style={{
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px ${highlightColor}15, inset 0 1px 0 rgba(255,255,255,0.06)`
        }}
      >
        {/* Colorful dynamic top decorative aura bar */}
        <div 
          className="absolute top-0 left-12 right-12 h-[3px] rounded-full filter blur-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${highlightColor}, transparent)`
          }}
        />

        {/* Dynamic Glowing Halo */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[70px] opacity-20 pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: highlightColor }}
        />

        {/* Content Shield */}
        <div className="relative z-10">
          
          {/* Animated Celebration Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 text-3xl font-bold bg-white/[0.02] border border-white/[0.08]"
            style={{ 
              boxShadow: `0 0 15px ${highlightColor}20`,
              borderColor: `${highlightColor}40`
            }}
          >
            {isUpgrade ? '✨' : '🌀'}
          </motion.div>

          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">
            {isUpgrade ? '✧ AURA ASCENSION TRIGGERED ✧' : '✧ AURA STATE RE-ALIGNMENT ✧'}
          </span>

          <h2 
            className="text-2xl font-black text-white uppercase tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {isUpgrade ? 'Bracket Ascended!' : 'Aura Bracket Shifted'}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed px-2 mb-6">
            Reputation telemetry consensus finalized! Your sandbox hold integrity score has bridged the threshold into a new level of consensus hierarchy.
          </p>

          {/* Level Transition Comparison graphic */}
          <div className="flex items-center justify-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/[0.03] mb-6">
            
            {/* Old Aura */}
            <div className="text-center flex-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Previous</span>
              <span 
                className="text-xs font-bold font-sans uppercase px-2 py-1 rounded inline-block"
                style={{ color: prevAura.color, backgroundColor: `${prevAura.color}10`, border: `1px solid ${prevAura.color}20` }}
              >
                {prevAura.badge}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-1">{prevAura.name}</span>
            </div>

            {/* Path indicator arrows */}
            <div className="text-slate-500 font-bold text-xl animate-pulse shrink-0">
              ➔
            </div>

            {/* New Aura */}
            <div className="text-center flex-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Active Now</span>
              <span 
                className="text-xs font-bold font-sans uppercase px-2 py-1 rounded inline-block animate-pulse"
                style={{ color: currAura.color, backgroundColor: `${currAura.color}15`, border: `1.5px solid ${currAura.color}35` }}
              >
                {currAura.badge}
              </span>
              <span className="text-[9px] font-mono text-white font-bold block mt-1">{currAura.name}</span>
            </div>

          </div>

          {/* Action trigger button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              className="w-full py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${highlightColor}20, ${highlightColor}40)`,
                borderColor: `${highlightColor}60`,
                color: '#ffffff',
                textShadow: `0 0 8px ${highlightColor}40`
              }}
            >
              Exemplary conviction acknowledged
            </button>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">
              Dismissing automatically in 7.5 seconds
            </span>
          </div>

        </div>

      </motion.div>

    </div>
  );
}
