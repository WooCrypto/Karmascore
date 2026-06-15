import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Compass, 
  Key, 
  TrendingUp, 
  Eye, 
  Check, 
  Lock,
  ArrowRight,
  Fingerprint
} from 'lucide-react';

interface KarmaManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KarmaManifestoModal({ isOpen, onClose }: KarmaManifestoModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track read status of each of the 8 major verses
  const [readSections, setReadSections] = useState<Record<number, boolean>>({
    0: true, // First section starts read
  });

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight <= 0) return;

    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);

    // Dynamic scroll tracking: Mark sections as read as they scroll past
    const sectionsCount = 8;
    const currentSectionIdx = Math.min(
      sectionsCount - 1,
      Math.floor((scrollTop + el.clientHeight / 2) / (el.scrollHeight / sectionsCount))
    );

    if (currentSectionIdx >= 0) {
      setReadSections(prev => ({
        ...prev,
        [currentSectionIdx]: true
      }));
    }
  };


  const verses = [
    {
      id: 0,
      icon: <Sparkles className="text-amber-400" size={24} />,
      title: "KARMA",
      subtitle: "What You Do Always Comes Back",
      content: (
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed tracking-wide font-sans">
          For the first time, you’re not just holding a token… <br className="hidden sm:inline" />
          <span className="text-purple-300 font-extrabold italic">you’re holding a reflection of your actions.</span>
        </p>
      ),
      glow: "from-purple-500/20 to-[#14F195]/5"
    },
    {
      id: 1,
      icon: <ShieldCheck className="text-purple-400" size={24} />,
      title: "Karma Is Not Luck. It’s Accountability.",
      subtitle: "The Law of Equilibrium",
      content: (
        <div className="space-y-2.5">
          <p className="text-slate-300 text-sm leading-relaxed">
            Holding <strong className="text-white">$KARMA</strong> isn’t about hoping the universe delivers.
            It’s about proving who you are — through action, consistency, and integrity.
          </p>
          <div className="p-3 bg-black/40 border border-purple-500/10 rounded-xl text-xs font-mono text-purple-300 text-center uppercase tracking-wider">
            Every transaction, interaction, and contribution leaves a trace. Karma remembers.
          </div>
        </div>
      ),
      glow: "from-purple-500/10 to-indigo-500/10"
    },
    {
      id: 2,
      icon: <Zap className="text-[#14F195]" size={24} />,
      title: "Belief Alone Isn’t Enough — Action Creates Karma",
      subtitle: "Manifestation via Execution",
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            In the real world, belief without action fades. In the Karma ecosystem, <span className="text-emerald-400 font-bold">action is measured</span>.
          </p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            That’s why Karma is paired with <strong className="text-white">KarmaScore.xyz</strong> — a platform that checks, tracks, and reflects your digital behavior.
          </p>
          <div className="text-xs font-bold text-amber-300 italic border-l-2 border-amber-400 pl-3">
            You don’t claim good karma. You earn it.
          </div>
        </div>
      ),
      glow: "from-[#14F195]/10 to-teal-500/5"
    },
    {
      id: 3,
      icon: <Fingerprint className="text-cyan-400" size={24} />,
      title: "Your Karma Score Is Your Signal",
      subtitle: "Verifiable Character Oracle",
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Your Karma Score is a living indicator of:
          </p>
          <ul className="text-xs font-mono text-slate-400 space-y-1.5 pl-4 list-disc text-left">
            <li>Consistent participation & commitment</li>
            <li>Fair and honest peer-level behavior</li>
            <li>Contribution to decentralized communities</li>
            <li>Long-term alignment, absolutely not short-term hype</li>
            <li>Reputation mapped across the ecosystem</li>
          </ul>
          <div className="text-[11px] font-bold text-slate-500 border-t border-white/[0.04] pt-2 italic text-center">
            It’s not about perfection. It’s about patterns.
          </div>
        </div>
      ),
      glow: "from-cyan-500/10 to-blue-500/10"
    },
    {
      id: 4,
      icon: <Key className="text-amber-400" size={24} />,
      title: "The Higher Your Karma, the More Doors Open",
      subtitle: "Unlocking Sovereign Privileges",
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Karma isn’t punishment or reward — <span className="text-amber-300 font-bold">it’s balance</span>.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            As your Karma Score grows, so does your access to:
          </p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 text-[9.5px] font-mono text-[#a78bfa]">
            <span className="p-1.5 rounded bg-white/5 border border-white/[0.02]">• Platform privileges</span>
            <span className="p-1.5 rounded bg-white/5 border border-white/[0.02]">• Token-based incentives</span>
            <span className="p-1.5 rounded bg-white/5 border border-white/[0.02]">• Community trust desk</span>
            <span className="p-1.5 rounded bg-white/5 border border-white/[0.02]">• Reputation opportunities</span>
          </div>
          <p className="text-[11px] text-slate-500 text-center pt-1">
            The system doesn’t ask who you say you are. <br /><strong>It shows who you’ve proven yourself to be.</strong>
          </p>
        </div>
      ),
      glow: "from-amber-500/10 to-purple-500/10"
    },
    {
      id: 5,
      icon: <TrendingUp className="text-purple-400" size={24} />,
      title: "Why Hold $KARMA?",
      subtitle: "The Compounding Return of Alignment",
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Holding <strong className="text-white">$KARMA</strong> is more than an investment — it’s a commitment to alignment.
          </p>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.03] space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 🛑 Shortcuts cost you later</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 🌱 Integrity compounds</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 🌌 Reputation has tangible value</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> ✨ Every minor action matters</div>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            The more aligned your actions, the stronger your Karma becomes.
          </p>
        </div>
      ),
      glow: "from-purple-500/10 to-indigo-500/5"
    },
    {
      id: 6,
      icon: <Eye className="text-amber-500" size={24} />,
      title: "This Isn’t Manifestation — It’s Reflection",
      subtitle: "Immutable Mirror of truth",
      content: (
        <div className="space-y-3 text-center">
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            The universe doesn’t guess. The blockchain ledger doesn’t forget.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Karma doesn’t promise instant rewards. It builds long-term, unshakeable credibility.
          </p>
          <div className="p-3 bg-[#fbbf24]/5 border border-[#fbbf24]/10 rounded-xl font-mono text-amber-300 text-xs font-black">
            "What you put out is exactly what comes back — measured, scored, and visible."
          </div>
        </div>
      ),
      glow: "from-amber-500/15 to-transparent"
    },
    {
      id: 7,
      icon: <Activity className="text-emerald-400" size={24} />,
      title: "Karma Is Always Watching.",
      subtitle: "The Question Is — What Is It Seeing?",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-300 text-sm tracking-wide font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
            The Question Is — What Is It Seeing?
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400 mt-2">
            <div className="p-2 border border-white/[0.02] bg-slate-900/30 rounded-lg">
              <span className="block text-[#14F195] font-black">CHECK</span>
              <span>Your Karma</span>
            </div>
            <div className="p-2 border border-white/[0.02] bg-slate-900/30 rounded-lg">
              <span className="block text-purple-400 font-black">BUILD</span>
              <span>Your Score</span>
            </div>
            <div className="p-2 border border-white/[0.02] bg-slate-900/30 rounded-lg">
              <span className="block text-amber-400 font-black">EARN</span>
              <span>Your Future</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-[#14F195] text-slate-950 hover:opacity-90 active:scale-95 transition-all text-center cursor-pointer shadow-lg shadow-emerald-500/20"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            I Accept the Immutable Creed 🤝
          </button>
        </div>
      ),
      glow: "from-emerald-500/10 to-[#14F195]/20"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-10 bg-black/90 backdrop-blur-sm cursor-pointer font-sans"
        >
          
          {/* Particle / Light Orb Ambient BG inside Modal */}
          <div className="absolute inset-x-0 top-12 bottom-12 bg-gradient-to-b from-purple-950/15 via-transparent to-emerald-950/10 rounded-3xl filter blur-3xl opacity-60 pointer-events-none" />

          {/* Modal Outer Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-[#030308]/95 border border-white/[0.08] rounded-[20px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[92vh] sm:h-[90vh] md:h-[85vh] text-[#f8fafc] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
          
          {/* TOP HEADER STATUS & NAVIGATION BAR */}
          <div className="p-4 sm:p-5 border-b border-white/[0.04] flex items-center justify-between bg-slate-950/60 relative z-30">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 font-mono text-[9px] font-black tracking-widest uppercase border border-purple-500/10">
                🔮 SACRED LEDGER
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                  The Karma Creed
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">
                  Version 1.0.9 • Public Accountability
                </span>
              </div>
            </div>

            {/* Quick Progress Indicator on Header */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/[0.03] px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-400">
              <span className="text-amber-400 font-bold">Creed Progress:</span>
              <span>{Math.round(scrollProgress)}% read</span>
              <div className="w-16 h-1 rounded-full bg-slate-800 ml-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-[#14F195] transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            {/* Dismiss Cross Icon Button */}
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all cursor-pointer border-none bg-transparent"
              title="Close Manifesto [Esc]"
            >
              <X size={18} />
            </button>
          </div>

          {/* DYNAMIC LIQUID SCROLL PROGRESS STRIP */}
          <div className="h-[2px] w-full bg-slate-900 overflow-hidden relative z-20">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 via-cyan-400 to-[#14F195] transition-all duration-150" 
              style={{ width: `${scrollProgress}%` }} 
            />
          </div>

          {/* SPLIT SCREEN LAYOUT CONTAINER */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
            
            {/* LEFT INDEX TRACKER PILLARS (Desktop Only) */}
            <div className="hidden md:flex w-72 border-r border-white/[0.04] bg-slate-950/20 p-6 flex-col justify-between select-none">
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                  Creed Verse Index
                </span>
                
                <div className="space-y-2.5">
                  {verses.map((v, idx) => {
                    const isRead = readSections[idx];
                    const isActive = Math.round(scrollProgress / 12.5) >= idx;
                    return (
                      <div 
                        key={idx}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                          isActive 
                            ? 'bg-purple-950/15 border-purple-500/20 shadow' 
                            : 'bg-transparent border-transparent'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-black ${
                          isRead
                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                            : isActive
                              ? 'bg-purple-500/20 text-[#a78bfa] border border-purple-500/20'
                              : 'bg-slate-900 text-slate-500'
                        }`}>
                          {isRead ? <Check size={10} /> : idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <span className={`block text-[10px] font-bold truncate leading-none ${
                            isActive ? 'text-slate-100' : 'text-slate-500'
                          }`}>
                            {v.title}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600 block truncate mt-0.5 uppercase tracking-wide">
                            {v.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accountability Signet */}
              <div className="p-3.5 bg-purple-950/5 border border-purple-500/10 rounded-xl space-y-1.5">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">
                  🛡️ Immutable Sandbox
                </span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Your actions across Karma’s sandbox leaving a permanent signature of dedication. Hold and earn.
                </p>
              </div>
            </div>

            {/* RIGHT SCROLLABLE VERSES CONTENT GROUND */}
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-8 scrollbar-thin scroll-smooth"
            >
              
              {/* Introduction Banner card */}
              <div className="text-center pb-6 border-b border-white/[0.04]">
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div className="absolute w-12 h-12 bg-purple-400/10 rounded-full blur-xl animate-pulse" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-full border border-purple-500/20 hover:border-purple-400/40 flex items-center justify-center bg-slate-950 z-10"
                  >
                    🔮
                  </motion.div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  THE $KARMA CODE
                </h2>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  A decentralized declaration of holding, credibility, reflection, and absolute accountability. Scroll down to absorb.
                </p>
              </div>

              {/* Verses Lists cards with sequential entries */}
              <div className="space-y-6 max-w-2xl mx-auto">
                {verses.map((v, index) => {
                  const isSectionRead = readSections[index];
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      id={`creed-verse-${v.id}`}
                      className={`p-5 sm:p-6 rounded-2xl bg-[#090915] border transition-all duration-300 relative overflow-hidden ${
                        isSectionRead
                          ? 'border-white/[0.08] hover:border-purple-500/25 shadow-lg shadow-[#020204]/80'
                          : 'border-white/[0.03] opacity-60'
                      }`}
                    >
                      {/* Ambient background glow gradient in cell */}
                      <div className={`absolute inset-0 bg-gradient-to-tr ${v.glow} opacity-15 pointer-events-none`} />
                      
                      {/* Index / Badge header line */}
                      <div className="flex justify-between items-center mb-3.5 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/[0.04] text-[9.5px] font-mono text-slate-400 font-extrabold select-none">
                            VERSE 0{v.id + 1}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">•</span>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wide">
                            {v.subtitle}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/[0.04] flex items-center justify-center relative z-10">
                          {v.icon}
                        </div>
                      </div>

                      {/* Heading */}
                      <h4 
                        className="text-base sm:text-lg font-extrabold text-white mb-2 font-sans tracking-tight leading-tight relative z-10"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {v.title}
                      </h4>

                      {/* Content block */}
                      <div className="relative z-10 space-y-2">
                        {v.content}
                      </div>

                      {/* Visual indicator of reading */}
                      <div className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-700 select-none">
                        {isSectionRead ? '✓ PROCESSED' : '⌛ UNREAD'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Closing Interactive Call to action */}
              <div className="pt-8 pb-12 text-center border-t border-white/[0.04]">
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed font-mono">
                  ✨ "The ledger doesn't forget. Your reputation is your only collateral in the sovereign domain."
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={onClose}
                    className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-100 active:scale-95 transition-all text-center cursor-pointer shadow"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Close Manifesto [esc]
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* STICKY FOOTER NAVIGATION PROGRESS BADGES */}
          <div className="p-3 bg-slate-950 border-t border-white/[0.04] text-center text-[10px] text-slate-500 font-mono tracking-wide flex flex-col xs:flex-row justify-between items-center px-6 gap-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SANDBOX COMPLIANCE GUARANTEED
            </span>
            <div className="flex gap-2 text-[9px]">
              {Array.from({ length: 8 }).map((_, rIdx) => (
                <div 
                  key={rIdx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    readSections[rIdx] ? 'bg-emerald-400' : 'bg-slate-800'
                  }`} 
                  title={`Verse ${rIdx + 1} Status`}
                />
              ))}
            </div>
          </div>

        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
