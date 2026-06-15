import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Zap, Activity, ShieldAlert, CheckCircle, Database } from 'lucide-react';
import { User, ActivityEvent, ChartDataPoint } from '../types';
import GlassCard from './GlassCard';
import Tag from './Tag';

interface LiveAnalyticsProps {
  user: User;
}

// Fixed mock historical data for professional charting
const HISTORICAL_CHART_DATA: ChartDataPoint[] = [
  { time: '09:00', reputation: 81, activityVolume: 12, gasSaved: 14 },
  { time: '10:00', reputation: 82, activityVolume: 35, gasSaved: 18 },
  { time: '11:00', reputation: 82, activityVolume: 21, gasSaved: 22 },
  { time: '12:00', reputation: 84, activityVolume: 49, gasSaved: 36 },
  { time: '13:00', reputation: 85, activityVolume: 15, gasSaved: 39 },
  { time: '14:00', reputation: 85, activityVolume: 8,  gasSaved: 41 },
  { time: '15:00', reputation: 86, activityVolume: 42, gasSaved: 54 },
  { time: '16:00', reputation: 87, activityVolume: 65, gasSaved: 73 },
];

const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: 'tx-001',
    timestamp: 'Just now',
    type: 'Trade',
    txHash: '0x4fbc...1a39',
    amount: 1.42,
    asset: 'ETH',
    scoreDelta: 3,
    patienceImpact: 4,
    loyaltyImpact: 2,
    wisdomImpact: 1,
  },
  {
    id: 'tx-002',
    timestamp: '4m ago',
    type: 'Mint',
    txHash: '0x32ba...dd91',
    amount: 1,
    asset: 'Karma NFT',
    scoreDelta: 1,
    patienceImpact: 0,
    loyaltyImpact: 3,
    wisdomImpact: 0,
  },
  {
    id: 'tx-003',
    timestamp: '18m ago',
    type: 'Stake',
    txHash: '0x81ee...cc32',
    amount: 500,
    asset: 'USDC',
    scoreDelta: 4,
    patienceImpact: 5,
    loyaltyImpact: 5,
    wisdomImpact: 2,
  },
  {
    id: 'tx-004',
    timestamp: '1h ago',
    type: 'Vote',
    txHash: '0xbf90...8130',
    amount: 120,
    asset: 'KARMA dGov',
    scoreDelta: 2,
    patienceImpact: 1,
    loyaltyImpact: 1,
    wisdomImpact: 4,
  },
];

