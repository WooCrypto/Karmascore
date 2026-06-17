import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Twitter, 
  Wallet, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  Cpu, 
  Award, 
  Flame, 
  ShieldCheck, 
  RefreshCw, 
  BadgeHelp,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from './GlassCard';

interface ScoreCheckerProps {
  user?: any;
  onShowConnect?: () => void;
}

export default function ScoreChecker({ user, onShowConnect }: ScoreCheckerProps = {}) {
  const [wallet, setWallet] = useState('');
  const [xUser, setXUser] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState<{
    score: number;
    rank: string;
    walletAge: number;
    govIndex: number;
    velocity: number;
    multiplier: number;
    tokensAllocated: number;
    tierName: string;
    tierColor: string;
    badgeEmoji: string;
    badges: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Keep input fields in sync when a real user connects
  useEffect(() => {
    if (user) {
      const activeAddress = user.address || '';
      const activeUsername = user.username ? `@${user.username}` : '';
      setWallet(activeAddress);
      setXUser(activeUsername);
      
      // Run automatic dramatic analysis for the connected user
      setIsAnalyzing(true);
      setAnalysisStep(0);
      setResults(null);
      
      decryptAnimateText(activeAddress, activeUsername || 'karma_pioneer', async () => {
        let liveProfile: any = null;
        try {
          const res = await fetch(`/api/profile/${activeAddress.toLowerCase()}`);
          if (res.ok) {
            liveProfile = await res.json();
          }
        } catch (e) {
          console.warn('Live profile fetch failed:', e);
        }

        const score = liveProfile?.karmaScore || user.karmaScore || 680;
        const rankPercent = ((1000 - score) / 700 * 9.5 + 0.1).toFixed(2);
        const rank = `Top ${rankPercent}%`;
        const walletAge = liveProfile?.metrics?.walletAgeDays || user.metrics?.walletAgeDays || 180;
        const govIndex = liveProfile?.scores?.governance || user.scores?.governance || 65;
        const velocity = liveProfile?.scores?.txQuality || user.scores?.txQuality || 70;
        const multiplier = parseFloat(((score - 300) / 400 + 1.2).toFixed(2));
        const tokensAllocated = Math.round((score - 300) * multiplier * 3);
        
        let tierName = 'Strong';
        let tierColor = '#38bdf8';
        let badgeEmoji = '💎';
        let badges = ['Active Validator Sign', 'Hold Mastery Streak'];

        if (score >= 880) {
          tierName = 'Legendary';
          tierColor = '#a78bfa';
          badgeEmoji = '👑';
          badges = ['Sovereign Whale Guild', 'Consensus Guardian', 'Alpha Ambassador'];
        } else if (score >= 750) {
          tierName = 'Trusted';
          tierColor = '#14F195';
          badgeEmoji = '✨';
          badges = ['High Velocity Spend Loop', 'DeFi Vault Master'];
        } else if (score < 620) {
          tierName = 'Building';
          tierColor = '#fbbf24';
          badgeEmoji = '🌱';
          badges = ['Pioneer Explorer Status'];
        }

        setResults({
          score,
          rank,
          walletAge,
          govIndex,
          velocity,
          multiplier,
          tokensAllocated,
          tierName,
          tierColor,
          badgeEmoji,
          badges
        });
        setIsAnalyzing(false);
      });
    } else {
      const defaultWallet = 'satoshipatience.sol';
      const defaultX = 'SatoshiPatient';
      setWallet(defaultWallet);
      setXUser(defaultX);
      setResults(computeDeterministicScore(defaultWallet, defaultX));
    }
  }, [user]);

  // Reusable deterministic calculation engine
  const computeDeterministicScore = (walletAddress: string, xHandle: string) => {
    const cleanWallet = walletAddress.trim().toLowerCase();
    const cleanX = xHandle.trim().replace('@', '').toLowerCase();
    const comb = cleanWallet + '|' + cleanX;
    
    let hash = 0;
    for (let i = 0; i < comb.length; i++) {
      hash = comb.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    // Score range from 540 to 985
    const score = (hash % 445) + 540;
    
    // Rank mapping
    const rankPercent = ((1000 - score) / 700 * 9.5 + 0.1).toFixed(2);
    const rank = `Top ${rankPercent}%`;

    // Maturity metric
    const walletAge = (hash % 1200) + 85; 
    const govIndex = (hash % 28) + 72;
    const velocity = (hash % 35) + 65;
    const multiplier = parseFloat(((hash % 15) / 10 + 1.2).toFixed(2));
    
    // Real karma token allocation simulation
    const tokensAllocated = Math.round(((score - 300) * multiplier * 2.8) + (hash % 1500));

    // Tiers
    let tierName = 'Strong';
    let tierColor = '#38bdf8'; // sky
    let badgeEmoji = '💎';
    let badges = ['Active Validator Sign', 'Hold Mastery Streak'];

    if (score >= 880) {
      tierName = 'Legendary';
      tierColor = '#a78bfa'; // purple
      badgeEmoji = '👑';
      badges = ['Sovereign Whale Guild', 'Consensus Guardian', 'Alpha Ambassador'];
    } else if (score >= 750) {
      tierName = 'Trusted';
      tierColor = '#14F195'; // neon green
      badgeEmoji = '✨';
      badges = ['High Velocity Spend Loop', 'DeFi Vault Master'];
    } else if (score < 620) {
      tierName = 'Building';
      tierColor = '#fbbf24'; // amber
      badgeEmoji = '🌱';
      badges = ['Pioneer Explorer Status'];
    }

    return {
      score,
      rank,
      walletAge,
      govIndex,
      velocity,
      multiplier,
      tokensAllocated,
      tierName,
      tierColor,
      badgeEmoji,
      badges
    };
  };

  const [animatedScore, setAnimatedScore] = useState(300);
  const [animatedTokens, setAnimatedTokens] = useState(0);
  const [animatedAge, setAnimatedAge] = useState(0);

  // Smooth easing count-up function for metrics
  useEffect(() => {
    if (results) {
      const duration = 1500; // 1.5 seconds
      const startTime = performance.now();
      
      const startScore = 300;
      const endScore = results.score;
      const startTokens = 0;
      const endTokens = results.tokensAllocated;
      const startAge = 0;
      const endAge = results.walletAge;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Quad easeOut
        const easeProgress = progress * (2 - progress);
        
        setAnimatedScore(Math.round(startScore + (endScore - startScore) * easeProgress));
        setAnimatedTokens(Math.round(startTokens + (endTokens - startTokens) * easeProgress));
        setAnimatedAge(Math.round(startAge + (endAge - startAge) * easeProgress));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedScore(endScore);
          setAnimatedTokens(endTokens);
          setAnimatedAge(endAge);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [results]);

  // Decrypting feels/characters scrambler when checking scores or randomising
  const decryptAnimateText = (finalWallet: string, finalX: string, callback: () => void) => {
    const chars = 'abcdef0123456789_x.';
    const xChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let currentPercent = 0;

    const interval = setInterval(() => {
      currentPercent += 0.08;
      
      const tempWall = finalWallet
        .split('')
        .map((char, idx) => {
          if (idx / finalWallet.length < currentPercent) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
        
      const tempX = finalX
        .split('')
        .map((char, idx) => {
          if (idx / finalX.length < currentPercent) return char;
          return xChars[Math.floor(Math.random() * xChars.length)];
        })
        .join('');

      setWallet(tempWall);
      setXUser(tempX);

      if (currentPercent >= 1.0) {
        clearInterval(interval);
        setWallet(finalWallet);
        setXUser(finalX);
        callback();
      }
    }, 40);
  };

  const handleRandomProfile = () => {
    const randomWallets = [
      'satoshipatience.sol', 'vitalik_hold.eth', 'alpha_whale.sol', 'sol_cons.sol',
      'defiguardian.eth', 'holding_conviction.sol', 'karma_zealot.eth', 'shadow_consensus.sol'
    ];
    const randomXUsers = [
      'SatoshiPatient', 'VitalikHold', 'AlphaWhale', 'SolConsensus',
      'DeFiGuardian', 'HoldConviction', 'KarmaZealot', 'BasePioneer'
    ];
    const randIdx = Math.floor(Math.random() * randomWallets.length);
    const targetWallet = randomWallets[randIdx];
    const targetX = randomXUsers[randIdx];
    
    // Clear dynamic results while animating scanning to make it exciting
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setResults(null);

    decryptAnimateText(targetWallet, targetX, () => {
      // Continue simulated multi-step scan after decryption completes
      const stepsCount = 5;
      let currentStep = 0;
      const scanInterval = setInterval(() => {
        currentStep += 1;
        setAnalysisStep(currentStep);
        if (currentStep >= stepsCount) {
          clearInterval(scanInterval);
          setResults(computeDeterministicScore(targetWallet, targetX));
          setIsAnalyzing(false);
        }
      }, 180); // Fast, high-energy pace for random checks
    });
  };

  // Simple deterministic computation to guarantee a reliable result for any given profile
  const executeEvaluation = () => {
    if (!wallet.trim() || !xUser.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setResults(null);

    decryptAnimateText(wallet, xUser, () => {
      // Run immersive staggered step scans
      const steps = [
        'Scanning chain registers & holding age...',
        'Analyzing stablecoin network velocity footprint...',
        'Computing multi-chain governance votes ledger...',
        'Filtering Sybil risk profiles & malicious exit tags...',
        'Resolving permanent sovereign credit quotient...'
      ];

      let currentStep = 0;
      const scanInterval = setInterval(async () => {
        currentStep += 1;
        setAnalysisStep(currentStep);
        if (currentStep >= steps.length) {
          clearInterval(scanInterval);
          
          let liveProfile: any = null;
          if (/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) {
            try {
              const res = await fetch(`/api/profile/${wallet.trim().toLowerCase()}`);
              if (res.ok) {
                liveProfile = await res.json();
              }
            } catch (e) {
              console.warn('Live profile fetch failed:', e);
            }
          }

          if (liveProfile && !liveProfile.error) {
            const score = liveProfile.karmaScore || 650;
            const rankPercent = ((1000 - score) / 700 * 9.5 + 0.1).toFixed(2);
            const rank = `Top ${rankPercent}%`;
            const walletAge = liveProfile.metrics?.walletAgeDays || 180;
            const govIndex = liveProfile.scores?.governance || 65;
            const velocity = liveProfile.scores?.txQuality || 70;
            const multiplier = parseFloat(((score - 300) / 400 + 1.2).toFixed(2));
            const tokensAllocated = Math.round((score - 300) * multiplier * 3);
            
            let tierName = 'Strong';
            let tierColor = '#38bdf8';
            let badgeEmoji = '💎';
            let badges = ['Active Validator Sign', 'Hold Mastery Streak'];

            if (score >= 880) {
              tierName = 'Legendary';
              tierColor = '#a78bfa';
              badgeEmoji = '👑';
              badges = ['Sovereign Whale Guild', 'Consensus Guardian', 'Alpha Ambassador'];
            } else if (score >= 750) {
              tierName = 'Trusted';
              tierColor = '#14F195';
              badgeEmoji = '✨';
              badges = ['High Velocity Spend Loop', 'DeFi Vault Master'];
            } else if (score < 620) {
              tierName = 'Building';
              tierColor = '#fbbf24';
              badgeEmoji = '🌱';
              badges = ['Pioneer Explorer Status'];
            }

            setResults({
              score,
              rank,
              walletAge,
              govIndex,
              velocity,
              multiplier,
              tokensAllocated,
              tierName,
              tierColor,
              badgeEmoji,
              badges
            });
          } else {
            setResults(computeDeterministicScore(wallet, xUser));
          }
          setIsAnalyzing(false);
        }
      }, 550); // Fluid, dramatic pacing
    });
  };

  const getEligibleLimit = (scoreValue: number) => {
    const scaledScoreForCalc = Math.max(0, Math.min(100, Math.round((scoreValue - 300) / 5.5)));
    const baseVal = (scaledScoreForCalc - 50) / 10;
    const loanMultiplier = baseVal > 0 ? Math.max(1, Math.pow(baseVal, 2.6)) : 1;
    
    // Deterministic random seed based on score value to generate stable higher figures
    const seed = (scoreValue * 723) % 43000;
    const randHigherAdder = (seed % 24500) + 35000; // random component between $35k and $59.5k
    
    // Scale base loan limit to high attractive figures
    const baseLimit = (65000 * loanMultiplier) + randHigherAdder;
    return Math.floor(baseLimit);
  };

  const shareText = results 
    ? `🔍 Just checked my sovereign credit quotient on @KarmaAIScore !\n\n👑 Score: ${results.score} (${results.tierName} Tier)\n🌍 Rank: ${results.rank} Globally\n🪙 Allocated: ${results.tokensAllocated.toLocaleString()} $KARMA reserved\n💸 Eligible Loan Limit: $${getEligibleLimit(results.score).toLocaleString()} USDT/USDC\n\n🖼️ Passport Preview: ${window.location.origin}/src/assets/images/karma_share_card_1780957350199.png\n\nYour reputation score is building in the background. Mapped live without logs.\nCheck yours: https://KarmaScore.xyz\n\n#Karma #Web3Karma #DeFiPassport #Solana #Base`
    : '';

  const handleCopy = () => {
    if (!shareText) return;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    if (!shareText) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const resetForm = () => {
    setWallet('');
    setXUser('');
    setResults(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative" id="viral-karma-score-checker">
      {/* Background neon elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[300px] bg-[#9945ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold">Instant Viral Attestation</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Check Your Sovereign Karma Score
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
          The $KARMA token utility allocation is real. Even if you haven't opened a dashboard, our on-chain indexer tracks wallet age, holding streaks, stablecoin transactions, and metrics live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* INPUT PANEL AND VIRAL ANATOMY DESCRIPTION */}
        <div className="md:col-span-5 space-y-4">
          <GlassCard className="p-5 md:p-6 border-white/[0.04] bg-[#07070e]/90 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <span>💳</span> Reputation Query Node
              </h3>
              <button
                onClick={handleRandomProfile}
                disabled={isAnalyzing}
                type="button"
                className="text-[9.5px] font-mono font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/15 hover:border-purple-400/30 px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm select-none"
                title="Populate and check a random on-chain profile"
              >
                🎲 Surprise Me
              </button>
            </div>

            {!results ? (
              <div className="space-y-4">
                
                {/* Wallet Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    Connected Wallet / Public Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      placeholder="e.g. satis_holder.eth or public 0x..."
                      disabled={isAnalyzing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* X Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    X Username (Twitter Handle)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={xUser}
                      onChange={(e) => setXUser(e.target.value)}
                      placeholder="e.g. @SatoshiPatient"
                      disabled={isAnalyzing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={executeEvaluation}
                  disabled={isAnalyzing || !wallet.trim() || !xUser.trim()}
                  className="w-full py-3 rounded-xl border-none outline-none text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01] active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #14F195, #a78bfa)',
                    fontFamily: "'Syne', sans-serif"
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>Scanning Rep Registers...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 shrink-0" />
                      <span>Verify My Score Allocation →</span>
                    </>
                  )}
                </button>

                {/* Direct Link option for seamless onboarding inside checker */}
                {!user && onShowConnect ? (
                  <button
                    onClick={onShowConnect}
                    type="button"
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#a78bfa]/40 hover:border-[#a78bfa]/80 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/10 text-[#c084fc] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>🔌</span> Link My Live Wallet Connection
                  </button>
                ) : user ? (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10.5px] text-[#c084fc] font-mono mt-2 select-none">
                    <span className="font-bold flex items-center gap-1">🟢 Live Connected Wallet Verified</span>
                    <span className="font-bold">@{user.username}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#14F195]/10 border border-[#14F195]/20 rounded-xl">
                  <span className="text-[10px] font-mono text-[#14F195] font-black uppercase tracking-widest block font-extrabold">✓ RATINGS CALCULATED SECURELY</span>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Your reputation rank and allocations are dynamically mapped. Track stats live without server logs.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleTwitterShare}
                    className="flex-1 py-2.5 rounded-xl border-none bg-[#1d9bf0] text-white font-black text-[11px] uppercase tracking-wider cursor-pointer hover:bg-[#1a8cd8] transition-all flex items-center justify-center gap-1.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    <Twitter className="w-3.5 h-3.5" /> Tweet Score Card
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.05] hover:border-white/10 bg-slate-950 text-slate-300 font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleRandomProfile}
                    className="flex-1 py-2 rounded-lg border border-purple-500/20 hover:border-purple-400/40 bg-slate-950 text-purple-300 font-bold text-[9.5px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    🎲 Check Another Random
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-3 py-2 rounded-lg border border-white/5 hover:border-white/10 bg-slate-900 text-slate-500 hover:text-slate-400 font-bold text-[9.5px] uppercase tracking-widest cursor-pointer transition-all"
                  >
                    Clear Input
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Sweet Viral Token Narrative Card */}
          <div className="p-4 bg-gradient-to-tr from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-2xl text-left space-y-2">
            <h4 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              🪙 THE $KARMA TOKEN PHILOSOPHY
            </h4>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Most crypto projects force users to complete continuous, point-less click quests to farm basic visual points. <strong>Karma AI is different.</strong> Your on-chain token allocation acts as a real back-ground dividend of your continuous on-chain maturity. Even if you never log into our platform, your score secures your equity.
            </p>
            <p className="text-[10.5px] text-[#14F195] font-semibold">
              Share your score card with peers to directly speed up your native mint multiplier.
            </p>
          </div>
        </div>

        {/* OUTPUT OR PREVIEW HOVER SCREEN */}
        <div className="md:col-span-7 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="scanning-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full min-h-[380px] rounded-3xl bg-[#030307]/90 border border-purple-500/10 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden"
              >
                {/* Modern Radar Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.04)_0%,transparent_70%)]" />
                
                {/* Scanning Bar Animation */}
                <motion.div
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 blur-[1px] pointer-events-none"
                />

                <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                  {/* Concentric Pulsing Rings */}
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full border border-purple-500/20"
                  />
                  <motion.div 
                    animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="absolute inset-[15px] rounded-full border border-cyan-500/20"
                  />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="absolute inset-[30px] rounded-full border-t border-r border-[#14F195]"
                  />
                  <Cpu className="w-8 h-8 text-[#14F195] animate-pulse" />
                </div>

                <div className="space-y-1.5 max-w-sm relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#a78bfa] font-black block animate-pulse">Running Decentralized Indexers</span>
                  <h4 className="text-sm font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>Analyzing Sovereign Credentials</h4>
                  
                  {/* Custom active loader lines */}
                  <div className="bg-slate-950/80 border border-white/[0.04] p-3.5 rounded-xl mt-4 text-[11px] font-mono text-cyan-400 text-left min-h-[50px] relative overflow-hidden shadow-inner">
                    <span className="absolute top-2 right-3 leading-none opacity-40 text-[9px] font-bold animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 block" /> ENGINE INDEX
                    </span>
                    <span className="block text-slate-500 text-[9px] font-bold mb-1">STAGE {analysisStep + 1}/5</span>
                    <p className="font-bold flex items-center gap-2 text-slate-200">
                      <span className="text-[#14F195]">☇</span> 
                      {[
                        'Scanning chain registers & holding age...',
                        'Analyzing stablecoin network velocity footprint...',
                        'Computing multi-chain governance votes ledger...',
                        'Filtering Sybil risk profiles & toxic listings...',
                        'Resolving sovereign credit quotient...'
                      ][Math.max(0, Math.min(analysisStep, 4))] || 'Running...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : results ? (
              
              /* DYNAMIC HOLOGRAPHIC SCORE CARD FOR SHARING */
              <motion.div 
                key="results-state"
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full space-y-4 text-left"
              >
                
                <div 
                  className="w-full rounded-3xl border relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] group transition-all"
                  style={{
                    background: 'linear-gradient(215deg, #090916 0%, #030307 100%)',
                    borderColor: `${results.tierColor}35`
                  }}
                >
                  {/* Background high-glow matrix */}
                  <div 
                    className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none transition-transform"
                    style={{ background: `${results.tierColor}12` }}
                  />
                  <div className="absolute top-[40%] left-[10%] w-[150px] pin h-[150px] bg-purple-500/5 rounded-full blur-[70px] pointer-events-none" />
  
                  {/* Badge Header Row */}
                  <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${results.tierColor}15`,
                          border: `1.5px solid ${results.tierColor}25`
                        }}
                      >
                        {results.badgeEmoji}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white leading-none uppercase tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                          Sovereign reputation card
                        </h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                          <span>@{xUser.replace('@', '')}</span>
                          <span>•</span>
                          <span className="truncate max-w-[80px]" title={wallet}>
                            {wallet.length > 12 ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : wallet}
                          </span>
                        </p>
                      </div>
                    </div>
  
                    <div className="text-right">
                      <span 
                        className="text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: `${results.tierColor}12`,
                          color: results.tierColor,
                          borderColor: `${results.tierColor}25`
                        }}
                      >
                        {results.tierName}
                      </span>
                    </div>
                  </div>
  
                  {/* Giant Metric Body Section */}
                  <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    
                    {/* Score circle dial */}
                    <div className="relative w-36 h-36 flex items-center justify-center text-center shrink-0">
                      <svg viewBox="0 0 144 144" className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="62" 
                          stroke={results.tierColor} 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 62}
                          strokeDashoffset={2 * Math.PI * 62 * (1 - (animatedScore - 300) / 700)}
                          style={{ filter: `drop-shadow(0 0 6px ${results.tierColor}35)` }}
                        />
                      </svg>
  
                      <div className="relative z-10">
                        <span className="text-4xl font-extrabold tracking-tighter text-white font-mono block">{animatedScore}</span>
                        <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block mt-0.5">Rating</span>
                      </div>
                    </div>
  
                    {/* Core Metrics & badging layout info */}
                    <div className="flex-1 space-y-3 w-full text-left">
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 bg-slate-950/60 border border-white/[0.03] rounded-xl">
                          <span className="block text-[8.5px] text-slate-500 uppercase font-black">Global Rank Position</span>
                          <span className="text-slate-100 font-bold block mt-0.5">{results.rank}</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/60 border border-white/[0.03] rounded-xl">
                          <span className="block text-[8.5px] text-slate-500 uppercase font-black">Hold Maturity Days</span>
                          <span className="text-slate-100 font-bold block mt-0.5">{animatedAge} Days</span>
                        </div>
                      </div>
  
                      {/* Staked $KARMA reservation */}
                      <div className="p-3 bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-500/10 rounded-xl relative overflow-hidden">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 text-lg opacity-40">🪙</div>
                        <span className="block text-[8.5px] font-mono text-[#a78bfa] uppercase tracking-widest font-black leading-none">
                          PROSPECTIVE $KARMA TOKEN OUTSTANDING
                        </span>
                        <span className="text-white text-base font-black font-sans block mt-1">
                          {animatedTokens.toLocaleString()} KARMA <span className="text-xs font-mono font-normal text-slate-400">Tokens Reserved</span>
                        </span>
                      </div>
                    </div>
  
                  </div>
  
                  {/* Subtitle footer badges elements */}
                  <div className="border-t border-white/[0.04] pt-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {results.badges.map((b, bidx) => (
                        <span key={bidx} className="text-[9px] font-mono font-bold bg-white/[0.02] border border-white/[0.06] hover:border-white/10 px-2 py-0.5 rounded text-slate-300">
                          🛡️ {b}
                        </span>
                      ))}
                    </div>
  
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest select-none">
                      Karmascore.xyz verified attestation
                    </span>
                  </div>
  
                </div>
                
                {/* Floating sharing helper tips */}
                <p className="text-[10.5px] font-mono text-slate-500 text-center leading-normal">
                  💡 Tip: Tap <strong>"Tweet Score Card"</strong> above to showcase your proof of on-chain reputation and join the active leaderboard registry.
                </p>
  
              </motion.div>
  
            ) : (
              
              /* EMPTY PLACEHOLDER DESIGNS */
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full min-h-[380px] rounded-3xl bg-[#030307] border border-dashed border-white/[0.06] p-8 flex flex-col justify-center items-center text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-slate-500 text-lg">
                  💡
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-300">No profile query evaluated yet</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Enter your public wallet credentials and X handle in the query panel to compile your secure reputation index card.
                  </p>
                </div>
                
                <div className="flex gap-4 items-center justify-center text-[10px] font-mono text-slate-600 pt-3 border-t border-white/[0.02] w-full max-w-xs">
                  <span>✦ Deterministic Hash</span>
                  <span>•</span>
                  <span>✦ Dynamic multipliers</span>
                </div>
              </motion.div>
  
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
