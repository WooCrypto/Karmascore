import { useState } from 'react';
import { User, Wallet } from '../types';
import GlassCard from './GlassCard';
import Tag from './Tag';
import { getAura, PERSONALITIES } from '../constants';
import { generateUserProfile } from '../utils/generator';

interface WalletArenaProps {
  user: User;
}

const PRESET_OPPONENTS = [
  { id: 'satoshi', username: 'SatoshiPatience', name: 'SatoshiPatience', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', walletId: 'metamask' },
  { id: 'riskynode', username: 'RiskyNode', name: 'DumpMaster', address: '0x9965555111388b098defB751B7401B5f6d897efc', walletId: 'walletconnect' },
  { id: 'chainepl', username: 'ChainExplorer', name: 'ChainExplorer', address: '0x3fa1112faf1282f1cc34000109b81faabcc0ea12', walletId: 'trust' },
];

export default function WalletArena({ user }: WalletArenaProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('satoshi');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [battleReport, setBattleReport] = useState<string | null>(null);

  // Derive Opponent (Wallet B)
  const getOpponentUser = (): User => {
    if (customAddress.trim() && customUsername.trim()) {
      const mockWallet: Wallet = { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#f59e0b', desc: 'Secure software wallet' };
      return generateUserProfile(mockWallet, customUsername.trim(), customAddress.trim(), false);
    }

    const matched = PRESET_OPPONENTS.find(o => o.id === selectedPreset) || PRESET_OPPONENTS[0];
    const mockWallet: Wallet = { 
      id: matched.walletId, 
      name: matched.walletId === 'metamask' ? 'MetaMask' : matched.walletId === 'trust' ? 'Trust Wallet' : 'WalletConnect', 
      icon: matched.walletId === 'metamask' ? '🦊' : matched.walletId === 'trust' ? '🛡️' : '🔌',
      color: matched.walletId === 'metamask' ? '#f59e0b' : '#3b82f6',
      desc: 'Simulated battlefield wallet node'
    };
    return generateUserProfile(mockWallet, matched.username, matched.address, false);
  };

  const opponent = getOpponentUser();

  const userAura = getAura(user.karmaScore);
  const opponentAura = getAura(opponent.karmaScore);

  const getPercentageWinnerResult = () => {
    const diff = user.karmaScore - opponent.karmaScore;
    if (diff > 0) {
      return `🎉 You dominate @${opponent.username} by +${diff} points! Clean transaction discipline pays off.`;
    } else if (diff < 0) {
      return `⚠️ @${opponent.username} leads by +${Math.abs(diff)} points! Increase your token holding streak or participate in votes.`;
    } else {
      return `🤝 Absolute deadlock! Both profiles show symmetric holding conviction.`;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100" id="wallet-battle-arena">
      
      {/* Intro Header */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden border border-purple-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] block mb-1">VIRAL WEB3 UTILITY</span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          ⚔️ Sandbox Wallet Battle Arena
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Compare any two digital accounts side-by-side. Put your holding discipline and governance score to the proof! Enter a custom mock wallet below or select one of the legendary network veterans to pit against your rating.
        </p>
      </GlassCard>

      {/* Select Match Section */}
      <GlassCard className="p-6 bg-slate-950/20">
        <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-4">Choose Your Contender</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          {/* Preset Pick */}
          <div className="md:col-span-4">
            <label className="block text-xs text-slate-400 mb-2 font-mono">Preset Sandbox Competitors</label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                setCustomAddress('');
                setCustomUsername('');
              }}
              className="w-full px-4.5 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] text-slate-100 text-xs font-mono focus:border-purple-500/45 focus:outline-none"
            >
              <option value="satoshi">SatoshiPatience (Legendary - 94)</option>
              <option value="riskynode">RiskyNode (Active Trader - 65)</option>
              <option value="chainepl">ChainExplorer (Strong Builder - 79)</option>
            </select>
          </div>

          <div className="md:col-span-1 text-center text-xs font-mono font-bold text-slate-600 block pb-3">OR</div>

          {/* Custom Wallet Inputs */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">Custom Mock Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  setSelectedPreset('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] text-slate-100 text-xs font-mono focus:border-purple-500/45 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">Custom UsernameAlias</label>
              <input
                type="text"
                placeholder="e.g. whale_trader"
                value={customUsername}
                onChange={(e) => {
                  setCustomUsername(e.target.value);
                  setSelectedPreset('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] text-slate-100 text-xs font-sans focus:border-purple-500/45 focus:outline-none"
              />
            </div>
          </div>

        </div>
      </GlassCard>

      {/* Side-by-Side Arena Combat Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* WARRIOR A: CURRENT USER */}
        <GlassCard className="p-6 md:p-8 relative flex flex-col justify-between border-t-2 border-[#a78bfa]/40">
          <div className="text-center pb-6 border-b border-white/[0.05]">
            <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase">CONTENDER A (YOU)</span>
            <h4 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Syne', sans-serif" }}>@{user.username}</h4>
            <span className="text-[10.5px] font-mono text-slate-500">{user.address.slice(0,10)}...{user.address.slice(-6)}</span>
          </div>

          {/* Big Score Dial representation */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="text-5xl font-black text-[#a78bfa] font-mono mb-2">{user.karmaScore}</div>
            <Tag color={userAura.color}>{userAura.name} ({userAura.badge})</Tag>
          </div>

          {/* Stats breakdown */}
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Archetype Profile</span>
              <span className="font-bold font-mono text-[#a78bfa]">{user.personality}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Activity Streak</span>
              <span className="font-bold font-mono text-amber-400">{user.streak} Days 🔥</span>
            </div>
            
            {/* Pillars comparison bar */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Core Pillars</span>
              {user.categories?.map((cat) => (
                <div key={cat.label} className="text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{cat.label}</span>
                    <span className="font-bold font-mono" style={{ color: cat.color }}>{cat.value}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* WARRIOR B: OPPONENT */}
        <GlassCard className="p-6 md:p-8 relative flex flex-col justify-between border-t-2 border-amber-400/30 bg-slate-950/10">
          <div className="text-center pb-6 border-b border-white/[0.05]">
            <span className="text-[9px] font-mono tracking-widest text-[#fbbf24] uppercase">CONTENDER B</span>
            <h4 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Syne', sans-serif" }}>@{opponent.username}</h4>
            <span className="text-[10.5px] font-mono text-slate-500">{opponent.address.slice(0,10)}...{opponent.address.slice(-6)}</span>
          </div>

          {/* Big Score Dial representation */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="text-5xl font-black text-[#fbbf24] font-mono mb-2">{opponent.karmaScore}</div>
            <Tag color={opponentAura.color}>{opponentAura.name} ({opponentAura.badge})</Tag>
          </div>

          {/* Stats breakdown */}
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Archetype Profile</span>
              <span className="font-bold font-mono text-[#fbbf24]">{opponent.personality}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Activity Streak</span>
              <span className="font-bold font-mono text-amber-500">{opponent.streak} Days 🔥</span>
            </div>

            {/* Pillars comparison bar */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Core Pillars</span>
              {opponent.categories?.map((cat) => (
                <div key={cat.label} className="text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{cat.label}</span>
                    <span className="font-bold font-mono" style={{ color: cat.color }}>{cat.value}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Battle Verdict Box */}
      <GlassCard className="p-6 text-center border border-[#fbbf24]/20 bg-amber-500/5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block mb-1">ARENA VERDICT REPORT</span>
        <p className="text-md font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
          {getPercentageWinnerResult()}
        </p>
        
        {/* Dynamic score summary chart comparison info */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-center gap-6 text-[11px] text-slate-400 font-mono">
          <span>Winner category: <strong className="text-emerald-400">{user.karmaScore >= opponent.karmaScore ? 'Contender A' : 'Contender B'}</strong></span>
          <span>•</span>
          <span>Sovereign integrity multiplier: <strong>{user.streak > opponent.streak ? '1.2x Active' : 'Neutral'}</strong></span>
        </div>
      </GlassCard>

    </div>
  );
}