export default function LiveAnalytics({ user }: LiveAnalyticsProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(user.activities || INITIAL_EVENTS);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(HISTORICAL_CHART_DATA);
  const [gasBase, setGasBase] = useState(15.2);
  const [gasETH, setGasETH] = useState(48.5);
  const [feeSolana, setFeeSolana] = useState(0.00005);
  const [gasBNB, setGasBNB] = useState(3.1);

  // Auto-generate transaction logs over time
  useEffect(() => {
    const streamInterval = setInterval(() => {
      // 1. Randomise gas prices slightly
      setGasBase(g => Math.max(12, Math.min(35, Number((g + (Math.random() - 0.5) * 1.5).toFixed(1)))));
      setGasETH(g => Math.max(38, Math.min(95, Number((g + (Math.random() - 0.5) * 4).toFixed(1)))));
      setFeeSolana(s => Math.max(0.00003, Math.min(0.00018, Number((s + (Math.random() - 0.5) * 0.00001).toFixed(6)))));
      setGasBNB(b => Math.max(1.5, Math.min(5.5, Number((b + (Math.random() - 0.5) * 0.2).toFixed(2)))));

      // 2. Chance of a new simulated live event
      if (Math.random() > 0.45) {
        const assets = ['ETH', 'USDC', 'DAE', 'BaseNFT', 'LINK'];
        const types: Array<ActivityEvent['type']> = ['Trade', 'Mint', 'Stake', 'Vote', 'Transfer'];
        const selectedAsset = assets[Math.floor(Math.random() * assets.length)];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        const delta = Math.floor(Math.random() * 4) + 1;
        const newEvent: ActivityEvent = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: 'Just now',
          type: selectedType,
          txHash: `0x${Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...${Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          amount: Number((Math.random() * 5 + 0.1).toFixed(2)),
          asset: selectedAsset,
          scoreDelta: delta,
          patienceImpact: Math.floor(Math.random() * 5),
          loyaltyImpact: Math.floor(Math.random() * 5),
          wisdomImpact: Math.floor(Math.random() * 5),
        };

        // Update events list (max 7 items)
        setEvents(prev => {
          // Adjust old "Just now" timestamps to represent actual time
          const updated = prev.map((e, idx) => {
            if (e.timestamp === 'Just now') return { ...e, timestamp: '1m ago' };
            if (e.timestamp.endsWith('m ago')) {
              const minutes = parseInt(e.timestamp) + 1;
              return { ...e, timestamp: `${minutes}m ago` };
            }
            return e;
          });
          return [newEvent, ...updated.slice(0, 5)];
        });

        // Add progress point into historical chart
        setChartData(prev => {
          const lastPoint = prev[prev.length - 1];
          const newTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          const nextRep = Math.max(80, Math.min(100, lastPoint.reputation + (Math.random() > 0.4 ? 1 : -0.5)));
          return [
            ...prev.slice(1),
            {
              time: newTime,
              reputation: Number(nextRep.toFixed(1)),
              activityVolume: Math.floor(Math.random() * 70) + 10,
              gasSaved: lastPoint.gasSaved + Math.floor(Math.random() * 5) + 1,
            }
          ];
        });
      }
    }, 4500);

    return () => clearInterval(streamInterval);
  }, []);

  return (
    <div className="w-full animate-fade-in text-slate-100" id="live-analytics-viewport">
      {/* Visual background enhancements */}
      <div className="absolute top-1/4 right-[10%] w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite' }} />

      {/* Hero Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Live On-Chain Engine
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Real-Time Activity <span className="text-[#a78bfa]">Analytics</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">
            This module simulates telemetry streaming from Solana, Base, Ethereum, and BNB Chain networks to compute shifts in your behavioral reputation pillars. Full mainnet connection go-live in August 2026.
          </p>
        </div>

        {/* Network status and Gas tracker */}
        <div className="flex flex-wrap gap-2.5">
          <GlassCard style={{ padding: '8px 14px', borderRadius: 12 }}>
            <div className="text-[9px] font-mono uppercase text-[#14F195] tracking-widest mb-0.5">Solana Fee</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-[#14F195]">{feeSolana.toFixed(5)}</span>
              <span className="text-[8px] font-mono text-slate-500">SOL</span>
            </div>
          </GlassCard>
          <GlassCard style={{ padding: '8px 14px', borderRadius: 12 }}>
            <div className="text-[9px] font-mono uppercase text-emerald-400 tracking-widest mb-0.5">Base Gas</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-emerald-400">{gasBase}</span>
              <span className="text-[8px] font-mono text-slate-500">Gwei</span>
            </div>
          </GlassCard>
          <GlassCard style={{ padding: '8px 14px', borderRadius: 12 }}>
            <div className="text-[9px] font-mono uppercase text-amber-500 tracking-widest mb-0.5">Ethereum Gas</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-amber-500">{gasETH}</span>
              <span className="text-[8px] font-mono text-slate-500">Gwei</span>
            </div>
          </GlassCard>
          <GlassCard style={{ padding: '8px 14px', borderRadius: 12 }}>
            <div className="text-[9px] font-mono uppercase text-[#F3BA2F] tracking-widest mb-0.5">BNB Gas</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-[#F3BA2F]">{gasBNB}</span>
              <span className="text-[8px] font-mono text-slate-500">Gwei</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Dashboard Top Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Chart: Reputation Momentum & Volatility */}
        <div className="lg:col-span-2">
          <GlassCard style={{ padding: 28, height: 380, display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-100 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Reputation Momentum</h3>
                <p className="text-xs text-slate-400">Historical performance score over the 24 hour rolling timeline.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block" />
                  <span className="text-slate-300">Karma Score</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReputation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    domain={[70, 100]} 
                    stroke="rgba(255,255,255,0.15)"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0c0c16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    labelClassName="text-slate-400 font-mono text-xs"
                    itemStyle={{ color: '#a78bfa', fontSize: '13px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reputation" 
                    stroke="#a78bfa" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorReputation)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Secondary Chart: Gas efficiency and savings bar char */}
        <div>
          <GlassCard style={{ padding: 28, height: 380, display: 'flex', flexDirection: 'column' }}>
            <div>
              <h3 className="font-bold text-slate-100 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Gas Optimization</h3>
              <p className="text-xs text-slate-400">Total USD savings yielded via gas limits & route efficiency modules.</p>
            </div>

            <div className="my-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#67e8f9] font-mono">$1,492</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Saved</span>
            </div>

            <div className="flex-1 w-full" style={{ minHeight: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.15)"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.12)"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0c0c16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px'
                    }}
                    labelClassName="text-slate-400 font-mono text-xs"
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Bar dataKey="gasSaved" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Onchain Events Streams Block */}
      <GlassCard style={{ padding: 28 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-100 text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Live Activity Log</h3>
            <p className="text-xs text-slate-400">Calculated dynamic impact variables based on smart contract interactions.</p>
          </div>
          <Tag color="#a78bfa"><Zap className="w-3 h-3 mr-1 inline-block animate-pulse" /> Network Feed</Tag>
        </div>

        <div className="space-y-4">
          {events.map((e, index) => (
            <div 
              key={e.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-white/[0.04] transition-all bg-white/[0.013] hover:bg-white/[0.025]"
              style={{ animation: 'fadeUp 0.3s ease' }}
            >
              <div className="flex items-center gap-4">
                {/* Event Type Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background: e.type === 'Trade' ? 'rgba(167,139,250,0.12)' : e.type === 'Mint' ? 'rgba(103,232,249,0.12)' : e.type === 'Stake' ? 'rgba(110,231,183,0.12)' : 'rgba(244,114,182,0.12)',
                    color: e.type === 'Trade' ? '#a78bfa' : e.type === 'Mint' ? '#67e8f9' : e.type === 'Stake' ? '#6ee7b7' : '#f472b6',
                    border: `1px solid ${e.type === 'Trade' ? 'rgba(167,139,250,0.22)' : e.type === 'Mint' ? 'rgba(103,232,249,0.22)' : e.type === 'Stake' ? 'rgba(110,231,183,0.22)' : 'rgba(244,114,182,0.22)'}`
                  }}
                >
                  {e.type[0]}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-200">{e.type}</span>
                    <span className="text-xs font-mono text-slate-400">{e.amount} {e.asset}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-help" title="Mock transaction hash generated representing on-chain ledger records">{e.txHash}</span>
                    <span className="text-[10px] font-mono text-slate-500">· {e.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Behavior parameters impact ratings */}
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
                {e.patienceImpact > 0 && (
                  <span className="text-[10px] font-mono bg-violet-400/10 text-violet-300 border border-violet-400/20 px-2 py-0.5 rounded-md">
                    +{e.patienceImpact} patience
                  </span>
                )}
                {e.loyaltyImpact > 0 && (
                  <span className="text-[10px] font-mono bg-blue-400/10 text-blue-300 border border-blue-400/20 px-2 py-0.5 rounded-md">
                    +{e.loyaltyImpact} loyalty
                  </span>
                )}
                {e.wisdomImpact > 0 && (
                  <span className="text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    +{e.wisdomImpact} wisdom
                  </span>
                )}
                <div className="text-sm font-extrabold text-emerald-400 font-mono ml-2 pl-2 border-l border-white/10">
                  +{e.scoreDelta} PTS
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
