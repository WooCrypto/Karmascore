import { useState } from 'react';
import { User, LeaderboardRow } from '../types';
import { AURAS, PERSONALITIES, BASE_LEADERBOARD, truncateWallet } from '../constants';
import GlassCard from './GlassCard';

interface LeaderboardProps {
  user?: User | null;
}

export default function Leaderboard({ user }: LeaderboardProps) {
  const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All Time'>('All Time');
  const [tab, setTab] = useState<'Top Karma' | 'Rising Fast' | 'Longest Streak' | 'Top Aura'>('Top Karma');
  const [sortField, setSortField] = useState<'rank' | 'identity' | 'personality' | 'score' | 'streak'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filters: Array<'Daily' | 'Weekly' | 'Monthly' | 'All Time'> = ['Daily', 'Weekly', 'Monthly', 'All Time'];
  const tabs: Array<'Top Karma' | 'Rising Fast' | 'Longest Streak' | 'Top Aura'> = ['Top Karma', 'Rising Fast', 'Longest Streak', 'Top Aura'];

  // Dynamically inject user inside the leaderboard to simulate live competition if connected
  const userRow: LeaderboardRow | null = user ? {
    rank: 4,
    wallet: user.address,
    username: user.username,
    hideWallet: user.hideWallet,
    personality: (user.personality || 'Visionary') as any,
    score: user.karmaScore,
    aura: 'Purple Aura',
    streak: user.streak,
    isMe: true,
  } : null;

  // Convert tab choice to sorting guidelines
  const handleTabClick = (t: 'Top Karma' | 'Rising Fast' | 'Longest Streak' | 'Top Aura') => {
    setTab(t);
    if (t === 'Top Karma') {
      setSortField('score');
      setSortDirection('desc');
    } else if (t === 'Longest Streak') {
      setSortField('streak');
      setSortDirection('desc');
    } else if (t === 'Top Aura') {
      setSortField('score');
      setSortDirection('desc');
    } else {
      // Rising Fast mix
      setSortField('streak');
      setSortDirection('desc');
    }
  };

  function handleHeaderClick(field: 'rank' | 'identity' | 'personality' | 'score' | 'streak') {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  // Generate share link of verified profile row with username fallback if active
  function handleShareRow(row: LeaderboardRow) {
    const handle = row.hideWallet ? `@${row.username}` : ((row.isMe && user) ? user.address : row.wallet);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://karma-ai.net';
    const link = `${origin}/?user=${encodeURIComponent(handle)}`;

    navigator.clipboard.writeText(link)
      .then(() => {
        setToastMessage(`Copied share link for @${row.username} to clipboard!`);
        setTimeout(() => setToastMessage(null), 3500);
      })
      .catch(() => {
        setToastMessage('Clipboard access restricted.');
        setTimeout(() => setToastMessage(null), 3000);
      });
  }

  // Merge lists and apply dynamic custom sorting over addresses/usernames
  const rows = [...BASE_LEADERBOARD.slice(0, 3), ...(userRow ? [userRow] : []), ...BASE_LEADERBOARD.slice(3)].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'score') {
      comparison = a.score - b.score;
    } else if (sortField === 'streak') {
      comparison = a.streak - b.streak;
    } else if (sortField === 'rank') {
      comparison = b.rank - a.rank; // lower rank number (1st, 2nd) shows at the top
    } else if (sortField === 'personality') {
      comparison = a.personality.localeCompare(b.personality);
    } else if (sortField === 'identity') {
      // If wallet is hidden, sort by username. Otherwise compare the raw address string representation.
      const aVal = a.hideWallet ? `@${a.username}` : ((a.isMe && user) ? user.address : a.wallet);
      const bVal = b.hideWallet ? `@${b.username}` : ((b.isMe && user) ? user.address : b.wallet);
      comparison = aVal.localeCompare(bVal);
    }

    return sortDirection === 'desc' ? -comparison : comparison;
  });

  // Re-adjust rank based on sorting choice or preserve index
  const rankedRows = rows.map((r, idx) => ({ ...r, displayRank: idx + 1 }));

  return (
    <div className="max-w-[900px] mx-auto pt-24 px-4 sm:px-6 pb-16 animate-fade-in text-slate-100" id="leaderboard-root-view">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-center sm:text-left">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-2">Global Reputation Index</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Leaderboard
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            The on-chain elite. Ranked by verifiable smart contract behavior, holding history, and ecosystem goodwill.
          </p>
        </div>
        
        {!user && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center md:text-left shrink-0 max-w-sm">
            <span className="text-xs text-purple-300 block font-bold mb-1 font-mono">✦ NOT INDEXED</span>
            <span className="text-[11px] text-slate-400 block leading-relaxed">
              Connect your sandbox wallet to join the ranked directory and customize your pseudonymous profile.
            </span>
          </div>
        )}
      </div>

      {/* Floating toast notification panel */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-purple-950 border border-purple-500/30 text-[#c084fc] rounded-xl text-xs font-mono shadow-2xl animate-fade-in">
          ✦ {toastMessage}
        </div>
      )}

      {/* Tabs and Filters Toggle rail */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => handleTabClick(t)}
              className="text-xs transition-all duration-200 px-3 py-2 rounded-lg border font-medium cursor-pointer flex-1 sm:flex-initial text-center"
              style={{
                background: tab === t ? 'rgba(167, 139, 250, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: tab === t ? 'rgba(167, 139, 250, 0.35)' : 'rgba(255, 255, 255, 0.07)',
                color: tab === t ? '#c084fc' : 'rgba(248, 250, 252, 0.45)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 w-full lg:w-auto overflow-x-auto justify-start lg:justify-end pb-1 lg:pb-0">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] uppercase font-mono tracking-wider transition-all px-2.5 py-1.5 rounded-md border cursor-pointer whitespace-nowrap"
              style={{
                background: filter === f ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: filter === f ? '#f8fafc' : 'rgba(248, 250, 252, 0.3)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Deck */}
      <GlassCard className="overflow-hidden w-full p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[650px]">
            {/* Table Head */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] bg-slate-950/40 text-[10px] font-mono tracking-widest text-slate-400 uppercase select-none">
              <button 
                onClick={() => handleHeaderClick('rank')}
                className="col-span-1 text-left bg-transparent border-none p-0 text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase hover:text-white cursor-pointer outline-none"
              >
                # {sortField === 'rank' && (sortDirection === 'desc' ? '▼' : '▲')}
              </button>
              <button 
                onClick={() => handleHeaderClick('identity')}
                className="col-span-4 text-left bg-transparent border-none p-0 text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase hover:text-white cursor-pointer outline-none"
              >
                Identity {sortField === 'identity' && (sortDirection === 'desc' ? '▼' : '▲')}
              </button>
              <button 
                onClick={() => handleHeaderClick('personality')}
                className="col-span-3 text-left bg-transparent border-none p-0 text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase hover:text-white cursor-pointer outline-none"
              >
                Personality {sortField === 'personality' && (sortDirection === 'desc' ? '▼' : '▲')}
              </button>
              <button 
                onClick={() => handleHeaderClick('score')}
                className="col-span-2 text-right bg-transparent border-none p-0 text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase hover:text-white cursor-pointer outline-none"
              >
                Score {sortField === 'score' && (sortDirection === 'desc' ? '▼' : '▲')}
              </button>
              <button 
                onClick={() => handleHeaderClick('streak')}
                className="col-span-2 text-right bg-transparent border-none p-0 text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase hover:text-white cursor-pointer outline-none"
              >
                Streak {sortField === 'streak' && (sortDirection === 'desc' ? '▼' : '▲')}
              </button>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {rankedRows.map((row) => {
                const auraDef = AURAS.find(a => row.score >= a.min && row.score <= a.max) || AURAS[4];
                const personalityDef = PERSONALITIES[row.personality] || PERSONALITIES.Visionary;
                const isMe = !!row.isMe;

                return (
                  <div
                    key={row.username}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all bg-white/[0.005] hover:bg-white/[0.02]"
                    style={{
                      background: isMe ? 'rgba(167, 139, 250, 0.06)' : 'transparent',
                      borderLeft: isMe ? '3px solid rgba(167, 139, 250, 0.65)' : '3px solid transparent',
                    }}
                  >
                    {/* Ranking Emblem */}
                    <div className="col-span-1 text-sm font-mono font-bold select-none">
                      {row.displayRank === 1 ? (
                        <span className="text-amber-400 font-extrabold text-base" title="1st Place Champion">🥇</span>
                      ) : row.displayRank === 2 ? (
                        <span className="text-slate-300 font-extrabold text-base" title="2nd Place Silver">🥈</span>
                      ) : row.displayRank === 3 ? (
                        <span className="text-amber-600 font-extrabold text-base" title="3rd Place Bronze">🥉</span>
                      ) : (
                        <span className="text-slate-500 font-normal">#{row.displayRank}</span>
                      )}
                    </div>

                    {/* Username and Address info */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-bold text-slate-100 text-sm hover:text-purple-300 transition-colors cursor-default"
                        >
                          @{row.username}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-mono tracking-wider font-extrabold bg-[#a78bfa]/20 text-[#c084fc] px-1.5 py-0.5 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      
                      {/* Sub address label showing username replacement consistently on toggle active */}
                      <div 
                        className="text-xs font-mono text-slate-500 mt-1 select-all hover:text-slate-300 transition-colors"
                        title={row.hideWallet ? `@${row.username} (Wallet identity hidden)` : ((isMe && user) ? user.address : row.wallet)}
                      >
                        {row.hideWallet ? `@${row.username}` : ((isMe && user) ? truncateWallet(user.address) : truncateWallet(row.wallet))}
                      </div>
                    </div>

                    {/* Archetype badge */}
                    <div className="col-span-3 flex items-center gap-2.5">
                      <span 
                        className="text-lg leading-none select-none" 
                        style={{ color: personalityDef.color, textShadow: `0 0 10px ${personalityDef.color}50` }}
                      >
                        {personalityDef.icon}
                      </span>
                      <span className="text-slate-300 text-xs font-medium md:inline hidden">{personalityDef.name}</span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-right">
                      <span 
                        className="text-lg font-bold" 
                        style={{ 
                          color: auraDef.color, 
                          fontFamily: "'Syne', sans-serif",
                          textShadow: `0 0 12px ${auraDef.color}88` 
                        }}
                      >
                        {row.score}
                      </span>
                      <span className="text-[9px] uppercase font-mono block text-slate-500 tracking-wider font-semibold">
                        {auraDef.badge}
                      </span>
                    </div>

                    {/* Streak count & copy share parameters */}
                    <div className="col-span-2 text-right flex flex-col items-end justify-center select-none">
                      <div className="text-xs font-semibold font-mono text-amber-500 flex items-center gap-1.5 justify-end">
                        {row.streak}d 🔥
                      </div>
                      <button
                        onClick={() => handleShareRow(row)}
                        className="mt-1 text-[9px] font-mono hover:text-[#a78bfa] text-slate-500 border-none bg-transparent hover:underline cursor-pointer flex items-center gap-0.5 p-0 transition-colors outline-none"
                        title={`Copy cryptographic share link for @${row.username}`}
                      >
                        ✦ Share Link
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Global disclaimer on anonymity */}
      <div className="mt-6 flex items-start gap-3 bg-slate-950/40 px-5 py-3.5 rounded-xl border border-white/[0.04]">
        <span className="text-sm mt-0.5">🔒</span>
        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Ledger records are public, but your identity profile details are synced locally to your current session. When the "Hide wallet address" option is active, we consistently swap raw physical client addresses with verified handles across index sorting, tooltips, and digital passport links.
        </span>
      </div>
    </div>
  );
}
