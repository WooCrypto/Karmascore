import { useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard';
import KarmaLogo from './KarmaLogo';
import { useLanguage } from '../context/LanguageContext';
import ScoreChecker from './ScoreChecker';
import SovereignGuideSimulator from './SovereignGuideSimulator';
import NavigationVideo from './NavigationVideo';
import AuraSupplyTracker from './AuraSupplyTracker';

interface LandingProps {
  onShowConnect: () => void;
  onShowManifesto: () => void;
  user?: any;
}

// Custom 2D Canvas ambient networking visualizer
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialise 45 floating coordinates
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.5 + 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Edge bouncing
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.fill();
      });

      // Draw connection vectors
      particles.forEach((a, idx) => {
        particles.slice(idx + 1).forEach(b => {
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}

export default function Landing({ onShowConnect, onShowManifesto, user }: LandingProps) {
  const [sliderScore, setSliderScore] = useState<number>(780);
  const [showFirstTimeHelp, setShowFirstTimeHelp] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showTutorialVideo, setShowTutorialVideo] = useState<boolean>(false);
  const { t } = useLanguage();

  const getTierFromScore = (score: number) => {
    if (score >= 950) return { name: 'Legendary', color: '#f8fafc', shadow: 'rgba(248,250,252,0.4)', badges: '🌐 💎 ✨ 👑 🗳️' };
    if (score >= 800) return { name: 'Trusted', color: '#a78bfa', shadow: 'rgba(167,139,250,0.5)', badges: '🌐 💎 🔥 🤝' };
    if (score >= 700) return { name: 'Strong', color: '#38bdf8', shadow: 'rgba(56,189,248,0.5)', badges: '🌐 💎' };
    if (score >= 600) return { name: 'Building', color: '#10b981', shadow: 'rgba(16,185,129,0.4)', badges: '🌐' };
    if (score >= 500) return { name: 'New', color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)', badges: '🌐' };
    return { name: 'Risky', color: '#ef4444', shadow: 'rgba(239,68,68,0.3)', badges: '⚠️' };
  };

  const activeTier = getTierFromScore(sliderScore);

  const features = [
    { icon: '◆', title: t('landing.reputationIndex'), desc: t('landing.featuresDesc') },
    { icon: '◉', title: t('landing.activeAura'), desc: t('hero.subtitle') },
    { icon: '💳', title: t('lenders.title'), desc: t('lenders.desc') },
    { icon: '⬡', title: t('landing.unlockedBadges'), desc: t('landing.sliderDesc') },
    { icon: '🎙️', title: t('ai.title'), desc: t('ai.desc') },
    { icon: '🗳️', title: t('leaderboard.title'), desc: t('leaderboard.desc') },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden">
      
      {/* Hero Visual Space Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
        
        {/* Dynamic network vector background canvas */}
        <ParticleField />

        {/* Ambient neon orbs floating */}
        <div className="absolute top-[20%] left-[25%] w-[450px] h-[450px] rounded-full pointer-events-none opacity-40 blur-[130px] animate-orb-float" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full pointer-events-none opacity-40 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />

        {/* Inner layout bounds - Redesigned into responsive split grid */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-2 py-8">
          
          {/* LEFT COLUMN: Premium Copy & FICO Positioning Header */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top release tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/15 mb-6 max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] inline-block animate-pulse" />
              <span 
                className="text-[9.5px] uppercase font-mono tracking-widest text-[#a78bfa] font-black leading-none"
                style={{ letterSpacing: '0.12em' }}
              >
                {t('hero.badge')}
              </span>
            </div>

            {/* Heading with Syne Display font */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#f8fafc] leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
            >
              {t('hero.titleLine1')} <br />
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#38bdf8] to-[#10b981] bg-clip-text text-transparent">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="text-xl font-bold text-slate-200 mb-2 font-sans tracking-tight">
              {t('hero.subtitle')}
            </p>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
              {t('hero.desc')}
            </p>

            {/* COLLABORATIVE WEB3 UTILITY PANELS */}
            <div className="w-full max-w-xl space-y-4 mb-8 text-left">
              
              {/* KAST Stablecoin Debit Card Partnership Card */}
              <a
                href="https://app.kast.xyz/referral/O7A99Y65"
                target="_blank"
                referrerPolicy="no-referrer"
                className="block p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/20 border border-emerald-500/10 relative overflow-hidden group hover:border-[#14F195]/40 hover:shadow-[0_0_25px_rgba(20,241,149,0.06)] transition-all cursor-pointer"
              >
                {/* Glowing Emerald Card Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#14F195]/10 to-teal-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:scale-110" />
                
                <div className="flex items-start gap-4">
                  {/* Holographic KAST Card Icon Representative */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="absolute inset-0 bg-emerald-500/25 rounded-xl blur-md animate-pulse" />
                    <div className="w-12 h-12 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-center relative z-10 shadow-lg text-lg">
                      💳
                    </div>
                    {/* Tiny Visa/Card badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 px-1 py-0.5 rounded bg-black border border-emerald-400/30 flex items-center gap-0.5 text-[7px] font-black text-emerald-400 z-20 shadow-md">
                      <span>VISA</span>
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        🚀 ACTIVE COLLABORATING PROVIDER
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-emerald-400/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        +80 POINT BOOST
                      </span>
                    </div>
                    
                    <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-sm sm:text-base font-extrabold text-white leading-tight flex items-center gap-1.5 group-hover:text-[#14F195] transition-colors">
                      KAST Stablecoin Debit Card
                      <span className="text-xs text-slate-500 font-mono font-normal group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </h3>
                    
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                      Link your KAST username to track stablecoin card transactions. Let your everyday coffee, travel, and cloud expenditures double as a high-velocity boost to your Web3 reputation score.
                    </p>
                    
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400">
                      <span>Get Card & Link Account</span>
                      <span>•</span>
                      <span className="underline group-hover:text-white transition-colors">app.kast.xyz/referral/O7A99Y65</span>
                    </div>
                  </div>
                </div>
              </a>

              {/* Solana Token Coming Soon Space */}
              <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-emerald-950/10 border border-white/[0.04] relative overflow-hidden group hover:border-[#14F195]/20 hover:shadow-[0_0_20px_rgba(20,241,149,0.04)] transition-all">
                {/* Solana Network Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#9945FF]/10 to-[#14F195]/15 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100" />
                
                <div className="flex items-start gap-4">
                  {/* Glowing Endless Knot Logo centered in a high-fidelity token representation */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="absolute inset-0 bg-[#D4AF37]/25 rounded-xl blur-md animate-pulse" />
                    <div className="w-12 h-12 rounded-xl bg-slate-950/90 border border-[#D4AF37]/30 flex items-center justify-center relative z-10 shadow-lg">
                      <KarmaLogo size={40} className="text-[#D4AF37]" />
                    </div>
                    {/* Small Solana bottom right badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 px-1 py-0.5 rounded bg-black border border-[#14F195]/35 flex items-center gap-0.5 text-[7px] font-black text-[#14F195] z-20 shadow-md" title="Solana Network">
                      <span>SOL</span>
                      <span className="w-1 h-1 rounded-full bg-[#14F195] animate-ping" />
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-[10px] font-black uppercase tracking-wider text-[#ecc452]">
                        {t('solana.utility')}
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] text-slate-950 px-2 py-0.5 rounded-full">
                        {t('solana.launch')}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-sm sm:text-base font-extrabold text-white leading-tight">
                      {t('solana.comingSoon')}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                      {t('solana.powering')}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-8 w-full sm:w-auto">
              <button
                onClick={onShowConnect}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border-none text-white font-extrabold text-sm transition-all shadow-[0_0_30px_rgba(167,139,250,0.3)] hover:shadow-[0_0_40px_rgba(167,139,250,0.5)] transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-tight whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  fontFamily: "'Syne', sans-serif"
                }}
              >
                {t('nav.connect')} →
              </button>
              <button
                onClick={() => setShowTutorialVideo(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 outline-none shadow-[0_4px_15px_rgba(20,241,149,0.1)] active:scale-95"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                🎥 Watch Tutorial
              </button>
              <button
                onClick={onShowManifesto}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-[#c084fc] font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 outline-none shadow-[0_4px_15px_rgba(167,139,250,0.15)] active:scale-95"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                🔮 Karma Creed (Manifesto)
              </button>
              <button
                onClick={() => {
                  setShowFirstTimeHelp(!showFirstTimeHelp);
                  if (!showFirstTimeHelp) {
                    setTimeout(() => {
                      document.getElementById('first-time-accordion')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/5 hover:bg-[#fbbf24]/10 text-amber-300 font-extrabold text-sm transition-all cursor-pointer"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {showFirstTimeHelp ? 'Hide Starter Guide ✖' : '🎯 New to Crypto? Start Here'}
              </button>
            </div>

            {/* Quick trust items block */}
            <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">🛡️ No Keys Required</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">⚡ Simulated Sandbox Flows</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">🌌 Verified on Public Testbeds</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Reputation Score Meter & Demo Slider */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <GlassCard className="p-6 md:p-8 w-full max-w-[400px] flex flex-col items-center text-center relative overflow-visible border-purple-500/10">
              <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase mb-4 block">Interactive Dial Preview</span>
              
              {/* Giant circular score dial */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                
                {/* SVG circular track with glow */}
                <svg viewBox="0 0 176 176" className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="74"
                    className="stroke-slate-900"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="74"
                    stroke={activeTier.color}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 74}
                    strokeDashoffset={2 * Math.PI * 74 * (1 - (sliderScore - 300) / 700)}
                    className="transition-all duration-300 ease-out"
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${activeTier.color}45)`
                    }}
                  />
                </svg>

                {/* Score centered details */}
                <div className="z-10 flex flex-col items-center">
                  <span className="text-5xl font-extrabold tracking-tighter text-white font-mono">{sliderScore}</span>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-2 font-mono"
                    style={{
                      backgroundColor: `${activeTier.color}15`,
                      color: activeTier.color,
                      border: `1.5px solid ${activeTier.color}25`
                    }}
                  >
                    {activeTier.name}
                  </span>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="w-full mb-5">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
                  <span>{t('landing.reputationIndex')} (300)</span>
                  <span className="text-[#a78bfa] font-bold">{t('landing.unlockedBadges')}</span>
                  <span>Legendary (1000)</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1000"
                  value={sliderScore}
                  onChange={(e) => setSliderScore(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-950/80 accent-[#a78bfa] border border-white/[0.05]"
                />
              </div>

              {/* Perks / Badges responsive row */}
              <div className="w-full pt-4 border-t border-white/[0.05] text-left">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-400 font-medium font-sans">{t('landing.activeAura')}:</span>
                  <span className="text-[11px] font-semibold text-slate-300">{activeTier.badges}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  {sliderScore >= 800 && '🥇 Elite Credit rating! Qualifies you for uncollateralized loan offers and priority developer status queues.'}
                  {(sliderScore >= 700 && sliderScore < 800) && '🥈 Strong standing. Pre-qualifies for standard Sandbox developer tier perks and active timelines.'}
                  {(sliderScore >= 600 && sliderScore < 700) && '🥉 Steady builder. Complete active transaction cycles to raise your parameters to the strong pool.'}
                  {(sliderScore >= 500 && sliderScore < 600) && '🌱 Fresh wallet state. Hold tokens past 7 days to trigger streak boosts of +120 points.'}
                  {sliderScore < 500 && '⚠️ High risk tier. Quick turnovers and low token lifetimes penalty overall score multipliers.'}
                </p>
              </div>
            </GlassCard>
          </div>

        </div>

        {/* Dynamic First-time User Start Point Guide Accordion */}
        {showFirstTimeHelp && (
          <div className="relative z-10 w-full max-w-2xl mx-auto mt-6 px-4 animate-scale-up" id="first-time-accordion">
            <GlassCard className="p-6 md:p-8 border border-amber-500/15 bg-amber-950/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span>🎯</span> New to Cryptocurrency?
                </h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-bold">First-Time Mode Enabled</span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                You do not need to be an expert, deposit funds, or configure technical gas limits. We have built-in secure **virtual sandbox addresses** that simulate real DeFi activities. Follow these 3 simple steps to get started:
              </p>

              {/* 3 Step Visual Stack */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left mb-6">
                {[
                  { step: '01', title: 'Pick a Sandbox Identity', desc: 'Secure custom usernames in 1 tap (e.g. SatoshiPatience, OraclePath) which hold virtual assets in sandbox registers.' },
                  { step: '02', title: 'Tap Connect Wallet', desc: 'Trigger the top right wallet trigger button. Select any available mock adapter without entering keys.' },
                  { step: '03', title: 'Receive Karma Index', desc: 'Instantly watch the digital index calculate, evaluate your personality details, and explore available perks.' }
                ].map((s, idx) => (
                  <div key={s.step} className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.04] relative">
                    <span className="absolute top-2 right-3 font-mono font-black text-xs text-amber-500/30">{s.step}</span>
                    <h4 className="text-xs font-bold text-[#fbbf24] mb-1.5">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={onShowConnect}
                  className="px-6 py-3 rounded-lg border-none text-slate-950 font-extrabold text-xs bg-amber-300 hover:bg-amber-400 transition-all cursor-pointer shadow-[0_4px_16px_rgba(251,191,36,0.2)] font-mono"
                >
                  🚀 Connect Your Sandbox Wallet Now
                </button>
              </div>
            </GlassCard>
          </div>
        )}

      </div>

      {/* Dynamic Companion Simulator Walkthrough Video Tour */}
      <SovereignGuideSimulator onShowConnect={onShowConnect} />

      {/* Dynamic Karma Creed Highlight Section */}
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div 
          onClick={onShowManifesto}
          className="p-5 sm:p-8 bg-gradient-to-r from-purple-950/15 via-[#030308] to-[#14F195]/5 border border-purple-500/20 hover:border-[#14F195]/40 transition-all rounded-[24px] cursor-pointer relative group overflow-hidden shadow-2xl"
        >
          {/* Decorative glowing gradient sphere */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-[#14F195]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-105 transition-transform duration-500" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-left">
            <div className="space-y-2.5 max-w-2xl">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#14F195] font-black bg-[#14F195]/10 px-3 py-1 rounded-full border border-[#14F195]/10 inline-block">
                ✨ Core Doctrine
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                What You Do Always Comes Back.
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                For the first time, you’re not just holding a token… you’re holding a reflection of your actions. Take the accountability test, monitor patterns of consistency, and elevate your reputation score.
              </p>
              <div className="flex flex-wrap gap-2.5 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                <span>⚡ Real-Time Tracking</span>
                <span>•</span>
                <span>⚖️ Pure Accountability</span>
                <span>•</span>
                <span>🔮 Immutable Record</span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowManifesto();
                }}
                className="w-full md:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-[#a78bfa]/40 bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#c084fc] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-normal sm:whitespace-nowrap shadow-md shadow-purple-500/10"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                🔮 Enter Creed Experience <span className="font-sans font-normal group-hover:translate-x-1.5 transition-transform inline-block">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIRAL SCORE CHECK PANEL AND NARRATIVE */}
      <div className="border-t border-b border-white/[0.04] bg-[#05050b]/40 py-12">
        <ScoreChecker user={user} onShowConnect={onShowConnect} />
      </div>

      {/* FAMILIAR COMPARISON: FICO vs. Karma reputability translation table */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10" id="fico-comparison">
        <div className="text-center mb-8">
          <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">No Mystery Logic</span>
          <h2 
            className="text-2xl md:text-3xl font-extrabold text-slate-200 mt-3 mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Familiar FICO Logic Meets Web3
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            We mirror traditional credit structures so people understand their reputation parameters in under 10 seconds.
          </p>
        </div>

        <GlassCard className="p-0 overflow-hidden border-white/[0.04]">
          <div className="grid grid-cols-2 bg-slate-950/60 p-4 border-b border-white/[0.06] text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <div className="pl-4">Credit Score (FICO)</div>
            <div className="pl-4 text-[#a78bfa]">Karma score (Web3)</div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {[
              { credit: '💳 Payment History', karma: '⏳ Wallet Age Holding Streaks', desc: 'Sustained account balances without sudden exits.' },
              { credit: '⏳ Credit History Age', karma: '🌱 On-Chain Account Maturity', desc: 'Longevity/maturity of your virtual connected network node.' },
              { credit: '🧩 Credit Mix Indicators', karma: '🌌 Multi-Chain DeFi Ecosystem Activity', desc: 'Participating in various indices and network structures.' },
              { credit: '✅ On-Time Payments History', karma: '🗳️ Positive Governance Participation', desc: 'Voted on reports or active validator consensus signals.' },
              { credit: '⚠️ High Risk Red Flags', karma: '⚔️ Rapid Fresh-Wallet Sell-offs / Sybil Behaviors', desc: 'Freshly fabricated accounts with sudden token liquidation spikes.' }
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 p-4 md:p-5 hover:bg-white/[0.01] transition-all">
                <div className="flex flex-col mb-2 md:mb-0 pl-1">
                  <span className="text-[13px] font-bold text-slate-300">{row.credit}</span>
                  <span className="text-[11px] text-slate-500 font-sans mt-0.5">Focuses on repayment cycles</span>
                </div>
                <div className="flex flex-col border-t border-dashed border-white/[0.04] md:border-none pt-2 md:pt-0 pl-1">
                  <span className="text-[13px] font-bold text-[#c084fc] flex items-center gap-1.5">
                    {row.karma}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans mt-0.5">{row.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Structured Core Features Deck */}
      <div className="max-w-[1080px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl font-extrabold text-[#f8fafc] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Verifiable On-Chain Reputation
          </h2>
          <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-md mx-auto">
            Our engine translates raw transactional activity into five behavioral criteria dimensions, rewarding discipline over speculation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title}>
              <GlassCard hover style={{ padding: 28, height: '100%' }}>
                <div className="text-[#a78bfa] text-2xl mb-4 font-mono select-none">{f.icon}</div>
                <h4 className="text-white font-bold text-base mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* ADVERTISE SOVEREIGN LENDERS */}
      <div className="max-w-[1080px] mx-auto px-6 py-12 border-t border-white/[0.04] relative z-10">
        <div className="text-center mb-10">
          <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#a78bfa] bg-purple-500/10 px-3 py-1 rounded-full font-bold">
            ⚡ PRE-QUALIFICATION ROADMAP
          </span>
          <h2 
            className="text-2xl md:text-3xl font-extrabold text-[#f8fafc] tracking-tight mt-3 mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Sovereign Lending Pools
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            These prospective underwriter vaults ingest your secure Karma reputation score to deploy on-demand liquid credit. Higher scores dynamically unlock massive rate discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {[
            {
              name: 'KARMALend Pool',
              baseApr: '8.50%',
              minScore: '630 PTS',
              backer: '◈ Direct Vault',
              desc: 'Our native liquid pool backing active Web3 builders with low barriers.',
              colorBorder: 'group-hover:border-purple-500/30',
              bullet: 'text-purple-400'
            },
            {
              name: 'Aave v4 VIP Desk',
              baseApr: '11.20%',
              minScore: '712 PTS',
              backer: '◆ Institution Direct',
              desc: 'High-volume prime client desk targeting seasoned DeFi strategists.',
              colorBorder: 'group-hover:border-cyan-500/30',
              bullet: 'text-cyan-400'
            },
            {
              name: 'Celestia Credit Vault',
              baseApr: '9.80%',
              minScore: '674 PTS',
              backer: '⊕ Liquid Consensus',
              desc: 'Modular collateral matching optimized for consensus nodes & stakers.',
              colorBorder: 'group-hover:border-emerald-500/30',
              bullet: 'text-emerald-400'
            },
            {
              name: 'Arbitrum Trust Grant',
              baseApr: '7.20%',
              minScore: '751 PTS',
              backer: '⬡ DAO Underwrite',
              desc: 'Ultra competitive rates backed by DAO-staked reputation grants.',
              colorBorder: 'group-hover:border-amber-500/30',
              bullet: 'text-amber-400'
            }
          ].map((partner, pidx) => (
            <div
              key={pidx}
              onClick={onShowConnect}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#07070d] to-slate-950 border border-white/[0.04] transition-all hover:-translate-y-1 hover:bg-[#090911] cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{partner.backer}</span>
                <span className="text-xs text-[#14F195] font-bold font-mono">Active</span>
              </div>
              
              <h4 
                className="text-sm font-extrabold text-white group-hover:text-[#14F195] transition-colors mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {partner.name}
              </h4>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 min-h-[50px]">
                {partner.desc}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.03] text-[10px] font-mono text-slate-400">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase">Min Rating</span>
                  <span className="font-bold text-slate-300">{partner.minScore}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] text-slate-500 uppercase">Base Rate</span>
                  <span className="font-bold text-[#14F195]">{partner.baseApr}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── $AURA Global Supply Tracker — public, visible to anyone ── */}
      <AuraSupplyTracker onShowConnect={onShowConnect} />

      {/* CTA Footer section */}
      <div className="py-24 px-6 text-center bg-slate-950/30 border-t border-white/[0.03]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa] font-bold mb-2">The New Standard for Web3 Identity</div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-200 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          Ready to verify your score?
        </h3>
        <button
          onClick={onShowConnect}
          className="px-8 py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all shadow-[0_0_35px_rgba(167,139,250,0.25)] hover:shadow-[0_0_45px_rgba(167,139,250,0.45)] cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            fontFamily: "'Syne', sans-serif"
          }}
        >
          Initialize Sandbox Connection →
        </button>
      </div>

      <NavigationVideo isOpen={showTutorialVideo} onClose={() => setShowTutorialVideo(false)} />

    </div>
  );
}
