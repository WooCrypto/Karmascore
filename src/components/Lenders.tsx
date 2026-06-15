import React, { useState, useEffect } from 'react';
import { User } from '../types';
import GlassCard from './GlassCard';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle,
  PiggyBank,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LendersProps {
  user: User;
}

interface LendingPartner {
  id: string;
  name: string;
  avatarChar: string;
  baseApr: number;
  minScore: number;
  governanceChain: string;
  backerLogo: string;
  utilizationRate: number;
}

interface ActiveLoan {
  id: string;
  amount: number;
  token: 'USDT' | 'USDC';
  partnerName: string;
  apr: number;
  durationDays: number;
  startTime: number;
  repaid: boolean;
  interestCharged: number;
}

const LENDING_PARTNERS: LendingPartner[] = [
  {
    id: 'karma-pool',
    name: 'KARMALend Sovereign Pool',
    avatarChar: 'K',
    baseApr: 8.5,
    minScore: 630,
    governanceChain: 'Karma Layer 2',
    backerLogo: '◈ Direct Vault',
    utilizationRate: 42,
  },
  {
    id: 'aave-vip',
    name: 'Aave v4 VIP Desk',
    avatarChar: 'A',
    baseApr: 11.2,
    minScore: 712,
    governanceChain: 'Ethereum L1 Core',
    backerLogo: '◆ Institution Direct',
    utilizationRate: 68,
  },
  {
    id: 'celestia-credit',
    name: 'Celestia Alpha Credit Vault',
    avatarChar: 'C',
    baseApr: 9.8,
    minScore: 674,
    governanceChain: 'Modular Celestia Ledger',
    backerLogo: '⊕ Liquid Consensus',
    utilizationRate: 31,
  },
  {
    id: 'arbitrum-trust',
    name: 'Arbitrum Trust Grant DAO',
    avatarChar: 'R',
    baseApr: 7.2,
    minScore: 751,
    governanceChain: 'Arbitrum One',
    backerLogo: '⬡ DAO Underwrite',
    utilizationRate: 59,
  },
];

