import { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Compass, 
  Coins, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Target,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Activity,
  Layers,
  Flame,
  Globe,
  Settings
} from 'lucide-react';

interface WhitepaperModalProps {
  onClose: () => void;
}

interface Milestone {
  phase: string;
  title: string;
  target: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Funding Goal';
  percentage: number;
  allocations: string[];
}

export default function WhitepaperModal({ onClose }: WhitepaperModalProps) {
  const [activeSection, setActiveSection] = useState<'paper' | 'roadmap'>('paper');

  const milestones: Milestone[] = [
    {
      phase: 'Completed',
      title: 'Platform Creation & Seed Interface Launch',
      target: 'Completed',
      description: 'Successfully deployed the core sandbox interface including the dynamic real-time D3 Reputation Karma Ring, real-time score tuning, interactive transaction ledger, and historical trace visualization line charts.',
      status: 'Completed',
      percentage: 100,
      allocations: [
        'D3.js reactive engine setup',
        '30-Day historical Recharts engine integration',
        'State persistence and toast celebration triggers'
      ]
    },
    {
      phase: 'Completed',
      title: 'Sovereign Social Campaign Start & Community Soft Promo',
      target: 'Completed',
      description: 'Officially launched public soft promotion starting on June 9, 2026. Within 5 days of organic outreach, completed our first baseline user acquisition targets, surpassing 100+ active core Telegram participants and 300+ Twitter followers.',
      status: 'Completed',
      percentage: 100,
      allocations: [
        'Telegram community hub setup',
        'Sovereign Twitter amplification network',
        'Brand materials & visual design toolkit'
      ]
    },
    {
      phase: 'Phase 1',
      title: 'Decentralized Oracle Integration & KAST Sync',
      target: '$25,000',
      description: 'Engineering the robust API and indexer connectors with our partner KAST. This links real-world stablecoin Visa transaction velocity onto our testbed indexers.',
      status: 'Completed',
      percentage: 100,
      allocations: [
        'Off-chain indexers tuning',
        'KAST referral & sign-up automation scripts',
        'ZKP proof-of-transaction models client mock-ups'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Solana/EVM Multi-Chain Attestation Contracts',
      target: '$35,000',
      description: 'Building the core settlement contract library. Allows dApps to query a user’s Karma Score off-chain and mint a non-transferable EAS (Ethereum Attestation Service) stamp or Solana Metaplex badge.',
      status: 'In Progress',
      percentage: 35,
      allocations: [
        'Smart contract audit coverage',
        'Gas relay subsidy pools setup',
        'EAS Integration wrappers'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'ZK-SNARK Scoring Privacy Shields (Zero-Data Passport)',
      target: '$45,000',
      description: 'True sovereign reputation. We are coding zero-knowledge proofs so third-party underwriters can verify your credit status (>700 points) without scanning your raw wallets, assets, or KAST spending categories.',
      status: 'Funding Goal',
      percentage: 10,
      allocations: [
        'ZKP circom proof generation optimization',
        'Edge device execution library',
        'Multi-party computation (MPC) testing framework'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Underwriter Yield & Real-World Credit Pool Match',
      target: '$60,000',
      description: 'Kickstarting first-party micro-liquidity vaults. Selected institutional underwriters lock USD assets to offer real, instant, low-collateral micro-loans directly inside the App with custom smart underwrite terms. Note: This micro-loan service is scheduled to go live when the system is fully operational.',
      status: 'Funding Goal',
      percentage: 0,
      allocations: [
        'Liquidity pools liquidity guarantee safety nets',
        'Collateralized protocol insurance layers',
        'Institutional credit connector compliance'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-6 md:py-12 bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-fade-in" id="whitepaper-modal-overlay">
      <div className="relative w-full max-w-4xl bg-[#090911] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        
        {/* Absolute Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#14F195]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-white/[0.06] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative z-10 bg-[#07070d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14F195]/10 border border-[#14F195]/20 flex items-center justify-center text-[#14F195] shrink-0">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span>KARMA PROTOCOL</span>
                <span className="text-[10px] bg-[#14F195]/10 text-[#14F195] px-2 py-0.5 rounded-full font-mono font-medium tracking-normal border border-[#14F195]/20 block">
                  Official Whitepaper
                </span>
              </h2>
              <p className="text-[10px] md:text-[11px] font-mono text-slate-400">VERSION 2.0 · SOVEREIGN BEHAVIOR ENGINE</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t border-white/[0.04] md:border-none">
            {/* Quick Toggle Sections */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/[0.05]">
              <button
                onClick={() => setActiveSection('paper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  activeSection === 'paper' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Whitepaper
              </button>
              <button
                onClick={() => setActiveSection('roadmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  activeSection === 'roadmap' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Milestones & Roadmap
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/[0.05] hover:border-white/10 text-slate-400 hover:text-white transition-all bg-slate-950/40 cursor-pointer ml-auto md:ml-0"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 relative z-10 custom-scrollbar">
          
          {activeSection === 'paper' ? (
            <div className="space-y-8 text-left max-w-3xl mx-auto">
              
              {/* Abstract Header Card */}
              <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-[#14F195]/5 border border-indigo-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 1
                  </span>
                  <h3 className="text-xs font-mono font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> 1. Abstract
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white">Karma Protocol</strong> introduces a decentralized reputation economy where wallet behavior defines financial access, rewards, and trust. Unlike traditional crypto systems that reward capital, Karma rewards conduct. 
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  The system integrates on-chain reputation scoring (<strong>KarmaScore</strong>), native utility token structures (<strong>KARMA</strong>), deflationary staking + burn mechanics, and real-world asset (<strong>RWA</strong>) access layers to transform blockchain identity into a measurable financial primitive.
                </p>
              </div>

              {/* Special Live Achievements Highlight Banner */}
              <div className="p-4 md:p-5 rounded-xl bg-slate-950/90 border border-[#14F195]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#14F195]/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">📈</span>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Live Project Metas & Milestones</span>
                    <h4 className="text-xs font-bold text-white uppercase font-sans">Sovereign Soft-Hype Campaign Surges</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      We officially initiated soft promotion for KarmaScore starting on <strong className="text-white">June 9, 2026</strong> (5 days ago). The community response has been epic: we have crossed <strong className="text-[#14F195]">100+ members in Telegram</strong> and <strong className="text-[#14F195]">300+ active followers on Twitter</strong>. The Web3 client dApp sandbox prototype is officially compiled and live.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapter 2 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 2
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    2. Problem Statement
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Current crypto ecosystems suffer from acute structural flaws:
                </p>
                <ul className="space-y-3.5 text-xs text-slate-300 pl-1 md:pl-2">
                  <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 font-sans">
                    <strong className="text-white sm:w-56 shrink-0 select-none">2.1 Capital-Weighted Systems:</strong>
                    <span className="text-slate-300 leading-relaxed">Influence is proportional to wealth. Early insiders dominate distributions, and whale players distort both governance metrics and dynamic market indices.</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 font-sans">
                    <strong className="text-white sm:w-56 shrink-0 select-none">2.2 Lack of Reputation Primitive:</strong>
                    <span className="text-slate-300 leading-relaxed">Wallets remain anonymous and highly interchangeable with no cumulative long-term behavioral scoring. Consequently, automated bots and sybil setups continuously exploit basic incentive programs.</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 font-sans">
                    <strong className="text-white sm:w-56 shrink-0 select-none">2.3 Weak Utility Protocols:</strong>
                    <span className="text-slate-300 leading-relaxed">Most utility tokens lack practical systemic use, resulting in price movements driven purely by manual trading speculation with no structural organic holding demand.</span>
                  </li>
                </ul>
              </div>

              {/* Chapter 3 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 3
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    3. Solution Overview
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Karma Protocol resolves these critical bottlenecks by introducing an immutable behavior-backed financial layer composed of four core pillars:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.02]">
                    <span className="text-[#14F195] font-bold block mb-1">1. KarmaScore Engine</span>
                    <span className="text-[11px] text-slate-400">Algorithmic validator compiling multi-chain activity histories into a clean score metrics range.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.02]">
                    <span className="text-purple-400 font-bold block mb-1">2. KARMA Token Utility</span>
                    <span className="text-[11px] text-slate-400">A fixed-supply asset powering staking tiers, score boosters, and deflationary burns.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.02]">
                    <span className="text-blue-400 font-bold block mb-1">3. Reputation Access Layer</span>
                    <span className="text-[11px] text-slate-400">Permission systems verifying wallet histories to enable low-collateral credit pools.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.02]">
                    <span className="text-amber-400 font-bold block mb-1">4. Real World Asset (RWA) Gateway</span>
                    <span className="text-[11px] text-slate-400">Tokenized product pools gated strictly by conduct thresholds, preventing whale monopolies.</span>
                  </div>
                </div>
              </div>

              {/* Chapter 4 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 4
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    4. Karma Score System
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-white mb-1">4.1 Operational Definition</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      KarmaScore is a dynamic, live, on-chain reputation score scaling from <strong className="text-white">0 to 1000+</strong>, assigned on-chain to analyze wallet behavioral compliance signals.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/10">
                      <span className="text-[#14F195] font-bold block mb-1 text-[11px]">▲ Positive Signals (Growth Weight)</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10.5px]">
                        <li>Long-term asset holding durations</li>
                        <li>Consistent governance voting presence</li>
                        <li>Staking locks into core pools</li>
                        <li>Active liquidity provision positions</li>
                        <li>Transaction volume stability</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-950/10 border border-rose-500/10">
                      <span className="text-rose-400 font-bold block mb-1 text-[11px]">▼ Negative Signals (Decline Weight)</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10.5px]">
                        <li>Rapid flash buy-to-sell operations (Wash behavior)</li>
                        <li>Known automated bot cluster interactions</li>
                        <li>Short-term dump activity and multi-recycles</li>
                        <li>Exclusive throwaway airdrop farming setups</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="font-bold text-white mb-2">4.3 Dynamic Range Outputs & Tiers</h4>
                    <div className="overflow-hidden rounded-xl border border-white/[0.04]">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="bg-slate-950 border-b border-white/[0.06] text-slate-400">
                            <th className="p-2.5">Score Range</th>
                            <th className="p-2.5">Reputation Tier</th>
                            <th className="p-2.5">Protocol Access Meaning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-slate-300">
                          <tr className="hover:bg-white/[0.01]">
                            <td className="p-2 text-rose-400">0 – 200</td>
                            <td className="p-2 font-bold uppercase text-[10px]">New Wallet</td>
                            <td className="p-2 text-slate-400">Unverified state. Maximum base rate, no privileges.</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01]">
                            <td className="p-2 text-amber-400">200 – 400</td>
                            <td className="p-2 font-bold uppercase text-[10px]">Active</td>
                            <td className="p-2 text-slate-400">Basic participation footprint. Normal transaction tracking.</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01]">
                            <td className="p-2 text-emerald-400">400 – 600</td>
                            <td className="p-2 font-bold uppercase text-[10px]">Trusted</td>
                            <td className="p-2 text-slate-400">Stable community contributor. Eligible for normal staking pools.</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01]">
                            <td className="p-2 text-purple-400">600 – 800</td>
                            <td className="p-2 font-bold uppercase text-[10px]">Elite</td>
                            <td className="p-2 text-slate-400">High reputational status. Unlocks initial RWA investment access.</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01]">
                            <td className="p-2 text-[#14F195]">800 – 1000+</td>
                            <td className="p-2 font-bold uppercase text-[10px]">Guardian</td>
                            <td className="p-2 text-slate-200">Protocol-level sovereign trust. Maximum APY and lowest loan rates (loan features go live when system is fully operational).</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 5 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 5
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    5. Karma Token Design
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">5.1 Token Overview</h4>
                    <ul className="space-y-1 text-slate-400 font-mono text-[10.5px]">
                      <li>• Name: <span className="text-slate-300">Karma Token</span></li>
                      <li>• Symbol: <span className="text-emerald-400">KARMA</span></li>
                      <li>• Maximum Supply: <span className="text-white">1,000,000,000 (Fixed)</span></li>
                      <li>• Class: <span className="text-purple-400">Reputation Asset + Utility Prim</span></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">5.2 Core Utility Functions</h4>
                    <p className="text-slate-400 leading-normal text-[11px]">
                      KARMA execution is natively required to authenticate score upgrade thresholds, secure RWA vault allocations, execute proposal burns within the DAO, and unlock advanced private identity analytics.
                    </p>
                  </div>
                  
                  {/* Highlighted section about Aura Points and the Reward Token Airdrop */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 space-y-4 mt-2 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#14F195]/10 border border-[#14F195]/20 text-[8.5px] font-mono font-bold text-[#14F195] uppercase bg-opacity-10">
                          Ecosystem Reward Core
                        </span>
                        <h4 className="text-[13px] font-extrabold text-white uppercase flex items-center gap-1.5 font-sans" style={{ fontFamily: "'Syne', sans-serif" }}>
                          <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" /> 5.3 Aura Points & Ecosystem Reward Token
                        </h4>
                      </div>
                    </div>
                    
                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      To incentivize long-term active holding and continuous community consistency, we have introduced <strong className="text-[#14F195]">Aura Points</strong> and the official <strong className="text-purple-400">Aura Token</strong>. Aura is the official premier reward token for the entire Karma ecosystem, designed to enrich reputation multipliers and active holding habits.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.04] space-y-2">
                        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Aura Points Functionality
                        </h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Aura Points serve as official system credentials accumulated through robust platform checkpoints (holding streaks, category boosts). Points align directly to your overall score, converting your consistency into real ecosystem standing.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.04] space-y-2">
                        <h5 className="text-[10px] font-bold text-[#14F195] uppercase tracking-wider font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" /> September Airdrop Launch
                        </h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          The official Aura token smart contract rewards loyal active participants. Users who acquire Aura Points will receive a direct conversion airdrop of the premium Aura reward token. The official release date and distribution details will be announced in <strong className="text-purple-400 font-bold font-mono">September 2026</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Highly descriptive parameters regarding conversion, scoring and holding multipliers */}
                    <div className="pt-3 border-t border-white/[0.04] space-y-3">
                      <h5 className="text-[10.5px] font-bold text-slate-250 uppercase font-sans tracking-wide">
                        🔍 Core Integration & Distribution Mechanics:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                          <span className="text-[9.5px] font-bold text-[#14F195] uppercase font-mono block">1. Loyalty Checkpoint Verification</span>
                          <p className="text-[10px] text-slate-405 leading-relaxed text-slate-400">
                            Our snapshot scripts verify true long-term wallets. Temporary "dumping" wallets are actively filtered from Aura conversion allocation weights.
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                          <span className="text-[9.5px] font-bold text-[#14F195] uppercase font-mono block">2. Streaks Multiplier Boosts</span>
                          <p className="text-[10px] text-slate-405 leading-relaxed text-slate-400">
                            Higher day streaks multiply your point capture vector. Your daily streak value acts as a multiplier boost to your base accrued Aura rewards.
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                          <span className="text-[9.5px] font-bold text-[#14F195] uppercase font-mono block">3. September Conversion Event</span>
                          <p className="text-[10px] text-slate-405 leading-relaxed text-slate-400">
                            Points gathered during this test-phase partition directly map to the official airdrop pool. Snapshots will cease on official launch announcement day.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 6 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 6
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    6. Tokenomics
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-white mb-1">6.1 Supply Allocation Architecture</h4>
                    <div className="overflow-hidden rounded-xl border border-white/[0.04] bg-slate-950">
                      <table className="w-full text-left text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-white/[0.04] text-slate-400">
                            <th className="p-2">Target Pool</th>
                            <th className="p-2">Percentage</th>
                            <th className="p-2">Allocated Tokens</th>
                            <th className="p-2">Liquidity Venue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-slate-300">
                          <tr>
                            <td className="p-2 text-white font-bold">Fair Launch</td>
                            <td className="p-2 text-emerald-400">100%</td>
                            <td className="p-2">1,000,000,000</td>
                            <td className="p-2">Deep curve LP Pump.fun target</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">6.2 Emission Model</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Zero institutional lockups or team cliffs. Zero emission inflation beyond the hard-coded 1 Billion target cap level. All rewards are actively distributed exclusively through functional community staking pools.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapter 7 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 7
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> 7. Burn Mechanics
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  KARMA introduces systemic local deflationary protocols to sustain ecosystem utility:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/[0.02]">
                    <strong className="text-white block mb-0.5">7.1 Score Upgrade Burns</strong>
                    <span>Users burn KARMA to push through tier limit gates, unlocking elevated status ranges and high-reception score limits.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/[0.02]">
                    <strong className="text-white block mb-0.5">7.2 Access & Entrance Burns</strong>
                    <span>Private investment doors and institutional-tier RWA vaults enforce direct, micro-deflationary burning of KARMA for verification.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/[0.02]">
                    <strong className="text-white block mb-0.5">7.3 Governance Spam Protection</strong>
                    <span>Submitting formal parameters or requesting score metric calibrations requires a permanent token burn to prevent flash-churn exploits.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/[0.02]">
                    <strong className="text-white block mb-0.5">7.4 Behavioral Penalty System</strong>
                    <span>Accounts identified by sybil filters or engaging in market exploitation profiles incur rewards forfeiture or voluntary burn siphoning.</span>
                  </div>
                </div>
              </div>

              {/* Chapter 8 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 8
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    8. Staking System
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    APY rewards are deeply linked to conduct rather than just capital weight, establishing a dynamic incentive loop:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                    <li>
                      <strong className="text-white">8.1 Base Yield APY Yields:</strong> Standard baseline ranges float between <span className="text-[#14F195] font-mono">6% – 12%</span> with dedicated lock programs reaching up to <span className="text-[#14F195] font-mono">15% - 52%</span>.
                    </li>
                    <li>
                      <strong className="text-white">8.2 Reputation Multiplier:</strong> Your score directly scales your payouts:
                      <div className="grid grid-cols-5 text-center font-mono text-[10px] mt-2 gap-1.5 text-slate-300">
                        <div className="bg-slate-950 p-1.5 rounded border border-white/[0.04]">New<br/><span className="text-rose-400 font-bold">1.0x</span></div>
                        <div className="bg-slate-950 p-1.5 rounded border border-white/[0.04]">Active<br/><span className="text-amber-400 font-bold">1.2x</span></div>
                        <div className="bg-slate-950 p-1.5 rounded border border-white/[0.04]">Trusted<br/><span className="text-emerald-400 font-bold">1.5x</span></div>
                        <div className="bg-slate-950 p-1.5 rounded border border-white/[0.04]">Elite<br/><span className="text-purple-400 font-bold">2.0x</span></div>
                        <div className="bg-slate-950 p-1.5 rounded border border-white/[0.04]">Guardian<br/><span className="text-[#14F195] font-bold">3.0x Max</span></div>
                      </div>
                    </li>
                    <li>
                      <strong className="text-white">8.3 Locking Options:</strong> Choose between flexible staking (lower APY, instant withdrawal) and locked staking (30–180 day locks for maximized APY multipliers, required for RWA access).
                    </li>
                    <li>
                      <strong className="text-white">8.4 Reputation Dependency:</strong> Staking payouts are checked and updated in real-time. If score drops, yield drops; if score grows, rewards grow correspondingly.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Chapter 9 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 9
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    9. Real World Asset (RWA) Integration & KAST Synergy
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Karma Protocol bridges trust metadata directly with premium tokenized real-world yields (Treasury bills, institutional credit, and real estate yield products).
                </p>
                
                {/* Keep existing KAST synergy widget as requested */}
                <div className="relative p-4 rounded-xl bg-slate-950 border border-[#14F195]/20 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden mt-2 text-xs">
                  <div className="space-y-1 flex-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">💳 INTEGRATED USER ACCESS MODULE</span>
                    <h4 className="font-bold text-slate-200">The KAST Ambassador Pathway</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      To bridge real spend telemetry, register on KAST under our official tracker. This unlocks a verified <strong className="text-white">+80 PTS Reputation Score boost</strong>, high-yield stablecoin staking pipelines, and direct institutional clearance.
                    </p>
                    <div className="pt-1">
                      <a 
                        href="https://app.kast.xyz/referral/O7A99Y65" 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-white transition-colors"
                      >
                        Visit app.kast.xyz <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-900 border border-white/[0.04] rounded-lg text-center shrink-0 w-full md:w-36">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">SCORE BOOST</span>
                    <span className="text-xl font-extrabold text-white block font-sans">+80 PTS</span>
                    <span className="text-[9px] text-[#14F195] font-mono font-bold">Auto-Enabled</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-1">
                  <p>
                    <strong className="text-white">9.2 Verification Milestones:</strong> Participation requires keeping a minimum KarmaScore of <span className="font-bold text-emerald-400">600+</span>, a dedicated stake of KARMA tokens, and submitting a validator entry burn.
                  </p>
                  <p>
                    <strong className="text-white">9.3 Allocation Mechanics:</strong> Allocation is proportional to combined <strong className="text-white">KarmaScore + Stake Weight</strong>, ensuring capital alone cannot lock out community members.
                  </p>
                </div>
              </div>

              {/* Chapter 10 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 10
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    10. System Architecture
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-slate-400">
                  <p className="text-[11px] text-slate-300">The backend architecture is engineered across five sovereign service components:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-slate-950 border border-white/[0.02]">
                      <strong className="text-white block mb-0.5 text-[10.5px]">1. Blockchain Data Layer</strong>
                      <span>Continuous indexing of transaction flows crossing Ethereum, Solana, Base, BSC, and Polygon networks.</span>
                    </div>
                    <div className="p-3 rounded bg-slate-950 border border-white/[0.02]">
                      <strong className="text-white block mb-0.5 text-[10.5px]">2. Karma Engine Scoring Core</strong>
                      <span>Real-time proprietary checking loop validating conduct signals to refresh score values.</span>
                    </div>
                    <div className="p-3 rounded bg-slate-950 border border-white/[0.02]">
                      <strong className="text-white block mb-0.5 text-[10.5px]">3. Token Contract Layer</strong>
                      <span>Direct handling of non-custodial staking contracts, burn thresholds, and decentralized voting power weights.</span>
                    </div>
                    <div className="p-3 rounded bg-slate-950 border border-white/[0.02]">
                      <strong className="text-white block mb-0.5 text-[10.5px]">4. RWA Gateway Layer</strong>
                      <span>Whitelist validation checkers linked in real-time to active score variables.</span>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-slate-950 border border-white/[0.02] text-center font-mono text-[10.5px]">
                    <strong className="text-white">5. Direct API Integration Gateway:</strong> Supplies scoring data cleanly to partnered dApps and underwriter networks.
                  </div>
                </div>
              </div>

              {/* Chapter 11 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 11
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    11. Economic Loop (Core Value Engine)
                  </h3>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-[#14F195]/10 text-xs">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center font-mono font-bold text-[10px] text-slate-300">
                    <span className="bg-slate-900 px-2 py-1 rounded border border-white/[0.04]">On-Chain Activity</span>
                    <span className="text-[#14F195] hidden md:inline">➔</span>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-white/[0.04]">KarmaScore Updates</span>
                    <span className="text-[#14F195] hidden md:inline">➔</span>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-white/[0.04]">Token Multipliers</span>
                    <span className="text-[#14F195] hidden md:inline">➔</span>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-[#14F195]/20 text-[#14F195]">Staking & Burns</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px] mt-4">
                    The closed behavioral economy locks KARMA away or permanent-burns it to qualify for reputation increments. This directly reduces market floating supply while elevating protocol demand utility.
                  </p>
                </div>
              </div>

              {/* Chapter 12 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 12
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    12. Governance Model
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Decentralized governance through the <strong className="text-white">Karma DAO</strong> controls protocol limits, treasury staking incentives, emission curves, and smart audit calibrations. Core voting votes are secured by matching <strong className="text-[#14F195]">Staked KARMA weight with KarmaScore ratios</strong>.
                </p>
              </div>

              {/* Chapter 13 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 13
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#14F195]" /> 13. Security & Anti-Manipulation
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conduct checks incorporate advanced sybil detection modules: wallet clustering heuristics, robotic behavior interval checks, score time-decay parameters to penalize dormancy, and dynamic yield slashing algorithms to block exploits.
                </p>
              </div>

              {/* Chapter 14 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 14
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    14. Roadmap
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">Phase 1:</span>
                    <span><strong>Foundation:</strong> Score engine alpha sandbox deployment (Accomplished!), initial Twitter and Telegram launch campaign (Over 100+ TG, 300+ X members secured starting June 9, 2026!).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold font-mono">Phase 2:</span>
                    <span><strong>Utility Expansion:</strong> Active burn execution parameters, variable score APY mechanics, and release of real historical analytics dashboards.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold font-mono">Phase 3:</span>
                    <span><strong>RWA Integration:</strong> Yield vault integrations and corporate partner verification channels inside the dApp.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold font-mono">Phase 4:</span>
                    <span><strong>Ecosystem Scale:</strong> Live multi-chain settlement layers and transitioning complete controller voting to the Karma DAO.</span>
                  </div>
                </div>
              </div>

              {/* Chapter 15 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/[0.03] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase">
                    Chapter 15
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    15. Vision
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic" style={{ fontFamily: "'Syne', sans-serif" }}>
                  "Redefining decentralized systems from simple Proof of Capital models to Sovereign Proof of Individual Behavior models. A fair infrastructure where good actions construct liquid equity."
                </p>
              </div>

              {/* Chapter 16 */}
              <div className="p-6 md:p-8 rounded-2xl bg-[#090911] border border-emerald-500/10 space-y-3 text-center">
                <span className="text-[10px] font-mono text-[#14F195] font-bold uppercase tracking-widest block">CHAPTER 16 · CONCLUDING DIRECTIVE</span>
                <h4 className="text-md font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>16. Final Statement</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
                  Karma is not designed to be a speculative asset. It is engineered to build a reputation-backed financial credit layer where your behavior becomes the secure, permanent collateral.
                </p>
              </div>

            </div>
          ) : (
            <div className="space-y-8 text-left max-w-3xl mx-auto">
              
              {/* Pitch Banner for Funding */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-[#14F195]/5 border border-[#14F195]/15 space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#14F195] font-bold uppercase tracking-wider bg-[#14F195]/15 border border-[#14F195]/30 px-2 py-0.5 rounded-full">
                    🚀 Sovereign Funding Plan
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">Catalyzing Private Sovereign Credit</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Karma Protocol avoids predatory venture capitalism by focusing on community-centered micro-grants and strategic liquidity pairing. See below the specific engineering scopes we are raising capital to deploy:
                  </p>
                </div>
                
                <div className="bg-slate-950 border border-white/[0.05] rounded-xl p-4 text-center w-full md:w-56 shrink-0 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Total Raising Scope</span>
                  <span className="text-2xl font-black text-[#14F195] block" style={{ fontFamily: "'Syne', sans-serif" }}>$165,000 USD</span>
                  <span className="text-[9.5px] text-slate-500 font-mono block">Across 4 target phases</span>
                </div>
              </div>

              {/* Milestones grid layout */}
              <div className="space-y-6">
                {milestones.map((milestone, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl border transition-all ${
                      milestone.status === 'Completed'
                        ? 'bg-slate-950/30 border-emerald-500/15'
                        : milestone.status === 'In Progress'
                        ? 'bg-slate-950/70 border-purple-500/20'
                        : 'bg-slate-950/20 border-white/[0.04]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-black uppercase border select-none ${
                          milestone.status === 'Completed'
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                            : milestone.status === 'In Progress'
                            ? 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                            : 'bg-slate-500/10 border-white/5 text-slate-400'
                        }`}>
                          {milestone.phase}
                        </span>
                        <h4 className="text-sm font-extrabold text-white leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {milestone.title}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#14F195] block">{milestone.target} Goal</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">{milestone.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {milestone.description}
                    </p>

                    {/* Funding progress track */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Funding Progress Target:</span>
                        <span className={milestone.status === 'Completed' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          {milestone.percentage}% Funded
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${milestone.percentage}%`,
                            background: milestone.status === 'Completed' 
                              ? 'linear-gradient(90deg, #10b981, #14f195)' 
                              : 'linear-gradient(90deg, #9945ff, #818cf8)'
                          }}
                        />
                      </div>
                    </div>

                    {/* List Allocations */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-white/[0.02]">
                      <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Scope allocation focuses:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {milestone.allocations.map((alloc, aidx) => (
                          <div key={aidx} className="flex gap-1.5 text-[10.5px] text-slate-400 leading-tight">
                            <span className="text-[#14F195] select-none">✦</span>
                            <span>{alloc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multiplier CTA card */}
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2.5">
                  <span className="text-lg">📢</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Pitch to the Community</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This roadmap outlines the core primitives of Sovereign Financial Attestations. Participate on the KAST platform to directly contribute transaction metrics onto our live testbeds!
                    </p>
                  </div>
                </div>

                <a 
                  href="https://app.kast.xyz/referral/O7A99Y65"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-[#14F195] text-slate-950 font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.03] shrink-0 text-center select-none shadow"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  💳 Join KAST Debit Card Program
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-white/[0.06] bg-[#07070d] flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10 text-[11px] font-mono text-slate-500 select-none">
          <span>Sovereign Proof Attestations © 2026</span>
          <div className="flex gap-4 items-center">
            <a 
              href="https://app.kast.xyz/referral/O7A99Y65" 
              target="_blank" 
              referrerPolicy="no-referrer" 
              className="hover:text-emerald-400 transition-colors"
            >
              [KAST Platform Provider link]
            </a>
            <span>•</span>
            <button 
              onClick={onClose} 
              className="text-purple-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer font-bold uppercase"
            >
              [Close Window]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
