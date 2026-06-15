import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Tv, 
  Sparkles, 
  Clock, 
  Compass, 
  Coins, 
  ShieldCheck, 
  Check,
  ExternalLink,
  ChevronRight,
  Monitor
} from 'lucide-react';

interface NavigationVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VideoTutorial {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  duration: string;
  embedUrl: string;
  description: string;
  chapters: { time: string; title: string; seconds: number }[];
}

export default function NavigationVideo({ isOpen, onClose }: NavigationVideoProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>('connection');
  const [playedOnce, setPlayedOnce] = useState<boolean>(false);

  const tutorials: VideoTutorial[] = [
    {
      id: 'connection',
      title: 'Wallet Connection & Core Signals',
      subtitle: 'Learn how to link active credentials safely',
      duration: '3:15 min',
      icon: <Compass className="w-4 h-4 text-purple-400" />,
      embedUrl: 'https://www.youtube.com/embed/YwnCAl9f_pI?autoplay=1&mute=1&rel=0',
      description: 'A comprehensive walkthrough demonstrating secure client-side sandbox wallet linking, credential verification, and initial reputation point syncing under zero private-key exposure protocols.',
      chapters: [
        { time: '0:00', title: 'Tutorial Introduction & Concept', seconds: 0 },
        { time: '0:45', title: 'Initiating Secure Connection Link', seconds: 45 },
        { time: '1:30', title: 'Verifying Multi-chain Assets', seconds: 90 },
        { time: '2:15', title: 'Score Alignment & Synchronization', seconds: 135 },
        { time: '2:55', title: 'Accessing Initial Dashboard Tiers', seconds: 175 },
      ]
    },
    {
      id: 'navigation',
      title: 'Dashboard Navigation & Karma Engine',
      subtitle: 'Complete guide to pillars, charts, and simulator',
      duration: '4:20 min',
      icon: <Tv className="w-4 h-4 text-[#14F195]" />,
      embedUrl: 'https://www.youtube.com/embed/YVgfHZMVMm4?autoplay=1&mute=1&rel=0',
      description: 'Master the Five Behavioral Pillars of Karma. Learn how to optimize daily active holding streaks, decipher reputation timeline charts, and interact with the sandbox underwriter simulator.',
      chapters: [
        { time: '0:00', title: 'Navigation Overview', seconds: 0 },
        { time: '1:10', title: 'Five Behavioral Pillars Demystified', seconds: 70 },
        { time: '2:05', title: 'Analyzing Streak Multipliers', seconds: 125 },
        { time: '2:50', title: 'Navigating Reputation Charts', seconds: 170 },
        { time: '3:40', title: 'Utilizing the Emulator Sandbox', seconds: 220 },
      ]
    }
  ];

  const activeVideo = tutorials.find(t => t.id === activeVideoId) || tutorials[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-6 md:py-12 bg-slate-950/85 backdrop-blur-md flex items-center justify-center animate-fade-in" id="tutorial-video-modal-overlay">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-[#090912] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh]"
          >
            
            {/* Ambient Background Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#14F195]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header section (Always visible) */}
            <div className="p-5 md:p-6 border-b border-white/[0.06] flex items-center justify-between relative z-10 bg-[#07070d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                  <Monitor className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white flex flex-wrap items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    <span>INTERACTIVE VIDEO TUTORIALS</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono border border-purple-500/20">
                      Step-by-Step Guide
                    </span>
                  </h2>
                  <p className="text-[10px] md:text-[11px] font-mono text-slate-400">CONNECTING PROCESS & DASHBOARD MASTERCLASS</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-white/[0.05] hover:border-white/10 text-slate-400 hover:text-white transition-all bg-slate-950/40 cursor-pointer"
                title="Close Tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (Scrollable if viewport is tiny) */}
            <div className="overflow-y-auto flex-1 relative z-10 custom-scrollbar flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/[0.05]">
              
              {/* Left major column - Video Player */}
              <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                
                {/* Active Player Wrapper */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.06] shadow-2xl group">
                  <iframe
                    src={activeVideo.embedUrl}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    id="tutorial-video-iframe"
                  />
                </div>

                {/* Video Info Panel */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Currently Playing
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10">
                      <Clock className="w-3 h-3" />
                      <span>{activeVideo.duration}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-base font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {activeVideo.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeVideo.description}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      We do not collect seeds or credentials. Verify fully offline.
                    </span>
                    <a 
                      href="https://app.kast.xyz/referral/O7A99Y65" 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 shrink-0"
                    >
                      Kast Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Right column - Video Selector & Timeline Chapters */}
              <div className="w-full lg:w-80 shrink-0 p-5 md:p-6 bg-[#07070e] flex flex-col justify-start gap-5">
                
                {/* Switcher Header */}
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                    Select Tutorial Guide
                  </span>
                  
                  <div className="space-y-2">
                    {tutorials.map(tut => {
                      const isActive = tut.id === activeVideoId;
                      return (
                        <button
                          key={tut.id}
                          onClick={() => {
                            setActiveVideoId(tut.id);
                          }}
                          className={`w-full p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer flex items-start gap-2.5 ${
                            isActive 
                              ? 'bg-purple-600/15 border-purple-500/30 shadow-md' 
                              : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive ? 'bg-purple-500/20 border-purple-500/30' : 'bg-slate-950 border-white/[0.04]'
                          }`}>
                            {tut.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-slate-350'}`}>
                              {tut.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 mt-1 block truncate">
                              {tut.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline chapters checklist */}
                <div className="border-t border-white/[0.05] pt-4">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">
                    Video Chapters & Key Metas
                  </span>

                  <div className="space-y-2 font-sans">
                    {activeVideo.chapters.map((chapter, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.01] border border-white/[0.03] text-[10.5px] text-slate-400"
                      >
                        <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-white/[0.05] text-purple-300 font-bold shrink-0">
                          {chapter.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-305 block truncate text-slate-300">
                            {chapter.title}
                          </span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-[#14F195]/70 shrink-0 stroke-2" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
            </div>

            {/* Sticky footer actions */}
            <div className="p-4 md:p-5 border-t border-white/[0.05] bg-[#07070c] flex flex-col sm:flex-row gap-3 items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Sandbox Environment: Safe for wallet diagnostics.</span>
              </div>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] uppercase tracking-wide border-none cursor-pointer transition-all active:scale-95"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Close Video Tutorial
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
