import { useState } from 'react';
import { User, ActivityEvent } from '../types';
import { getAura, PERSONALITIES, truncateWallet } from '../constants';
import GlassCard from './GlassCard';

interface ReputationTimelineProps {
  user: User;
}

interface TimelineItem {
  id: string;
  timestamp: string;
  type: 'milestone' | 'onchain';
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  badgeText?: string;
  icon: string;
  color: string;
  metadata?: {
    blockHeight?: string;
    network?: string;
    consensusHash?: string;
    gasSaved?: string;
    influenceImpact?: string;
  };
}

export default function ReputationTimeline({ user }: ReputationTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'milestones' | 'onchain'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chronicles' | 'milestones' | 'symbology'>('chronicles');

  const aura = getAura(user.karmaScore);
  const personality = PERSONALITIES[user.personality || 'Visionary'] || PERSONALITIES.Visionary;

  // Dynamically generate milestones and events calibrated to user's parameters
  const items: TimelineItem[] = [
    {
      id: 'ms-transcend',
      timestamp: 'Just Now',
      type: 'milestone',
      title: `Ascended to ${aura.name} Status`,
      description: `Your Reputation Quotient calibrated at ${user.karmaScore}/1000. Ranked as a ${aura.badge} user within the network registry.`,
      status: 'completed',
      badgeText: '✧ ASCENSION',
      icon: '✨',
      color: aura.color,
      metadata: {
        blockHeight: '19,842,912',
        network: user.wallet.name,
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: `+${(user.karmaScore * 0.02).toFixed(1)}% Governance Weight`
      }
    },
    {
      id: 'on-governance',
      timestamp: '2 hours ago',
      type: 'onchain',
      title: 'DAO Ballot Decrypted',
      description: 'Participation in multi-chain governance verified. Your vote contributed to decentralized infrastructure allocation guidelines.',
      status: 'completed',
      badgeText: '⚡ GOVERNANCE',
      icon: '🗳️',
      color: '#fbbf24', // Wisdom Orange
      metadata: {
        blockHeight: '19,842,401',
        network: 'Base',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: '4.8 Gwei saved via L2 bundling',
        influenceImpact: '+4 Wisdom Quotient'
      }
    },
    {
      id: 'ms-streak',
      timestamp: '1 day ago',
      type: 'milestone',
      title: `Holding Conviction: ${user.streak}-Day Milestone`,
      description: `Sustained consecutive hold parameters verified. Completed ${user.streak} distinct diurnal reputation cycles without exit operations.`,
      status: 'completed',
      badgeText: '🔥 STREAK',
      icon: '🔥',
      color: '#f97316',
      metadata: {
        blockHeight: '19,831,042',
        network: 'Solana',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: '+3.5x Multiplier to Loyalty Pillar'
      }
    },
    {
      id: 'on-rebalance',
      timestamp: '3 days ago',
      type: 'onchain',
      title: 'Synergistic Position Calibrated',
      description: 'Zero-friction balance re-allocation identified across verified digital asset holding entities.',
      status: 'completed',
      badgeText: '⚡ ASSET MATRIX',
      icon: '📊',
      color: '#34d399', // Generosity Green
      metadata: {
        blockHeight: '19,812,093',
        network: 'Ethereum',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: '11.2 Gwei optimized via gas-token dynamic indexing',
        influenceImpact: '+2 Energy Quotient'
      }
    },
    {
      id: 'ms-archetype',
      timestamp: '5 days ago',
      type: 'milestone',
      title: `Aligned with ${personality.name} Archetype`,
      description: `Advanced algorithmic pattern analysis completed. Your historical multi-chain signature matches the ${personality.name} profile characteristics.`,
      status: 'completed',
      badgeText: '☯ ALIGNMENT',
      icon: personality.icon,
      color: personality.color,
      metadata: {
        blockHeight: '19,794,841',
        network: 'Multi-Chain Validator Node',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: `Unlocked unique custom display vector: ${personality.name}`
      }
    },
    {
      id: 'on-staking',
      timestamp: '1 week ago',
      type: 'onchain',
      title: 'Longevity Smart Contract Activated',
      description: 'Sovereign digital assets locked into long-term commitment vault. Signals supreme patience paradigm behavior.',
      status: 'completed',
      badgeText: '⚡ DEEP YIELD',
      icon: '🔒',
      color: '#60a5fa', // Loyalty Blue
      metadata: {
        blockHeight: '19,701,234',
        network: 'BNB Chain',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: 'Zero-slippage pool allocation active',
        influenceImpact: '+6 Patience Factor'
      }
    },
    {
      id: 'ms-genesis',
      timestamp: 'Genesis Connection',
      type: 'milestone',
      title: 'Karma Passport Protocol Connected',
      description: `Cryptographic index initialized from ${truncateWallet(user.address)} using ${user.wallet.name} Client. Secure reputation pipeline authorized.`,
      status: 'completed',
      badgeText: '⚙ GENESIS',
      icon: '🌐',
      color: '#818cf8',
      metadata: {
        blockHeight: '19,650,119',
        network: user.wallet.name,
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: 'Reputation profile synchronized permanently inside decentralized local ledger.'
      }
    }
  ];

  const filteredItems = items.filter(item => {
    if (filter === 'milestones') return item.type === 'milestone';
    if (filter === 'onchain') return item.type === 'onchain';
    return true;
  });

  return (
    <div className="w-full mt-10" id="karma-reputation-timeline">
      {/* Reputation Section Header with dynamic subsegment controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-[#f8fafc] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            Reputation Ledger Archives & Roadmap
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Explore your fully synchronized on-chain behavioral history, milestone objectives, and rating symbology maps.
          </p>
        </div>

        {/* Dynamic component sub-navigation rails */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/40 border border-white/[0.04] rounded-xl self-stretch md:self-auto justify-between overflow-x-auto">
          {[
            { id: 'chronicles', label: '📜 Chronicles Timeline' },
            { id: 'milestones', label: '🏆 Milestones Table' },
            { id: 'symbology', label: '🔮 Symbology & Auras' }
          ].map(tabOpt => (
            <button
              key={tabOpt.id}
              onClick={() => setActiveTab(tabOpt.id as any)}
              className="text-[10px] font-mono tracking-wide uppercase px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={{
                background: activeTab === tabOpt.id ? 'rgba(167, 139, 250, 0.14)' : 'transparent',
                color: activeTab === tabOpt.id ? '#c084fc' : '#94a3b8',
                fontWeight: activeTab === tabOpt.id ? 'bold' : 'normal'
              }}
            >
              {tabOpt.label}
            </button>
          ))}
        </div>
      </div>

      <GlassCard style={{ padding: '28px 24px', borderRadius: 16 }}>
        {/* VIEW 1: COGNITIVE CHRONICLES TIMELINE */}
        {activeTab === 'chronicles' && (
          <div className="space-y-6 animate-fade-in" id="chronicles-timeline-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.04] pb-4 gap-3">
              <div>
                <h4 className="text-white font-bold text-sm font-sans flex items-center gap-2">
                  <span>📜</span> Historical Activity Chronicles
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Chronological consensus logs retrieved from on-chain block history.</p>
              </div>

              {/* Sub filters */}
              <div className="flex gap-1 bg-white/[0.02] p-0.5 border border-white/[0.05] rounded-lg">
                {[
                  { key: 'all', label: 'All Events' },
                  { key: 'milestones', label: '✧ Milestones' },
                  { key: 'onchain', label: '⚡ On-Chain' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setFilter(opt.key as any)}
                    className="text-[9px] font-mono px-2 py-1 rounded-md border-none cursor-pointer transition-all"
                    style={{
                      background: filter === opt.key ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      color: filter === opt.key ? '#f8fafc' : '#64748b',
                      fontWeight: filter === opt.key ? 'bold' : 'normal'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative border-l-2 border-white/[0.04] ml-3.5 md:ml-6 space-y-8 py-2">
              {filteredItems.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div key={item.id} className="relative pl-6 md:pl-10 group">
                    
                    {/* Node Dot marker */}
                    <div 
                      className="absolute left-0 top-1.5 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer bg-[#05050b]"
                      style={{
                        borderColor: isSelected ? item.color : 'rgba(255,255,255,0.08)',
                        boxShadow: isSelected ? `0 0 12px ${item.color}40` : 'none'
                      }}
                      onClick={() => setSelectedId(isSelected ? null : item.id)}
                      title="Toggle cryptographic details"
                    >
                      <span className="text-xs">{item.icon}</span>
                    </div>

                    {/* Left/Time display panel */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className="text-[9px] font-mono font-black italic tracking-widest px-2 py-0.5 rounded"
                          style={{
                            background: `${item.color}15`,
                            color: item.color
                          }}
                        >
                          {item.badgeText}
                        </span>
                        <h4 
                          className="text-white text-sm font-bold group-hover:text-purple-300 transition-colors cursor-pointer"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                          onClick={() => setSelectedId(isSelected ? null : item.id)}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mb-2">
                      {item.description}
                    </p>

                    {/* Expand toggled details button */}
                    <button
                      onClick={() => setSelectedId(isSelected ? null : item.id)}
                      className="text-[10px] text-slate-500 font-mono hover:text-purple-400 border-none bg-none cursor-pointer flex items-center gap-1.5 p-0"
                    >
                      <span>{isSelected ? '▼ Hide Metadata' : '▶ Show Cryptographic Metadata'}</span>
                    </button>

                    {/* Metadata container card if block selected */}
                    {isSelected && item.metadata && (
                      <div className="mt-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] space-y-2.5 animate-fade-in max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-500 uppercase block tracking-wider">Indexed Network</span>
                            <span className="text-slate-300 font-bold block mt-0.5">{item.metadata.network || 'Multi-Chain Validator'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase block tracking-wider">Block Number Height</span>
                            <span className="text-slate-300 font-bold block mt-0.5">#{item.metadata.blockHeight || 'N/A'}</span>
                          </div>
                        </div>

                        {item.metadata.consensusHash && (
                          <div className="text-[10px] font-mono border-t border-white/[0.03] pt-2">
                            <span className="text-slate-500 uppercase block tracking-wider">Consensus Hash Registry</span>
                            <span className="text-slate-400 block mt-0.5 break-all select-all">{item.metadata.consensusHash}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono border-t border-white/[0.03] pt-2">
                          {item.metadata.gasSaved && (
                            <div>
                              <span className="text-slate-500 uppercase block tracking-wider font-medium">Optimization Log</span>
                              <span className="text-[#a78bfa] block mt-0.5 font-bold">✨ {item.metadata.gasSaved}</span>
                            </div>
                          )}
                          {item.metadata.influenceImpact && (
                            <div>
                              <span className="text-slate-500 uppercase block tracking-wider font-medium">Diplomacy Contribution</span>
                              <span className="text-emerald-400 block mt-0.5 font-bold">{item.metadata.influenceImpact}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: UNLOCKED MILESTONES OBJECTIVES INDEX TABLE */}
        {activeTab === 'milestones' && (
          <div className="space-y-6 animate-fade-in" id="milestones-objective-table">
            <div className="border-b border-white/[0.04] pb-4 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
              <div>
                <h4 className="text-white font-bold text-sm font-sans flex items-center gap-2">
                  <span>🏆</span> Ecosystem Reputational Milestones
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Progress guidelines to expand your verified crypto credentials.</p>
              </div>
              <div className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-xl">
                Current hold streak: <b>{user.streak} days</b>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.04]">
              <table className="w-full text-left text-xs text-slate-300 min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950/40 select-none">
                    <th className="py-3 px-5">Milestone Objective</th>
                    <th className="py-3 px-5 text-center">Insignia</th>
                    <th className="py-3 px-5">Performance Expectations</th>
                    <th className="py-3 px-5 text-right">Reputation Merit</th>
                    <th className="py-3 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-slate-950/[0.05]">
                  {[
                    {
                      name: 'Genesis Connection',
                      tag: '🌐 SECURITY',
                      icon: '🌐',
                      desc: 'Successfully bind a sovereign digital address and initialize local consensus data pipeline.',
                      merit: '+5 Overall Karma Score',
                      active: true,
                    },
                    {
                      name: 'Loyalty Conviction VII',
                      tag: '🔥 STREAK',
                      icon: '🔥',
                      desc: 'Maintain active token balances without outward transfer triggers across 7 consecutive diurnal epochs.',
                      merit: '+25 Loyalty Pillar Score',
                      active: user.streak >= 7,
                    },
                    {
                      name: 'Consensus Participant',
                      tag: '🗳️ GOVERNANCE',
                      icon: '🗳️',
                      desc: 'Register cryptographic ballot alignments during active snapshots or DAO infrastructure guidelines.',
                      merit: '+15 Wisdom Pillar Score',
                      active: true,
                    },
                    {
                      name: 'Credit Handshake Alpha',
                      tag: '🤝 DEFI UTILITY',
                      icon: '🤝',
                      desc: 'Confirm pre-qualification constraints and verify eligibility pools on sovereign lending routers.',
                      merit: '+15 General Karma Quotient',
                      active: user.karmaScore >= 700,
                    },
                    {
                      name: 'Transcendent Halo',
                      tag: '✨ ASCENSION',
                      icon: '✨',
                      desc: 'Establish a net reputation scorecard ranking of 800+ inside the global validator directory.',
                      merit: 'Unlocks White Aura Badge',
                      active: user.karmaScore >= 800,
                    }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.015] transition-all">
                      <td className="py-4.5 px-5 font-bold text-white max-w-[170px]">
                        <span className="block font-sans text-slate-100 tracking-tight">{row.name}</span>
                        <span className="text-[8px] font-mono tracking-widest font-black px-1.5 py-0.5 rounded uppercase mt-1.5 inline-block bg-[#a78bfa]/10 text-[#c084fc]">
                          {row.tag}
                        </span>
                      </td>
                      <td className="py-4.5 px-5 text-center text-lg select-none">{row.icon}</td>
                      <td className="py-4.5 px-5 text-slate-400 select-all leading-normal max-w-sm">{row.desc}</td>
                      <td className="py-4.5 px-5 text-right font-mono font-bold text-[#a78bfa]">{row.merit}</td>
                      <td className="py-4.5 px-5 text-center">
                        {row.active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg font-black border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                            ✔ Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                            🔒 Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] font-mono text-slate-500 text-left pl-1">
              * Reputation indexes automatically recalculate in real-time when on-chain activities are verified.
            </div>
          </div>
        )}

        {/* VIEW 3: SACRED REPUTATION SYMBOLS LEGEND */}
        {activeTab === 'symbology' && (
          <div className="space-y-6 animate-fade-in" id="reputation-symbology-legend">
            <div className="border-b border-white/[0.04] pb-4">
              <h4 className="text-white font-bold text-sm font-sans flex items-center gap-2">
                <span>🔮</span> Alchemical Reputation Symbology & Aura Glossary
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Understand your crypto-behavioral profile symbols, color alignments, and ranking limits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
              {/* Pillar Symbols breakdown */}
              <div className="lg:col-span-5 space-y-4">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa] border-b border-white/[0.05] pb-2 font-black select-none">
                  ✦ Behavioral Pillar Symbols
                </h5>
                
                <div className="divide-y divide-white/[0.04] space-y-3">
                  {[
                    {
                      sym: '◈',
                      name: 'Future Patience',
                      desc: 'Trade pacing. Measures lock durations, hold delays, and dampens short-term velocity triggers.',
                      color: '#a78bfa',
                    },
                    {
                      sym: '◆',
                      name: 'Absolute Loyalty',
                      desc: 'Hold solidity. Computes coin longevity without coin split operations or exit events.',
                      color: '#67e8f9',
                    },
                    {
                      sym: '⊕',
                      name: 'Decentralized Wisdom',
                      desc: 'Governance index. Quantifies DAO snapshots, active signatures, and democratic protocol ballots.',
                      color: '#fbbf24',
                    },
                    {
                      sym: '⬡',
                      name: 'Ecosystem Generosity',
                      desc: 'Optimization weight. Measures gas-saving bundles and contribution allocations.',
                      color: '#6ee7b7',
                    },
                    {
                      sym: '◉',
                      name: 'Consolidated Energy',
                      desc: 'Capital rotation. Evaluates multi-chain rebalances and active utility transfers.',
                      color: '#fb923c',
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 pt-3 items-start first:pt-0">
                      <span 
                        className="text-xl font-bold shrink-0 font-mono text-center w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center select-none"
                        style={{ color: item.color, textShadow: `0 0 10px ${item.color}35` }}
                      >
                        {item.sym}
                      </span>
                      <div>
                        <span className="font-bold text-white block text-xs">{item.name} Symbol</span>
                        <span className="text-slate-400 mt-0.5 block leading-relaxed text-[11px]">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aura tiers rankings */}
              <div className="lg:col-span-7 space-y-4">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] border-b border-white/[0.05] pb-2 font-black select-none">
                  ✦ Diplomatic Aura Alignments
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { range: '801 – 1000', name: 'Gold Aura', color: '#fbbf24', badge: 'Legend', desc: 'The absolute crest of on-chain conviction. Legendary holding patterns.' },
                    { range: '601 – 800', name: 'Purple Aura', color: '#a78bfa', badge: 'Guardian', desc: 'Superior hold attributes and extensive voting records verified.' },
                    { range: '401 – 600', name: 'Blue Aura', color: '#60a5fa', badge: 'Builder', desc: 'Substantial holding cycles with regular governance inputs.' },
                    { range: '201 – 400', name: 'Gray Aura', color: '#94a3b8', badge: 'Contributor', desc: 'Credentials linked, passport active. Active onboarding phase.' },
                    { range: '0 – 200', name: 'Charcoal Aura', color: '#4b5563', badge: 'New Soul', desc: 'Initial ground state awaiting transaction signature analysis.' }
                  ].map((tier, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.012] border border-white/[0.03] rounded-xl hover:border-white/[0.06] hover:bg-white/[0.02] transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-xs" style={{ color: tier.color }}>{tier.name}</span>
                          <span className="text-[8px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-500 font-bold border border-white/[0.04]">
                            {tier.range}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono uppercase font-black block tracking-wider" style={{ color: tier.color }}>
                          🔹 {tier.badge}
                        </span>
                        <p className="text-slate-400 text-[10.5px] mt-1.5 leading-relaxed">{tier.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
