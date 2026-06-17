import { useState, useEffect } from 'react';
import { User, AuraClaimRecord } from '../types';
import {
  Flame, Sparkles, Check, Coins, Copy, ChevronRight,
  Clock, ExternalLink, X, Search, Swords, Zap, Crown,
  TrendingUp, RefreshCw, Trophy, Star, AlertTriangle
} from 'lucide-react';
import GlassCard from './GlassCard';

// ─────────────────────────────────────────────────────────────────────
// Constants — 7 Trillion supply theme
// ─────────────────────────────────────────────────────────────────────
const TOTAL_SUPPLY    = 7_000_000_000_000; // 7 trillion
const TRILLION        = 1_000_000_000_000;
const BILLION         = 1_000_000_000;

function fmtAura(n: number): string {
  if (n >= TRILLION)  return (n / TRILLION).toFixed(3)  + 'T';
  if (n >= BILLION)   return (n / BILLION).toFixed(2)   + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

// ─────────────────────────────────────────────────────────────────────
interface AuraAirdropPortalProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

export default function AuraAirdropPortal({ user, onUpdateUser }: AuraAirdropPortalProps) {
  // ── Aura state (loaded from backend) ─────────────────────────────
  const [auraPoints,       setAuraPoints]       = useState<number>(user.auraPoints || 0);
  const [totalAuraClaimed, setTotalAuraClaimed] = useState<number>(user.totalAuraClaimed || user.auraPoints || 0);
  const [claimHistory,     setClaimHistory]     = useState<AuraClaimRecord[]>(user.auraClaimHistory || []);
  const [hasClaimed,       setHasClaimed]       = useState<boolean>(false);
  const [statsLoaded,      setStatsLoaded]      = useState<boolean>(false);
  const [statsError,       setStatsError]       = useState<string>('');

  // ── Claim UI state ────────────────────────────────────────────────
  const [isClaiming,      setIsClaiming]      = useState(false);
  const [claimProgress,   setClaimProgress]   = useState(0);
  const [claimSuccess,    setClaimSuccess]    = useState(false);
  const [claimError,      setClaimError]      = useState('');
  const [lastClaimAmount, setLastClaimAmount] = useState(0);

  // ── Duel arena ───────────────────────────────────────────────────
  const [showClashArena, setShowClashArena] = useState(false);
  const [rivalInput,     setRivalInput]     = useState('');
  const [isDueling,      setIsDueling]      = useState(false);
  const [duelProgress,   setDuelProgress]   = useState(0);
  const [duelResult,     setDuelResult]     = useState<any>(null);
  const [copyDuelOk,     setCopyDuelOk]     = useState(false);

  // ── History modal ─────────────────────────────────────────────────
  const [showHistory,  setShowHistory]  = useState(false);
  const [historySearch,setHistorySearch]= useState('');
  const [selectedTx,   setSelectedTx]   = useState<AuraClaimRecord | null>(null);

  // ── Derived calculations ──────────────────────────────────────────
  const streak           = user.streak || 1;
  const basePoints       = streak * 250;
  const multiplier       = parseFloat((1 + streak * 0.15).toFixed(2));
  const claimableAmount  = Math.round(basePoints * multiplier);
  const isSandbox        = !user.address || user.address.length !== 42 || !user.address.startsWith('0x');

  // Global simulated distribution (deterministic per address, feels live)
  const addrSeed = user.address.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const globalDistributed = Math.floor(TOTAL_SUPPLY * (0.012 + (addrSeed % 1000) / 100000));
  const globalPct = (globalDistributed / TOTAL_SUPPLY) * 100;

  // User's progress toward 1 trillion (Elon milestone)
  const userToTrillionPct = Math.min(100, (totalAuraClaimed / TRILLION) * 100);

  // ── On-mount: load live aura stats from backend ───────────────────
  useEffect(() => {
    const isDemoOrSandbox = isSandbox || user.wallet?.id === 'sandbox_wallet';
    if (isDemoOrSandbox) {
      // In demo/sandbox mode, build plausible stats from local data
      const today = new Date().toISOString().split('T')[0];
      setHasClaimed(user.lastClaimedAt === today);
      setAuraPoints(user.auraPoints || 0);
      setTotalAuraClaimed(user.totalAuraClaimed || user.auraPoints || 0);
      setClaimHistory(user.auraClaimHistory || []);
      setStatsLoaded(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/aura/stats/${user.address}`);
        if (res.ok) {
          const data = await res.json();
          setAuraPoints(data.auraPoints);
          setTotalAuraClaimed(data.totalAuraClaimed);
          setHasClaimed(data.claimedToday);
          setClaimHistory(data.auraClaimHistory || []);
          // Sync back to user object in case profile was out of date
          onUpdateUser({
            ...user,
            auraPoints: data.auraPoints,
            totalAuraClaimed: data.totalAuraClaimed,
            lastClaimedAt: data.lastClaimedAt,
            auraClaimHistory: data.auraClaimHistory || [],
          });
        }
      } catch (e) {
        setStatsError('Could not reach server — showing cached data.');
        const today = new Date().toISOString().split('T')[0];
        setHasClaimed(user.lastClaimedAt === today);
      } finally {
        setStatsLoaded(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.address]);

  // ── Claim handler (hits backend) ─────────────────────────────────
  async function handleClaim() {
    if (hasClaimed || isClaiming) return;
    setIsClaiming(true);
    setClaimError('');
    setClaimProgress(0);

    // Animate progress bar
    const tick = setInterval(() => setClaimProgress(p => p >= 85 ? 85 : p + 12), 120);

    try {
      // Sandbox / demo fallback
      const isDemoOrSandbox = isSandbox || user.wallet?.id === 'sandbox_wallet';
      let data: any;

      if (isDemoOrSandbox) {
        await new Promise(r => setTimeout(r, 900));
        const today = new Date().toISOString().split('T')[0];
        const newAura = auraPoints + claimableAmount;
        const newTotal = totalAuraClaimed + claimableAmount;
        const rec: AuraClaimRecord = {
          id: `claim-${Date.now()}`,
          timestamp: new Date().toISOString(),
          amount: claimableAmount,
          multiplier,
          streak,
          txHash: `0xsandbox${Date.now().toString(16)}`,
          status: 'Settled',
        };
        data = {
          success: true,
          claimedAmount: claimableAmount,
          auraPoints: newAura,
          totalAuraClaimed: newTotal,
          lastClaimedAt: today,
          claimRecord: rec,
          auraClaimHistory: [rec, ...claimHistory].slice(0, 50),
          karmaScore: Math.min(1000, user.karmaScore + 35),
        };
      } else {
        const res = await fetch('/api/aura/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.address }),
        });
        data = await res.json();
        if (!res.ok && !data.alreadyClaimed) {
          throw new Error(data.error || 'Claim failed');
        }
      }

      clearInterval(tick);
      setClaimProgress(100);

      if (data.alreadyClaimed) {
        setHasClaimed(true);
        setAuraPoints(data.auraPoints);
        setTotalAuraClaimed(data.totalAuraClaimed);
        setClaimHistory(data.auraClaimHistory || claimHistory);
      } else {
        setLastClaimAmount(data.claimedAmount);
        setAuraPoints(data.auraPoints);
        setTotalAuraClaimed(data.totalAuraClaimed);
        setHasClaimed(true);
        setClaimSuccess(true);
        if (data.auraClaimHistory) setClaimHistory(data.auraClaimHistory);

        onUpdateUser({
          ...user,
          auraPoints: data.auraPoints,
          totalAuraClaimed: data.totalAuraClaimed,
          lastClaimedAt: data.lastClaimedAt,
          auraClaimHistory: data.auraClaimHistory || claimHistory,
          karmaScore: data.karmaScore ?? user.karmaScore,
        });
      }
    } catch (err: any) {
      clearInterval(tick);
      setClaimError(err?.message || 'Claim failed. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  }

  // ── Duel logic ────────────────────────────────────────────────────
  function handleStartDuel(rivalName: string) {
    if (!rivalName.trim() || isDueling) return;
    setIsDueling(true);
    setDuelProgress(0);
    setDuelResult(null);

    let p = 0;
    const iv = setInterval(() => {
      p += 10;
      if (p >= 100) {
        clearInterval(iv);
        const seed = rivalName.toLowerCase().trim().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const rivalScore = 320 + (seed * 843) % 521;
        const rivalStreak = 1 + (seed * 419) % 28;
        const titles = ['Panic Selling Goblin 👺','Leverage High-Roller 🃏','Gas War Survivor ⛽','Meme Bag Cultist 💎','Exit Liquidity Contributor 💀','On-Chain Yield Master 🌾','Diamond-Handed Oracle 🔮','Airdrop Hunter Ninja 🥷'];
        const roasts  = ['Caught panic-selling the local bottom on 3 different chains. Absolute exit liquidity behavior.','Owns NFTs down 99.8% but maintains they are "multigenerational utility hedges".','Once paid $320 in gas to mint a duplicate meme coin. True sovereign explorer!','Wallet shows zero reputation history, yet lists "Web3 Advisor" on socials.','Verified ledger shows textbook Paper Hands syndrome under rigorous stress testing.','Believes holding 24 hours qualifies as a "long-term strategic position".'];
        setDuelResult({
          name: rivalName.toLowerCase().replace('@',''),
          score: rivalScore,
          streak: rivalStreak,
          title: titles[seed % titles.length],
          roast: roasts[seed % roasts.length],
          winner: user.karmaScore >= rivalScore ? 'user' : 'rival',
        });
        setIsDueling(false);
        setDuelProgress(100);
      } else {
        setDuelProgress(p);
      }
    }, 120);
  }

  function copyDuelVerdict() {
    if (!duelResult) return;
    const winner = duelResult.winner === 'user' ? `👑 @${user.username}` : `💀 @${duelResult.name}`;
    navigator.clipboard.writeText(
      `⚔️ ON-CHAIN REPUTATION BATTLE ⚔️\n\n@${user.username} vs @${duelResult.name}\n\n🏆 Winner: ${winner}\n\nMy Karma: ${user.karmaScore}/1000 · Rival: ${duelResult.score}/1000\n\n"${duelResult.roast}"\n\nRace for a Trillionaire starts with $AURA → KarmaAI\n\n#KarmaDuel #SovereignAura #Web3 #RaceForTrillionaire`
    );
    setCopyDuelOk(true);
    setTimeout(() => setCopyDuelOk(false), 3000);
  }

  // ── History modal filter ──────────────────────────────────────────
  const filteredHistory = claimHistory.filter(r =>
    historySearch ? r.txHash.includes(historySearch) || fmtDate(r.timestamp).toLowerCase().includes(historySearch.toLowerCase()) : true
  );

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" id="aura-airdrop-portal">

      {/* ── HERO: Race for a Trillionaire ────────────────────────── */}
      <GlassCard className="p-0 overflow-hidden border-amber-500/15 relative" style={{ background: 'linear-gradient(135deg, rgba(7,7,14,0.95), rgba(20,10,40,0.9))' }}>
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/[0.05] rounded-full blur-3xl pointer-events-none" />

        {/* Top banner */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">🏆</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-black">Race for a Trillionaire</span>
                <span className="text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">7T Supply</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5 leading-none" style={{ fontFamily:"'Syne',sans-serif" }}>
                $AURA Token Claim Forge
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-1.5 text-[9.5px] font-mono text-purple-300 border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            >
              📜 Claim History
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Global 7T race bar ── */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-amber-400 shrink-0" />
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">Global Distribution Progress</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">
                {fmtAura(globalDistributed)} / 7T distributed
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/[0.03]">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width:`${Math.max(0.3,globalPct)}%`, background:'linear-gradient(90deg,#f59e0b,#fbbf24,#14F195)' }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>0</span>
              <span className="text-amber-400 font-bold">First Trillionaire Target: 1T $AURA</span>
              <span>7T</span>
            </div>
          </div>

          {/* ── Elon reference + race message ── */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.05] to-purple-500/[0.04] border border-amber-500/[0.12]">
            <span className="text-2xl shrink-0">🌍</span>
            <div>
              <div className="text-xs font-bold text-amber-300 leading-snug">
                Elon Musk became Earth's first trillionaire. In $AURA, <em className="text-white not-italic">the race has just begun.</em>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                7 trillion $AURA tokens. One race. Your daily claim is your entry ticket. Hold longer — earn more. The blockchain never forgets.
              </div>
            </div>
          </div>

          {/* ── User stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/[0.1] text-center">
              <span className="text-[8px] font-mono text-amber-500 uppercase tracking-wider block font-bold mb-1">Total Claimed</span>
              <span className="text-lg font-extrabold text-amber-400 block leading-none font-mono">{fmtAura(totalAuraClaimed)}</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">since joining</span>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/[0.1] text-center">
              <span className="text-[8px] font-mono text-purple-400 uppercase tracking-wider block font-bold mb-1">Today's Reward</span>
              <span className="text-lg font-extrabold text-purple-300 block leading-none font-mono">+{fmtAura(claimableAmount)}</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">x{multiplier} mult</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/[0.1] text-center">
              <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider block font-bold mb-1">Claim Days</span>
              <span className="text-lg font-extrabold text-emerald-300 block leading-none font-mono">{claimHistory.length}</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">total claims</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/[0.1] text-center">
              <span className="text-[8px] font-mono text-blue-400 uppercase tracking-wider block font-bold mb-1">To 1 Trillion</span>
              <span className="text-lg font-extrabold text-blue-300 block leading-none font-mono">{userToTrillionPct < 0.001 ? '<0.001' : userToTrillionPct.toFixed(4)}%</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">of 1T goal</span>
            </div>
          </div>

          {/* ── Claim button row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Calculation breakdown */}
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Your <strong>{streak}-day holding streak</strong> generates <strong>{basePoints.toLocaleString()} base $AURA</strong> amplified by a <strong className="text-purple-300">x{multiplier} velocity multiplier</strong>. Claim every 24h UTC to stack your trillionaire progress.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                  <span className="text-[7.5px] text-slate-500 uppercase block font-bold mb-0.5">Base</span>
                  <span className="text-sm font-bold text-slate-200">{basePoints.toLocaleString()}</span>
                  <span className="text-[7.5px] text-slate-500 block mt-0.5">250 × {streak}d</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/10">
                  <span className="text-[7.5px] text-purple-400 uppercase block font-bold mb-0.5">Mult.</span>
                  <span className="text-sm font-bold text-purple-300">×{multiplier}</span>
                  <span className="text-[7.5px] text-purple-500 block mt-0.5">+15%/day</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/10">
                  <span className="text-[7.5px] text-amber-400 uppercase block font-bold mb-0.5">Reward</span>
                  <span className="text-sm font-extrabold text-[#14F195]">+{claimableAmount.toLocaleString()}</span>
                  <span className="text-[7.5px] text-slate-500 block mt-0.5">$AURA</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono leading-normal">
                ⚡ Claiming adds <strong className="text-emerald-400">+35 Karma score</strong> and advances your position in the $AURA Trillionaire Race. Resets 00:00 UTC daily.
              </div>
            </div>

            {/* CTA button */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/30 rounded-2xl border border-white/[0.03] min-h-[160px]">
              {!statsLoaded ? (
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-t-amber-400 animate-spin mx-auto" />
                  <span className="text-[10px] font-mono text-slate-500 block">Loading aura data…</span>
                </div>
              ) : isClaiming ? (
                <div className="w-full text-center space-y-3">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 animate-spin" style={{ animationDuration:'0.8s' }} />
                    <Coins size={22} className="text-amber-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block animate-pulse">Forging Aura Blocks…</span>
                    <div className="h-1.5 w-36 bg-white/[0.04] rounded-full mx-auto overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-150" style={{ width:`${claimProgress}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block">{claimProgress}% — Saving to ledger</span>
                  </div>
                </div>
              ) : hasClaimed ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <Check size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 block uppercase tracking-wider">Claimed Today ✓</span>
                    {claimSuccess && lastClaimAmount > 0 && (
                      <span className="text-[10px] text-amber-400 font-mono font-bold block mt-1">+{lastClaimAmount.toLocaleString()} $AURA saved to ledger</span>
                    )}
                    <p className="text-[10px] text-slate-400 leading-normal mt-1.5 max-w-[200px] mx-auto">
                      Reputation updated. <span className="text-emerald-300">+35 Karma</span> applied. Come back tomorrow!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 w-full">
                  {claimError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] text-left">
                      <AlertTriangle size={12} className="shrink-0" />
                      {claimError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleClaim}
                    className="w-full max-w-[240px] mx-auto py-3.5 px-5 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-2 group"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)' }}
                  >
                    <Flame size={14} className="fill-current group-hover:scale-110 transition-transform" />
                    Claim {fmtAura(claimableAmount)} $AURA
                  </button>
                  <div className="text-[9.5px] text-slate-500 font-mono text-center max-w-[200px] mx-auto">
                    Persists to ledger. <span className="text-amber-400/70">Points never expire.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {statsError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-amber-300/70 text-[10px] font-mono">
              <AlertTriangle size={11} />
              {statsError}
            </div>
          )}

          {/* ── Recent claims preview ── */}
          {claimHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Recent Claims</span>
                {claimHistory.length > 3 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-[9px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer border-none bg-transparent"
                  >
                    View all ({claimHistory.length})
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {claimHistory.slice(0, 3).map(rec => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-white/[0.04] hover:bg-white/[0.02] transition-all cursor-pointer group"
                    onClick={() => { setSelectedTx(rec); setShowHistory(true); }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Coins size={12} className="text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-300 block">+{rec.amount.toLocaleString()} $AURA</span>
                        <span className="text-[8.5px] font-mono text-slate-500 block">{fmtDate(rec.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-[8.5px] font-mono text-purple-400 block">×{rec.multiplier}</span>
                        <span className="text-[8px] font-mono text-slate-600 block">{rec.streak}d streak</span>
                      </div>
                      <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Duel arena toggle ── */}
        <div className="mx-6 mb-6 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/[0.07] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-3">
            <span className="bg-[#14F195]/10 text-[#14F195] p-2 rounded-xl border border-[#14F195]/15 text-sm shrink-0">⚔️</span>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                On-Chain Battle Arena
                <span className="bg-[#14F195]/15 text-[#14F195] text-[7px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Viral</span>
              </h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5 max-w-lg">
                Duel any wallet or username — generates a custom roast report for TikTok or X.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowClashArena(v => !v)}
            className="shrink-0 text-xs px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 border transition-all"
            style={{
              background: showClashArena ? 'rgba(20,241,149,0.1)'  : 'rgba(167,139,250,0.1)',
              borderColor:showClashArena ? 'rgba(20,241,149,0.3)'  : 'rgba(167,139,250,0.3)',
              color:       showClashArena ? '#14F195'               : '#c084fc'
            }}
          >
            {showClashArena ? <><X size={12}/> Close Arena</> : <><Swords size={12}/> Open Duel Arena</>}
          </button>
        </div>
      </GlassCard>

      {/* ── Duel arena panel ───────────────────────────────────────── */}
      {showClashArena && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Input */}
          <div className="lg:col-span-4">
            <GlassCard className="p-5 border-purple-500/10 h-full">
              <span className="text-[9px] uppercase font-mono tracking-widest text-purple-400 block font-bold mb-1">Target Matchmaker</span>
              <h4 className="text-sm font-black text-white mb-1" style={{ fontFamily:"'Syne',sans-serif" }}>Summon Adversary</h4>
              <p className="text-[10.5px] text-slate-400 mb-4 leading-relaxed">Enter any Twitter handle, ENS, or Karma username to calculate a reputation duel verdict.</p>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    value={rivalInput}
                    onChange={e => setRivalInput(e.target.value.replace(/\s+/g,''))}
                    onKeyDown={e => e.key === 'Enter' && handleStartDuel(rivalInput)}
                    placeholder="vitalik, paper_hands_mike…"
                    className="w-full bg-slate-950 border border-white/[0.06] rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <button
                  onClick={() => handleStartDuel(rivalInput)}
                  disabled={isDueling || !rivalInput.trim()}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] active:scale-95"
                >
                  <Swords size={13} />
                  {isDueling ? 'Analyzing Ledger…' : '⚔️ Initiate Duel'}
                </button>
                {isDueling && (
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-100" style={{ width:`${duelProgress}%` }} />
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.03]">
                <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider mb-1.5">Quick summon:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['vitalik.eth','paper_hand_larry','exit_liq_mike','degen_master'].map(p => (
                    <button key={p} onClick={() => { setRivalInput(p); handleStartDuel(p); }}
                      className="text-[9px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 px-2.5 py-1 rounded border border-white/[0.04] cursor-pointer transition-all">
                      @{p}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Result */}
          <div className="lg:col-span-8">
            {duelResult ? (
              <GlassCard className="p-5 border-purple-500/15 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] uppercase font-mono tracking-widest font-bold" style={{ color: duelResult.winner === 'user' ? '#14F195' : '#f87171' }}>
                    {duelResult.winner === 'user' ? '🏆 You WIN' : duelResult.winner === 'draw' ? '🤝 Draw' : '💀 Rival Wins'}
                  </span>
                  <button
                    onClick={copyDuelVerdict}
                    className="text-[9.5px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
                    style={{ borderColor:'rgba(20,241,149,0.25)', background:'rgba(20,241,149,0.08)', color:'#14F195' }}
                  >
                    {copyDuelOk ? <Check size={11}/> : <Copy size={11}/>}
                    {copyDuelOk ? 'Copied!' : 'Copy for X / TikTok'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'You', name: user.username, score: user.karmaScore, streak: user.streak, isMe: true, win: duelResult.winner === 'user' },
                    { label: 'Rival', name: duelResult.name, score: duelResult.score, streak: duelResult.streak, isMe: false, win: duelResult.winner === 'rival' }
                  ].map(p => (
                    <div key={p.label} className="p-4 rounded-2xl border text-center"
                      style={{ borderColor: p.win ? 'rgba(20,241,149,0.3)' : 'rgba(255,255,255,0.06)', background: p.win ? 'rgba(20,241,149,0.04)' : 'rgba(255,255,255,0.01)' }}>
                      <span className="text-[8.5px] font-mono uppercase tracking-widest block mb-1" style={{ color: p.win ? '#14F195' : '#94a3b8' }}>{p.label}</span>
                      <span className="text-sm font-extrabold block" style={{ color: p.win ? '#14F195' : '#e2e8f0' }}>@{p.name}</span>
                      <span className="text-xl font-black block mt-1" style={{ color: p.win ? '#14F195' : '#a78bfa' }}>{p.score}</span>
                      <span className="text-[8.5px] font-mono text-slate-500 block">🔥 {p.streak}d streak</span>
                      {!p.isMe && <span className="text-[8px] font-mono text-slate-500 block mt-1 italic">{duelResult.title}</span>}
                    </div>
                  ))}
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Duel Verdict</span>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed italic">"{duelResult.roast}"</p>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-5 h-full flex items-center justify-center" style={{ minHeight: 180 }}>
                <div className="text-center space-y-2 opacity-40">
                  <Swords size={28} className="mx-auto text-purple-400" />
                  <p className="text-xs font-mono text-slate-400">Enter a rival to start the duel</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* ── History Modal ───────────────────────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-[250] overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => { setShowHistory(false); setSelectedTx(null); }} />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-[560px]" style={{ animation:'fadeUp 0.25s ease' }}>
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.04] flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-lg" style={{ fontFamily:"'Syne',sans-serif" }}>Aura Claim Ledger</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">@{user.username} · {claimHistory.length} total claims · {fmtAura(totalAuraClaimed)} $AURA earned</p>
                  </div>
                  <button onClick={() => { setShowHistory(false); setSelectedTx(null); }} className="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* Total box */}
                <div className="mx-6 mt-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.07] to-purple-500/[0.05] border border-amber-500/[0.12]">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">All-Time $AURA Claimed</span>
                      <span className="text-3xl font-black text-amber-400 font-mono">{fmtAura(totalAuraClaimed)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Race Progress</span>
                      <span className="text-base font-bold text-slate-300 font-mono">{userToTrillionPct < 0.001 ? '<0.001' : userToTrillionPct.toFixed(6)}%</span>
                      <span className="text-[8.5px] font-mono text-slate-500 block">of 1T milestone</span>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="px-6 pb-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3.5 top-2.5 text-slate-500" />
                    <input
                      type="text" value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      placeholder="Search by date or tx hash…"
                      className="w-full pl-8 pr-4 py-2 bg-slate-950/60 border border-white/[0.05] rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none focus:border-purple-500/30"
                    />
                  </div>
                </div>

                {/* History list */}
                <div className="overflow-y-auto max-h-[340px] px-6 pb-6 space-y-2">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-mono">No claim records found.</div>
                  ) : filteredHistory.map(rec => (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedTx(selectedTx?.id === rec.id ? null : rec)}
                      className="p-3.5 rounded-xl border cursor-pointer transition-all"
                      style={{
                        borderColor: selectedTx?.id === rec.id ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.05)',
                        background:  selectedTx?.id === rec.id ? 'rgba(167,139,250,0.05)' : 'rgba(255,255,255,0.01)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] flex items-center justify-center shrink-0">
                            <Coins size={13} className="text-amber-400" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-300 font-mono block">+{rec.amount.toLocaleString()} $AURA</span>
                            <span className="text-[8.5px] font-mono text-slate-500">{fmtDate(rec.timestamp)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-purple-400 block">×{rec.multiplier} mult</span>
                          <span className="text-[8.5px] font-mono text-slate-500">{rec.streak}d streak</span>
                        </div>
                      </div>
                      {selectedTx?.id === rec.id && (
                        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
                          <div className="flex items-center justify-between text-[9.5px] font-mono">
                            <span className="text-slate-500">Status</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1"><Check size={10}/> {rec.status}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[9px] font-mono">
                            <span className="text-slate-500 shrink-0">Tx Hash</span>
                            <span className="text-slate-300 break-all text-right">{rec.txHash}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