export default function Lenders({ user }: LendersProps) {
  const karmaScore = user.karmaScore || 700;
  
  // Calculate dynamic loan limits based on Karma Score
  // Higher score = dramatically larger eligibility bracket
  const scaledScoreForCalc = Math.max(0, Math.min(100, Math.round((karmaScore - 300) / 5.5)));
  const multiplier = Math.max(1, Math.pow((scaledScoreForCalc - 50) / 10, 2.4));
  const maxBorrowUSDT = Math.floor(1500 * multiplier);
  
  // Selection States
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT');
  const [borrowAmount, setBorrowAmount] = useState<number>(Math.floor(maxBorrowUSDT * 0.4));
  const [selectedDuration, setSelectedDuration] = useState<number>(90); // 30, 90, 180, 365 Days
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('karma-pool');
  const [hoverTooltip, setHoverTooltip] = useState<string | null>(null);

  // Simulation pipeline states
  const [borrowStatus, setBorrowStatus] = useState<'idle' | 'simulating' | 'success' | 'failed'>('idle');
  const [simulationLogIndex, setSimulationLogIndex] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  
  // Active in-memory loans tracker (persisted to localStorage per user address)
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync / Load loans from localStorage securely
  useEffect(() => {
    try {
      const cachedLoans = localStorage.getItem(`karma_loans_${user.address.toLowerCase()}`);
      if (cachedLoans) {
        setActiveLoans(JSON.parse(cachedLoans));
      } else {
        // Seed default dummy historic loan for rich layout context
        const seedTime = Date.now() - (30 * 24 * 3600 * 1000);
        const seed: ActiveLoan = {
          id: 'loan-seed-982',
          amount: 800,
          token: 'USDT',
          partnerName: 'KARMALend Sovereign Pool',
          apr: 9.2,
          durationDays: 30,
          startTime: seedTime,
          repaid: true,
          interestCharged: 6.04,
        };
        setActiveLoans([seed]);
        localStorage.setItem(`karma_loans_${user.address.toLowerCase()}`, JSON.stringify([seed]));
      }
    } catch (err) {
      console.warn('Sandbox block prevented storage reading. Operating state recursively:', err);
    }
  }, [user.address]);

  // APR calculation: base APR discounted by karma points above 60
  const selectedPartner = LENDING_PARTNERS.find(p => p.id === selectedPartnerId) || LENDING_PARTNERS[0];
  const karmaDiscount = Math.max(0, (scaledScoreForCalc - 60) * 0.12); // e.g. score 90 = 30 * 0.12 = 3.6% discount
  const finalApr = Math.max(1.8, Number((selectedPartner.baseApr - karmaDiscount).toFixed(2)));
  const estimatedInterest = Number((borrowAmount * (finalApr / 100) * (selectedDuration / 365)).toFixed(2));
  const totalRepayment = Number((borrowAmount + estimatedInterest).toFixed(2));
  const monthlyRepayment = Number((totalRepayment / (selectedDuration / 30)).toFixed(2));

  // Partner Acceptability Probability Engine
  const getApprovalRate = (partner: LendingPartner) => {
    if (karmaScore < partner.minScore) return 0;
    const scoreDiff = (karmaScore - partner.minScore) / 5.5;
    const probability = 75 + Math.min(24, Math.floor(scoreDiff * 1.8));
    return probability; // cap under 100 max
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorrowAmount(Number(e.target.value));
  };

  const setPercentAmount = (percent: number) => {
    setBorrowAmount(Math.floor(maxBorrowUSDT * percent));
  };

  // Launch simulated consensus handshake checking loop
  const triggerBorrowSimulation = () => {
    if (borrowAmount <= 0) return;
    if (borrowAmount > maxBorrowUSDT) {
      setFeedbackMsg(`Requested borrow is above your assigned threshold limit.`);
      return;
    }
    if (karmaScore < selectedPartner.minScore) {
      setFeedbackMsg(`Your karma score prevents connecting with this institutional tier partner.`);
      return;
    }

    setFeedbackMsg(null);
    setBorrowStatus('simulating');
    setSimulationLogIndex(0);

    const logsList = [
      `📡 Packing credit query broadcast packets for address ${user.address.slice(0, 10)}...`,
      `⚙️ Indexing holding block epochs, streak indicators (${user.streak} days), and behavior trends...`,
      `🔍 Verifying Karma score (${karmaScore}/1000) in de-centralized reputation underlay network...`,
      `✨ Aura matched: "${user.personality || 'Visionary'}" checks out healthy with exceptionally low bankruptcy hazard.`,
      `🤝 Conveying underwritten proposal parameters of ${borrowAmount} ${selectedToken} (APR: ${finalApr}%) to ${selectedPartner.name}...`,
      `⚡ Dynamic Liquidity Handshake accepted: Cryptographic signature underwrote successfully!`,
      `💰 Initializing virtual on-chain pool reserve disbursement to your sandbox wallet address...`
    ];
    setSimulationLogs(logsList);
  };

  // Step-by-step ticker for loader
  useEffect(() => {
    let timer: any;
    if (borrowStatus === 'simulating') {
      if (simulationLogIndex < simulationLogs.length) {
        timer = setTimeout(() => {
          setSimulationLogIndex(prev => prev + 1);
        }, 1200);
      } else {
        // Complete the loan simulation!
        const newLoan: ActiveLoan = {
          id: `loan-tx-${Math.floor(Math.random() * 89999 + 10000)}`,
          amount: borrowAmount,
          token: selectedToken,
          partnerName: selectedPartner.name,
          apr: finalApr,
          durationDays: selectedDuration,
          startTime: Date.now(),
          repaid: false,
          interestCharged: estimatedInterest,
        };
        
        const updated = [newLoan, ...activeLoans];
        setActiveLoans(updated);
        try {
          localStorage.setItem(`karma_loans_${user.address.toLowerCase()}`, JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }

        setBorrowStatus('success');
        // Reset inputs after layout transition
        setBorrowAmount(Math.floor(maxBorrowUSDT * 0.3));
      }
    }
    return () => clearTimeout(timer);
  }, [borrowStatus, simulationLogIndex, simulationLogs]);

  // Payoff active simulation handler
  const handleRepayLoan = (loanId: string) => {
    const updated = activeLoans.map(loan => {
      if (loan.id === loanId) {
        return { ...loan, repaid: true };
      }
      return loan;
    });
    setActiveLoans(updated);
    try {
      localStorage.setItem(`karma_loans_${user.address.toLowerCase()}`, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    
    setFeedbackMsg(`🎉 High fidelity loan payment settled securely. Reputation nodes reported +3 Karma points score momentum!`);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 7000);
  };

  return (
    <div className="max-w-[1080px] mx-auto pt-24 px-4 sm:px-6 pb-16 animate-fade-in text-slate-100" id="lending-hub-viewport">
      
      {/* Upper header block */}
      <div className="mb-8" id="lenders-header-section">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-1">
          Decentralized Credit Markets
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Sovereign <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]">Lending Bazaar</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 font-sans max-w-2xl leading-relaxed">
          Liquid credit underwritten entirely by your on-chain reputation history. High Karma scores earn institutional tiers, reduced APR rates, and immediate pre-approval on stablecoin borrow proposals.
        </p>
      </div>

      {feedbackMsg && (
        <div id="repay-success-toast" className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-[#a78bfa]/20 text-xs font-sans text-purple-200 flex items-start gap-3 justify-between animate-fade-in">
          <div className="flex gap-2 items-start">
            <Sparkles className="w-4 h-4 text-[#a78bfa] shrink-0 mt-0.5" />
            <div>{feedbackMsg}</div>
          </div>
          <button 
            id="close-feedback-btn-toast"
            onClick={() => setFeedbackMsg(null)} 
            className="text-[10px] uppercase font-mono text-slate-500 hover:text-slate-300 font-bold border-none bg-none cursor-pointer"
          >
            dim
          </button>
        </div>
      )}

      {/* Main interactive columns container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="lending-grid-board">
        
        {/* Left column: Borrow Terminal config */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <GlassCard className="p-6 sm:p-8 space-y-6 flex-1" id="borrow-configurator-card">
            
            {/* Header / Limit indicator */}
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Reputation Line of Credit
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">Maximum collateral-free capacity</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-400" id="max-borrow-limit-text">
                  ${maxBorrowUSDT.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-1.5 uppercase font-bold">USD</span>
              </div>
            </div>

            {/* Token Switch Deck */}
            <div className="space-y-2.5">
              <label id="label-stablecoin-credential" className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Stablecoin Asset
              </label>
              <div className="grid grid-cols-2 gap-3" id="stablecoin-toggle-deck">
                {[
                  { id: 'USDT', label: 'Tether Stablecoin', symbol: 'USDT', color: 'from-[#26a17b]/15 to-[#26a17b]/5', borderColor: 'border-[#26a17b]/20', textColor: 'text-emerald-400' },
                  { id: 'USDC', label: 'USD Coin Consortium', symbol: 'USDC', color: 'from-[#2775ca]/15 to-[#2775ca]/5', borderColor: 'border-[#2775ca]/20', textColor: 'text-[#2775ca]' }
                ].map(token => (
                  <button
                    key={token.id}
                    id={`asset-switch-${token.id.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedToken(token.id as any)}
                    className="p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left"
                    style={{
                      background: selectedToken === token.id ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      borderColor: selectedToken === token.id ? '#a78bfa' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                        <Coins className={`w-3.5 h-3.5 ${selectedToken === token.id ? 'text-purple-400' : 'text-slate-500'}`} />
                        {token.id}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{token.label}</div>
                    </div>
                    {selectedToken === token.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Slider / Input */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <label id="label-borrow-amount-config" className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Borrow Allocation Amount
                </label>
                <div className="relative font-mono">
                  <input
                    type="number"
                    id="borrow-amount-raw-numeric-input"
                    value={borrowAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBorrowAmount(v > maxBorrowUSDT ? maxBorrowUSDT : v < 0 ? 0 : v);
                    }}
                    className="bg-slate-950/70 border border-white/10 px-3 py-1 text-right text-xs font-bold text-slate-100 rounded-lg outline-none w-28 focus:border-purple-500 focus:bg-slate-950"
                  />
                  <span className="text-[9px] text-slate-500 absolute left-2 top-1/2 -translate-y-1/2 uppercase font-semibold">
                    {selectedToken}
                  </span>
                </div>
              </div>

              {/* Slider Component */}
              <div className="pt-2 px-1 relative">
                <input
                  type="range"
                  id="borrow-range-slider-control"
                  min="100"
                  max={maxBorrowUSDT}
                  step="50"
                  value={borrowAmount}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#a78bfa]"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-2">
                  <span>Min: $100</span>
                  <span>Limit: ${maxBorrowUSDT.toLocaleString()}</span>
                </div>
              </div>

              {/* Fractional quick select list */}
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2" id="quick-fractions-selectors">
                {[
                  { percent: 0.25, label: '25%' },
                  { percent: 0.50, label: '50%' },
                  { percent: 0.75, label: '75%' },
                  { percent: 1.0, label: 'Max (100%)' }
                ].map((frac, idx) => (
                  <button
                    key={idx}
                    id={`quick-fraction-button-cell-${idx}`}
                    type="button"
                    onClick={() => setPercentAmount(frac.percent)}
                    className="py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono text-slate-400 hover:bg-white/[0.05] hover:text-purple-400 hover:border-purple-500/20 transition-all cursor-pointer"
                  >
                    {frac.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Borrow Duration Selector */}
            <div className="space-y-2.5">
              <label id="label-repayment-timeline-days" className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Repayment Window Period
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2" id="repayment-window-tabs-deck">
                {[
                  { Days: 30, text: '30 Days', rateLabel: 'Short Option' },
                  { Days: 90, text: '90 Days', rateLabel: 'Standard' },
                  { Days: 180, text: '180 Days', rateLabel: 'Extended' },
                  { Days: 365, text: '365 Days', rateLabel: 'Annual Lock' }
                ].map(opt => (
                  <button
                    key={opt.Days}
                    id={`repayment-dur-tab-${opt.Days}`}
                    type="button"
                    onClick={() => setSelectedDuration(opt.Days)}
                    className="py-2.5 px-1 bg-white/[0.02] border rounded-xl flex flex-col items-center transition-all cursor-pointer text-center"
                    style={{
                      background: selectedDuration === opt.Days ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.01)',
                      borderColor: selectedDuration === opt.Days ? '#a78bfa' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <span className="text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1 font-sans">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {opt.text}
                    </span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">{opt.rateLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Underwrite Parameters terms Sheet */}
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3" id="live-financial-underwrite-terms-card">
              <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold mb-1">
                Estimated Settlement Terms
              </h4>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-mono">
                
                <div className="flex items-center gap-1.5 justify-between pr-2 border-r border-white/[0.05]">
                  <div className="text-slate-500 flex items-center gap-1">
                    <span>Lending Partner APR:</span>
                  </div>
                  <div className="text-right font-bold text-slate-200">
                    {finalApr}% APR
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-between pl-2">
                  <div className="text-slate-500">Karma Score Discount:</div>
                  <div className="text-right font-bold text-[#a78bfa] flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    -{karmaDiscount.toFixed(2)}%
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-between pr-2 border-r border-white/[0.05]">
                  <div className="text-slate-500">Accumulated Interest:</div>
                  <div className="text-right font-bold text-amber-400">
                    ~${estimatedInterest.toLocaleString()} {selectedToken}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-between pl-2">
                  <div className="text-slate-500">Total Settlement Amnt:</div>
                  <div className="text-right font-bold text-slate-200">
                    ${totalRepayment.toLocaleString()} {selectedToken}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-between col-span-2 border-t border-white/[0.04] pt-2 mt-1">
                  <span className="text-slate-500">Collateral Assurance:</span>
                  <span className="text-purple-400 font-bold text-right flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Reputation Backed, Collateral-Free (Index {karmaScore}/100)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Trigger Or Loader Pipeline depending on borrowStatus state */}
            <div>
              {borrowStatus === 'idle' && (
                <button
                  id="submit-sovereign-borrow-proposal-btn"
                  onClick={triggerBorrowSimulation}
                  disabled={borrowAmount <= 0}
                  className="w-full py-4 rounded-xl text-white font-extrabold text-sm transition-transform active:scale-[0.99] hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                    fontFamily: "'Syne', sans-serif"
                  }}
                >
                  <ArrowUpRight className="w-4 h-4 text-white" />
                  Acquire Underwritten Capital (${borrowAmount.toLocaleString()})
                </button>
              )}

              {borrowStatus === 'failed' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Settlement failed: Credit indices do not qualify. Try lowering the amount or boost Karma.</span>
                </div>
              )}

              {/* Handshake Verification Logs Console */}
              {borrowStatus === 'simulating' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/[0.05] font-mono text-[10.5px] space-y-2.5 text-left text-slate-300 shadow-inner relative overflow-hidden" id="simulation-console-panel">
                  <div className="absolute top-2 right-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Consensus Trace</span>
                  </div>
                  
                  <div className="text-purple-400 font-bold border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                    <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
                    Handshake Protocol Activated
                  </div>

                  <div className="space-y-1.5 min-h-[110px]" id="simulation-scrolling-logs">
                    {simulationLogs.slice(0, simulationLogIndex + 1).map((log, lIdx) => (
                      <div 
                        key={lIdx} 
                        id={`sim-log-row-${lIdx}`}
                        className={`leading-relaxed ${lIdx === simulationLogIndex ? 'text-purple-300 font-semibold animate-pulse' : 'text-slate-400'}`}
                      >
                        {lIdx < simulationLogIndex ? '✓ ' : '➜ '} {log}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700" 
                      style={{ width: `${((simulationLogIndex + 1) / simulationLogs.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Screen state inside the configurator */}
              {borrowStatus === 'success' && (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex flex-col items-center text-center space-y-4 animate-fade-in" id="borrow-success-banner">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Sovereign Loan Funded
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 font-sans">
                      USDT/USDC successfully settled inside your ledger registry interface, and listed inside outstanding contracts below!
                    </p>
                  </div>
                  <button
                    id="dismiss-borrow-success-btn"
                    onClick={() => {
                      setBorrowStatus('idle');
                    }}
                    className="py-2 px-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono text-[10px] hover:bg-emerald-500/25 transition-all cursor-pointer font-bold"
                  >
                    Access borrow terminal again
                  </button>
                </div>
              )}
            </div>

          </GlassCard>
        </div>

        {/* Right column: Partners eligibility list */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Lenders eligibility cards block */}
          <GlassCard className="p-6 space-y-4" id="lenders-partners-list-card">
            <div className="border-b border-white/[0.04] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider font-mono">
                  Available Syndicate Desks
                </h3>
                <p className="text-[10px] text-slate-500">Acceptance eligibility matches your score</p>
              </div>
              <HelpCircle 
                className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-pointer"
                onMouseEnter={() => setHoverTooltip('syndicates')}
                onMouseLeave={() => setHoverTooltip(null)}
              />
            </div>

            {hoverTooltip === 'syndicates' && (
              <div className="bg-slate-950 p-3 rounded-lg border border-white/5 text-[9px] font-mono text-slate-400 leading-relaxed animate-fade-in">
                Syndicate Desk operators evaluation. High Karma ratings immediately unlock lower base risk indexes to reduce APR.
              </div>
            )}

            <div className="space-y-3" id="partners-accordion-deck">
              {LENDING_PARTNERS.map(partner => {
                const isEligible = karmaScore >= partner.minScore;
                const probability = getApprovalRate(partner);
                const isSelected = selectedPartnerId === partner.id;

                return (
                  <button
                    key={partner.id}
                    id={`partner-card-${partner.id}`}
                    type="button"
                    disabled={!isEligible && !isSelected}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className="w-full text-left p-4 rounded-xl border flex flex-col justify-between transition-all relative block focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isSelected 
                        ? 'rgba(129, 140, 248, 0.08)' 
                        : isEligible 
                          ? 'rgba(255,255,255,0.015)' 
                          : 'rgba(255, 65, 108, 0.02)',
                      borderColor: isSelected 
                        ? '#a78bfa' 
                        : isEligible 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(239, 68, 68, 0.12)',
                    }}
                  >
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs text-slate-100 shrink-0"
                          style={{
                            backgroundColor: isSelected ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${isSelected ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`
                          }}
                        >
                          {partner.avatarChar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 font-sans">{partner.name}</div>
                          <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{partner.governanceChain}</span>
                            <span>•</span>
                            <span className="text-slate-400">{partner.backerLogo}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Check indicator or ineligible lock */}
                      <div className="text-right">
                        {isEligible ? (
                          <span className={`text-[10px] font-mono font-bold ${probability > 90 ? 'text-emerald-400' : 'text-purple-400'}`}>
                            {probability}% Match
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded uppercase font-bold">
                            Min Score {partner.minScore}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats details section inside each accordion */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/[0.04] w-full text-[9px] font-mono text-slate-500">
                      <div>
                        <span>Base APR:</span>
                        <span className="text-slate-300 font-bold block mt-0.5">{partner.baseApr}%</span>
                      </div>
                      <div>
                        <span>Utilization:</span>
                        <span className="text-slate-300 font-bold block mt-0.5">{partner.utilizationRate}% Capacity</span>
                      </div>
                      <div>
                        <span>Karma Cutoff:</span>
                        <span className="text-slate-300 font-bold block mt-0.5">✧ {partner.minScore} Level</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Core Underwrite Disclaimer Card */}
          <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-start gap-3 text-[10px] font-mono text-slate-500 leading-relaxed" id="borrow-limits-disclaimer-panel">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-400 mb-0.5 uppercase tracking-wider text-[9px]">Decentralized Sandbox Testbed</p>
              Capital settlement runs in simulated parity. This is designed for builders to evaluate reputation credentials scoring mechanisms before production mainnet contracts launch. Build credibility index and pay off loans promptly to bolster local score levels.
            </div>
          </div>

        </div>

      </div>

      {/* Outstanding borrowed loans grid section */}
      <div className="mt-8 border-t border-white/[0.05] pt-8" id="outstanding-loans-block-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-200" style={{ fontFamily: "'Syne', sans-serif" }}>
              My On-Chain Borrow Portfolios
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Comprehensive active and historically closed debt agreements</p>
          </div>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/[0.05]">
            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
              Total Active: {activeLoans.filter(l => !l.repaid).length}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 px-2 py-1">
              Settled: {activeLoans.filter(l => l.repaid).length}
            </span>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center bg-white/[0.01] border border-white/[0.04] rounded-2xl text-slate-400 text-xs" id="no-active-loans-placeholder">
            No active borrow contracts indexed on your public address ledger. Configure amount and trigger consensus in terminal above to unlock.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="active-borrow-contracts-grid">
            {activeLoans.map(loan => (
              <div key={loan.id} className="h-full">
                <GlassCard 
                  id={`loan-card-item-${loan.id}`}
                  className="p-5.5 h-full space-y-4 hover:border-white/10 transition-all text-left relative"
                  style={{
                    borderLeft: loan.repaid ? '3px solid #10b981' : '3px solid #f59e0b',
                  }}
                >
                {/* Upper index details */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] px-1.5 py-0.5 border rounded uppercase tracking-wider font-mono font-bold" 
                      style={{
                        backgroundColor: loan.repaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                        borderColor: loan.repaid ? '#10b981' : '#f59e0b',
                        color: loan.repaid ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {loan.repaid ? 'Settled & Boosted' : 'Outstanding Activity'}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono block mt-1">ID: {loan.id}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-100">
                      ${loan.amount.toLocaleString()} <span className="text-xs uppercase text-slate-500">{loan.token}</span>
                    </div>
                  </div>
                </div>

                {/* Sub features overview */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/[0.03] space-y-2 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Underwriter:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[130px]" title={loan.partnerName}>{loan.partnerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Financing Index:</span>
                    <span className="text-slate-300">{loan.apr}% APR Discount</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Duration Term:</span>
                    <span className="text-slate-300">{loan.durationDays} Days Duration</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Interest Charged:</span>
                    <span className="text-amber-400 font-bold">${loan.interestCharged} {loan.token}</span>
                  </div>
                </div>

                {/* Payoff Action */}
                {!loan.repaid && (
                  <button
                    id={`payback-trigger-button-${loan.id}`}
                    type="button"
                    onClick={() => handleRepayLoan(loan.id)}
                    className="w-full py-2.5 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-purple-300 font-extrabold text-xs tracking-wide hover:bg-[#a78bfa]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    Payoff & Settle Stablecoin Borrow
                  </button>
                )}

                {loan.repaid && (
                  <div className="py-2 text-center text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/15 flex items-center justify-center gap-1.5 flex-wrap">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Reputation fully authenticated and verified
                  </div>
                )}

                </GlassCard>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
