import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Smartphone, 
  CheckCircle2, 
  Wallet, 
  Compass, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Sparkles, 
  HelpCircle,
  Eye, 
  MousePointerClick,
  Monitor
} from 'lucide-react';
import GlassCard from './GlassCard';

interface SovereignGuideSimulatorProps {
  onShowConnect: () => void;
}

type TourStep = {
  id: number;
  title: string;
  icon: string;
  desc: string;
  mediaText: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Initialize Connection',
    icon: '🔌',
    desc: 'Launch the wallet connect interface. Select any standard wrapper (MetaMask, Phantom, Ledger, or WalletConnect).',
    mediaText: 'Step 1: Open Connect Wallet menu on top-right.'
  },
  {
    id: 2,
    title: 'Select Sandbox ID',
    icon: '🎲',
    desc: 'Avoid inputting private key records or making gas deposits. Click the Sandbox ID credentials tab to instantly generate high-fidelity simulated addresses.',
    mediaText: 'Step 2: Input your @handle and check "Sandbox ID" for mock simulation.'
  },
  {
    id: 3,
    title: 'Authorize Profile Check',
    icon: '⚡',
    desc: 'Watch the real-time scoring engine scan RPC nodes, index smart wallets, and compile your behavioral Karma Rank.',
    mediaText: 'Step 3: Click "Compile My Karma Score" to trigger real-time scanning.'
  },
  {
    id: 4,
    title: 'Explore the Dashboard',
    icon: '📊',
    desc: 'Navigate to the Dashboard. Analyze your live D3 Reputation ring, check streak calendar records, and monitor behavioral indicators.',
    mediaText: 'Step 4: Navigate tabs to analyze reputation, streaks, and assets on the Dashboard.'
  },
  {
    id: 5,
    title: 'Access Underwritten Perks',
    icon: '💳',
    desc: 'Access Lenders and KAST. Higher scores unlock lower borrowing APRs, premium stakes, and real-world asset credit doors!',
    mediaText: 'Step 5: Access uncollateralized lending limits and RWA perks gated by score!'
  }
];

