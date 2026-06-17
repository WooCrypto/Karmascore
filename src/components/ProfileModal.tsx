import { useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import GlassCard from './GlassCard';
import {
  ShieldCheck, Cpu, Database, Activity, Landmark,
  Wallet as WalletIcon, PenLine, Sparkles, X, ChevronRight, AlertTriangle, CheckCircle2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────
const INJECTED_WALLETS = [
  { id: 'metamask',      name: 'MetaMask',        icon: '🦊', color: '#f6851b', desc: 'Most popular browser extension' },
  { id: 'rabby',         name: 'Rabby Wallet',     icon: '🐰', color: '#8672FF', desc: 'Security-focused EVM wallet' },
  { id: 'coinbasewallet',name: 'Coinbase Wallet',  icon: '🔵', color: '#0052ff', desc: 'Coinbase browser extension' },
  { id: 'phantom',       name: 'Phantom (EVM)',    icon: '👻', color: '#ab9ff2', desc: 'Solana & EVM compatible' },
  { id: 'rainbow',       name: 'Rainbow',          icon: '🌈', color: '#ff4d82', desc: 'Beautiful mobile wallet' },
];

const SCAN_STAGES = [
  { title: 'Connecting to RPC Gateways',    desc: 'Handshaking with Ethereum, Base, and Polygon nodes…',            icon: <Cpu      className="w-5 h-5 text-indigo-400" /> },
  { title: 'Fetching Transaction History',  desc: 'Scanning block history for your wallet activity…',               icon: <Database className="w-5 h-5 text-purple-400" /> },
  { title: 'Analyzing Hold Patterns',       desc: 'Measuring conviction streaks and liquidity behaviour…',          icon: <Activity className="w-5 h-5 text-pink-400" /> },
  { title: 'Calibrating Behaviour Score',   desc: 'Mapping governance participation and protocol reputation…',       icon: <Landmark className="w-5 h-5 text-emerald-400" /> },
  { title: 'Compiling Karma Score',         desc: 'Building your cryptographic credit reputation passport…',         icon: <ShieldCheck className="w-5 h-5 text-amber-500 animate-bounce" /> },
];

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
interface ConnectModalProps {
  onConnect: (data: { wallet: Wallet; username: string; hideWallet: boolean; address: string; profile?: User }) => void;
  onClose: () => void;
}

type Step   = 'pick' | 'requesting' | 'signing' | 'setup' | 'scanning';
type Method = 'browser' | 'address' | 'demo';

interface SavedEntry {
  username: string;
  hideWallet: boolean;
  address: string;
  karmaScore: number;
  personality: string;
  auraPoints: number;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function readRegistry(): Record<string, SavedEntry> {
  try { return JSON.parse(localStorage.getItem('karma_profiles_registry') || '{}'); } catch { return {}; }
}
function writeRegistry(reg: Record<string, SavedEntry>) {
  try { localStorage.setItem('karma_profiles_registry', JSON.stringify(reg)); } catch { /* ignore */ }
}
function toHex(str: string): string {
  return '0x' + Array.from(new TextEncoder().encode(str))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
function detectInjectedWallet() {
  const eth = typeof window !== 'undefined' && (window as any).ethereum;
  if (!eth || eth.__isFallback) return null;
  if (eth.isRabby)         return INJECTED_WALLETS[1];
  if (eth.isCoinbaseWallet) return INJECTED_WALLETS[2];
  if (eth.isPhantom)       return INJECTED_WALLETS[3];
  return INJECTED_WALLETS[0]; // MetaMask default
}

// ─────────────────────────────────────────────────────────────────────
// WalletModal
// ─────────────────────────────────────────────────────────────────────
export function WalletModal({ onConnect, onClose }: ConnectModalProps) {
  const [step, setStep]         = useState<Step>('pick');
  const [method, setMethod]     = useState<Method>('browser');
  const [detectedWallet]        = useState(() => detectInjectedWallet());
  const hasEthereum             = !!detectedWallet;

  // wallet connection
  const [connAddress,  setConnAddress]  = useState('');
  const [connSig,      setConnSig]      = useState('sandbox_sig');
  const [connWallet,   setConnWallet]   = useState<typeof INJECTED_WALLETS[0] | null>(null);
  const [connError,    setConnError]    = useState('');

  // setup form
  const [username,          setUsername]          = useState('');
  const [hideWallet,        setHideWallet]        = useState(false);
  const [usernameError,     setUsernameError]     = useState('');
  const [manualAddress,     setManualAddress]     = useState('');
  const [manualAddressError,setManualAddressError]= useState('');
  const [isReturning,       setIsReturning]       = useState(false); // pre-filled from registry

  // scan animation
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage,    setScanStage]    = useState(0);

  // scan animation loop
  useEffect(() => {
    if (step !== 'scanning') return;
    setScanProgress(0);
    setScanStage(0);
    const prog  = setInterval(() => setScanProgress(p => p >= 100 ? 100 : p + 2), 76);
    const stage = setInterval(() => setScanStage(s => s >= SCAN_STAGES.length - 1 ? SCAN_STAGES.length - 1 : s + 1), 820);
    return () => { clearInterval(prog); clearInterval(stage); };
  }, [step]);

  // ── STEP 1: browser wallet connect → always signs ──────────────────
  async function connectBrowserWallet(hint?: typeof INJECTED_WALLETS[0]) {
    const wallet = hint || detectedWallet;
    if (!wallet) { setConnError('No Web3 wallet detected. Install MetaMask or Rabby first.'); return; }
    setConnWallet(wallet);
    setConnError('');
    setStep('requesting');

    const eth = (window as any).ethereum;
    if (!eth || eth.__isFallback) {
      setConnError('Wallet extension not accessible. Make sure it is unlocked and refresh the page.');
      setStep('pick');
      return;
    }

    // 1. Request accounts
    let accounts: string[];
    try {
      accounts = await eth.request({ method: 'eth_requestAccounts' });
    } catch (err: any) {
      setConnError(
        err?.code === 4001
          ? 'You rejected the connection. Approve it in your wallet to continue.'
          : err?.message?.includes('already pending')
            ? 'A request is already pending — check your wallet extension.'
            : `Connection failed: ${err?.message || 'Unknown error'}`
      );
      setStep('pick');
      return;
    }
    if (!accounts?.[0]) {
      setConnError('No accounts returned. Please unlock your wallet and try again.');
      setStep('pick');
      return;
    }
    const addr = accounts[0].toLowerCase();
    setConnAddress(addr);

    // 2. Fetch challenge
    setStep('signing');
    let sig = '';
    try {
      const chalRes  = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });
      const chalData = await chalRes.json();
      if (chalData?.message && !chalData.error) {
        // 3. Request signature — this is the one place the wallet popup appears
        sig = await eth.request({
          method: 'personal_sign',
          params: [toHex(chalData.message), addr],
        });
      }
    } catch (signErr: any) {
      if (signErr?.code === 4001) {
        setConnError('Signature rejected. You must sign the message to verify ownership of this wallet.');
        setStep('pick');
        return;
      }
      // Network / timeout errors — continue with empty sig (server handles gracefully)
      console.warn('[KARMA] Signing error (non-rejection):', signErr);
    }
    setConnSig(sig || 'sandbox_sig');

    // 4. Pre-fill username from registry if returning
    const registry = readRegistry();
    const saved = registry[addr];
    if (saved) {
      setUsername(saved.username);
      setHideWallet(saved.hideWallet ?? false);
      setIsReturning(true);
    } else {
      setUsername('');
      setHideWallet(false);
      setIsReturning(false);
    }

    setStep('setup');
  }

  // ── STEP 2: confirm setup → launch scan ────────────────────────────
  function handleSetupConfirm() {
    const trimmed = username.trim();
    if (!trimmed)           { setUsernameError('Please enter a username.');                        return; }
    if (trimmed.length < 3) { setUsernameError('Username must be at least 3 characters.');        return; }
    if (trimmed.length > 20){ setUsernameError('Username must be 20 characters or fewer.');       return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setUsernameError('Only letters, numbers, and underscores.'); return; }
    setUsernameError('');

    let resolvedAddress = connAddress;
    let wallet: Wallet;
    let resolvedSig     = connSig;

    if (method === 'browser') {
      wallet = connWallet
        ? { id: connWallet.id, name: connWallet.name, icon: connWallet.icon, color: connWallet.color, desc: connWallet.desc }
        : { id: 'browser', name: 'Browser Wallet', icon: '🔌', color: '#a78bfa', desc: 'Web3 Extension' };

    } else if (method === 'address') {
      const clean = manualAddress.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(clean) && !(clean.toLowerCase().endsWith('.eth') && clean.length > 4)) {
        setManualAddressError('Enter a valid 0x Ethereum address or .eth ENS name.');
        return;
      }
      resolvedAddress = clean;
      resolvedSig     = 'sandbox_sig';
      wallet          = { id: 'manual_wallet', name: 'Manual Address', icon: '✍️', color: '#818cf8', desc: 'Read-Only Audit' };

    } else { // demo
      const hex = '0123456789abcdef';
      let a = '0x';
      for (let i = 0; i < 40; i++) a += hex[Math.floor(Math.random() * 16)];
      resolvedAddress = a;
      resolvedSig     = 'sandbox_sig';
      wallet          = { id: 'sandbox_wallet', name: 'Demo Mode', icon: '🎲', color: '#10b981', desc: 'Sandbox Demo' };
    }

    setManualAddressError('');
    launchScan(resolvedAddress, resolvedSig, trimmed, wallet);
  }

  // ── Core: scan + backend verify ────────────────────────────────────
  async function launchScan(addr: string, sig: string, uname: string, wallet: Wallet) {
    setStep('scanning');

    let profile: any = null;
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, signature: sig, username: uname, hideWallet, wallet }),
      });
      if (res.ok) {
        const parsed = await res.json();
        if (parsed && !parsed.error) profile = parsed;
      }
    } catch (err) {
      console.warn('[KARMA] Backend verify failed, using local fallback:', err);
    }

    // Local fallback (no backend)
    if (!profile) {
      const clean = addr.toLowerCase();
      let hash = 0;
      for (let i = 0; i < clean.length; i++) { hash = (hash << 5) - hash + clean.charCodeAt(i); hash |= 0; }
      hash = Math.abs(hash);
      const karmaScore = Math.max(120, Math.min(1000, 380 + (hash % 580)));
      const personalities = ['Diamond','Visionary','Builder','Sage','Guardian','Explorer','Phoenix','Pioneer'];
      profile = {
        address: clean, username: uname, hideWallet, wallet,
        streak: 3 + (hash % 64), connectedAt: new Date().toISOString(),
        karmaScore, personality: personalities[hash % personalities.length],
        auraPoints: 50 + (hash % 500), lastClaimedAt: '',
        activities: [],
        categories: [
          { label:'Patience',   value: Math.min(100, 30 + (hash % 60)), color:'#a78bfa', icon:'◈' },
          { label:'Loyalty',    value: Math.min(100, 25 + (hash % 65)), color:'#60a5fa', icon:'◆' },
          { label:'Wisdom',     value: Math.min(100, 35 + (hash % 55)), color:'#fbbf24', icon:'⊕' },
          { label:'Generosity', value: Math.min(100, 20 + (hash % 60)), color:'#34d399', icon:'⬡' },
          { label:'Energy',     value: Math.min(100, 15 + (hash % 70)), color:'#f472b6', icon:'◉' },
        ],
        scores: { walletAge:60, holdingBehavior:70, txQuality:75, staking:40, governance:45, community:55, protocolRep:90 },
        metrics: {
          firstTxDate: new Date(Date.now() - 180*86400000).toISOString().split('T')[0],
          walletAgeDays:180, totalTransactions:50+(hash%200), activeDays:20,
          tokenBalancesUSD:500+(hash%5000), nftCount:hash%8,
          stakedAmountUSD:0, stakedDurationDays:0, daoVotes:hash%5, earlyMintsCount:0, riskInteractionsCount:0,
        },
        history: [
          { time:'Jun 10', reputation:karmaScore-10, activityVolume:3, gasSaved:0.01 },
          { time:'Jun 13', reputation:karmaScore-4,  activityVolume:5, gasSaved:0.015 },
          { time:'Jun 17', reputation:karmaScore,    activityVolume:6, gasSaved:0.022 },
        ],
      };
    }

    // Persist to registry (remembers username for next sign-in)
    const registry = readRegistry();
    registry[addr.toLowerCase()] = {
      username: uname, hideWallet,
      address: addr.toLowerCase(),
      karmaScore: profile.karmaScore,
      personality: profile.personality ?? 'Explorer',
      auraPoints: profile.auraPoints ?? 100,
    };
    writeRegistry(registry);

    // Give scan animation time to finish (min 4.2s feels authentic)
    setTimeout(() => {
      onConnect({ wallet, username: uname, hideWallet, address: addr, profile });
    }, 4200);
  }

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="wallet-modal-overlay">
      <div
        onClick={step !== 'scanning' && step !== 'requesting' && step !== 'signing' ? onClose : undefined}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[440px]" style={{ animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>

            {/* Header */}
            <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-white/[0.04]">
              <div>
                <h3 className="font-extrabold text-[#f8fafc] text-xl" style={{ fontFamily:"'Syne',sans-serif" }}>
                  {step === 'pick'       && 'Connect Wallet'}
                  {step === 'requesting' && 'Open Your Wallet'}
                  {step === 'signing'    && 'Sign to Verify'}
                  {step === 'setup'      && (isReturning ? `Welcome back` : 'Set Up Profile')}
                  {step === 'scanning'   && 'Scanning On-Chain…'}
                </h3>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  {step === 'pick'       && 'Choose how to connect your on-chain identity.'}
                  {step === 'requesting' && `Approve the connection request in ${connWallet?.name ?? 'your wallet'}.`}
                  {step === 'signing'    && 'Sign the message to prove wallet ownership. No gas fee required.'}
                  {step === 'setup'      && (isReturning ? `Confirm your username to sign in as @${username}.` : 'Choose a username for your Karma reputation profile.')}
                  {step === 'scanning'   && 'Reading your on-chain activity across Ethereum, Base & Polygon…'}
                </p>
              </div>
              {step !== 'scanning' && step !== 'requesting' && step !== 'signing' && (
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer p-1 ml-4 mt-0.5 shrink-0">
                  <X size={17} />
                </button>
              )}
            </div>

            {/* ── STEP: pick ─────────────────────────────────── */}
            {step === 'pick' && (
              <div className="p-7 space-y-5">

                {/* Error banner */}
                {connError && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs leading-relaxed">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{connError}</span>
                  </div>
                )}

                {/* ─ Browser wallet ─ */}
                <div>
                  <p className="text-[9.5px] font-mono uppercase tracking-widest text-slate-500 mb-2.5 font-bold">Browser Extension</p>

                  {hasEthereum ? (
                    <>
                      {/* Primary detected wallet */}
                      <button
                        onClick={() => { setMethod('browser'); connectBrowserWallet(); }}
                        className="w-full p-4 rounded-2xl flex items-center justify-between bg-white/[0.03] border border-white/[0.08] hover:bg-purple-500/[0.08] hover:border-purple-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                            {detectedWallet!.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-100 text-sm">{detectedWallet!.name}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                              <span className="text-[10px] text-emerald-400 font-mono">Detected & ready</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* Other wallets grid */}
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {INJECTED_WALLETS.filter(w => w.id !== detectedWallet!.id).map(w => (
                          <button
                            key={w.id}
                            onClick={() => { setMethod('browser'); connectBrowserWallet(w); }}
                            title={w.name}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer flex flex-col items-center gap-1 group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform">{w.icon}</span>
                            <span className="text-[8px] text-slate-500 font-mono truncate w-full text-center">{w.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">🔌</div>
                        <div>
                          <div className="font-bold text-slate-400 text-sm">No Wallet Detected</div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Install{' '}
                            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">MetaMask</a>
                            {' '}or{' '}
                            <a href="https://rabby.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">Rabby</a>
                            , then refresh this page to connect your live wallet.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/[0.05]" />
                  <span className="mx-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">or</span>
                  <div className="flex-grow border-t border-white/[0.05]" />
                </div>

                {/* ─ Alternative methods ─ */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setMethod('address'); setConnError(''); setStep('setup'); setIsReturning(false); }}
                    className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/15 hover:bg-indigo-500/[0.07] hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col items-start gap-2 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center"><PenLine size={15} className="text-indigo-400" /></div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Enter Address</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Check any ETH wallet read-only</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMethod('demo'); setConnError(''); setStep('setup'); setIsReturning(false); }}
                    className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/15 hover:bg-emerald-500/[0.07] hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col items-start gap-2 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Sparkles size={15} className="text-emerald-400" /></div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Demo Mode</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Explore with a sandbox ID</div>
                    </div>
                  </button>
                </div>

                <p className="text-center text-[9.5px] text-slate-600 leading-relaxed pt-1">
                  🔒 Read-only connection. We never access private keys or sign transactions on your behalf.
                </p>
              </div>
            )}

            {/* ── STEP: requesting ───────────────────────────── */}
            {step === 'requesting' && (
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-[2.5px] border-t-transparent animate-spin"
                    style={{ borderColor: connWallet?.color ?? '#a78bfa', borderTopColor: 'transparent' }}
                  />
                  <span className="text-4xl z-10">{connWallet?.icon ?? '🔌'}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-100 text-base">Approve in {connWallet?.name ?? 'your wallet'}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[270px] mx-auto">
                    A connection popup should have appeared. Click <strong className="text-slate-200">Connect</strong> to continue.
                  </p>
                </div>
                <button onClick={() => { setStep('pick'); setConnError(''); }} className="text-xs text-slate-500 hover:text-slate-300 underline border-none bg-transparent cursor-pointer">
                  Cancel
                </button>
              </div>
            )}

            {/* ── STEP: signing ──────────────────────────────── */}
            {step === 'signing' && (
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/40 animate-spin [animation-duration:3s]" />
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <WalletIcon size={22} className="text-purple-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-100 text-base">Sign the Message</h4>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[270px] mx-auto">
                    <strong className="text-slate-200">{connWallet?.name ?? 'Your wallet'}</strong> is asking you to sign a message.
                    This verifies ownership — <em>no transaction or gas fee</em>.
                  </p>
                </div>
                <div className="w-full p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-left">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider block mb-1">Connected Address</span>
                  <span className="text-[10px] font-mono text-slate-300 break-all">{connAddress}</span>
                </div>
                <button onClick={() => { setStep('pick'); setConnError(''); }} className="text-xs text-slate-500 hover:text-slate-300 underline border-none bg-transparent cursor-pointer">
                  Cancel
                </button>
              </div>
            )}

            {/* ── STEP: setup ────────────────────────────────── */}
            {step === 'setup' && (
              <div className="p-7 space-y-5">

                {/* Returning user banner */}
                {isReturning && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/25">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">Welcome back, @{username}!</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Username pre-filled from your last session. Edit below if you want a new one.</div>
                    </div>
                  </div>
                )}

                {/* Method tag */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                  <span className="text-sm">
                    {method === 'browser' ? (connWallet?.icon ?? '🔌') : method === 'address' ? '✍️' : '🎲'}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {method === 'browser' ? (connWallet?.name ?? 'Browser Wallet')
                      : method === 'address' ? 'Read-Only Address' : 'Demo Mode'}
                  </span>
                  <button
                    onClick={() => { setStep('pick'); setConnError(''); }}
                    className="text-[9px] font-mono text-purple-400 hover:text-purple-300 underline border-none bg-transparent cursor-pointer ml-1"
                  >
                    Change
                  </button>
                </div>

                {/* Verified address pill (browser mode) */}
                {method === 'browser' && connAddress && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.05]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-mono text-slate-300 break-all">{connAddress}</span>
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">
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
                  <p className="text-[9px] text-slate-500 font-mono mt-1.5">Letters, numbers, underscores · 3–20 chars</p>
                </div>

                {/* Address input for manual mode */}
                {method === 'address' && (
                  <div>
                    <label className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">
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
                    <p className="text-[9px] text-slate-500 font-mono mt-1.5">Any valid 0x address or .eth ENS name · read-only</p>
                  </div>
                )}

                {/* Hide wallet toggle */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Hide Wallet Address</div>
                    <div className="text-[9.5px] text-slate-500 mt-0.5">Address stays private in leaderboards</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHideWallet(p => !p)}
                    className="w-11 h-6 rounded-full relative transition-all border-none outline-none cursor-pointer shrink-0"
                    style={{ backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white absolute top-[4px] transition-all shadow-md"
                      style={{ left: hideWallet ? '22px' : '4px' }}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSetupConfirm}
                  className="w-full py-4 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer border-none shadow-[0_0_20px_rgba(167,139,250,0.2)]"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', fontFamily:"'Syne',sans-serif" }}
                >
                  {isReturning ? 'Resume My Karma Session →' : 'Compile My Karma Score →'}
                </button>
              </div>
            )}

            {/* ── STEP: scanning ─────────────────────────────── */}
            {step === 'scanning' && (
              <div className="p-8 pb-10 flex flex-col items-center text-center space-y-6">
                {/* Radar ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse" />
                  <div className="absolute inset-2 rounded-full border border-purple-500/15 animate-ping [animation-duration:3s]" />
                  <div className="absolute inset-4 rounded-full border border-indigo-400/15 animate-spin [animation-duration:12s] border-dashed" />
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
                  <div
                    className="w-16 h-16 rounded-full bg-slate-950/90 border flex items-center justify-center text-3xl z-10"
                    style={{ borderColor: `${connWallet?.color ?? '#a78bfa'}44`, boxShadow:`0 0 25px ${connWallet?.color ?? '#a78bfa'}20` }}
                  >
                    {method === 'browser' ? (connWallet?.icon ?? '🔌') : method === 'address' ? '✍️' : '🎲'}
                  </div>
                  <div className="absolute -bottom-2 bg-slate-950 border border-purple-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono text-purple-300 font-bold z-20">
                    {scanProgress}%
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-100 text-base uppercase tracking-wider" style={{ fontFamily:"'Syne',sans-serif" }}>
                    Karma Score Analysis
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Reading on-chain activity across Ethereum, Base & Polygon…
                  </p>
                </div>

                <div className="w-full bg-[#06060c]/60 p-4 rounded-2xl border border-white/[0.04] text-left space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0">{SCAN_STAGES[scanStage].icon}</span>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold block">Phase {scanStage+1} of {SCAN_STAGES.length}</span>
                      <span className="text-xs font-bold text-slate-200 block mt-0.5">{SCAN_STAGES[scanStage].title}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono border-t border-white/[0.03] pt-2 leading-relaxed">
                    {SCAN_STAGES[scanStage].desc}
                  </p>
                </div>

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

// ─────────────────────────────────────────────────────────────────────
// DisconnectModal
// ─────────────────────────────────────────────────────────────────────
interface DisconnectProps { user: User; onDisconnect: () => void; onClose: () => void; }

export function DisconnectModal({ user, onDisconnect, onClose }: DisconnectProps) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="disconnect-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-[380px]" style={{ animation: 'fadeUp 0.2s ease-out' }}>
          <GlassCard style={{ padding: 28 }}>
            <h3 className="font-extrabold text-[#f8fafc] text-xl mb-2" style={{ fontFamily:"'Syne',sans-serif" }}>
              Disconnect Wallet
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Signing out of <strong className="text-purple-400">@{user.username}</strong>. Your scores, streaks, and profile remain saved. You will need to sign again on your next login.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-white/5 bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
              <button onClick={onDisconnect} className="flex-1 py-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all cursor-pointer">Sign Out</button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EditProfileModal
// ─────────────────────────────────────────────────────────────────────
interface EditProps { user: User; onSave: (u: User) => void; onClose: () => void; }

export function EditProfileModal({ user, onSave, onClose }: EditProps) {
  const [username,    setUsername]    = useState(user.username);
  const [hideWallet,  setHideWallet]  = useState(user.hideWallet);
  const [error,       setError]       = useState('');

  function handleSave() {
    const t = username.trim();
    if (!t || t.length < 3)              { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(t))     { setError('Only letters, numbers, and underscores.'); return; }
    setError('');
    onSave({ ...user, username: t, hideWallet });
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" id="edit-profile-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-[400px]" style={{ animation: 'fadeUp 0.25s ease' }}>
          <GlassCard style={{ padding: 28 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-[#f8fafc] text-lg" style={{ fontFamily:"'Syne',sans-serif" }}>Edit Profile</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 mb-2 block font-bold">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-purple-400/60 font-bold text-sm">@</span>
                  <input
                    type="text" value={username}
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
                  <div className="text-[10px] text-slate-500 mt-0.5">Hides address in leaderboards</div>
                </div>
                <button
                  type="button" onClick={() => setHideWallet(p => !p)}
                  className="w-11 h-6 rounded-full relative transition-all border-none outline-none cursor-pointer shrink-0"
                  style={{ backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-[4px] transition-all shadow-md" style={{ left: hideWallet ? '22px' : '4px' }} />
                </button>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white font-extrabold text-xs hover:opacity-90 transition-all cursor-pointer border-none" style={{ background:'linear-gradient(135deg,#a78bfa,#818cf8)', fontFamily:"'Syne',sans-serif" }}>
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
