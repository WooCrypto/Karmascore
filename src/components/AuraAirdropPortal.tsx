import { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { 
  Flame, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Coins,
  Copy,
  ChevronRight,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  Search,
  Swords,
  Zap,
  Share2,
  Crown,
  ShieldAlert
} from 'lucide-react';
import GlassCard from './GlassCard';

interface AuraAirdropPortalProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

interface ClaimRecord {
  id: string;
  timestamp: string;
  amount: number;
  multiplier: number;
  streak: number;
  txHash: string;
  status: 'Settled' | 'Pending Distribution';
}

export default function AuraAirdropPortal({ user, onUpdateUser }: AuraAirdropPortalProps) {
  const [totalPoints, setTotalPoints] = useState<number>(user.auraPoints || 0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimProgress, setClaimProgress] = useState(0);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // On-Chain Clash Arena State
  const [showClashArena, setShowClashArena] = useState(false);
  const [rivalInput, setRivalInput] = useState('');
  const [isDueling, setIsDueling] = useState(false);
  const [duelProgress, setDuelProgress] = useState(0);
  const [duelResult, setDuelResult] = useState<any>(null);
  const [copyDuelSuccess, setCopyDuelSuccess] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Claim History State
  const [claimHistory, setClaimHistory] = useState<ClaimRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<ClaimRecord | null>(null);

  // Stats calculation
  const basePoints = user.streak * 250;
  const streakMultiplier = parseFloat((1 + (user.streak * 0.15)).toFixed(2));
  const claimableAmount = Math.round(basePoints * streakMultiplier);

  // Check if claimed today / during session
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (user.lastClaimedAt) {
      const today = new Date().toISOString().split('T')[0];
      setHasClaimed(user.lastClaimedAt === today);
    } else {
      setHasClaimed(false);
    }
  }, [user.lastClaimedAt]);

  useEffect(() => {
    setTotalPoints(user.auraPoints || 0);
  }, [user.auraPoints]);

  // Load claim history from localStorage or bootstrap simulated records
  useEffect(() => {
    const storageKey = `aura_claims_${user.username}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setClaimHistory(JSON.parse(stored));
      } catch (e) {
        // Safe fallback
      }
    } else {
      const initialHistory: ClaimRecord[] = [];
      const now = new Date();
      
      // Let's generate entries if streak exists
      const limit = Math.max(2, Math.min(4, user.streak));
      for (let i = 1; i <= limit; i++) {
        const claimDate = new Date();
        claimDate.setDate(now.getDate() - i);
        
        const historicalStreak = Math.max(1, user.streak - i);
        const basePointValue = historicalStreak * 250;
        const historicalMultiplier = parseFloat((1 + (historicalStreak * 0.15)).toFixed(2));
        const historicalAmount = Math.round(basePointValue * historicalMultiplier);
        
        // Deterministic hash based on username
        const hashSeed = (user.username + '|' + i).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dayTxHash = `0x${((hashSeed * 71329) % 16777215).toString(16)}a2ebd${i}9bbf7a${historicalStreak}ef`;

        initialHistory.push({
          id: `claim-${Date.now() - i * 86400000}`,
          timestamp: claimDate.toISOString(),
          amount: historicalAmount,
          multiplier: historicalMultiplier,
          streak: historicalStreak,
          txHash: dayTxHash,
          status: 'Settled'
        });
      }
      setClaimHistory(initialHistory);
      localStorage.setItem(storageKey, JSON.stringify(initialHistory));
    }
  }, [user.username, user.streak]);

  const handleClaim = () => {
    if (hasClaimed || isClaiming) return;
    setIsClaiming(true);
    setClaimProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setClaimProgress(100);

        const today = new Date().toISOString().split('T')[0];
        const calculatedAuraPoints = (user.auraPoints || 0) + claimableAmount;
        const calculatedKarmaScore = (user.karmaScore || 320) + 35;
        const updatedUser = {
          ...user,
          auraPoints: calculatedAuraPoints,
          karmaScore: calculatedKarmaScore > 1000 ? 1000 : calculatedKarmaScore,
          lastClaimedAt: today
        };

        onUpdateUser(updatedUser);
        setTotalPoints(calculatedAuraPoints);
        setHasClaimed(true);
        setClaimSuccess(true);
        setIsClaiming(false);

        // Append simulated record to claims history ledger
        const seed = updatedUser.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const claimTxHash = `0x${((seed * 91823) % 16777215).toString(16)}ffd56${user.streak}bfae8d7`;
        const newRecord: ClaimRecord = {
          id: `claim-${Date.now()}`,
          timestamp: new Date().toISOString(),
          amount: claimableAmount,
          multiplier: streakMultiplier,
          streak: user.streak,
          txHash: claimTxHash,
          status: 'Settled'
        };

        const storageKey = `aura_claims_${user.username}`;
        setClaimHistory(prevHistory => {
          const currentHistory = [newRecord, ...prevHistory];
          localStorage.setItem(storageKey, JSON.stringify(currentHistory));
          return currentHistory;
        });
      } else {
        setClaimProgress(progress);
      }
    }, 100);
  };

  // On-Chain Duel calculations
  const handleStartDuel = (rivalName: string) => {
    if (!rivalName.trim()) return;
    setIsDueling(true);
    setDuelProgress(0);
    setDuelResult(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setDuelProgress(100);

        const seed = rivalName.toLowerCase().trim().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rivalScore = Math.round(320 + (seed * 843) % 521);
        const rivalStreak = Math.round(1 + (seed * 419) % 28);
        
        const titles = [
          "Panic Selling Goblin 👺",
          "Leverage High-Roller 🃏",
          "Gas War Survivor ⛽",
          "Meme Bag Cultist 💎",
          "Exit Liquidity Contributor 💀",
          "On-Chain Yield Master 🌾",
          "Diamond-Handed Oracle 🔮",
          "Airdrop Hunter Ninja 🥷"
        ];
        const rivalTitle = titles[seed % titles.length];

        const userScore = user.karmaScore;
        const userStreak = user.streak;

        let winner = 'user';
        let userAdvantage = '';
        let rivalAdvantage = '';

        if (userScore > rivalScore) {
          winner = 'user';
          userAdvantage = 'Reputation Superiority';
          rivalAdvantage = 'High Degeneracy';
        } else if (userScore < rivalScore) {
          winner = 'rival';
          userAdvantage = 'Strategic Patience';
          rivalAdvantage = 'Unbothered Conviction';
        } else {
          winner = 'draw';
          userAdvantage = 'Perfect Balance';
          rivalAdvantage = 'Mirror Synergy';
        }

        const funnyRoasts = [
          `Caught panic-selling the local bottom on 3 different chains. Absolute exit liquidity behavior.`,
          `Owns custom NFT collections down 99.8% but maintains they are 'multigenerational utility hedges'.`,
          `Once paid $320 in gas priority fees to mint a duplicate meme coin. True sovereign explorer!`,
          `Has a wallet with zero continuous reputation history, yet lists 'Web3 Advisor' on social media profiles.`,
          `Spends 14 hours a day reading Alpha Telegram logs. Sleep quality is low, wallet performance is lower.`,
          `Verified ledger shows standard 'Paper Hands' syndrome under rigorous stress testing.`,
          `Believes holding for 24 hours is a 'long-term strategic locking position'.`
        ];
        const rivalRoast = funnyRoasts[seed % funnyRoasts.length];

        setDuelResult({
          name: rivalName.toLowerCase().trim().replace('@', ''),
          score: rivalScore,
          streak: rivalStreak,
          title: rivalTitle,
          roast: rivalRoast,
          winner,
          userAdvantage,
          rivalAdvantage
        });
        setIsDueling(false);
      } else {
        setDuelProgress(progress);
      }
    }, 120);
  };

  const copyDuelVerdict = () => {
    if (!duelResult) return;
    const emojiWinner = duelResult.winner === 'user' ? `👑 @${user.username}` : `💀 @${duelResult.name}`;
    const text = `⚔️ ON-CHAIN REPUTATION BATTLE ⚔️\n\n@${user.username} vs @${duelResult.name}\n\n🏆 Absolute Winner: ${emojiWinner}\n\n🔮 My Karma Score: ${user.karmaScore}/1000 (🔥 ${user.streak}D hold streak)\n👺 Rival Score: ${duelResult.score}/1000 (${duelResult.title})\n\n📢 Clash Verdict: "${duelResult.roast}"\n\nHolding is sovereign gold. Duel your friends and find your Aura ranking:\n👉 Check: https://KarmaScore.xyz\n\n#KarmaDuel #SovereignAura #Web3Reputation #CryptoTikTok #FIP`;
    
    navigator.clipboard.writeText(text);
    setCopyDuelSuccess(true);
    setTimeout(() => {
      setCopyDuelSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="aura-airdrop-portal">
      {/* Primary Claim Interface inside standard grid */}
      <GlassCard className="p-6 border-amber-500/10 relative overflow-hidden bg-[#07070e]/85">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.04] pb-4 mb-5">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#fbbf24] bg-amber-500/10 px-2.5 py-0.5 rounded font-black items-center gap-1 inline-flex select-none">
              <Sparkles size={10} className="text-amber-400" /> Airdrop Forge
            </span>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                Aura Token Claim Node
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="px-2 py-0.5 text-[9.5px] font-mono text-[#c084fc] border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20 rounded-md font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer select-none"
                title="View on-chain records of user claimed aura points"
              >
                📜 Claim History
              </button>
            </div>
          </div>
          <div className="text-right flex items-center md:flex-col gap-2 md:gap-0 bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.04]">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-none mb-1">TOTAL CLAIMED</span>
            <span className="text-xl font-mono font-black text-amber-400 tracking-tight flex items-center gap-1 justification-end">
              🪙 {totalPoints.toLocaleString()} <span className="text-[10px] text-slate-500">$AURA</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Details & Multipliers Column */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Your holding conviction acts as an energy accumulator. For each day in your verified <strong>{user.streak}-day streak</strong>, you accrue <strong>250 base $AURA points</strong> magnified by an active velocity multiplier.
            </p>

            {/* Calculations Table */}
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">Base Accumulation</span>
                <span className="text-sm font-bold text-slate-200 block">{basePoints}</span>
                <span className="text-[8.5px] text-slate-500 block mt-0.5">250 pts / Day</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <span className="text-[8px] text-purple-400 uppercase block font-bold mb-1">Streak Mult.</span>
                <span className="text-sm font-bold text-purple-300 block">x{streakMultiplier}</span>
                <span className="text-[8.5px] text-purple-500 block mt-0.5">+15% Multiplier / Day</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[8px] text-amber-400 uppercase block font-bold mb-1">Total Reward</span>
                <span className="text-sm font-extrabold text-[#14F195] block">+{claimableAmount.toLocaleString()}</span>
                <span className="text-[8.5px] text-slate-500 block mt-0.5">$AURA Points</span>
              </div>
            </div>

            {/* Airdrop Disclaimers */}
            <div className="text-[10px] text-slate-500 leading-normal font-mono">
              ⚡ Claiming instantly unlocks points for future token supply distributions. Claiming also adds <strong className="text-emerald-400">+35 reputation points</strong> instantly to your main Karma score! Check-in resets daily at 00:00 UTC.
            </div>
          </div>

          {/* Interactive Forge button / progress loader */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/30 rounded-2xl border border-white/[0.03] min-h-[180px]">
            {isClaiming ? (
              <div className="w-full text-center space-y-4 py-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/10 pointer-events-none" />
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-t-amber-400 animate-spin" 
                    style={{ animationDuration: '0.8s' }}
                  />
                  <Coins className="text-amber-400 animate-pulse" size={24} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block animate-pulse">Forging Aura Blocks...</span>
                  <div className="h-1.5 w-40 bg-white/[0.04] rounded-full mx-auto overflow-hidden border border-white/[0.01]">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-150" style={{ width: `${claimProgress}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">{claimProgress}% Synced</span>
                </div>
              </div>
            ) : hasClaimed ? (
              <div className="text-center space-y-3.5 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <Check size={24} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 block uppercase tracking-wider">Aura claimed for today</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-1 max-w-[200px] mx-auto">
                    Reputation updated. You gained <span className="text-emerald-300 font-semibold">+35 credit weight</span>. Come back tomorrow!
                  </p>
                </div>
                
                {claimSuccess && (
                  <div className="text-[9.5px] font-mono text-slate-500 animate-bounce">
                    ✨ Securely archived on simulated ledger!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 w-full">
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full max-w-[230px] mx-auto py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-1.5 group select-none"
                >
                  <Flame className="fill-current group-hover:scale-110 transition-transform" size={14} />
                  Claim {claimableAmount.toLocaleString()} $AURA Ports
                </button>
                <div className="text-[10px] text-slate-400 leading-normal text-center max-w-[220px] mx-auto">
                  Tethers verified hold maturity of {user.streak} days. Multiplier pool locked at <span className="text-[#a78bfa] font-bold">x{streakMultiplier}</span>.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* On-Chain Clash Arena Callout banner */}
        <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-purple-950/10 p-3.5 rounded-xl border border-purple-500/5">
          <div className="flex items-start gap-2.5">
            <span className="bg-[#14F195]/10 text-[#14F195] p-2 rounded-lg border border-[#14F195]/15 text-xs select-none">⚔️</span>
            <div>
              <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                On-Chain Battle Arena: Duel Your Friends <span className="bg-[#14F195]/20 text-[#14F195] text-[7.5px] font-mono px-1 rounded uppercase tracking-wider font-extrabold">Viral content engine</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xl">
                Compare your reputation, holding conviction, and $AURA points multiplier against any wallet or username. Generates hilarious custom roasts perfect for TikTok or X screenshots!
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowClashArena(!showClashArena);
              if(!showClashArena) {
                if(!rivalInput) setRivalInput('paper_hands_deg');
              }
            }}
            className="w-full md:w-auto text-xs px-4 py-2 rounded-xl transition-all font-bold tracking-wide cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 text-center select-none"
            style={{
              background: showClashArena ? 'rgba(20,241,149,0.1)' : 'rgba(167,139,250,0.14)',
              borderColor: showClashArena ? 'rgba(20,241,149,0.3)' : 'rgba(167,139,250,0.3)',
              color: showClashArena ? '#14F195' : '#c084fc'
            }}
          >
            {showClashArena ? (
              <>
                <X size={12} /> Leave Battle Lounge
              </>
            ) : (
              <>
                <Swords size={12} /> Open On-Chain Duel Arena
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Embedded Clash / Battle Duel lounge */}
      {showClashArena && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in animate-duration-300" id="clash-battle-arena">
          
          {/* Left panel: configure duel & search rival */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-5 border-purple-500/10">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#a78bfa] block font-bold mb-1">Target Matchmaker</span>
              <h4 className="text-sm font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Summon Adversary</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                Type any Twitter handle, ENS / Solana address, or username. Our node will procedurally calculate their hold score and generate custom feedback.
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[9.5px] font-mono text-slate-500 uppercase font-black block tracking-widest mb-1.5">Rival Handle or Wallet</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">@</span>
                    <input
                      type="text"
                      value={rivalInput}
                      onChange={(e) => setRivalInput(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. vitalik, solana_whale, paper_hands_mike"
                      className="w-full bg-slate-950 border border-white/[0.06] rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 block font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleStartDuel(rivalInput)}
                  disabled={isDueling || !rivalInput.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border select-none disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] active:scale-95"
                >
                  <Swords size={13} />
                  {isDueling ? 'Analyzing Block Ledger...' : '⚔️ Initiate Reputation Duel'}
                </button>
              </div>

              {/* Suggestive rival prompts */}
              <div className="mt-4 pt-3 border-t border-white/[0.03] space-y-1.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Fast-track summoning presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['vitalik.eth', 'ansem_coindiff', 'exit_liquidity_matt', 'paper_hand_larry'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setRivalInput(preset);
                        handleStartDuel(preset);
                      }}
                      className="text-[9.5px] font-mono bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded border border-white/[0.03] transition-all cursor-pointer text-left"
                    >
                      @{preset}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* share suggestions advice */}
            <GlassCard className="p-4 border-white/[0.02] bg-[#0c0c16]/50">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#14F195] block font-bold mb-1 select-none">🔥 VIRAL PLAYBOOK</span>
              <h5 className="text-xs font-bold text-white font-sans">Why this goes viral instantly:</h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Reputation roast results trigger deep engagement. Mentioning notable influencer usernames or calling out friends creates an instant reaction loop in comment threads. Copy the raw verdict caption below to drive video traction!
              </p>
            </GlassCard>
          </div>

          {/* Right panel: Arena combat ground */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <GlassCard className="p-6 border-white/[0.05] bg-slate-950/40 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[360px]">
              {/* Battle grids & animations */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

              {isDueling ? (
                // Processing screen
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8 relative z-10 animate-pulse">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute -inset-1 rounded-full border border-purple-500/25 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-purple-400 animate-spin" style={{ animationDuration: '0.6s' }} />
                    <Swords className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-black text-purple-400 uppercase tracking-widest block">COMPARING WEB3 REPUTATION SEEDS</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Checking address priority hold... Gas history check: {duelProgress}% complete
                    </p>
                  </div>
                  <div className="w-1/2 h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.01]">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" style={{ width: `${duelProgress}%` }} />
                  </div>
                </div>
              ) : duelResult ? (
                // Duel active display
                <div className="space-y-5 relative z-10 flex-grow flex flex-col justify-between">
                  
                  {/* Duel stats comparison headers */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                    
                    {/* User Profile */}
                    <div className="md:col-span-5 p-4 rounded-2xl bg-purple-950/15 border border-purple-500/20 text-center space-y-1.5 relative">
                      {duelResult.winner === 'user' && (
                        <div className="absolute -top-3 py-0.5 bg-amber-400 text-black font-mono font-black text-[8px] uppercase px-2 rounded-full tracking-widest flex items-center gap-1 select-none shadow">
                          <Crown size={9} /> VICTOR
                        </div>
                      )}
                      <span className="text-[9px] uppercase font-mono tracking-wider text-purple-400 font-bold block">Current Challenger</span>
                      <h4 className="text-sm font-black text-white tracking-tight">@{user.username}</h4>
                      <div className="inline-flex items-center gap-1.5 justify-center bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/[0.03]">
                        <span className="text-[10.5px] font-mono text-purple-300 font-black">Score: {user.karmaScore}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        🔥 {user.streak}D Hold Streak
                      </div>
                    </div>

                    {/* Versus Shield logo spacer */}
                    <div className="md:col-span-1 text-center font-mono font-black text-xs text-rose-500 flex justify-center py-2 md:py-0">
                      <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(239,68,68,0.25)] select-none">
                        VS
                      </div>
                    </div>

                    {/* Rival Profile */}
                    <div className={`md:col-span-5 p-4 rounded-2xl border text-center space-y-1.5 relative ${
                      duelResult.winner === 'rival' 
                        ? 'bg-rose-950/15 border-rose-500/20' 
                        : 'bg-slate-950/80 border-white/[0.04]'
                    }`}>
                      {duelResult.winner === 'rival' && (
                        <div className="absolute -top-3 py-0.5 bg-amber-400 text-black font-mono font-black text-[8px] uppercase px-2 rounded-full tracking-widest flex items-center gap-1 select-none shadow">
                          <Crown size={9} /> VICTOR
                        </div>
                      )}
                      <span className={`text-[9px] uppercase font-mono tracking-wider font-bold block ${
                        duelResult.winner === 'rival' ? 'text-rose-400' : 'text-slate-500'
                      }`}>Procedural Opponent</span>
                      <h4 className="text-sm font-black text-white tracking-tight">@{duelResult.name}</h4>
                      <div className="inline-flex items-center gap-1.5 justify-center bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/[0.03]">
                        <span className="text-[10.5px] font-mono text-slate-300 font-black">Score: {duelResult.score}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {duelResult.title}
                      </div>
                    </div>

                  </div>

                  {/* Roast Verdict Block */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.04] space-y-2 relative">
                    <span className="text-[8px] uppercase font-mono text-[#fbbf24] bg-amber-500/10 px-2 py-0.5 rounded font-black tracking-widest">
                      ⚖️ Clash Verdict Roast
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed font-mono">
                      "{duelResult.roast}"
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-white/[0.04] pt-2 mt-1">
                      <span>Winner Advantage: <strong className="text-emerald-400">{duelResult.winner === 'user' ? duelResult.userAdvantage : duelResult.rivalAdvantage}</strong></span>
                      <span className="text-purple-400">Deterministic Seed Match</span>
                    </div>
                  </div>

                  {/* Copy tools for feed viral distribution */}
                  <div className="flex flex-col md:flex-row items-center gap-3 bg-purple-950/10 p-3 rounded-lg border border-purple-500/10 justify-between">
                    <div className="text-left font-mono space-y-0.5 mb-2 md:mb-0">
                      <span className="text-[8px] text-slate-500 block uppercase font-black">Copywriting Assist</span>
                      <div className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        🚀 Copy optimized duel text for comment sections & social feeds
                      </div>
                    </div>
                    
                    <button
                      onClick={copyDuelVerdict}
                      className="w-full md:w-auto py-2 px-4 rounded-lg bg-purple-500 text-white font-bold text-xs uppercase tracking-wide hover:bg-purple-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow select-none"
                    >
                      <Share2 size={12} />
                      {copyDuelSuccess ? 'Copied Verdict!' : 'Copy Duel Verdict'}
                    </button>
                  </div>

                </div>
              ) : (
                // Idle Screen
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3.5 py-12 relative z-10 text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400">
                    <Swords size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-300 font-sans uppercase">Duel Arena Ready</h5>
                    <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto mt-1">
                      Enter any username or wallet in the target search bar on the left, then click <strong>Initiate Reputation Duel</strong> to generate your comparative roast layout.
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

        </div>
      )}

      {/* SECURE CLAIMS LEDGER HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="relative w-full max-w-2xl bg-[#090915] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Header */}
            <div className="p-5 border-b border-white/[0.04] flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <span className="p-1 px-2.5 rounded-lg bg-[#c084fc]/10 text-[#c084fc] font-mono text-[10px] font-bold tracking-widest uppercase">
                  📜 SECURE LEDGER
                </span>
                <h3 className="text-sm font-bold text-white font-sans">
                  $AURA Points Claim Log
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedTx(null);
                }} 
                className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-2 p-5 bg-purple-950/10 border-b border-white/[0.02]">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/[0.02]">
                <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Accumulated Balance</span>
                <span className="text-sm font-mono font-bold text-amber-400 block mt-0.5">🪙 {totalPoints.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/[0.02]">
                <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Total Check-Ins</span>
                <span className="text-sm font-mono font-bold text-purple-400 block mt-0.5">{claimHistory.length} Cycles</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/[0.02]">
                <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Highest Multiplier</span>
                <span className="text-sm font-mono font-bold text-[#14F195] block mt-0.5">
                  x{claimHistory.length > 0 ? Math.max(...claimHistory.map(h => h.multiplier)).toFixed(2) : streakMultiplier}
                </span>
              </div>
            </div>

            {/* Search Filter */}
            <div className="p-4 border-b border-white/[0.02] bg-slate-950/20">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by transaction hash, streak, or amount..."
                  className="w-full bg-slate-950 border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 transition-all font-sans"
                />
              </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Detailed Expanded Transaction Panel */}
              {selectedTx && (
                <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-500/25 space-y-3 animate-fade-in animate-duration-150">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-black select-none">
                        SIMULATED ON-CHAIN AUTHENTICATION
                      </span>
                      <h4 className="text-xs font-bold text-white font-sans mt-0.5">
                        Cryptographic Checksum Details
                      </h4>
                    </div>
                    <button 
                      onClick={() => setSelectedTx(null)}
                      className="text-[9.5px] font-mono text-slate-400 hover:text-white hover:underline cursor-pointer"
                    >
                      Close Details [x]
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center py-1">
                    <div className="bg-slate-950 p-2 rounded-lg border border-white/[0.03] space-y-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">Validator Proof</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">✓ PASS</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-white/[0.03] space-y-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">Block Height</span>
                      <span className="text-[10px] font-mono text-slate-300 font-bold block">#19,257,309</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-white/[0.03] space-y-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">Transit Method</span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold block">ECDSA Secp256k1</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-white/[0.03] space-y-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">Gas Levy</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">0.000000 SOL</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-white/[0.04] text-[10px] font-mono space-y-1 block max-w-full overflow-x-auto text-slate-400">
                    <div><span className="text-slate-600">Origin:</span> {user.address}</div>
                    <div className="truncate"><span className="text-slate-600">Claims Hash:</span> <strong className="text-[#fbbf24]">{selectedTx.txHash}</strong></div>
                    <div><span className="text-slate-600">Points Allocated:</span> 🪙 {selectedTx.amount} (base: {selectedTx.streak * 250}, mult: x{selectedTx.multiplier})</div>
                    <div><span className="text-slate-600">Timestamp:</span> {new Date(selectedTx.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Claims List */}
              <div className="space-y-2">
                {claimHistory.filter(item => {
                  const query = searchQuery.toLowerCase();
                  return (
                    item.txHash.toLowerCase().includes(query) ||
                    item.amount.toString().includes(query) ||
                    item.streak.toString().includes(query) ||
                    new Date(item.timestamp).toLocaleDateString().toLowerCase().includes(query)
                  );
                }).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <span>🔍 No matching transactions found</span>
                    <p className="text-[11px] text-slate-600 max-w-xs mx-auto text-center">
                      Try refining your search query or keep claiming to populate the ledger database.
                    </p>
                  </div>
                ) : (
                  claimHistory
                    .filter(item => {
                      const query = searchQuery.toLowerCase();
                      return (
                        item.txHash.toLowerCase().includes(query) ||
                        item.amount.toString().includes(query) ||
                        item.streak.toString().includes(query) ||
                        new Date(item.timestamp).toLocaleDateString().toLowerCase().includes(query)
                      );
                    })
                    .map((item) => {
                      const isSelected = selectedTx?.id === item.id;
                      return (
                        <div 
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isSelected 
                              ? 'bg-purple-950/10 border-purple-500/40 shadow-sm'
                              : 'bg-slate-950/40 border-white/[0.03] hover:border-white/[0.08]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-black text-[#14F195]">
                                🪙 +{item.amount.toLocaleString()} $AURA
                              </span>
                              <span className="text-[8.5px] bg-[#fbbf24]/10 border border-[#fbbf24]/15 text-[#fbbf24] px-1.5 py-0.2 rounded font-mono font-bold select-none uppercase">
                                🔥 {item.streak}D Streak
                              </span>
                              <span className="text-[8.5px] bg-purple-500/10 text-purple-300 px-1.5 py-0.2 rounded font-mono select-none">
                                x{item.multiplier}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                              <Clock size={10} />
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                              <span className="text-slate-700">|</span>
                              <span className="truncate max-w-[120px] select-all cursor-copy md:max-w-none text-[9px] hover:text-slate-400">
                                {item.txHash}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center">
                            <span className="text-[9.5px] text-slate-500 font-mono flex items-center gap-1">
                              <ShieldCheck size={11} className="text-[#14F195]" /> Settled
                            </span>
                            <button
                              onClick={() => {
                                if (isSelected) setSelectedTx(null);
                                else setSelectedTx(item);
                              }}
                              className="px-2.5 py-1 text-[9.5px] font-mono text-purple-400 hover:text-purple-300 bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/15 hover:border-purple-400/30 rounded-lg transition-all cursor-pointer"
                            >
                              Verify Proof {isSelected ? '▴' : '▾'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.04] bg-slate-950/70 text-center text-[10px] text-slate-500 font-mono tracking-wide flex justify-between items-center px-6">
              <span>SANDBOX COMPLIANCE</span>
              <span>STATE: SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