export default function SovereignGuideSimulator({ onShowConnect }: SovereignGuideSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'checklist'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(0); // 0 to 4 corresponding to steps
  const [progress, setProgress] = useState<number>(0);
  const [simUsername, setSimUsername] = useState<string>('satoshi_');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 20, y: 120 });
  const [simAddress, setSimAddress] = useState<string>('0x...');
  const [scanState, setScanState] = useState<string>('Idle');
  const [scanProgress, setScanProgress] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Auto-play interval for simulation video
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            // Move to next step
            setSimStep(current => {
              const next = (current + 1) % TOUR_STEPS.length;
              return next;
            });
            return 0; // reset step progress
          }
          return p + 1.25; // Speed multiplier for smooth visual playback
        });
      }, 50);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  // Handle specific step-based mock triggers for high-fidelity representation
  useEffect(() => {
    // Reset secondary simulated states upon transition
    if (simStep === 0) {
      // Step 1: Open Connect Wallet
      setSimUsername('s');
      setCursorPos({ x: 340, y: 30 }); // pointer moves toward Connect Wallet button
      setScanState('Idle');
      setScanProgress(0);
      setSimAddress('0x...');
    } else if (simStep === 1) {
      // Step 2: Input username & Pick Sandbox
      let typed = '';
      const targetUser = 'rep_visionary';
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i < targetUser.length) {
          typed += targetUser[i];
          setSimUsername(typed);
          i++;
        } else {
          clearInterval(typeTimer);
        }
      }, 80);
      
      setCursorPos({ x: 140, y: 160 }); // pointer selects Sandbox ID tab
      setScanState('Ready');
      return () => clearInterval(typeTimer);
    } else if (simStep === 2) {
      // Step 3: Compiles karma checking
      setCursorPos({ x: 210, y: 250 }); // click compile button
      setScanState('Scanning...');
      let sp = 0;
      const scanTimer = setInterval(() => {
        sp += 4;
        if (sp >= 100) {
          sp = 100;
          setScanState('Complete');
          setSimAddress('0x4f195d...e32a');
          clearInterval(scanTimer);
        }
        setScanProgress(sp);
      }, 70);
      return () => clearInterval(scanTimer);
    } else if (simStep === 3) {
      // Step 4: Dashboard
      setCursorPos({ x: 120, y: 15 }); // pointer moves to dashboard tab
    } else if (simStep === 4) {
      // Step 5: Lenders
      setCursorPos({ x: 200, y: 15 }); // pointer moves to lenders tab
    }
  }, [simStep]);

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepJump = (idx: number) => {
    setSimStep(idx);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setSimStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full relative z-20 mt-10 px-4">
      <div className="max-w-[1080px] mx-auto">
        <GlassCard className="p-6 md:p-8 border-[#a78bfa]/15 bg-[#080810]/95 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
          
          {/* Subtle Ambient light behind top-left */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#14F195]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Heading block */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06] mb-6">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
                <span>📘 Navigation Companion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#f8fafc] flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Interactive Walkthrough & Video Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                New to the reputation engine? Follow our automated screen video simulator or standard checklist to quickly connect virtual credentials and tour premium features.
              </p>
            </div>

            {/* Selector tabs custom glass */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/[0.05] self-start md:self-center shrink-0">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer outline-none ${
                  activeTab === 'video' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Simulated Video Tour
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer outline-none ${
                  activeTab === 'checklist' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Start Quick Checklist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: Visual Media Player Screen */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              
              {/* Media Interface Container */}
              <div className="relative aspect-[16/10] w-full bg-slate-950 rounded-2xl border border-white/[0.08] shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-4 group">
                
                {/* Simulated Lens flare overlay */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none z-10 opacity-70" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 rounded px-2 py-0.5 z-20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[8px] font-mono uppercase font-bold text-rose-400 tracking-wider">Simulated Capture</span>
                </div>

                {/* Video Header Status bar */}
                <div className="relative z-20 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping inline-block shrink-0" />
                    SIM_VIDEO_PLAYBACK.MP4
                  </span>
                  <span className="bg-slate-900/80 border border-white/[0.04] px-2 py-0.5 rounded text-[8.5px] text-[#a78bfa]">
                    Frame {simStep + 1} of 5
                  </span>
                </div>

                {/* MAIN SCREEN RENDER AREA - RENDERING VIRTUAL DAPP WIREFRAMES */}
                <div className="relative z-20 flex-1 flex items-center justify-center py-4 px-2">
                  <AnimatePresence mode="wait">
                    
                    {/* Simulated Screen Stage 1 */}
                    {simStep === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[280px] p-4 rounded-xl bg-[#090912] border border-white/[0.05] text-left space-y-3 relative shadow-2xl"
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase border-b border-white/[0.03] pb-1.5 font-mono">
                          <span>Wallet Providers</span>
                          <span>X Close</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                          <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex flex-col gap-1 items-start">
                            <span>🦊</span>
                            <span className="text-white font-bold">MetaMask</span>
                          </div>
                          <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/30 flex flex-col gap-1 items-start relative overflow-hidden">
                            <span>🔮</span>
                            <span className="text-[#a78bfa] font-bold">App Wallet</span>
                            <div className="absolute top-0 right-0 w-6 h-6 bg-[#14F195]/20 rounded-full blur" />
                          </div>
                          <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex flex-col gap-1 items-start">
                            <span>🛡️</span>
                            <span className="text-slate-400">Ledger</span>
                          </div>
                          <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex flex-col gap-1 items-start">
                            <span>◈</span>
                            <span className="text-slate-400">WC Connect</span>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-amber-500/5 border border-amber-500/15 text-[8.5px] text-amber-300 font-sans leading-normal">
                          🛡️ Connecting is purely read-only signature checking. Custom addresses supported.
                        </div>
                      </motion.div>
                    )}

                    {/* Simulated Screen Stage 2 */}
                    {simStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[285px] p-4 rounded-xl bg-[#0a0a14] border border-[#a78bfa]/20 text-left space-y-3 relative shadow-2xl"
                      >
                        <div className="text-[10px] text-slate-200 font-bold border-b border-white/[0.03] pb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">🔮 COMPLETE PROFILE</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Step 2</span>
                        </div>

                        {/* Interactive Method Toggles representation */}
                        <div className="grid grid-cols-3 text-center text-[7.5px] font-bold bg-[#040408] rounded p-0.5 border border-white/[0.03] text-slate-500 font-mono">
                          <div className="py-0.5">Auto Web3</div>
                          <div className="py-0.5">Manual Paste</div>
                          <div className="py-0.5 bg-purple-500/10 text-[#a78bfa] border border-purple-500/20 rounded">Sandbox ID</div>
                        </div>

                        {/* Username simulated input */}
                        <div className="space-y-1">
                          <span className="text-[8.5px] text-slate-400 font-mono block">Assign Pseudonym</span>
                          <div className="bg-white/[0.02] border border-[#a78bfa]/20 rounded p-2 text-[10.5px] text-slate-100 font-mono flex items-center relative">
                            <span className="text-[#a78bfa] font-bold mr-0.5">@</span>
                            <span>{simUsername}</span>
                            <span className="w-1.5 h-3.5 bg-purple-400 inline-block animate-pulse ml-0.5" />
                          </div>
                        </div>

                        <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-[8.5px] text-emerald-400 leading-normal leading-relaxed">
                          🎲 <strong>Sandbox Mode:</strong> Generates instant, rich behavioral data tables to test the reputation client immediately.
                        </div>
                      </motion.div>
                    )}

                    {/* Simulated Screen Stage 3 */}
                    {simStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[280px] p-4 rounded-xl bg-[#06060c] border border-white/[0.05] text-center space-y-3 relative shadow-2xl"
                      >
                        <div className="flex flex-col items-center py-2 space-y-2">
                          <div className="w-8 h-8 rounded-full border-2 border-[#14F195] border-t-transparent animate-spin flex items-center justify-center">
                            <span className="text-[9px] text-[#14F195]">⚡</span>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-sans">
                              {scanState}
                            </h4>
                            <p className="text-[8px] text-slate-500 font-mono">
                              Scanning blockchain events starting at Epoch #4107
                            </p>
                          </div>

                          {/* Progress bar mock */}
                          <div className="w-full h-1 bg-slate-900 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-[#14F195] transition-all" 
                              style={{ width: `${scanProgress}%` }}
                            />
                          </div>

                          <span className="text-[8.5px] text-slate-400 font-mono font-bold">
                            Completed: {scanProgress}%
                          </span>

                          <div className="text-[7.5px] font-mono text-slate-500 space-y-0.5 w-full text-left bg-slate-950 p-2 rounded border border-white/[0.02]">
                            <p>• RPC handshakes completed</p>
                            <p>• Linked Simulated node address: <span className="text-white">{simAddress}</span></p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Simulated Screen Stage 4 */}
                    {simStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[290px] p-4.5 rounded-xl bg-[#08080f] border border-[#14F195]/20 text-left space-y-3.5 relative shadow-2xl"
                      >
                        {/* Mini Dashboard Frame */}
                        <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500 border-b border-light pb-2">
                          <span className="text-emerald-400 font-extrabold uppercase">📊 Dash System Core</span>
                          <span className="bg-[#14F195]/10 px-1.5 py-0.5 rounded text-[7.5px] text-[#14F195]">Rep: 779 Elite</span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Mini Ring Diagram */}
                          <div className="relative w-16 h-16 rounded-full border-4 border-slate-900 border-t-[#a78bfa] border-r-emerald-400 flex items-center justify-center font-bold text-slate-100 text-xs">
                            779
                          </div>
                          
                          <div className="flex-1 space-y-1.5">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-200 uppercase">Active Aura Standing</span>
                              <span className="text-[8px] text-slate-400 block font-sans">Aura: Silver Ascending (pre-qualified for standard stakes)</span>
                            </div>
                            <span className="text-[8.5px] text-emerald-400 font-mono font-bold block">✔ Streak Calendar: 12d continuous</span>
                          </div>
                        </div>

                        {/* Interactive pointers guide */}
                        <div className="text-[8px] text-slate-500 leading-normal leading-relaxed">
                          ⚡ Monitor dynamic charts showing credit variables, voting compliance indices, and automated trace timelines.
                        </div>
                      </motion.div>
                    )}

                    {/* Simulated Screen Stage 5 */}
                    {simStep === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[290px] p-4 rounded-xl bg-[#090912] border border-blue-500/20 text-left space-y-3 relative shadow-2xl"
                      >
                        <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 pb-1.5 border-b border-white/[0.04]">
                          <span>🛡️ AVAILABLE REWARDS & LOANS</span>
                          <span className="text-blue-400">Step 5</span>
                        </div>

                        <div className="space-y-2">
                          <div className="p-2 rounded bg-slate-950 border border-white/[0.04] space-y-0.5">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-white font-bold">KARMALend Limit</span>
                              <span className="text-[#14F195] font-bold font-mono">8.50% APR</span>
                            </div>
                            <span className="text-[7.5px] block text-slate-400">Unlock credit worth up to $15,000 USD</span>
                          </div>

                          <div className="p-2 rounded bg-slate-950 border border-white/[0.04] flex items-center justify-between text-[7.5px] font-mono text-slate-400">
                            <span>💳 KAST Debit Referral Card</span>
                            <span className="text-emerald-400 underline font-sans font-bold">Unlocks +80 rep</span>
                          </div>

                          <div className="p-2 rounded bg-purple-500/5 border border-purple-500/15 text-[8.5px] text-[#c084fc] font-sans">
                            🏆 Rewards, APR, and private access dynamically adapt. If your score falls, premium privileges adjust instantly.
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* VIRTUAL RE-ACTION ON-SCREEN POINTER CURSOR */}
                  <div 
                    className="absolute z-40 pointer-events-none transition-all duration-700 ease-in-out text-[#14F195] flex flex-col items-start gap-1"
                    style={{ 
                      top: `${cursorPos.y}px`, 
                      left: `calc(50% - 140px + ${cursorPos.x}px)` 
                    }}
                  >
                    <MousePointerClick className="w-5 h-5 drop-shadow-lg" />
                    <span className="text-[7.5px] font-mono uppercase bg-slate-950 px-1 py-0.5 rounded border border-[#14F195] block text-slate-200">
                      Cursor
                    </span>
                  </div>

                </div>

                {/* Subtitle description card on video */}
                <div className="relative z-20 w-full p-2.5 rounded-xl bg-slate-950/90 border border-white/[0.04] text-[10px] font-mono text-slate-300 text-left">
                  <span className="text-[#14F195] font-black mr-2">📌</span>
                  {TOUR_STEPS[simStep].mediaText}
                </div>

                {/* Video controls */}
                <div className="relative z-20 mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePausePlay}
                      className="p-1 px-2.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-slate-200 transition-colors border-none cursor-pointer text-[10px] flex items-center gap-1"
                      title={isPlaying ? "Pause Simulation" : "Play Simulation"}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#14F195]" />}
                      {isPlaying ? 'PAUSE' : 'PLAY'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-1 rounded bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 transition-colors border-none cursor-pointer"
                      title="Reset Playback"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Mock Seekbar progress tracking */}
                  <div className="flex-1 h-1.5 px-0.5 rounded-full bg-slate-900 relative border border-white/[0.02] overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 absolute left-0 top-0 transition-all rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <span className="text-slate-400 tabular-nums">
                    00:0{simStep} / 00:05
                  </span>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Guide Description Cards & Interactive Navigation Helper */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left">
              
              {activeTab === 'video' ? (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-[#a78bfa] block uppercase tracking-widest font-bold">Simulator Play-by-Play Guide</span>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {TOUR_STEPS.map((stepItem, idx) => {
                      const isActive = simStep === idx;
                      return (
                        <div
                          key={stepItem.id}
                          onClick={() => handleStepJump(idx)}
                          className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex gap-3 ${
                            isActive 
                              ? 'bg-purple-950/20 border-purple-500/45 shadow-md shadow-purple-500/5' 
                              : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                          }`}
                        >
                          <span className="text-lg shrink-0 select-none">{stepItem.icon}</span>
                          <div className="space-y-0.5 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-purple-300' : 'text-slate-300'}`}>
                                {stepItem.title}
                              </h4>
                              {isActive && (
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black uppercase">
                                  Live Match
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] leading-relaxed text-slate-400">
                              {stepItem.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-white/[0.05]">
                    <button
                      onClick={onShowConnect}
                      className="w-full py-3.5 rounded-xl border-none text-slate-950 font-black text-xs bg-[#14F195] hover:bg-[#14F195]/95 shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all cursor-pointer font-sans uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      🧪 Run It For Real & Connect Sandbox ID
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-[#a78bfa] block uppercase tracking-widest font-bold">Onboarding System Checklist</span>
                    
                    <p className="text-xs text-slate-400 leading-normal leading-relaxed">
                      Follow these precise action cues to fully authorize your sandbox node experience and navigate standard app structures:
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { step: '1', title: 'Open Wallet Panel', desc: 'Click the "Connect Wallet" button on the navigation bar on the top-right.' },
                        { step: '2', title: 'Pick Username', desc: 'Enter any pseudonym handle. This will uniquely label your local testing profile.' },
                        { step: '3', title: 'Select "🎲 Sandbox ID" credentials', desc: 'Choose the Sandbox tab, bypass MetaMask signatures, and authorize the mock indexer.' },
                        { step: '4', title: 'Explore Dashboard & Lenders', desc: 'Toggle tabs to inspect reputation points, stake KARMA, or review uncollateralized limits!' }
                      ].map(item => (
                        <div key={item.step} className="flex gap-3 text-left">
                          <span className="w-5 h-5 rounded-full bg-[#14F195]/10 border border-[#14F195]/20 text-[#14F195] flex items-center justify-center text-[10px] font-black shrink-0 font-mono">
                            {item.step}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.05]">
                    <button
                      onClick={onShowConnect}
                      className="w-full py-3.5 rounded-xl border-none text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-sans tracking-wide"
                      style={{
                        background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                        boxShadow: '0 4px 15px rgba(167, 139, 250, 0.3)'
                      }}
                    >
                      <Wallet className="w-3.5 h-3.5" /> Initialize Connection Panel Now
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </GlassCard>
      </div>
    </div>
  );
}
