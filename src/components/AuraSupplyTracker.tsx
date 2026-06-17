import { useState, useEffect, useCallback } from 'react';
import { Crown, RefreshCw, TrendingUp, Users, Coins, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────
const TOTAL_SUPPLY = 7_000_000_000_000;
const TRILLION     = 1_000_000_000_000;
const BILLION      = 1_000_000_000;
const MILLION      = 1_000_000;

function fmt(n: number): string {
  if (n >= TRILLION)  return (n / TRILLION).toFixed(4)  + 'T';
  if (n >= BILLION)   return (n / BILLION).toFixed(3)   + 'B';
  if (n >= MILLION)   return (n / MILLION).toFixed(2)   + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
  return n.toLocaleString();
}

function truncAddr(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

interface GlobalStats {
  totalSupply: number;
  totalDistributed: number;
  totalClaimers: number;
  totalClaimEvents: number;
  percentDistributed: number;
  remainingSupply: number;
  top10Claimers: {
    username: string;
    address: string;
    hideWallet: boolean;
    totalClaimed: number;
    streak: number;
    personality: string;
  }[];
  updatedAt: string;
}

interface Props {
  onShowConnect?: () => void;
}

// ─────────────────────────────────────────────────────────────────────
export default function AuraSupplyTracker({ onShowConnect }: Props) {
  const [stats,     setStats]     = useState<GlobalStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [refreshed, setRefreshed] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchStats = useCallback(async (showBlink = false) => {
    try {
      const res = await fetch('/api/aura/global');
      if (!res.ok) throw new Error('Server error');
      const data: GlobalStats = await res.json();
      setStats(data);
      setError('');
      setLastFetch(new Date());
      if (showBlink) { setRefreshed(true); setTimeout(() => setRefreshed(false), 1400); }
    } catch {
      setError('Could not load global stats — showing estimated data.');
      // Deterministic fallback so the page never breaks
      if (!stats) {
        setStats({
          totalSupply: TOTAL_SUPPLY,
          totalDistributed: 0,
          totalClaimers: 0,
          totalClaimEvents: 0,
          percentDistributed: 0,
          remainingSupply: TOTAL_SUPPLY,
          top10Claimers: [],
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 60_000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const pct     = stats ? Math.max(0.05, stats.percentDistributed) : 0;
  const distrib = stats?.totalDistributed ?? 0;

  // ─────────────────────────────────────────────────────────────────
  return (
    <section
      id="aura-supply-tracker"
      className="py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(7,7,14,0) 0%, rgba(12,6,28,0.8) 50%, rgba(7,7,14,0) 100%)' }}
    >
      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #a78bfa 0%, transparent 70%)' }} />

      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Section header ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9.5px] font-mono uppercase tracking-widest text-amber-400 font-bold">Live · Public Distribution Counter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
            The $AURA Trillionaire Race
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            7 trillion $AURA tokens released to the world. Elon became Earth's first trillionaire.{' '}
            <strong className="text-white">Who claims it on-chain?</strong> Every daily claim is a move in the race.
          </p>
        </div>

        {/* ── Main progress bar card ── */}
        <div
          className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden"
          style={{ background: 'rgba(7,7,14,0.85)', borderColor: 'rgba(251,191,36,0.15)' }}
        >
          <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />

          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={16} className="text-amber-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">Total Supply Distributed</span>
              </div>
              {loading ? (
                <div className="h-9 w-48 bg-white/[0.04] rounded-xl animate-pulse" />
              ) : (
                <div className="text-4xl font-black text-amber-400 font-mono leading-none tracking-tight">
                  {fmt(distrib)} <span className="text-base text-slate-500 font-semibold">$AURA</span>
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                of 7,000,000,000,000 total supply
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchStats(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white text-[10px] font-mono uppercase tracking-wide transition-all cursor-pointer"
              >
                <RefreshCw size={11} className={refreshed ? 'animate-spin' : ''} />
                Refresh
              </button>
              {lastFetch && (
                <span className="text-[9px] font-mono text-slate-600">
                  {lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2 space-y-2">
            <div className="flex justify-between text-[9.5px] font-mono text-slate-500">
              <span>0</span>
              <span className="text-amber-400/80 font-bold">1T — First Trillionaire Milestone</span>
              <span>7T</span>
            </div>
            <div className="h-4 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/[0.04] relative">
              {/* 1T milestone marker */}
              <div className="absolute top-0 bottom-0 w-px bg-amber-400/40 z-10" style={{ left: `${(1/7)*100}%` }} />
              {!loading && (
                <div
                  className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #fbbf24)',
                    minWidth: distrib > 0 ? '4px' : '0',
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse [animation-duration:2s]" />
                </div>
              )}
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>{pct < 0.001 ? '< 0.001' : pct.toFixed(6)}% distributed</span>
              <span>{fmt(stats?.remainingSupply ?? TOTAL_SUPPLY)} remaining</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Coins size={13} className="text-amber-400" />,   label: 'Total Claimed',   value: loading ? '…' : fmt(distrib),                         sub: '$AURA' },
              { icon: <Users size={13} className="text-purple-400" />,   label: 'Active Claimers', value: loading ? '…' : (stats?.totalClaimers ?? 0).toLocaleString(), sub: 'wallets' },
              { icon: <Zap   size={13} className="text-emerald-400" />, label: 'Claim Events',    value: loading ? '…' : (stats?.totalClaimEvents ?? 0).toLocaleString(), sub: 'total' },
              { icon: <TrendingUp size={13} className="text-blue-400" />,label: 'Remaining',       value: loading ? '…' : fmt(stats?.remainingSupply ?? TOTAL_SUPPLY), sub: 'unclaimed' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.04] text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">{s.icon}<span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 font-bold">{s.label}</span></div>
                <div className="text-sm font-extrabold text-slate-100 font-mono">{s.value}</div>
                <div className="text-[8px] font-mono text-slate-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-[10px] font-mono text-amber-500/60 text-center">{error}</div>
          )}
        </div>

        {/* ── Leaderboard ── */}
        <div
          className="rounded-3xl border overflow-hidden"
          style={{ background: 'rgba(7,7,14,0.85)', borderColor: 'rgba(167,139,250,0.12)' }}
        >
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crown size={15} className="text-amber-400" />
              <h3 className="font-extrabold text-white text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                $AURA Trillionaire Leaderboard
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Top Claimers · All-Time</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : !stats?.top10Claimers?.length ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-sm font-bold text-slate-300 mb-1">No claims yet — be the first!</div>
              <p className="text-[11px] text-slate-500 mb-5 max-w-xs mx-auto">Connect your wallet and start claiming daily $AURA to appear on this leaderboard.</p>
              {onShowConnect && (
                <button
                  onClick={onShowConnect}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer border-none"
                  style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)' }}
                >
                  Connect Wallet →
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {stats.top10Claimers.map((claimer, i) => {
                const rankColors = ['#fbbf24','#94a3b8','#b45309','#a78bfa','#60a5fa'];
                const rankIcons  = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
                const color = rankColors[i] ?? '#64748b';
                const pctOfT = ((claimer.totalClaimed / TRILLION) * 100);
                return (
                  <div
                    key={claimer.address + i}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.015] transition-all"
                  >
                    {/* Rank */}
                    <div className="w-7 text-center shrink-0">
                      <span className="text-base">{rankIcons[i]}</span>
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border"
                      style={{ background: `${color}15`, borderColor: `${color}35`, color }}
                    >
                      {claimer.username.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 truncate">@{claimer.username}</span>
                        <span className="text-[8.5px] font-mono text-slate-500 shrink-0">{claimer.personality}</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                        {claimer.hideWallet ? '0x••••••••••••' : truncAddr(claimer.address)}
                        {' · '}🔥 {claimer.streak}d streak
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-sm font-mono" style={{ color }}>
                        {fmt(claimer.totalClaimed)}
                      </div>
                      <div className="text-[8.5px] font-mono text-slate-500 mt-0.5">
                        {pctOfT < 0.001 ? '<0.001' : pctOfT.toFixed(4)}% of 1T
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer CTA */}
          <div className="px-6 py-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/30">
            <p className="text-[10.5px] text-slate-500 leading-relaxed text-center sm:text-left">
              <strong className="text-slate-300">7 trillion $AURA.</strong> The race for a trillionaire is live. Every daily claim advances your position.
            </p>
            {onShowConnect && (
              <button
                onClick={onShowConnect}
                className="shrink-0 px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer border-none shadow-[0_0_20px_rgba(167,139,250,0.2)] hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', fontFamily:"'Syne',sans-serif" }}
              >
                Start Claiming →
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
