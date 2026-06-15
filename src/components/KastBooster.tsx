import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import Tag from './Tag';
import { 
  CreditCard, 
  Zap, 
  Coins, 
  Sparkles, 
  ExternalLink, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface KastBoosterProps {
  currentScore: number;
  onApplyBoost: (boostAmount: number) => void;
  isBoosted: boolean;
}

interface SpendingHabit {
  category: string;
  icon: string;
  amount: number;
  frequency: string;
  impactScore: number;
  status: 'Unverified' | 'AI Verified On-Chain';
  color: string;
  speedMultiplier: string;
}

export default function KastBooster({ currentScore, onApplyBoost, isBoosted }: KastBoosterProps) {
  const { t } = useLanguage();
  const [kastUser, setKastUser] = useState('');
  const [contractAddr, setContractAddr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'idle' | 'failed'>('idle');
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  
  // Simulation Sandbox State
  const [simulationAmount, setSimulationAmount] = useState<number>(300);
  const [simulationAsset, setSimulationAsset] = useState<'USDT' | 'USDC'>('USDT');
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);
  const [simulatedTxHash, setSimulatedTxHash] = useState<string | null>(null);

  // Active status of KAST connection
  const [cardActive, setCardActive] = useState(isBoosted);
  const [activeKastUser, setActiveKastUser] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [activeMultiplier, setActiveMultiplier] = useState(isBoosted ? '2.5x' : '1.0x');
  
  // Multi-step instructional state
  const [activeStep, setActiveStep] = useState<number>(1);

  // Initialize stored KAST profile details
  useEffect(() => {
    try {
      const storedActive = localStorage.getItem('kast_booster_active') === 'true';
      const storedUser = localStorage.getItem('kast_booster_username') || '';
      const storedAddr = localStorage.getItem('kast_booster_address') || '';
      
      if (storedActive || isBoosted) {
        setCardActive(true);
        setActiveMultiplier('2.5x');
      }
      if (storedUser) {
        setKastUser(storedUser);
        setActiveKastUser(storedUser);
      }
      if (storedAddr) {
        setContractAddr(storedAddr);
        setActiveAddress(storedAddr);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [isBoosted]);

  const spendingHabits: SpendingHabit[] = [
    { 
      category: 'Organic Groceries & Restos', 
      icon: '🥗', 
      amount: 145.20, 
      frequency: 'Weekly', 
      impactScore: 18, 
      status: cardActive ? 'AI Verified On-Chain' : 'Unverified', 
      color: '#10b981',
      speedMultiplier: '3x Faster with KAST'
    },
    { 
      category: 'Cloud Services & AI Hostings', 
      icon: '⚡', 
      amount: 320.00, 
      frequency: 'Monthly', 
      impactScore: 32, 
      status: cardActive ? 'AI Verified On-Chain' : 'Unverified', 
      color: '#f59e0b',
      speedMultiplier: '3x Faster with KAST'
    },
    { 
      category: 'Commutes & Travel Bookings', 
      icon: '✈️', 
      amount: 450.00, 
      frequency: 'Monthly', 
      impactScore: 40, 
      status: cardActive ? 'AI Verified On-Chain' : 'Unverified', 
      color: '#3b82f6',
      speedMultiplier: '3x Faster with KAST'
    },
    { 
      category: 'Web3 domains & Gas Refuels', 
      icon: '⚓', 
      amount: 60.00, 
      frequency: 'Intermittent', 
      impactScore: 10, 
      status: cardActive ? 'AI Verified On-Chain' : 'Unverified', 
      color: '#a78bfa',
      speedMultiplier: '3x Faster with KAST'
    },
  ];

  // Starts the sandbox simulator which tops up simulated stablecoin
  const handleSimulateTopup = async () => {
    setIsSimulatingSend(true);
    setSimulatedTxHash(null);
    
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const randomHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const shorthandHash = `${randomHash.slice(0, 6)}...${randomHash.slice(-6)}`;
    
    setSimulatedTxHash(shorthandHash);
    setIsSimulatingSend(false);
    
    // Auto-populate contract inputs with simulated contract to ease onboarding feel
    if (!contractAddr) {
      setContractAddr(randomHash);
    }
    if (!kastUser) {
      setKastUser('kast_ambassador');
    }
    // Set step to 3 to guide user on what to do next
    setActiveStep(3);
  };

  // Triggers the decentralized AI verification routine
  const handleVerifyKast = async () => {
    if (!kastUser || !contractAddr) return;
    setIsVerifying(true);
    setScanSteps([]);
    setVerificationResult('idle');

    // Fun explanatory steps showing AI engine querying the blockchain for KAST card deposits
    const steps = [
      `Establishing handshakes with KAST platform consumer oracles...`,
      `Scanning on-chain transaction history for connected wallet: ${contractAddr.slice(0, 6)}...${contractAddr.slice(-4)}`,
      `Filtering for ERC-20 / stablecoin transfer tokens (USDT, USDC, EURK)...`,
      `Parsing contract deposit hashes matching user signature: "@${kastUser}"...`,
      `AI-evaluating monthly credit velocity and categorizing merchant categories...`,
      `Score multiplier calculated: Velocity indicates super-heavy utility! (+2.5x Active)`,
      `Injecting reputational upgrade into your permanent score ledger...`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setScanSteps((prev) => [...prev, steps[i]]);
    }

    setVerificationResult('success');
    setCardActive(true);
    setActiveKastUser(kastUser);
    setActiveAddress(contractAddr);
    setActiveMultiplier('2.5x');
    setIsVerifying(false);

    // Persist to state and root app context
    if (!isBoosted) {
      onApplyBoost(80);
    }

    try {
      localStorage.setItem('kast_booster_username', kastUser);
      localStorage.setItem('kast_booster_address', contractAddr);
      localStorage.setItem('kast_booster_active', 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('kast_booster_username');
      localStorage.removeItem('kast_booster_address');
      localStorage.setItem('kast_booster_active', 'false');
    } catch (e) {
      console.warn(e);
    }
    setCardActive(false);
    setActiveKastUser('');
    setActiveAddress('');
    setActiveMultiplier('1.0x');
    setKastUser('');
    setContractAddr('');
    setVerificationResult('idle');
    setScanSteps([]);
    setSimulatedTxHash(null);
    setActiveStep(1);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-100">
      
      {/* Pitch Header Banner: Pitching to "the massive" */}
      <div className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-[#14F195]/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#14F195]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Exclusively with class-leading platform KAST
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Own Your Credit Score via <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">Everyday Purchases</span>
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
              DeFi protocols evaluate static assets, but the real world values active demand velocity. 
              Karmascore.xyz tracks your real-world crypto spending on <strong className="text-white">KAST</strong>, validating physical debit transactions to reward your FICO-equivalent rating with a massive <span className="text-emerald-400 font-bold">2.5x multiplier</span>!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="https://app.kast.xyz/referral/O7A99Y65"
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#14F195] to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_35px_rgba(20,241,149,0.5)] cursor-pointer"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                <span>💳</span> Get KAST Debit Card
                <ExternalLink className="w-3 h-3 text-slate-950 shrink-0" />
              </a>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-white/[0.04] px-3 py-2 rounded-xl">
                🌟 Official Referral Link Enabled: <strong className="text-white hover:underline"><a href="https://app.kast.xyz/referral/O7A99Y65" target="_blank" referrerPolicy="no-referrer">app.kast.xyz</a></strong>
              </span>
            </div>
          </div>

          {/* Interactive Live Holographic Card Visualizer */}
          <div className="xs:w-80 w-full shrink-0">
            <div 
              className={`relative xs:w-80 w-full h-52 rounded-2xl p-6 border transition-all duration-500 hover:scale-103 select-none flex flex-col justify-between overflow-hidden cursor-help shadow-2xl ${
                cardActive 
                  ? 'border-emerald-400 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 text-white shadow-emerald-500/20' 
                  : 'border-white/[0.08] bg-gradient-to-br from-slate-900 to-slate-950 text-slate-300'
              }`}
            >
              {/* Glossy top overlay reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12" />
              
              {/* Backlight reflection glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#14F195]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xl font-black tracking-tighter text-white font-sans flex items-center gap-1">
                    KAST<span className="text-emerald-400">💳</span>
                  </span>
                  <p className="text-[7.5px] font-mono tracking-widest leading-none text-slate-500">STABLECOIN DEBIT PLATINUM</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full font-mono text-[8.5px] font-black uppercase shadow tracking-wider border ${
                  cardActive 
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' 
                    : 'bg-slate-500/10 text-slate-400 border-white/[0.04]'
                }`}>
                  {cardActive ? '● REPUTATION VERIFIED' : '○ DISCONNECTED'}
                </div>
              </div>

              {/* Card metallic gold chip */}
              <div className="w-10 h-7 bg-gradient-to-br from-amber-300 via-yellow-500 to-yellow-600 rounded-md border border-yellow-300/25 relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-30">
                  {Array.from({length: 9}).map((_, i) => <div key={i} className="border border-black" />)}
                </div>
              </div>

              {/* Card holder signature and active reputation rating */}
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 tracking-wider block">KAST USER ID</span>
                  <span className="text-sm font-bold text-slate-100 uppercase tracking-tight block truncate max-w-[150px]">
                    {cardActive && activeKastUser ? `@${activeKastUser}` : '@not_linked'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-slate-500 block">MULTIPLIER INJECTED</span>
                  <span className={`text-sm font-bold font-mono ${cardActive ? 'text-[#14F195]' : 'text-slate-400'}`}>
                    🚀 {activeMultiplier} SPEED
                  </span>
                </div>
              </div>
            </div>
            {cardActive && (
              <div className="text-center mt-3">
                <button 
                  onClick={handleReset}
                  className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors uppercase cursor-pointer"
                >
                  [Reset Linked KAST Account details]
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Pitching Workbench: Split Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Stepper + Interactive Sandbox + Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Interactive Pipeline: Steps To Play */}
          <GlassCard className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <Sparkles className="w-5 h-5 text-[#14F195]" />
              The Sovereign Spending Loop
            </h3>
            
            <p className="text-xs text-slate-400 mb-6">
              Spend stablecoins locally, gain credit globally. Follow the 4-step integration process to activate real-time AI checking of your daily transactions:
            </p>

            {/* Steps tracker UI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <button 
                onClick={() => setActiveStep(1)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStep === 1 
                    ? 'bg-slate-900 border-[#14F195]/50 text-white' 
                    : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-[9px] font-mono text-[#14F195] font-black uppercase mb-1">Step 1</div>
                <div className="font-bold text-xs truncate">Link Wallet</div>
              </button>
              <button 
                onClick={() => setActiveStep(2)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStep === 2 
                    ? 'bg-slate-900 border-[#14F195]/50 text-white' 
                    : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-[9px] font-mono text-[#14F195] font-black uppercase mb-1">Step 2</div>
                <div className="font-bold text-xs truncate">Topup KAST</div>
              </button>
              <button 
                onClick={() => setActiveStep(3)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStep === 3 
                    ? 'bg-slate-900 border-[#14F195]/50 text-white' 
                    : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-[9px] font-mono text-[#14F195] font-black uppercase mb-1">Step 3</div>
                <div className="font-bold text-xs truncate">Sync ID</div>
              </button>
              <button 
                onClick={() => setActiveStep(4)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStep === 4 
                    ? 'bg-slate-900 border-[#14F195]/50 text-white' 
                    : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-[9px] font-mono text-[#14F195] font-black uppercase mb-1">Step 4</div>
                <div className="font-bold text-xs truncate">Boost Score</div>
              </button>
            </div>

            {/* Conditional step panels */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.04] text-sm">
              {activeStep === 1 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-[#14F195] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Wallet Linked to Karmascore.xyz</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your Web3 wallet is actively integrated into Karma AI. Our scanning oracle checks this wallet for on-chain transfer transactions dispatched to the KAST crypto card network. You are ready to start routing!
                  </p>
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="mt-2 text-xs font-bold text-[#14F195] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Proceed to Step 2: Swap & Topup <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Coins className="w-4.5 h-4.5 text-yellow-400" />
                    <span>Swap & Send Stablecoin to KAST Debit Card</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Send stablecoins (USDT, USDC, EURK) from your connected wallet directly to KAST system addresses. This feeds your debit card account, ready for online or in-store purchases globally.
                  </p>
                  
                  {/* Interactive Mock Top-Up SandBox Simulator */}
                  <div className="p-3 bg-slate-900 border border-white/[0.05] rounded-xl space-y-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">🧪 LIVE ON-CHAIN TOP-UP SIMULATOR</span>
                      <span className="text-[10.5px] font-mono text-slate-500">Test network (Goerli/Devnet)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-mono text-slate-400 mb-1">STABLECOIN AMOUNT</label>
                        <select 
                          value={simulationAmount} 
                          onChange={(e) => setSimulationAmount(Number(e.target.value))}
                          className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-white/10 outline-none"
                        >
                          <option value="150">150 USDT / USDC</option>
                          <option value="500">500 USDT / USDC</option>
                          <option value="1200">1200 USDT / USDC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-mono text-slate-400 mb-1">CHOOSE ASSET</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSimulationAsset('USDT')}
                            className={`flex-1 py-1.5 rounded text-xs font-bold font-mono border ${
                              simulationAsset === 'USDT' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-slate-950 border-white/10 text-slate-400'
                            }`}
                          >
                            USDT
                          </button>
                          <button 
                            onClick={() => setSimulationAsset('USDC')}
                            className={`flex-1 py-1.5 rounded text-xs font-bold font-mono border ${
                              simulationAsset === 'USDC' 
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                : 'bg-slate-950 border-white/10 text-slate-400'
                            }`}
                          >
                            USDC
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSimulateTopup}
                      disabled={isSimulatingSend}
                      className="w-full text-xs font-bold py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded text-white flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isSimulatingSend ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Broadcasting simulated transaction...
                        </>
                      ) : (
                        'Execute Topup Simulation Transfer'
                      )}
                    </button>

                    {simulatedTxHash && (
                      <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-[10.5px] font-mono text-emerald-400 flex justify-between items-center">
                        <span>SUCCESS! Simulated top-up completed.</span>
                        <span className="underline">Hash: {simulatedTxHash}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-yellow-400/80">💡 Try the simulator above to auto-generate the credentials!</span>
                    <button 
                      onClick={() => setActiveStep(3)}
                      className="text-xs font-bold text-[#14F195] hover:underline flex items-center justify-end gap-1 cursor-pointer"
                    >
                      Step 3: Register Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <CreditCard className="w-4.5 h-4.5 text-purple-400 mb-0.5" />
                    <span>Enter KAST User Nickname & Receive Address</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Register your KAST account details below. Specify your KAST user nickname and the exact contract address that receives your stablecoin deposit topups so our off-chain indexing AI can permanently log your spending frequency.
                  </p>
                  
                  {/* Register info */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                          KAST Username *
                        </label>
                        <input
                          type="text"
                          value={kastUser}
                          onChange={(e) => setKastUser(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          placeholder="@e.g. spendmaster"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/10 rounded-lg outline-none focus:border-emerald-400 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                          KAST Deposit Contract Address *
                        </label>
                        <input
                          type="text"
                          value={contractAddr}
                          onChange={(e) => setContractAddr(e.target.value)}
                          placeholder="0x... or simulated transaction address"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/10 rounded-lg outline-none focus:border-emerald-400 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleVerifyKast}
                      disabled={isVerifying || !kastUser || !contractAddr}
                      className="w-full py-2.5 bg-[#14F195] text-slate-950 font-black text-xs uppercase rounded-lg transition-colors hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isVerifying ? 'SCANNING MEMPOOL FOR TRANSFERS...' : 'AI-VERIFY & SYNC PERFORMANCE INDEX'}
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Permanent Multiplier Upgrade Active (+80 Score)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Great choice! Spending or routing stablecoins through the KAST debit card has earned your decentralized ledger an un-slashable credit reputation weight of **2.5x**. Continue using KAST to accelerate your FICO status over other standard static wallets.
                  </p>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => setActiveStep(2)}
                      className="text-xs text-[#14F195] hover:underline font-bold cursor-pointer"
                    >
                      🔁 Run Simulator to verify another top-up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Interactive AI Scanning progression panel */}
          {(isVerifying || scanSteps.length > 0) && (
            <GlassCard className="p-5 md:p-6 bg-slate-950 border border-[#14F195]/10 font-mono text-xs text-slate-300">
              <div className="text-[10px] text-emerald-400 font-bold uppercase select-none border-b border-white/[0.04] pb-2 mb-3 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  🛰️ DECENTRALIZED SCORING ORACLE FEED
                </span>
                <span className="bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 text-[9px]">
                  {isVerifying ? 'STATUS: PROCESSING' : 'STATUS: SYNCHRONIZED'}
                </span>
              </div>
              
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5">
                    <span className="text-slate-500">[{idx + 1}]</span>
                    <span className={idx === scanSteps.length - 1 && isVerifying ? 'text-emerald-300 font-bold animate-pulse' : 'text-slate-300'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {verificationResult === 'success' && (
                <div className="text-center pt-4 mt-4 border-t border-white/[0.04] text-emerald-400 flex flex-col justify-center items-center gap-2">
                  <div className="p-1 px-3 bg-[#14F195]/10 border border-[#14F195]/20 rounded-full font-black text-xs font-mono">
                    ✨ REPUTATION MATRIX ENGAGED successfully
                  </div>
                  <p className="text-[11px] text-slate-300 max-w-md">
                    We scanned and synchronized on-chain logs to <strong className="text-white">@{activeKastUser}</strong>. Your permanent FICO-equivalent Karmascore is boosted by <strong className="text-emerald-400">+80 rating points</strong> with active real-world credit analytics!
                  </p>
                </div>
              )}
            </GlassCard>
          )}

          {/* Connected Spend Habits Grid */}
          <GlassCard className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.04]">
              <h3 className="text-sm font-mono tracking-widest text-[#a78bfa] uppercase">
                Active Spending habits Analysis
              </h3>
              <span className="text-xs text-slate-400">
                Data Index: {cardActive ? 'Active Realtime Sync' : 'Static Estimation'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spendingHabits.map((habit, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.02] flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{habit.category}</h4>
                        <span className="text-[10px] text-slate-500">{habit.frequency} expenditure</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded border ${
                      cardActive 
                        ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                        : 'bg-slate-500/5 border-white/[0.03] text-slate-400'
                    }`}>
                      {cardActive ? '⚡ AI Verified' : '○ Static'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Indexed monthly spend</span>
                      <span className="text-white">${habit.amount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-purple-400">{habit.speedMultiplier}</span>
                      <span className={`font-bold ${cardActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                        +{habit.impactScore} XP Score Weight
                      </span>
                    </div>
                  </div>

                  {/* Visual gauge tracker */}
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: cardActive ? '100%' : '15%',
                        background: cardActive ? `linear-gradient(90deg, #10b981, ${habit.color})` : '#475569'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Unique Investor Pitch, why it pops and wows */}
        <div className="lg:col-span-5 space-y-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          
          {/* Pitch Decks "Why we are unique" */}
          <GlassCard className="p-6 md:p-8 bg-gradient-to-br from-indigo-950/20 to-slate-950 border border-purple-500/10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div>
              <div className="text-[9px] font-mono tracking-widest text-[#14F195] uppercase mb-4 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
                THE REPUTATION REVOLUTION
              </div>

              <h3 className="text-lg font-black text-white mb-2 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
                Consumer Liquidity is the Ultimate Credit Signal
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Standard FICO models depend on predatory credit card debt. Karma AI proposes a spectacular upgrade: **utilize consumer asset velocity as credit validity**. 
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.04] shrink-0 text-white font-mono text-center font-bold text-xs w-10">
                    💡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">Physical Card Synergy</h4>
                    <p className="text-[11px] text-slate-400">
                      KAST lets you spend stablecoins anywhere Visa is accepted. Under the hood, Karmascore.xyz's AI instantly observes the card loading logs to verify real-world activity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.04] shrink-0 text-white font-mono text-center font-bold text-xs w-10">
                    🔥
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">3x Velocity Compression</h4>
                    <p className="text-[11px] text-slate-400">
                      Standard rating models take 6 months of static history. Routing your transactions to KAST compressor builds your trust points **3x faster** on-chain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.04] shrink-0 text-white font-mono text-center font-bold text-xs w-10">
                    🪐
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">Absolute Identity Sovereignty</h4>
                    <p className="text-[11px] text-slate-400">
                      Nobody learns what exact items you buy. Our zero-knowledge AI models extract the velocity metrics and volumes, retaining absolute billing privacy directly on-chain.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.03] flex justify-between items-center text-[10.5px] font-mono text-slate-500">
              <span>Karma / KAST integration</span>
              <span className="text-emerald-400">V1.2 Live Oracle</span>
            </div>
          </GlassCard>

          {/* Mini Interactive Calculator / Estimator Panel for the pitch */}
          <GlassCard className="p-6 md:p-8 bg-purple-950/10 border border-purple-500/10 relative overflow-hidden">
            <h4 className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Impact Forecaster
            </h4>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Enter your monthly estimated real-world stablecoin retail spending volume to forecast your accelerated Karma FICO rating impact:
            </p>

            <div className="space-y-4 font-mono">
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-white/[0.04] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Monthly retail spend:</span>
                  <span className="text-emerald-400 font-bold">${simulationAmount + 250} USD</span>
                </div>
                
                <input 
                  type="range" 
                  min="50" 
                  max="3000" 
                  step="50"
                  value={simulationAmount} 
                  onChange={(e) => setSimulationAmount(Number(e.target.value))}
                  className="w-full accent-emerald-400 mb-2 mt-1 cursor-pointer bg-slate-800"
                />

                <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-400 pt-1.5 border-t border-white/[0.03]">
                  <div>
                    <span>Karma Score Growth:</span>
                    <strong className="text-white block mt-0.5">
                      +{Math.min(150, Math.floor((simulationAmount + 250) * 0.08))} Points / mo
                    </strong>
                  </div>
                  <div>
                    <span>Speed Multiplier:</span>
                    <strong className="text-[#14F195] block mt-0.5">
                      {cardActive ? '🚀 2.5x Max Turbo Active' : '🔒 1.0x (Unlock via KAST)'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-950/15 to-indigo-950/15 border border-purple-500/10 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">TOTAL EXPECTED RATING IMPACT</span>
                <span className="text-xl font-bold text-white tracking-tight font-sans">
                  {cardActive 
                    ? `FICO Level: Excellent (Boosted +${80 + Math.min(150, Math.floor((simulationAmount + 250) * 0.08))} pts)` 
                    : `FICO Level: Base Upgrade Needed (+80 Points Available)`
                  }
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Global Pitch Deck Call to Action */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <span className="text-indigo-400 text-lg">💡</span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Ready to pitch "the massive"?</span>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Toggle client dashboard tabs to present this spend loop cleanly. Open your browser inspector console or sandbox simulation panel to verify the mock database performance live!
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
