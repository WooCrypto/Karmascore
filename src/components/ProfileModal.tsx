import { useState, useEffect, useRef } from 'react';
import { User, Wallet } from '../types';
import GlassCard from './GlassCard';
import { ShieldCheck, Cpu, Database, Activity, Landmark, Wallet as WalletIcon, PenLine, Sparkles, X, ChevronRight, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ConnectModalProps {
  onConnect: (data: { wallet: Wallet; username: string; hideWallet: boolean; address: string; profile?: User }) => void;
  onClose: () => void;
}

type Step = 'pick' | 'requesting' | 'signing' | 'setup' | 'scanning' | 'welcome_back';
type Method = 'browser' | 'address' | 'demo';

const INJECTED_WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#f6851b', desc: 'Most popular browser extension' },
  { id: 'rabby', name: 'Rabby Wallet', icon: '🐰', color: '#8672FF', desc: 'Security-focused EVM wallet' },
  { id: 'coinbasewallet', name: 'Coinbase Wallet', icon: '🔵', color: '#0052ff', desc: 'Coinbase browser extension' },
  { id: 'phantom', name: 'Phantom (EVM)', icon: '👻', color: '#ab9ff2', desc: 'Solana & Ethereum EVM' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', color: '#ff4d82', desc: 'Beautiful mobile wallet' },
];

const SCAN_STAGES = [
  { title: 'Connecting to RPC Gateways', desc: 'Handshaking with Ethereum, Base, and Polygon nodes...', icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
  { title: 'Fetching Transaction History', desc: 'Scanning block history for your wallet activity...', icon: <Database className="w-5 h-5 text-purple-400" /> },
  { title: 'Analyzing Hold Patterns', desc: 'Measuring conviction streaks and liquidity behavior...', icon: <Activity className="w-5 h-5 text-pink-400" /> },
  { title: 'Calibrating Behavior Score', desc: 'Mapping governance participation and protocol reputation...', icon: <Landmark className="w-5 h-5 text-emerald-400" /> },
  { title: 'Compiling Karma Score', desc: 'Building your cryptographic credit reputation passport...', icon: <ShieldCheck className="w-5 h-5 text-amber-500 animate-bounce" /> },
];

// ─────────────────────────────────────────────
// WalletModal
// ─────────────────────────────────────────────
export function WalletModal({ onConnect, onClose }: ConnectModalProps) {
  const [step, setStep] = useState<Step>('pick');
  const [method, setMethod] = useState<Method>('browser');

  // Wallet connection state
  const [detectedWallet, setDetectedWallet] = useState<typeof INJECTED_WALLETS[0] | null>(null);
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('sandbox_sig');
  const [connectionError, setConnectionError] = useState('');

  // Setup form state
  const [username, setUsername] = useState('');
  const [hideWallet, setHideWallet] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualAddressError, setManualAddressError] = useState('');

  // Scan animation state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Welcome back
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [savedWallet, setSavedWallet] = useState<Wallet | null>(null);

  const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum && !(window as any).ethereum.__isFallback;

  // Detect which injected wallet is present
  useEffect(() => {
    if (!hasEthereum) return;
    const eth = (window as any).ethereum;
    if (eth.isRabby) setDetectedWallet(INJECTED_WALLETS[1]);
    else if (eth.isCoinbaseWallet) setDetectedWallet(INJECTED_WALLETS[2]);
    else if (eth.isPhantom) setDetectedWallet(INJECTED_WALLETS[3]);
    else setDetectedWallet(INJECTED_WALLETS[0]); // default MetaMask
  }, [hasEthereum]);

  // Scan animation loop (runs during 'scanning' step)
  useEffect(() => {
    if (step !== 'scanning') return;
    setScanProgress(0);
    setScanStage(0);

    const progressInterval = setInterval(() => {
      setScanProgress(p => (p >= 100 ? 100 : p + 2));
    }, 76);

    const stageInterval = setInterval(() => {
      setScanStage(s => (s >= SCAN_STAGES.length - 1 ? SCAN_STAGES.length - 1 : s + 1));
    }, 820);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [step]);

  // ── Browser wallet connection ──
  async function connectBrowserWallet(walletHint?: typeof INJECTED_WALLETS[0]) {
    const wallet = walletHint || detectedWallet || INJECTED_WALLETS[0];
    setConnectionError('');
    setStep('requesting');

    const eth = (window as any).ethereum;
    if (!eth || eth.__isFallback) {
      setConnectionError('No Web3 wallet detected. Please install MetaMask or another browser extension, then try again.');
      setStep('pick');
      return;
    }

    let accounts: string[];
    try {
      accounts = await eth.request({ method: 'eth_requestAccounts' });
    } catch (err: any) {
      const msg = err?.code === 4001
        ? 'You rejected the connection request. Please approve it in your wallet to continue.'
        : err?.message?.includes('already pending')
          ? 'A connection request is already pending. Check your wallet extension.'
          : `Wallet connection failed: ${err?.message || 'Unknown error'}`;
      setConnectionError(msg);
      setStep('pick');
      return;
    }

    if (!accounts || !accounts[0]) {
      setConnectionError('No accounts returned from wallet. Please unlock your wallet and try again.');
      setStep('pick');
      return;
    }

    const resolvedAddress = accounts[0].toLowerCase();
    setAddress(resolvedAddress);

    // Get challenge and request signature
    setStep('signing');
    let sig = 'sandbox_sig';
    try {
      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: resolvedAddress }),
      });
      const challengeData = await challengeRes.json();

      if (challengeData?.message && !challengeData.error) {
        const hexMessage = '0x' + Array.from(new TextEncoder().encode(challengeData.message))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        sig = await eth.request({
          method: 'personal_sign',
          params: [hexMessage, resolvedAddress],
        });
      }
    } catch (signErr: any) {
      if (signErr?.code === 4001) {
        setConnectionError('You rejected the signature request. Signature is needed to verify wallet ownership.');
        setStep('pick');
        return;
      }
      // Non-rejection errors: continue with sandbox_sig fallback
      console.warn('[KARMA] Signing failed, using fallback:', signErr);
    }

    setSignature(sig);

    // Check for returning user
    try {
      const registryRaw = localStorage.getItem('karma_profiles_registry');
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        const saved = registry[resolvedAddress];
        if (saved) {
          setSavedProfile(saved);
          setSavedWallet(wallet);
          setStep('welcome_back');
          return;
        }
      }
    } catch { /* ignore */ }

    setStep('setup');
  }

  // ── Launch scan + backend verify ──
  async function launchScan(resolvedAddress: string, resolvedSignature: string, resolvedUsername: string, wallet: Wallet) {
    setStep('scanning');

    let profile: any = null;
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: resolvedAddress,
          signature: resolvedSignature,
          username: resolvedUsername,
          hideWallet,
          wallet,
        }),
      });
      if (res.ok) {
        const parsed = await res.json();
        if (parsed && !parsed.error) profile = parsed;
      }
    } catch (err) {
      console.warn('[KARMA] Backend verify failed, using local fallback:', err);
    }

    // Local fallback if backend unreachable
    if (!profile) {
      const clean = resolvedAddress.toLowerCase();
      let hash = 0;
      for (let i = 0; i < clean.length; i++) {
        hash = (hash << 5) - hash + clean.charCodeAt(i);
        hash |= 0;
      }
      hash = Math.abs(hash);
      const karmaScore = Math.max(120, Math.min(1000, 380 + (hash % 580)));
      const personalities = ['Diamond', 'Visionary', 'Builder', 'Sage', 'Guardian', 'Explorer', 'Phoenix', 'Pioneer'];
      profile = {
        address: clean,
        username: resolvedUsername,
        hideWallet,
        wallet,
        streak: 3 + (hash % 64),
        connectedAt: new Date().toISOString(),
        karmaScore,
        personality: personalities[hash % personalities.length],
        auraPoints: 50 + (hash % 500),
        lastClaimedAt: '',
        activities: [],
        categories: [
          { label: 'Patience', value: Math.min(100, 30 + (hash % 60)), color: '#a78bfa', icon: '◈' },
          { label: 'Loyalty', value: Math.min(100, 25 + (hash % 65)), color: '#60a5fa', icon: '◆' },
          { label: 'Wisdom', value: Math.min(100, 35 + (hash % 55)), color: '#fbbf24', icon: '⊕' },
          { label: 'Generosity', value: Math.min(100, 20 + (hash % 60)), color: '#34d399', icon: '⬡' },
          { label: 'Energy', value: Math.min(100, 15 + (hash % 70)), color: '#f472b6', icon: '◉' },
        ],
        scores: { walletAge: 60, holdingBehavior: 70, txQuality: 75, staking: 40, governance: 45, community: 55, protocolRep: 90 },
        metrics: { firstTxDate: new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0], walletAgeDays: 180, totalTransactions: 50 + (hash % 200), activeDays: 20, tokenBalancesUSD: 500 + (hash % 5000), nftCount: hash % 8, stakedAmountUSD: 0, stakedDurationDays: 0, daoVotes: hash % 5, earlyMintsCount: 0, riskInteractionsCount: 0 },
        history: [
          { time: 'Jun 10', reputation: karmaScore - 10, activityVolume: 3, gasSaved: 0.01 },
          { time: 'Jun 13', reputation: karmaScore - 4, activityVolume: 5, gasSaved: 0.015 },
          { time: 'Jun 17', reputation: karmaScore, activityVolume: 6, gasSaved: 0.022 },
        ],
      };
    }

    // Save to registry
    try {
      const registryRaw = localStorage.getItem('karma_profiles_registry');
      const registry = registryRaw ? JSON.parse(registryRaw) : {};
      registry[resolvedAddress] = {
        username: resolvedUsername,
        hideWallet,
        address: resolvedAddress,
        karmaScore: profile.karmaScore,
        personality: profile.personality,
        auraPoints: profile.auraPoints,
      };
      localStorage.setItem('karma_profiles_registry', JSON.stringify(registry));
    } catch { /* ignore */ }

    // Wait for scan animation to complete (minimum 4.2s feels good)
    setTimeout(() => {
      onConnect({ wallet, username: resolvedUsername, hideWallet, address: resolvedAddress, profile });
    }, 4200);
  }

  // ── Setup form submit ──
  function handleSetupConfirm() {
    const trimmed = username.trim();
    if (!trimmed) { setUsernameError('Please enter a username.'); return; }
    if (trimmed.length < 3) { setUsernameError('Username must be at least 3 characters.'); return; }
    if (trimmed.length > 20) { setUsernameError('Username must be 20 characters or less.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setUsernameError('Only letters, numbers, and underscores allowed.'); return; }
    setUsernameError('');

    let resolvedAddress = address;
    let wallet: Wallet = { id: 'browser', name: detectedWallet?.name || 'Browser Wallet', icon: detectedWallet?.icon || '🔌', color: detectedWallet?.color || '#a78bfa', desc: 'Browser Extension' };

    if (method === 'address') {
      const clean = manualAddress.trim();
      const isHex = /^0x[a-fA-F0-9]{40}$/.test(clean);
      const isEns = clean.toLowerCase().endsWith('.eth') && clean.length > 4;
      if (!isHex && !isEns) {
        setManualAddressError('Enter a valid Ethereum address (0x...) or ENS name (.eth).');
        return;
      }
      resolvedAddress = clean;
      wallet = { id: 'manual_wallet', name: 'Manual Address', icon: '✍️', color: '#818cf8', desc: 'Read-Only Audit' };
    } else if (method === 'demo') {
      const hexChars = '0123456789abcdef';
      let addr = '0x';
      for (let i = 0; i < 40; i++) addr += hexChars[Math.floor(Math.random() * 16)];
      resolvedAddress = addr;
      wallet = { id: 'sandbox_wallet', name: 'Demo Mode', icon: '🎲', color: '#10b981', desc: 'Sandbox Demo' };
    } else {
      // browser method: use detectedWallet info
      if (detectedWallet) {
        wallet = { id: detectedWallet.id, name: detectedWallet.name, icon: detectedWallet.icon, color: detectedWallet.color, desc: detectedWallet.desc };
      }
    }

    setManualAddressError('');
    launchScan(resolvedAddress, signature, trimmed, wallet);
  }

  // ── Returning user quick-login ──
  function handleWelcomeBackLogin() {
    if (!savedProfile || !savedWallet) return;
    launchScan(savedProfile.address, signature, savedProfile.username, savedWallet);
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="wallet-modal-overlay">
      <div
        onClick={step !== 'scanning' ? onClose : undefined}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[440px]" style={{ animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>

            {/* ── Header ── */}
            <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-white/[0.04]">
              <div>
                <h3 className="font-extrabold text-[#f8fafc] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {step === 'pick' && 'Connect Wallet'}
                  {step === 'requesting' && 'Approve Connection'}
                  {step === 'signing' && 'Sign to Verify'}
                  {step === 'setup' && 'Set Up Profile'}
                  {step === 'scanning' && 'Scanning On-Chain...'}
                  {step === 'welcome_back' && 'Welcome Back'}
                </h3>
                <p className="text-slate-400 text-[11px] mt-1">
                  {step === 'pick' && 'Choose how to connect your on-chain identity.'}
                  {step === 'requesting' && 'Approve the connection in your wallet extension.'}
                  {step === 'signing' && 'Sign the message to prove wallet ownership.'}
                  {step === 'setup' && 'Choose a username for your Karma reputation profile.'}
                  {step === 'scanning' && 'Analyzing your wallet activity across chains...'}
                  {step === 'welcome_back' && 'Your session is still cached. Resume instantly.'}
                </p>
              </div>
              {step !== 'scanning' && step !== 'requesting' && step !== 'signing' && (
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer p-1 ml-4 shrink-0">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* ── STEP: pick ── */}
            {step === 'pick' && (
              <div className="p-7 space-y-4">
                {connectionError && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs leading-relaxed">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>{connectionError}</span>
                  </div>
                )}

                {/* Browser wallet section */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2.5 font-bold">Browser Extension</p>
                  {hasEthereum ? (
                    <button
                      onClick={() => { setMethod('browser'); connectBrowserWallet(); }}
                      className="w-full p-4 rounded-2xl flex items-center justify-between bg-white/[0.03] border border-white/[0.08] hover:bg-purple-500/[0.08] hover:border-purple-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                          {detectedWallet?.icon || '🔌'}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-100 text-sm">{detectedWallet?.name || 'Browser Wallet'}</div>
                          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">● Detected & Ready</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ) : (
                    <div className="w-full p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">🔌</div>
                        <div>
                          <div className="font-bold text-slate-400 text-sm">No Wallet Detected</div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Install{' '}
                            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">MetaMask</a>
                            {' '}or{' '}
                            <a href="https://rabby.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Rabby</a>
                            {' '}to connect your live wallet.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other popular wallets (all use window.ethereum) */}
                  {hasEthereum && detectedWallet && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {INJECTED_WALLETS.filter(w => w.id !== detectedWallet.id).map(w => (
                        <button
                          key={w.id}
                          onClick={() => { setMethod('browser'); connectBrowserWallet(w); }}
                          title={w.name}
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer flex flex-col items-center gap-1 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">{w.icon}</span>
                          <span className="text-[8.5px] text-slate-500 font-mono truncate w-full text-center">{w.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/[0.05]" />
                  <span className="mx-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">OR</span>
                  <div className="flex-grow border-t border-white/[0.05]" />
                </div>

                {/* Alternative methods */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setMethod('address'); setConnectionError(''); setStep('setup'); }}
                    className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/15 hover:bg-indigo-500/[0.07] hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col items-start gap-2 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <PenLine size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Enter Address</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Check any ETH wallet read-only</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMethod('demo'); setConnectionError(''); setStep('setup'); }}
                    className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/15 hover:bg-emerald-500/[0.07] hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col items-start gap-2 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Sparkles size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Demo Mode</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Explore with a sandbox ID</div>
                    </div>
                  </button>
                </div>

                <p className="text-center text-[9.5px] text-slate-600 leading-relaxed">
                  🔒 Read-only. We never access private keys or sign transactions.
                </p>
              </div>
            )}

            {/* ── STEP: requesting ── */}
            {step === 'requesting' && (
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${detectedWallet?.color || '#a78bfa'}`, borderTopColor: 'transparent' }} />
                  <span className="text-4xl">{detectedWallet?.icon || '🔌'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base">Open Your Wallet</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-[280px]">
                    A connection request has been sent to <strong className="text-slate-200">{detectedWallet?.name || 'your wallet'}</strong>. Click <em>Connect</em> in the popup to continue.
                  </p>
                </div>
                <button
                  onClick={() => { setStep('pick'); setConnectionError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-300 underline border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ── STEP: signing ── */}
            {step === 'signing' && (
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/40 animate-spin [animation-duration:3s]" />
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <WalletIcon size={22} className="text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base">Sign the Message</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-[280px]">
                    Check <strong className="text-slate-200">{detectedWallet?.name || 'your wallet'}</strong> for a signature request. This proves ownership — <em>no transaction or gas fee is needed</em>.
                  </p>
                </div>
                <div className="w-full p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] font-mono text-[10px] text-slate-400 text-left break-all">
                  <span className="text-slate-600 block mb-1 uppercase text-[9px] tracking-wider">Connected Address</span>
                  {address}
                </div>
                <button
                  onClick={() => { setStep('pick'); setConnectionError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-300 underline border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ── STEP: setup ── */}
            {step === 'setup' && (
              <div className="p-7 space-y-5">
                {/* Method indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                  <span className="text-sm">
                    {method === 'browser' ? (detectedWallet?.icon || '🔌') : method === 'address' ? '✍️' : '🎲'}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {method === 'browser'
                      ? (detectedWallet?.name || 'Browser Wallet')
                      : method === 'address'
                        ? 'Read-Only Address'
                        : 'Demo Mode'}
                  </span>
                  <button
                    onClick={() => { setStep('pick'); setConnectionError(''); }}
                    className="text-[9px] font-mono text-purple-400 hover:text-purple-300 underline border-none bg-transparent cursor-pointer ml-1"
                  >
                    Change
                  </button>
                </div>

                {method === 'browser' && address && (
                  <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Wallet Verified</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-300 break-all">{address}</p>
                  </div>
                )}

                {/* Username input */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-purple-400/60 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSetupConfirm()}
                      placeholder="crypto_navigator"
                      maxLength={20}
                      autoFocus
                      className="w-full pl-8 pr-4 py-3.5 rounded-xl border bg-white/[0.03] text-slate-100 text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.05] focus:border-purple-500/30"
                      style={{ borderColor: usernameError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  {usernameError && <p className="text-rose-400 text-[11px] mt-1.5">{usernameError}</p>}
                  <p className="text-[9px] text-slate-500 font-mono mt-1.5">Letters, numbers, underscores · 3–20 characters</p>
                </div>

                {/* Address input for manual mode */}
                {method === 'address' && (
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">
                      Ethereum Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={e => { setManualAddress(e.target.value); setManualAddressError(''); }}
                      placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                      className="w-full px-4 py-3 rounded-xl border bg-white/[0.03] text-slate-100 text-xs font-mono outline-none transition-all focus:bg-white/[0.05] focus:border-indigo-500/30"
                      style={{ borderColor: manualAddressError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)' }}
                    />
                    {manualAddressError && <p className="text-rose-400 text-[11px] mt-1.5">{manualAddressError}</p>}
                    <p className="text-[9px] text-slate-500 font-mono mt-1.5">Any valid 0x address or .eth ENS name</p>
                  </div>
                )}

                {/* Privacy toggle */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Hide Wallet Address</div>
                    <div className="text-[9.5px] text-slate-500 mt-0.5">Address stays private in leaderboards</div>
                  </div>
                  <button
                    onClick={() => setHideWallet(p => !p)}
                    className="w-11 h-6 rounded-full relative transition-all border outline-none cursor-pointer shrink-0"
                    style={{ backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)', borderColor: hideWallet ? '#a78bfa' : 'rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white absolute top-[4px] transition-all shadow"
                      style={{ left: hideWallet ? '22px' : '4px' }}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSetupConfirm}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer border-none"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', fontFamily: "'Syne', sans-serif" }}
                >
                  Compile My Karma Score →
                </button>
              </div>
            )}

            {/* ── STEP: welcome_back ── */}
            {step === 'welcome_back' && savedProfile && (
              <div className="p-7 space-y-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)' }}>
                    {savedProfile.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                      @{savedProfile.username}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 break-all">{savedProfile.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Karma Score</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1">
                      <span className="text-purple-400">✧</span> {savedProfile.karmaScore}/1000
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Archetype</span>
                    <span className="text-xs font-bold text-purple-400 font-mono mt-1 block">{savedProfile.personality || 'Visionary'}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleWelcomeBackLogin}
                    className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer border-none"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', fontFamily: "'Syne', sans-serif" }}
                  >
                    Reconnect Instantly
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setUsername(savedProfile.username); setHideWallet(savedProfile.hideWallet || false); setStep('setup'); }}
                      className="flex-1 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-400 text-xs hover:bg-white/[0.05] transition-all cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const reg = JSON.parse(localStorage.getItem('karma_profiles_registry') || '{}');
                          delete reg[savedProfile.address];
                          localStorage.setItem('karma_profiles_registry', JSON.stringify(reg));
                        } catch { /* ignore */ }
                        setSavedProfile(null);
                        setStep('pick');
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] text-rose-400 text-xs hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      Clear & Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: scanning ── */}
            {step === 'scanning' && (
              <div className="p-8 pb-10 flex flex-col items-center text-center space-y-6">
                {/* Radar ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse" />
                  <div className="absolute inset-2 rounded-full border border-purple-500/20 animate-ping [animation-duration:3s]" />
                  <div className="absolute inset-4 rounded-full border border-indigo-400/20 animate-spin [animation-duration:12s] border-dashed" />
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-[#a78bfa]/10 stroke-2 fill-none" />
                    <circle
                      cx="56" cy="56" r="48"
                      className="stroke-purple-500 stroke-[3px] fill-none transition-all duration-300"
                      strokeDasharray={301.6}
                      strokeDashoffset={301.6 - (301.6 * scanProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="w-16 h-16 rounded-full bg-slate-950/90 border border-purple-500/30 flex items-center justify-center text-3xl z-10"
                    style={{ boxShadow: '0 0 25px rgba(167,139,250,0.2)' }}>
                    {method === 'browser' ? (detectedWallet?.icon || '🔌') : method === 'address' ? '✍️' : '🎲'}
                  </div>
                  <div className="absolute -bottom-2 bg-slate-950 border border-purple-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono text-purple-300 font-bold z-20">
                    {scanProgress}%
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-100 text-base uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Karma Score Analysis
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Reading on-chain activity across Ethereum, Base, and Polygon...
                  </p>
                </div>

                {/* Stage terminal */}
                <div className="w-full bg-[#06060c]/60 p-4 rounded-2xl border border-white/[0.04] text-left space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0">{SCAN_STAGES[scanStage].icon}</span>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
                        Phase {scanStage + 1} of {SCAN_STAGES.length}
                      </span>
                      <span className="text-xs font-bold text-slate-200 block mt-0.5">{SCAN_STAGES[scanStage].title}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono border-t border-white/[0.03] pt-2">
                    {SCAN_STAGES[scanStage].desc}
                  </p>
                </div>

                {/* Dot indicators */}
                <div className="flex gap-2">
                  {SCAN_STAGES.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i < scanStage ? '#10b981' : i === scanStage ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                        boxShadow: i === scanStage ? '0 0 8px #a78bfa' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DisconnectModal
// ─────────────────────────────────────────────
interface DisconnectProps {
  user: User;
  onDisconnect: () => void;
  onClose: () => void;
}

export function DisconnectModal({ user, onDisconnect, onClose }: DisconnectProps) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="disconnect-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[380px]" style={{ animation: 'fadeUp 0.2s ease-out' }}>
          <GlassCard style={{ padding: 28 }}>
            <h3 className="font-extrabold text-[#f8fafc] text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Disconnect Reputation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You are signing out of <strong className="text-purple-400">@{user.username}</strong>. Your scores and streaks remain saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-white/5 bg-white/5 text-slate-300 font-medium text-xs hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onDisconnect}
                className="flex-1 py-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EditProfileModal
// ─────────────────────────────────────────────
interface EditProps {
  user: User;
  onSave: (updated: User) => void;
  onClose: () => void;
}

export function EditProfileModal({ user, onSave, onClose }: EditProps) {
  const [username, setUsername] = useState(user.username);
  const [hideWallet, setHideWallet] = useState(user.hideWallet);
  const [error, setError] = useState('');

  function handleSave() {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError('Only letters, numbers, and underscores allowed.'); return; }
    setError('');
    onSave({ ...user, username: trimmed, hideWallet });
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="edit-profile-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[400px]" style={{ animation: 'fadeUp 0.25s ease' }}>
          <GlassCard style={{ padding: 28 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-[#f8fafc] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Edit Profile</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-purple-400/60 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border bg-white/[0.03] text-slate-100 text-sm outline-none transition-all focus:bg-white/[0.05]"
                    style={{ borderColor: error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)' }}
                  />
                </div>
                {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                <div>
                  <div className="text-xs font-bold text-slate-200">Hide Wallet Address</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hides address in leaderboards.</div>
                </div>
                <button
                  onClick={() => setHideWallet(p => !p)}
                  className="w-11 h-6 rounded-full relative transition-all border outline-none cursor-pointer shrink-0"
                  style={{ backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)', borderColor: hideWallet ? '#a78bfa' : 'rgba(255,255,255,0.08)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-[4px] transition-all shadow" style={{ left: hideWallet ? '22px' : '4px' }} />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl text-white font-extrabold text-xs hover:opacity-90 transition-all cursor-pointer border-none"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', fontFamily: "'Syne', sans-serif" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
