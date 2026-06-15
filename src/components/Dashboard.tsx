import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import NavigationVideo from './NavigationVideo';
import { getAura, PERSONALITIES, truncateWallet } from '../constants';
import GlassCard from './GlassCard';
import KarmaRing from './KarmaRing';
import LiveAnalytics from './LiveAnalytics';
import Tag from './Tag';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ShareModal from './ShareModal';
import ReputationTimeline from './ReputationTimeline';
import WalletArena from './WalletArena';
import KastBooster from './KastBooster';
import AuraAirdropPortal from './AuraAirdropPortal';
import KarmaPulseWidget from './KarmaPulseWidget';

interface DashboardProps {
  user: User;
  onDisconnect?: () => void;
  onUpdateUser?: (updated: User) => void;
  onNavigatePage?: (page: string) => void;
}

interface Category {
  label: string;
  value: number;
  color: string;
  icon: string;
}

// Generates simulated historical progress leading up to user's actual current score
const generateTrendData = (currentScore: number, tf: '7D' | '30D' | '90D') => {
  const data = [];
  const now = new Date();
  const daysCount = tf === '7D' ? 7 : tf === '30D' ? 30 : 90;
  
  // Starting ratio of current score based on length (longer span has more growth)
  const startingPercent = tf === '7D' ? 0.98 : tf === '30D' ? 0.92 : 0.76;
  const growthSpan = 1 - startingPercent;
  
  for (let i = 0; i < daysCount; i++) {
    const fraction = i / (daysCount - 1 || 1); // 0 to 1
    const progress = Math.pow(fraction, 1.22); // exponential curve Look
    
    // Smooth sinusoidal wave pattern as the rating stabilizes over time
    const wiggle = Math.sin(fraction * Math.PI * 4) * 0.012 * (1 - fraction); 
    
    const computed = Math.round(currentScore * (startingPercent + progress * growthSpan + wiggle));
    const scoreVal = Math.max(0, Math.min(1000, computed));
    
    const d = new Date();
    d.setDate(now.getDate() - (daysCount - 1 - i));
    
    // Only display dates for selected reference items to preserve layout density
    let timeLabel = '';
    if (tf === '7D') {
      timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (tf === '30D') {
      if (i % 6 === 0 || i === daysCount - 1) {
        timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } else {
      if (i % 18 === 0 || i === daysCount - 1) {
        timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    
    data.push({
      time: timeLabel,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reputation: scoreVal,
    });
  }
  return data;
};

const HISTORICAL_POINTS = [
  { time: 'May 31', reputation: 762 },
  { time: 'Jun 1', reputation: 762 },
  { time: 'Jun 2', reputation: 768 },
  { time: 'Jun 3', reputation: 768 },
  { time: 'Jun 4', reputation: 773 },
  { time: 'Jun 5', reputation: 773 },
  { time: 'Today', reputation: 779 },
];

export default function Dashboard({ user, onDisconnect, onUpdateUser, onNavigatePage }: DashboardProps) {
  const [subTab, setSubTab] = useState<'Reputation' | 'Activity' | 'Arena' | 'Kast'>('Reputation');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [isKastBoosted, setIsKastBoosted] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState<'space-blue' | 'charcoal-black'>(() => {
    try {
      const saved = localStorage.getItem('karma_dashboard_theme');
      return (saved === 'charcoal-black' || saved === 'space-blue') ? saved : 'space-blue';
    } catch {
      return 'space-blue';
    }
  });

  // Dynamic interactive sequence tooltips for first-time users
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);

  useEffect(() => {
    try {
      const completed = localStorage.getItem('karma_dashboard_tour_completed');
      if (completed !== 'true') {
        // Automatically start tour for first-time dashboard visitors
        setTourActive(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    try {
      setIsKastBoosted(localStorage.getItem('kast_booster_active') === 'true');
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const [showShare, setShowShare] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [showTutorialVideo, setShowTutorialVideo] = useState<boolean>(false);
  const [cats, setCats] = useState<Category[]>(user.categories || [
    { label: 'Patience', value: 91, color: '#a78bfa', icon: '◈' },
    { label: 'Loyalty', value: 88, color: '#60a5fa', icon: '◆' },
    { label: 'Wisdom', value: 85, color: '#fbbf24', icon: '⊕' },
    { label: 'Generosity', value: 79, color: '#34d399', icon: '⬡' },
    { label: 'Energy', value: 72, color: '#f472b6', icon: '◉' },
  ]);
  const aura = getAura(user.karmaScore);
  const personality = PERSONALITIES[user.personality || 'Visionary'] || PERSONALITIES.Visionary;

  // Set up the static badges requirements map
  const BADGES = [
    {
      id: 'genesis',
      name: 'Genesis Citizen',
      icon: '🌐',
      desc: 'Bound a sovereign digital address and initialized reputation metrics.',
      requirement: 'Always unlocked for connected network members.',
      unlocked: true,
      color: '#38bdf8'
    },
    {
      id: 'loyalist',
      name: 'Diurnal Loyalist',
      icon: '🔥',
      desc: 'Maintained account balances without token exits for 7+ days.',
      requirement: `Requires a hold streak of at least 7 days (Currently: ${user.streak}/7).`,
      unlocked: user.streak >= 7,
      color: '#fbbf24'
    },
    {
      id: 'consolidator',
      name: 'Consolidator',
      icon: '💎',
      desc: 'Achieved robust credit scoring on sandbox ledger registers.',
      requirement: `Requires a Karma Score of 700+ (Currently: ${user.karmaScore}/700).`,
      unlocked: user.karmaScore >= 700,
      color: '#34d399'
    },
    {
      id: 'transcendent',
      name: 'Transcendent Halo',
      icon: '✨',
      desc: 'Reached the elite peak of cryptographic network stature.',
      requirement: `Requires an Elite Karma Score of 800+ (Currently: ${user.karmaScore}/800).`,
      unlocked: user.karmaScore >= 800,
      color: '#f8fafc'
    },
    {
      id: 'governance',
      name: 'Protocol Diplomat',
      icon: '🗳️',
      desc: 'Participated in DAO consensus by signing and auditing reputation reports.',
      requirement: 'Requires custom registered username profile.',
      unlocked: !!user.username && user.username !== 'anonymous',
      color: '#a78bfa'
    },
    {
      id: 'synergy',
      name: 'Lending Synergy',
      icon: '🤝',
      desc: 'Pre-qualified for third-party independent token credit options.',
      requirement: `Requires Karma score of 650+, and safe history logs.`,
      unlocked: user.karmaScore >= 650,
      color: '#f472b6'
    }
  ];

  const unlockedCount = BADGES.filter(b => b.unlocked).length;

  const dynTrendData = generateTrendData(user.karmaScore, timeframe);
  const startScore = dynTrendData[0].reputation;
  const endScore = dynTrendData[dynTrendData.length - 1].reputation;
  const growthPercent = (((endScore - startScore) / startScore) * 100).toFixed(1);

  // Let indicators animate slightly on mount
  useEffect(() => {
    if (user.categories) {
      setCats(user.categories);
    }
  }, [user]);

  return (
    <div className="max-w-[1080px] mx-auto pt-24 px-4 sm:px-6 pb-16 animate-fade-in text-slate-100 relative z-10" id="reputation-portal-container">
      
      {/* Dashboard Custom Theme Background Layer */}
      <div 
        className={`fixed inset-0 transition-all duration-500 pointer-events-none ${
          dashboardTheme === 'space-blue' 
            ? 'bg-gradient-to-b from-[#030614] via-[#05060e] to-[#04040a]' 
            : 'bg-[#09090c]'
        }`}
        style={{ zIndex: -1 }}
      >
        {/* Subtle dynamic grid pattern for high detail */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70" />
        {/* Soft cosmic glow when in space blue */}
        {dashboardTheme === 'space-blue' && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        )}
      </div>

      {/* Sub-navigation controls for the dashboard */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-1">
              Reputation Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Welcome Back, <span className="text-[#a78bfa]">@{user.username}</span>
            </h2>
            <div className="text-slate-400 text-xs font-mono mt-1 select-none flex items-center gap-1.5 flex-wrap">
              <span>{user.hideWallet ? `@${user.username}` : truncateWallet(user.address)}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px]">{user.wallet.icon}</span>
              <span>{user.wallet.name}</span>
            </div>
          </div>
          
          {/* Theme Selector Widget */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.02] p-1 rounded-xl border border-white/[0.05] h-fit md:ml-4">
            <button
              onClick={() => {
                setDashboardTheme('space-blue');
                try { localStorage.setItem('karma_dashboard_theme', 'space-blue'); } catch {}
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all border-none uppercase tracking-wider font-mono select-none"
              style={{
                background: dashboardTheme === 'space-blue' ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                color: dashboardTheme === 'space-blue' ? '#c084fc' : 'rgba(241, 245, 249, 0.4)',
                border: dashboardTheme === 'space-blue' ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid transparent',
                boxShadow: dashboardTheme === 'space-blue' ? '0 0 10px rgba(167, 139, 250, 0.1)' : 'none',
              }}
            >
              🪐 Space Blue
            </button>
            <button
              onClick={() => {
                setDashboardTheme('charcoal-black');
                try { localStorage.setItem('karma_dashboard_theme', 'charcoal-black'); } catch {}
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all border-none uppercase tracking-wider font-mono select-none"
              style={{
                background: dashboardTheme === 'charcoal-black' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: dashboardTheme === 'charcoal-black' ? '#ffffff' : 'rgba(241, 245, 249, 0.4)',
                border: dashboardTheme === 'charcoal-black' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
              }}
            >
              🌑 Charcoal
            </button>

            <span className="h-4 w-[1px] bg-white/[0.06] mx-1 md:inline hidden" />

            <button
              onClick={() => {
                setTourStep(1);
                setTourActive(true);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all uppercase tracking-wider font-mono select-none ${
                tourActive 
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-300 hover:text-white'
              }`}
            >
              🎓 Restart Tour
            </button>

            <span className="h-4 w-[1px] bg-white/[0.06] mx-1 md:inline hidden" />

            <button
              onClick={() => {
                setShowTutorialVideo(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all uppercase tracking-wider font-mono select-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
            >
              🎥 Watch Tutorial
            </button>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setSubTab('Reputation')}
            className="text-xs px-4 py-2.5 rounded-xl transition-all font-medium border cursor-pointer flex-1 sm:flex-initial text-center"
            style={{
              background: subTab === 'Reputation' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Reputation' ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Reputation' ? '#c084fc' : '#94a3b8',
            }}
          >
            📊 Reputation Metrics
          </button>
          <button
            onClick={() => setSubTab('Activity')}
            className="text-xs px-4 py-2.5 rounded-xl transition-all font-medium border cursor-pointer flex-1 sm:flex-initial text-center"
            style={{
              background: subTab === 'Activity' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Activity' ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Activity' ? '#c084fc' : '#94a3b8',
            }}
          >
            ⚡ Live Activity & Analytics
          </button>
          <button
            onClick={() => setSubTab('Arena')}
            className="text-xs px-4 py-2.5 rounded-xl transition-all font-medium border cursor-pointer flex-1 sm:flex-initial text-center"
            style={{
              background: subTab === 'Arena' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Arena' ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Arena' ? '#c084fc' : '#94a3b8',
            }}
          >
            ⚔️ Wallet Battle Arena
          </button>
          <button
            onClick={() => setSubTab('Kast')}
            className="text-xs px-4 py-2.5 rounded-xl transition-all font-semibold border cursor-pointer flex-1 sm:flex-initial text-center"
            style={{
              background: subTab === 'Kast' ? 'rgba(20,241,149,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Kast' ? 'rgba(20,241,149,0.4)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Kast' ? '#14F195' : '#94a3b8',
            }}
          >
            💳 KAST Debit Booster
          </button>
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="text-xs px-4 py-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-medium transition-all cursor-pointer flex-1 sm:flex-initial text-center"
            >
              ⏻ Disconnect
            </button>
          )}
        </div>
      </div>

      {subTab === 'Activity' ? (
        <LiveAnalytics user={user} />
      ) : subTab === 'Arena' ? (
        <WalletArena user={user} />
      ) : subTab === 'Kast' ? (
        <KastBooster 
          currentScore={user.karmaScore}
          isBoosted={isKastBoosted}
          onApplyBoost={(boostAmount) => {
            setIsKastBoosted(true);
            const updatedUser = {
              ...user,
              karmaScore: Math.min(1000, user.karmaScore + boostAmount),
            };
            if (onUpdateUser) {
              onUpdateUser(updatedUser);
            }
          }}
        />
      ) : (
        <>
          {/* Interactive Categories Chart and Live Changes Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Left Column: 5 Behavioral Pillars */}
            <div className={`lg:col-span-7 flex flex-col ${tourActive && tourStep === 1 ? 'relative z-50' : 'relative z-10'}`}>
              <GlassCard className="p-6 md:p-8 flex-1 !overflow-visible">
                {/* Reputation Quotient Section */}
                <div className="mb-6 pb-6 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4 relative">
                    {/* Animated Step 1 Tooltip */}
                    {tourActive && tourStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-3 z-50 w-72 xs:w-80 p-4 rounded-xl bg-[#0b0b18]/95 border border-purple-500/40 shadow-[0_10px_35px_rgba(167,139,250,0.35)] text-left backdrop-blur-md"
                      >
                        <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#0b0b18] border-t border-l border-purple-500/40 transform rotate-45" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono font-bold text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            STEP 1/3 · KARMA SCORE
                          </span>
                          <button 
                            onClick={() => setTourActive(false)}
                            className="text-slate-500 hover:text-slate-300 transition-colors border-none bg-transparent cursor-pointer text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">Sovereign Aggregate Reputation Score</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                          Your Web3 aggregate score ranges from 0 to 1000 PTS. Connect high-quality wallet signals to escalate your standing, test aura updates using the sandboxed emulator below, and pre-qualify for lenders!
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-white/[0.04]">
                          <button 
                            onClick={() => {
                              try { localStorage.setItem('karma_dashboard_tour_completed', 'true'); } catch {}
                              setTourActive(false);
                            }} 
                            className="text-[9.5px] font-mono bg-transparent border-none text-slate-500 hover:text-slate-400 cursor-pointer"
                          >
                            Skip Tour
                          </button>
                          <button 
                            onClick={() => setTourStep(2)} 
                            className="px-3 py-1 rounded-lg bg-[#a78bfa] hover:bg-[#818cf8] text-slate-950 text-[10px] font-black border-none cursor-pointer transition-all active:scale-95"
                          >
                            Next Step →
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Reputation Quotient</span>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2" style={{ fontFamily: '"Syne", sans-serif' }}>
                        {user.karmaScore}
                        <span className="text-xs font-mono font-normal text-slate-500">/ 1000 PTS</span>
                      </h2>
                    </div>
                    <div className="text-right min-h-[29px] flex items-center justify-end">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span 
                          key={aura.name}
                          initial={{ opacity: 0, scale: 0.85, y: -6, filter: 'blur(3px)' }}
                          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.85, y: 6, filter: 'blur(3px)' }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 400, 
                            damping: 24,
                            mass: 0.8
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border select-none h-[22px]"
                          style={{ 
                            backgroundColor: `${aura.color}15`, 
                            color: aura.color,
                            borderColor: `${aura.color}25`,
                          }}
                        >
                          <motion.span 
                            animate={{ 
                              scale: [1, 1.25, 1],
                              opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-1.5 h-1.5 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: aura.color }} 
                          />
                          {aura.name}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Real-time Aura Crossing Simulation Controller */}
                  <div className="bg-[#030308]/60 p-3 rounded-xl border border-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left select-none">
                    <div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black block tracking-wider">Aura Change Sandbox Simulator</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle ratings below to test the celebratory crossover alert:</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (onUpdateUser) {
                            onUpdateUser({
                              ...user,
                              karmaScore: Math.max(300, user.karmaScore - 50)
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                        title="Decrease rating by 50 to test descend bracket change"
                      >
                        ➖ 50 Pts
                      </button>
                      <button
                        onClick={() => {
                          if (onUpdateUser) {
                            onUpdateUser({
                              ...user,
                              karmaScore: Math.min(1000, user.karmaScore + 50)
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold bg-[#14F195]/5 hover:bg-[#14F195]/20 border border-[#14F195]/20 hover:border-[#14F195]/50 text-[#14F195] transition-all cursor-pointer"
                        title="Increase rating by 50 to test ascend level up"
                      >
                        ➕ 50 Pts
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-6">Behavioral Blueprint</div>
                
                <div className="space-y-5">
                  {cats.map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="flex items-center gap-2 text-slate-300 font-medium">
                          <span style={{ color: c.color }}>{c.icon}</span> {c.label}
                        </span>
                        <span className="font-mono font-bold" style={{ color: c.color }}>{c.value}/100</span>
                      </div>
                      
                      {/* Bar Track */}
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden relative border border-white/[0.01]">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ 
                            width: `${c.value}%`, 
                            background: `linear-gradient(90deg, ${c.color}20, ${c.color})`, 
                            boxShadow: `0 0 10px ${c.color}80` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Mini Trend Chart and Logs */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Daily Streak visual component */}
              <motion.div
                className={`flex flex-col ${tourActive && tourStep === 2 ? 'relative z-50' : 'relative z-10'}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className="p-5 md:p-6 !overflow-visible">
                  <div className="flex justify-between items-center mb-3 relative">
                    {/* Animated Step 2 Tooltip */}
                    {tourActive && tourStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 z-50 w-72 xs:w-80 p-4 rounded-xl bg-[#0b0b18]/95 border border-amber-500/45 shadow-[0_10px_35px_rgba(251,191,36,0.35)] text-left backdrop-blur-md"
                      >
                        <div className="absolute -top-1.5 right-8 w-3 h-3 bg-[#0b0b18] border-t border-l border-amber-500/40 transform rotate-45" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            STEP 2/3 · HOLDING STREAKS
                          </span>
                          <button 
                            onClick={() => setTourActive(false)}
                            className="text-slate-500 hover:text-slate-300 transition-colors border-none bg-transparent cursor-pointer text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">Consistency Over Token Friction</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                          Keep your connected funds consolidated in your wallet without arbitrary token exits to accumulate consecutive active diurnal streaks and gain reputation multipliers.
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-white/[0.04]">
                          <button 
                            onClick={() => setTourStep(1)} 
                            className="text-[9.5px] font-mono bg-transparent border-none text-slate-400 hover:text-slate-300 cursor-pointer"
                          >
                            ← Back
                          </button>
                          <button 
                            onClick={() => setTourStep(3)} 
                            className="px-3 py-1 rounded-lg bg-[#a78bfa] hover:bg-[#818cf8] text-slate-950 text-[10px] font-black border-none cursor-pointer transition-all active:scale-95"
                          >
                            Next Step →
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <span className="text-[9px] font-mono tracking-widest text-[#fbbf24] uppercase">Holding Streaks</span>
                    <span className="text-xs font-mono font-bold text-amber-500">{user.streak}-day streak 🔥</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Consolidated hold limits. Maintain balances without token exits to complete additional cycles.
                  </p>

                  {/* 7 holding days bars */}
                  <div className="flex gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 h-2 rounded-md transition-all duration-300"
                        style={{
                          background: i < (user.streak % 7 || 5) ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                          boxShadow: i < (user.streak % 7 || 5) ? '0 0 8px rgba(251, 191, 36, 0.45)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-mono uppercase">
                    <span>Day 1</span>
                    <span>{user.streak % 7 || 5}/7 completed to next score mult</span>
                    <span>Day 7</span>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Dynamic summary chart box */}
              <motion.div
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase mb-0.5">Reputation Chronology</div>
                        <h4 className="text-sm font-bold text-white font-mono uppercase tracking-tight select-none">Score Growth</h4>
                      </div>
                      
                      {/* Range Buttons */}
                      <div className="flex items-center gap-1 bg-white/[0.02] p-0.5 rounded-lg border border-white/[0.04]">
                        {(['7D', '30D', '90D'] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className="px-2 py-1 text-[8px] font-bold cursor-pointer rounded transition-all border-none font-mono uppercase select-none"
                            style={{
                              background: timeframe === tf ? 'rgba(167, 139, 250, 0.18)' : 'transparent',
                              color: timeframe === tf ? '#c084fc' : 'rgba(241, 245, 249, 0.35)',
                            }}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[150px] w-full mt-2 relative select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dynTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorReputation" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.24}/>
                              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.025)" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 8, fontFamily: 'monospace' }}
                            dy={5}
                          />
                          <YAxis 
                            domain={['dataMin - 12', 'dataMax + 8']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 8, fontFamily: 'monospace' }}
                            width={30}
                          />
                          <Tooltip
                            cursor={{ stroke: 'rgba(167, 139, 250, 0.15)', strokeWidth: 1 }}
                            contentStyle={{
                              background: '#04040a',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: 'monospace' }}
                            itemStyle={{ fontSize: 9, color: '#c084fc', fontFamily: 'monospace' }}
                            formatter={(value: any) => [`${value} Points`, 'Reputation']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="reputation" 
                            stroke="#a78bfa" 
                            strokeWidth={1.5} 
                            fillOpacity={1}
                            fill="url(#colorReputation)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] text-slate-400 leading-normal flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">↑ +{growthPercent}%</span> 
                    <span>
                      Reputation grew from <strong className="text-slate-200">{startScore}</strong> to <strong className="text-slate-200">{endScore}</strong> over {timeframe === '7D' ? 'the past 7 days' : timeframe === '30D' ? 'the past month' : 'the past 3 months'}.
                    </span>
                  </div>
                </GlassCard>
              </motion.div>

            </div>

          </div>

          {/* Real-time D3 Reputation Karma Pulse Widget */}
          <div className="mb-8">
            <KarmaPulseWidget />
          </div>

          {/* 30-Day Historical Karma Score Growth Line Chart */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard className="p-6 md:p-8" id="historical-30d-line-chart">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
                    <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase font-bold">Comprehensive historical ledger</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#f1f5f9] select-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                    30-Day Historical Reputation Trace
                  </h3>
                  <p className="text-slate-400 text-xs max-w-xl">
                    Dynamic linear validation tracking sovereign trust telemetry, diurnal holds, and compliance consistency over the past 30 days.
                  </p>
                </div>

                {/* Micro indicators */}
                <div className="flex items-center gap-4 bg-[#030308]/60 p-3 rounded-2xl border border-white/[0.03] self-stretch sm:self-auto font-mono text-[10px]">
                  <div className="text-left">
                    <span className="text-slate-500 block text-[8px] uppercase font-bold">Initial Trace</span>
                    <span className="text-slate-300 font-extrabold">
                      {generateTrendData(user.karmaScore, '30D')[0].reputation} PTS
                    </span>
                  </div>
                  <div className="h-6 w-[1px] bg-white/[0.06]" />
                  <div className="text-left">
                    <span className="text-slate-500 block text-[8px] uppercase font-bold">Peak Valuation</span>
                    <span className="text-emerald-400 font-extrabold">
                      {user.karmaScore} PTS
                    </span>
                  </div>
                  <div className="h-6 w-[1px] bg-white/[0.06]" />
                  <div className="text-left">
                    <span className="text-slate-500 block text-[8px] uppercase font-bold">Trend Status</span>
                    <span className="text-[#14F195] font-extrabold flex items-center gap-0.5 animate-pulse">
                      ▲ EXPONENTIAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsive Line Chart */}
              <div className="h-[210px] w-full relative bg-[#020206]/85 rounded-2xl p-4 border border-white/[0.05] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={generateTrendData(user.karmaScore, '30D')} 
                    margin={{ top: 10, right: 15, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 8, fontFamily: 'monospace' }}
                      dy={5}
                    />
                    <YAxis 
                      domain={['dataMin - 15', 'dataMax + 10']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 8, fontFamily: 'monospace' }}
                      width={30}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255, 255, 255, 0.08)', strokeWidth: 1 }}
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const pointAura = getAura(data.reputation);
                          return (
                            <div className="bg-[#04040a]/95 border border-white/[0.08] p-3 rounded-xl shadow-2xl backdrop-blur-md select-none text-left">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase font-black mb-1">
                                {data.fullDate}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-mono font-black text-white">{data.reputation}</span>
                                <span className="text-[8px] font-mono text-slate-400">PTS</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-white/[0.04]">
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: pointAura.color }} />
                                <span className="text-[9px] font-mono font-bold uppercase" style={{ color: pointAura.color }}>
                                  {pointAura.name} Bracket
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reputation" 
                      stroke={aura.color} 
                      strokeWidth={2}
                      activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5, fill: aura.color }} 
                      dot={{ r: 2, fill: 'rgba(255, 255, 255, 0.15)', stroke: 'transparent' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-300/40 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>RECHARTS CORE ENGINE v2.10</span>
                <span>DATA SYNCHRONIZED DIRECTLY FROM SOVEREIGN IDENTITY WORKSPACE</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Main Reputation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            
            {/* Karma Ring Metric card */}
            <motion.div 
              className="md:col-span-12 lg:col-span-4 flex flex-col"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6 md:p-8 text-center flex flex-col items-center justify-center flex-1">
                <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-4">Reputation Quotient</div>
                <KarmaRing score={user.karmaScore} aura={aura} size={170} />
                <div className="mt-6 flex flex-col items-center w-full">
                  <div className="min-h-[24px] flex items-center justify-center mb-2">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div 
                        key={aura.name}
                        initial={{ opacity: 0, scale: 0.85, y: -4, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.85, y: 4, filter: 'blur(3px)' }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 400, 
                          damping: 24,
                          mass: 0.8
                        }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.span 
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-2 h-2 rounded-full inline-block shrink-0" 
                          style={{ backgroundColor: aura.color, boxShadow: `0 0 8px ${aura.color}` }} 
                        />
                        <span className="text-xs uppercase font-mono tracking-widest select-none" style={{ color: aura.color }}>{aura.name}</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <Tag color={aura.color}>Badge: {aura.badge}</Tag>

                  <button
                    onClick={() => setShowShare(true)}
                    className="mt-5 w-full max-w-[220px] py-2.5 px-3 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-[#a78bfa] border border-purple-500/25 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 outline-none"
                    title="Generate cryptographic Reputation Passport to share"
                  >
                    <span>✧</span> Share My Karma
                  </button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Wallet Archetype Personality details */}
            <motion.div 
              className="md:col-span-12 lg:col-span-4 flex flex-col"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-4">Archetype Profile</div>
                  <div className="flex flex-col items-start gap-3">
                    <span 
                      className="text-5xl font-mono leading-none select-none" 
                      style={{ color: personality.color, textShadow: `0 0 20px ${personality.color}60` }}
                    >
                      {personality.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: '"Syne", sans-serif' }}>{personality.name} Archetype</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Based on deep balance holding conviction and safety parameters.</p>
                      <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                        {personality.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score tags and performance indications */}
                <div className="mt-6 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    <Tag color={personality.color}>Top 8%</Tag>
                    <Tag color="#34d399">Consolidator</Tag>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Via {user.wallet.name}</span>
                </div>
              </GlassCard>
            </motion.div>

            {/* Interactive Reputation Badges Gallery */}
            <motion.div 
              className="md:col-span-12 lg:col-span-4 flex flex-col" 
              id="badges-gallery-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6 md:p-8 flex flex-col justify-between flex-1 relative overflow-visible">
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase mb-4 flex justify-between items-center select-none">
                    <span>REPUTATION INSIGNIA</span>
                    <span className="text-emerald-400 font-bold">{unlockedCount} / {BADGES.length} Unlocked</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Badges & Perks
                  </h3>
                  <p className="text-slate-400 text-[11px] mb-4 leading-normal">
                    Provable milestones on the sandbox network ledger. Tap to inspect or hover on desktop.
                  </p>

                  {/* Badges Grid with tooltips */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {BADGES.map((badge) => (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
                        className={`relative group flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          badge.unlocked 
                            ? 'bg-slate-900/30 border-white/[0.05] hover:border-purple-500/20 hover:bg-[#a78bfa]/5' 
                            : 'bg-black/40 border-white/[0.02] filter grayscale opacity-45 hover:opacity-70'
                        }`}
                        title={badge.unlocked ? `${badge.name}: Unlocked` : `${badge.name}: Locked`}
                      >
                        <span 
                          className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-110 select-none block"
                          style={{
                            textShadow: badge.unlocked ? `0 0 10px ${badge.color}50` : 'none',
                          }}
                        >
                          {badge.icon}
                        </span>
                        
                        <span className="text-[9px] font-mono text-center text-slate-300 truncate max-w-full font-semibold">
                          {badge.name.split(' ')[0]}
                        </span>

                        {/* Status small anchor dot */}
                        <div 
                          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: badge.unlocked ? badge.color : '#475569',
                            boxShadow: badge.unlocked ? `0 0 4px ${badge.color}` : 'none'
                          }}
                        />

                        {/* Beautiful responsive CSS Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-slate-950/95 border border-white/[0.08] backdrop-blur-md opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] text-center shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
                          <span className="block text-[11px] font-extrabold text-white mb-0.5">{badge.name}</span>
                          <span className={`block text-[9px] font-mono uppercase mb-1.5 ${badge.unlocked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}`}>
                            {badge.unlocked ? '✦ Unlocked' : '🔒 Locked'}
                          </span>
                          <p className="text-[10px] text-slate-300 leading-normal mb-1">{badge.desc}</p>
                          <p className="text-[9px] font-mono text-[#a78bfa] border-t border-white/[0.04] pt-1.5 mt-1.5 font-bold">
                            {badge.unlocked ? '✔ Threshold Met' : badge.requirement}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected badge details row for clickable and mobile fallback support */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-400 font-mono text-center min-h-[22px] flex items-center justify-center">
                  {selectedBadge ? (
                    <div className="animate-fade-in text-slate-200">
                      🎯 <strong style={{ color: BADGES.find(b => b.id === selectedBadge)?.color }}>
                        {BADGES.find(b => b.id === selectedBadge)?.name}
                      </strong>: {
                        BADGES.find(b => b.id === selectedBadge)?.unlocked 
                          ? 'Perk active — qualifies for premium scoring tiers!' 
                          : BADGES.find(b => b.id === selectedBadge)?.requirement
                      }
                    </div>
                  ) : (
                    <span className="text-slate-500">Tap insignia elements for interactive perk reviews</span>
                  )}
                </div>
              </GlassCard>
            </motion.div>

          </div>

          {/* Aura Token Airdrop Portal (Claiming + TikTok integration) */}
          <div className="mb-8">
            <AuraAirdropPortal 
              user={user} 
              onUpdateUser={(updated) => {
                if (onUpdateUser) {
                  onUpdateUser(updated);
                }
              }} 
            />
          </div>

          {/* Why Is My Score This & AI Recommendation Coach block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Why Is My Score This Points Breakdown */}
            <GlassCard className="p-6 md:p-8 flex flex-col justify-between" id="score-breakdown-details">
              <div>
                <div className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase mb-4 flex justify-between items-center select-none">
                  <span>SCORE DECONSTRUCTION</span>
                  <span className="text-emerald-400 font-bold">Summatic Base</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Why Is My Score {user.karmaScore}?
                </h3>
                <p className="text-slate-400 text-[11px] mb-5 leading-normal">
                  An objective, non-custodial breakdown of point accomplishments and penalties on your sandbox credentials.
                </p>

                {/* Point List */}
                <div className="space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-[#c084fc]/5 border border-[#c084fc]/10">
                    <span className="text-slate-300">⏳ Wallet hold maturity age</span>
                    <span className="text-emerald-400 font-extrabold">+120</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-slate-300">🗳️ Governance signature logs</span>
                    <span className="text-emerald-400 font-extrabold">+90</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-[#38bdf8]/5 border border-[#38bdf8]/10">
                    <span className="text-slate-300">🤝 Active collateral conviction</span>
                    <span className="text-emerald-400 font-extrabold">+75</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/10">
                    <span className="text-slate-300">🔥 Daily holding streaks multiplier</span>
                    <span className="text-emerald-400 font-extrabold">+{Math.min(user.streak * 5, 150)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <span className="text-slate-400">⚔️ Account age setup parameters</span>
                    <span className="text-rose-400 font-extrabold">-40</span>
                  </div>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-500 font-mono mt-4 text-center">
                Evaluated under the algorithmic FICO-equivalent sandbox scoring rule.
              </p>
            </GlassCard>

            {/* AI Recommendation Coach */}
            <GlassCard className="p-6 md:p-8 flex flex-col justify-between border border-emerald-500/10" id="ai-coach-card">
              <div>
                <div className="text-[9px] font-mono tracking-widest text-[#10b981] uppercase mb-4 flex justify-between items-center select-none">
                  <span>AI COACH MECHANICS</span>
                  <span className="text-amber-500 font-bold">Estimated Next: {user.karmaScore + 65} Score</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                  AI Karma Coach recommendations
                </h3>
                <p className="text-slate-400 text-[11px] mb-5 leading-normal">
                  Actionable guidelines tailored to mock address activities to optimize your credit standing.
                </p>

                {/* Recommendations checklist */}
                <div className="space-y-3 font-sans text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/30 border border-white/[0.02]">
                    <span className="text-amber-500 text-sm">💎</span>
                    <div>
                      <p className="font-bold text-slate-200">Hold assets past day 7</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal font-sans">Extending holding streaks completed triggers a massive +120 holding points multiplier.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/30 border border-white/[0.02]">
                    <span className="text-amber-500 text-sm">🗳️</span>
                    <div>
                      <p className="font-bold text-slate-200">Claim your custom username handle</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal font-sans">Sovereign identity profile structures qualify for the Diplomat badge (+90 points).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/30 border border-white/[0.02]">
                    <span className="text-amber-500 text-sm">🤝</span>
                    <div>
                      <p className="font-bold text-slate-200">Avoid rapid exit turnovers</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal font-sans">Frequent rapid transfers degrade overall score longevity weight indexes by -40 points.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9.5px] text-slate-500 font-mono text-center">
                AI Agent evaluates transaction ratios periodically to update predictions.
              </div>
            </GlassCard>
          </div>

          {/* Flexible Credit Lending Synergy Banner */}
          <GlassCard className="p-6 md:p-8 mb-8" id="sandbox-lending-model-card">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded font-black">Sandbox Utility</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] font-bold">Reputation Equity Credit Pool</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Sovereign Lending Synergy & Eligibility
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Just regularly checking your rating, tracking your progress, and securing your custom username establishes <strong className="text-[#a78bfa]">good credit karma</strong> for the future. 
                  Under our upcoming integration protocol, sovereign crypto holders with high karma rating badges will be eligible to pre-qualify for optimized, custom loans offered by independent digital lenders who query and grant terms based on Karma AI reputation indices.
                </p>
                
                {/* Visual points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✔</span>
                    <span><strong>Claim Username</strong> to lock in permanent credit weight.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✔</span>
                    <span><strong>P2P Lending Orbs</strong> evaluate raw address conviction profiles.</span>
                  </div>
                </div>
              </div>
              
              {/* Target score weight visual badge */}
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/[0.04] text-center w-full lg:w-56 shrink-0 flex flex-col justify-center items-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-1">P2P REPUTATION RATING</span>
                <span className="text-2xl font-black text-[#10b981] font-mono tracking-tight select-none">
                  {user.karmaScore >= 740 ? 'Tier A (Elite)' : 'Tier B (Standard)'}
                </span>
                <span className="text-[9px] text-slate-500 mt-1 uppercase font-mono block">Profile pre-qualification active</span>
              </div>
            </div>
            
            {/* Disclaimer Clause as required */}
            <div className="mt-6 pt-4 border-t border-white/[0.04] text-[10.5px] text-slate-400 leading-relaxed font-sans">
              ⚠️ <strong className="text-slate-300 font-semibold select-all">Karma AI Credit Disclaimer:</strong> Karma AI operates exclusively as an algorithmic scoring model, reputation interface, and analytical indexing terminal. Karma AI does not directly issue debt, extend custody, broker loans, or guarantee uncollateralized or collateralized loan offers from any participating third-party smart contract lender or lenders. All lending arrangements and terms remain governed under the sovereign discretion of participating capital providers.
            </div>
          </GlassCard>

          {/* Educational 'Good Karma' Card */}
          <GlassCard className="p-6 md:p-8 mb-8 border border-purple-500/10 bg-purple-950/10 relative overflow-hidden" id="educational-karma-lending-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="text-4xl text-purple-400 select-none shrink-0 bg-purple-950/30 p-3 rounded-2xl border border-purple-500/20">
                🌱
              </div>
              <div className="flex-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#a78bfa] block mb-1">Educational Guide</span>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Understanding Good Karma & Future Eligibility
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  By connecting your wallet, actively monitoring your on-chain behavior, and securing a personalized username, you establish your <strong>Reputation Passport (Good Karma)</strong>. But what does this mean in practice?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-[#c084fc] flex items-center gap-1.5 mb-1.5 font-mono">
                      <span>👤</span> Claiming a Username
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Locking in your custom handle binds historical wallet activity to a distinct human identity footprint. This pseudonymized anchor protects raw wallet data while proving long-term, sybil-resistant alignment.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-[#34d399] flex items-center gap-1.5 mb-1.5 font-mono">
                      <span>📈</span> Advancing Your Aura & Rating
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Maintaining long-term hold conviction and minimizing rapid transfers raises your Karma Quotient. Scoring top tiers proves you are a reliable stakeholder, reducing perceived structural risks.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/[0.04] md:col-span-2">
                    <h4 className="text-xs font-bold text-[#fbbf24] flex items-center gap-1.5 mb-1.5 font-mono">
                      <span>🤝</span> Third-Party Lending Integrations
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Participating decentralized web3 lenders can use the Karma AI public API to evaluate loan criteria. A strong reputation passport may allow lenders to offer better eligibility rates and non-collateralized options. 
                      <em className="block mt-1 text-[11px] text-slate-500 font-normal">
                        Note: Karma AI solely provides analytical scoring; final loan offers and approvals are made entirely at the discretion of the lending partners.
                      </em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <ReputationTimeline user={user} />
        </>
      )}

      {showShare && (
        <ShareModal user={user} onClose={() => setShowShare(false)} />
      )}

      {/* Dynamic Floating Global Walkthrough Companion */}
      {tourActive && tourStep === 3 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="p-5 rounded-2xl bg-[#060611]/95 border-2 border-[#14F195]/45 shadow-[0_20px_50px_rgba(20,241,149,0.25)] text-left backdrop-blur-xl relative"
          >
            {/* Interactive spark particles */}
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#14F195]/10 flex items-center justify-center border border-[#14F195]/30 text-xs animate-bounce">
              ✨
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-[#14F195] uppercase bg-[#14F195]/15 px-2.5 py-0.5 rounded-lg border border-[#14F195]/30">
                STEP 3/3 · NEURAL FORECAST
              </span>
              <button 
                onClick={() => setTourActive(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors border-none bg-transparent cursor-pointer text-xs p-1"
              >
                ✕
              </button>
            </div>
            
            <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center gap-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
              🧠 Calibrate AI Reading Module
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Authorize our deep neural consensus engine to analyze your combined active behavioral aura. Click below to experience your customized wallet psychological profile report.
            </p>
            
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/[0.05]">
              <button 
                onClick={() => setTourStep(2)} 
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                ← Back
              </button>
              
              <div className="flex gap-2">
                {onNavigatePage ? (
                  <button 
                    onClick={() => {
                      try { localStorage.setItem('karma_dashboard_tour_completed', 'true'); } catch {}
                      setTourActive(false);
                      onNavigatePage('AI Reading');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#14F195] to-emerald-400 hover:scale-[1.04] transition-all text-slate-950 text-xs font-black border-none cursor-pointer shadow-[0_0_15px_rgba(20,241,149,0.3)]"
                  >
                    🚀 Enter AI Reading
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      try { localStorage.setItem('karma_dashboard_tour_completed', 'true'); } catch {}
                      setTourActive(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#14F195] hover:bg-[#14F195]/95 text-slate-950 text-xs font-black border-none cursor-pointer transition-all"
                  >
                    Complete Tour! 🎉
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showTutorialVideo && (
        <NavigationVideo 
          isOpen={showTutorialVideo} 
          onClose={() => setShowTutorialVideo(false)} 
        />
      )}
    </div>
  );
}
