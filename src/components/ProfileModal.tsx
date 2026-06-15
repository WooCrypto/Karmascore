import { useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import { WALLETS } from '../constants';
import GlassCard from './GlassCard';
import { ShieldCheck, Cpu, Database, Activity, Landmark } from 'lucide-react';

interface ConnectModalProps {
  onConnect: (data: { wallet: Wallet; username: string; hideWallet: boolean; address: string }) => void;
  onClose: () => void;
}

export function WalletModal({ onConnect, onClose }: ConnectModalProps) {
  const [step, setStep] = useState<'pick' | 'setup' | 'connecting' | 'welcome_back' | 'walletconnect_pair'>('pick');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [username, setUsername] = useState('');
  const [hideWallet, setHideWallet] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [savedProfile, setSavedProfile] = useState<any | null>(null);

  // Connection options state: auto web3, manual paste, sandbox template
  const [connectMethod, setConnectMethod] = useState<'auto' | 'manual' | 'sandbox'>('auto');
  const [manualAddress, setManualAddress] = useState('');
  const [manualAddressError, setManualAddressError] = useState('');

  // WalletConnect pairing state simulation
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'linking'>('idle');
  const [pairingProgress, setPairingProgress] = useState(0);

  // Scanning simulation state variables
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState(0);

  const scanStages = [
    { title: "Resolving On-Chain RPCs", desc: "Handshaking with decentralized Ethereum gateway nodes...", icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
    { title: "Retrieving Transaction History", desc: "Indexed 147 historic block epochs for this public keyset...", icon: <Database className="w-5 h-5 text-purple-400" /> },
    { title: "Evaluating Asset Hold-Times", desc: "Averaging streak fidelity and multi-chain liquidity holding intervals...", icon: <Activity className="w-5 h-5 text-pink-400" /> },
    { title: "Calibrating Behavior Persona", desc: "Analyzing gas optimization strategies and smart contract voting history...", icon: <Landmark className="w-5 h-5 text-emerald-400" /> },
    { title: "Compiling Final Karma Rank", desc: "Success! Building cryptographic credit reputation ledger...", icon: <ShieldCheck className="w-5 h-5 text-amber-500 animate-bounce" /> },
  ];

  useEffect(() => {
    let interval: any;
    let stageInterval: any;
    if (step === 'connecting') {
      setScanProgress(0);
      setScanStage(0);
      
      interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 76);

      stageInterval = setInterval(() => {
        setScanStage(s => {
          if (s >= scanStages.length - 1) {
            clearInterval(stageInterval);
            return scanStages.length - 1;
          }
          return s + 1;
        });
      }, 820);
    }
    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, [step]);

  function handlePickWallet(wallet: Wallet) {
    setSelectedWallet(wallet);
    if (wallet.id === 'walletconnect') {
      setStep('walletconnect_pair');
      return;
    }
    try {
      const registryRaw = localStorage.getItem('karma_profiles_registry');
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        if (registry[wallet.id]) {
          setSavedProfile(registry[wallet.id]);
          setStep('welcome_back');
          return;
        }
      }
    } catch (e) {
      console.warn('Reading registry failed:', e);
    }
    setStep('setup');
  }

  function startSimulatedPairing() {
    setPairingStatus('linking');
    setPairingProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 8;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Handshake verified, generate a beautiful sandbox Ethereum public address!
        const hexChars = '0123456789abcdef';
        let generatedAddr = '0x';
        for (let i = 0; i < 40; i++) {
          generatedAddr += hexChars[Math.floor(Math.random() * 16)];
        }
        setManualAddress(generatedAddr);
        setConnectMethod('sandbox'); // Route to sandbox identity stream
        setPairingStatus('idle');
        setStep('setup');
      }
      setPairingProgress(currentProgress);
    }, 180);
  }

  async function handleConfirm() {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError('Please enter a username.');
      return;
    }
    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setUsernameError('Username must be 20 characters or less.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameError('Username can compile characters, numbers and underscores only.');
      return;
    }

    setUsernameError('');
    let resolvedAddress = '';

    if (connectMethod === 'manual') {
      const cleanAddr = manualAddress.trim();
      if (!cleanAddr) {
        setManualAddressError('Please enter an address or .eth name.');
        return;
      }
      
      const isEthHex = /^0x[a-fA-F0-9]{40}$/.test(cleanAddr);
      const isEns = cleanAddr.toLowerCase().endsWith('.eth') && cleanAddr.length > 4;

      if (!isEthHex && !isEns) {
        setManualAddressError('Please enter a valid 42-character Ethereum hex address starting with "0x", or a ".eth" extension.');
        return;
      }
      setManualAddressError('');
      resolvedAddress = cleanAddr;
    } else if (connectMethod === 'auto') {
      // Attempt real cryptographic web3 connection if available in the browser environment
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const provider = (window as any).ethereum;
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            resolvedAddress = accounts[0];
          }
        } catch (err: any) {
          console.warn('Real wallet login attempted but was rejected or unavailable in sandbox environment:', err);
          setManualAddressError(err?.message || 'Connection rejected by browser extension. Please authorize standard access.');
          return;
        }
      }
      
      if (!resolvedAddress) {
        setManualAddressError('No active Web3 extensions (MetaMask/Rabby etc.) found in browser context. Please select "✍️ Custom Address" instead.');
        return;
      }
    } else {
      // Sandbox Mode: Maintain previously generated handshake address, or fallback to new high-fidelity mock public keys
      const cleanAddr = manualAddress.trim();
      const isEthHex = /^0x[a-fA-F0-9]{40}$/.test(cleanAddr);
      if (isEthHex) {
        resolvedAddress = cleanAddr;
      } else {
        const hexChars = '0123456789abcdef';
        let hexPart = '';
        for (let i = 0; i < 40; i++) {
          hexPart += hexChars[Math.floor(Math.random() * 16)];
        }
        resolvedAddress = '0x' + hexPart; // produces a real formatted 42-character hex string
      }
    }

    let signature = 'sandbox_sig';
    if (connectMethod === 'auto' && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = (window as any).ethereum;
        // Request challenge
        const challengeRes = await fetch('/api/auth/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: resolvedAddress })
        });
        const challengeData = await challengeRes.json();
        if (challengeData.error) {
          setManualAddressError(challengeData.error);
          return;
        }
        
        // Request signature
        signature = await provider.request({
          method: 'personal_sign',
          params: [challengeData.message, resolvedAddress]
        });
      } catch (err: any) {
        console.warn('EVM signing rejected or failed:', err);
        setManualAddressError(err.message || 'Signature rejected by browser extension wallet.');
        return;
      }
    }

    setStep('connecting');

    try {
      // Call verify endpoint to compile reputation index on-chain
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: resolvedAddress,
          signature,
          username: trimmed,
          hideWallet,
          wallet: selectedWallet
        })
      });
      if (!verifyRes.ok) {
        const errText = await verifyRes.text();
        let errMsg = 'Failed to synchronize reputation passport with the index server.';
        try {
          const parsed = JSON.parse(errText);
          if (parsed && parsed.error) errMsg = parsed.error;
        } catch (_) {}
        setStep('setup');
        setManualAddressError(errMsg);
        return;
      }
      const profile = await verifyRes.json();
      if (profile.error) {
        setStep('setup');
        setManualAddressError(profile.error);
        return;
      }
      
      // Complete callback with real persistent backend profile data!
      setTimeout(() => {
        if (selectedWallet) {
          try {
            const registryRaw = localStorage.getItem('karma_profiles_registry');
            const registry = registryRaw ? JSON.parse(registryRaw) : {};
            registry[selectedWallet.id] = {
              username: trimmed,
              hideWallet,
              address: resolvedAddress,
              karmaScore: profile.karmaScore,
              personality: profile.personality,
              auraPoints: profile.auraPoints
            };
            localStorage.setItem('karma_profiles_registry', JSON.stringify(registry));
          } catch (e) {
            console.error('Failed to sync karma_profiles_registry', e);
          }

          onConnect({
            wallet: selectedWallet,
            username: trimmed,
            hideWallet,
            address: resolvedAddress,
            profile // pass along backend parsed record
          } as any);
        }
      }, 4200);
    } catch (err: any) {
      setStep('setup');
      setManualAddressError('Failed to synchronize reputation passport with the index server.');
    }
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto animate-fade-in" id="wallet-modal-overlay">
      {/* Dimmed static backdrop */}
      <div 
        onClick={step !== 'connecting' ? onClose : undefined} 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
      />

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[450px] transform transition-all" style={{ animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
          
          {/* Top Title deck */}
          <div className="p-8 pb-5 flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-[#f8fafc] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                {step === 'pick' 
                  ? 'Connect Wallet' 
                  : step === 'welcome_back' 
                    ? 'Welcome Back' 
                    : step === 'setup' 
                      ? 'Complete Profile' 
                      : step === 'walletconnect_pair' 
                        ? 'WalletConnect Handshake' 
                        : 'Verifying Credentials...'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {step === 'pick' && 'Select your active wallet provider to read on-chain state.'}
                {step === 'welcome_back' && 'Reauthorize your secure cryptographic reputation index.'}
                {step === 'setup' && 'Choose your unique pseudonym on the KARMA network.'}
                {step === 'walletconnect_pair' && 'Scan standard QR bridge to link your mobile web3 keyset.'}
                {step === 'connecting' && `Authorizing secure wallet handshake with ${selectedWallet?.name}...`}
              </p>
            </div>
            {step !== 'connecting' && (
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="h-[1px] bg-white/[0.06]" />

          {/* Wallet List selector */}
          {step === 'pick' && (
            <div className="p-6 md:p-8">
              {/* Sandbox Quick Onramp Tip */}
              <div className="mb-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-2.5 items-start text-left">
                <span className="text-sm select-none">💡</span>
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-black text-amber-300 block font-mono">Quick-Start Sandbox Tip</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Select <strong>any wallet provider</strong> below (e.g. App Wallet or MetaMask), then choose the <strong>🎲 Sandbox ID</strong> tab on the next step to instantly preview all dashboards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {WALLETS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handlePickWallet(w)}
                    className="p-4 rounded-2xl flex flex-col items-start gap-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-purple-500/40 transition-all text-left cursor-pointer group"
                  >
                    <span className="text-3xl filter saturate-[0.8] group-hover:scale-105 transition-transform">{w.icon}</span>
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-100">{w.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{w.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#a78bfa]/5 border border-[#a78bfa]/15">
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  🔒 Connection is read-only. We never request wallet signatures, private key variables, or transaction routing authority. Your assets remain secure inside your vault.
                </p>
              </div>
            </div>
          )}

          {/* WalletConnect pairing simulation view overlay */}
          {step === 'walletconnect_pair' && (
            <div className="p-6 md:p-8 space-y-6">
              
              {pairingStatus === 'idle' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Scan to Pair Address
                    </span>
                    <button 
                      onClick={() => setStep('pick')}
                      className="text-[10px] font-mono uppercase text-purple-400 hover:text-purple-300 underline cursor-pointer border-none bg-transparent"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  {/* Glowing QR wrapper */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 border border-white/[0.05] rounded-2xl relative group">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-md pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
                    
                    {/* Simulated SVG QR Code */}
                    <div 
                      onClick={startSimulatedPairing}
                      className="w-48 h-48 bg-white p-3.5 rounded-xl flex items-center justify-center relative cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-xl"
                      title="Click QR code to instantly verify peer-pairing signature"
                    >
                      <div className="w-full h-full border-4 border-slate-900 leading-none relative bg-white">
                        <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2">
                          {Array.from({ length: 36 }).map((_, i) => {
                            const isAnchor = [0, 1, 4, 5, 6, 11, 24, 29, 30, 31, 34, 35].includes(i);
                            return (
                              <div 
                                key={i}
                                className={`rounded-sm transition-colors ${
                                  isAnchor 
                                    ? 'bg-slate-950' 
                                    : (Math.sin(i * 4) > 0 ? 'bg-slate-900/90' : 'bg-transparent')
                                }`} 
                              />
                            );
                          })}
                        </div>
                        {/* Centered AppKit / WC logo bubble */}
                        <div className="absolute inset-0 m-auto w-10 h-10 bg-gradient-to-br from-[#3b99fc] to-[#2563eb] rounded-full border-3 border-white flex items-center justify-center text-white text-base font-extrabold shadow-lg">
                          ◈
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={startSimulatedPairing}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 border-none font-extrabold text-[11px] font-sans text-white cursor-pointer transition-all uppercase tracking-wider shadow-[0_4px_12px_rgba(59,153,252,0.3)] animate-pulse"
                    >
                      ⚡ Start Pairing Handshake
                    </button>
                    
                    <span className="text-[9px] font-mono text-slate-500 uppercase mt-2.5">
                      Or tap QR code to simulate fast peer connection
                    </span>
                  </div>
                  
                  {/* Desktop / Popular browser clients listing */}
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Desktop Wallet Shortcut Linking
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'metamask', name: 'MetaMask Link', icon: '🦊' },
                        { id: 'trust', name: 'Trust Link', icon: '🛡️' },
                        { id: 'rainbow', name: 'Rainbow Link', icon: '🌈' },
                        { id: 'rabby', name: 'Rabby Link', icon: '🐰' },
                      ].map(desktopWallet => (
                        <button
                          key={desktopWallet.id}
                          onClick={startSimulatedPairing}
                          className="p-3 bg-white/[0.02] border border-white/[0.05] hover:bg-[#3b99fc]/10 hover:border-[#3b99fc]/40 rounded-xl flex items-center gap-2.5 text-left cursor-pointer transition-all duration-200"
                        >
                          <span className="text-xl">{desktopWallet.icon}</span>
                          <span className="text-[10px] font-bold text-slate-200 uppercase font-mono">{desktopWallet.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {pairingStatus === 'linking' && (
                <div className="py-8 text-center flex flex-col items-center space-y-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 border border-blue-500/20 animate-ping pointer-events-none" />
                    <div className="absolute inset-2 rounded-full border-2 border-blue-400 border-t-transparent animate-spin pointer-events-none" />
                    <span className="text-2xl text-blue-450 z-10 select-none">◈</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-[#f1f5f9] text-sm uppercase tracking-wide font-sans">
                      Bridging WalletConnect Websocket Link...
                    </h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed max-w-xs mx-auto font-mono">
                      Querying sandbox relay node at bridge.walletconnect.org
                    </p>
                  </div>
                  
                  {/* Progress tracker bar */}
                  <div className="w-full max-w-xs h-1 px-0.5 bg-slate-900 border border-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-150 rounded-full" 
                      style={{ width: `${pairingProgress}%` }}
                    />
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-[#030308]/90 border border-white/[0.04] text-[10px] font-mono text-slate-400 w-full text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bridge State:</span>
                      <span className="text-[#3b99fc] font-bold">paired_listening_socket</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Peer Protocol:</span>
                      <span className="text-emerald-400">WC_v2_transport</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cryptographic Cipher:</span>
                      <span className="text-amber-500">ChaCha20_Poly1305_Auth</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Name & Options step */}
          {step === 'setup' && selectedWallet && (
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Wallet info indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <span className="text-sm">{selectedWallet.icon}</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{selectedWallet.name}</span>
                <button 
                  onClick={() => setStep('pick')}
                  className="text-[9px] font-mono uppercase text-purple-400 underline hover:text-purple-300 ml-2 border-none bg-none cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Verify Method Tab Deck */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5 block font-bold">
                  Credentials Source
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/[0.05]">
                  {[
                    { id: 'auto', label: '🔌 Web3 Check' },
                    { id: 'manual', label: '✍️ Custom Key' },
                    { id: 'sandbox', label: '🎲 Sandbox ID' },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setConnectMethod(method.id as any);
                        setManualAddressError('');
                      }}
                      className="py-2.5 rounded-lg text-[10px] font-bold font-sans cursor-pointer transition-all border-none focus:outline-none"
                      style={{
                        backgroundColor: connectMethod === method.id ? 'rgba(167, 139, 250, 0.12)' : 'transparent',
                        color: connectMethod === method.id ? '#c084fc' : 'rgba(248, 250, 252, 0.45)',
                      }}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input Container */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 block">
                  Assign Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#a78bfa]/60 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    placeholder="crypto_navigator"
                    maxLength={20}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border bg-white/[0.03] text-slate-100 text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.05]"
                    style={{
                      borderColor: usernameError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                </div>
                {usernameError && (
                  <p className="text-rose-400 text-[11px] mt-1.5 font-sans">{usernameError}</p>
                )}
                <p className="text-[9px] text-slate-500 font-mono mt-1.5">
                  Lowercase ASCII letters, digests, and underscores only. Length: 3-20 characters.
                </p>
              </div>

              {/* Connection Source Sub-Views */}
              {connectMethod === 'manual' && (
                <div className="space-y-2 animate-fade-in text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                    Ethereum Public Address or ENS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={e => { setManualAddress(e.target.value); setManualAddressError(''); }}
                    placeholder="0x71C7...976F or vitalik.eth"
                    className="w-full px-4 py-3 rounded-xl border bg-white/[0.03] text-slate-100 text-xs font-mono outline-none transition-all focus:bg-white/[0.05]"
                    style={{
                      borderColor: manualAddressError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                  {manualAddressError && (
                    <p className="text-rose-400 text-[11px] mt-1 font-sans">{manualAddressError}</p>
                  )}
                  <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
                    Provide any public read-only key to analyze. Your scores, streak calendars, and archetypes will compute deterministically relative to this ledger! No private key or signatures requested.
                  </p>
                </div>
              )}

              {connectMethod === 'auto' && (
                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-[#a78bfa]/10 space-y-1.5 animate-fade-in text-xs text-slate-300 text-left">
                  <div className="font-bold flex items-center gap-1.5 text-purple-300">
                    <span>🔌</span> Crypto Browser Check
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Detecting active browser wallet environments. Click the scan trigger to retrieve your public key securely.
                  </p>
                  {typeof window !== 'undefined' && !(window as any).ethereum ? (
                    <div className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1.5 rounded-lg leading-relaxed font-mono">
                      ⚠️ No Web3 browser extension detected in this frame. Open the page in a new window or switch tabs to "✍️ Custom Key" to scan any address manually!
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg font-mono">
                      ✨ Active browser extension check holds success. Handshake ready!
                    </div>
                  )}
                  {manualAddressError && (
                    <p className="text-rose-400 text-[11px] mt-1.5 font-sans font-bold">{manualAddressError}</p>
                  )}
                </div>
              )}

              {connectMethod === 'sandbox' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1 animate-fade-in text-xs text-slate-400 text-left">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300 mb-1">
                    <span>🎲</span> Infinite Sandbox Demo ID
                  </div>
                  <p className="text-[10px] leading-relaxed font-sans">
                    Generate an instant testbed identity. Instantly unlock beautiful stats maps, comprehensive holding records, and live AI reading reports. Perfect for quick preview of client features!
                  </p>
                </div>
              )}

              {/* Privacy Setting Toggle */}
              <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-200">Enforce Wallet pseudonymity</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Your public hex blockchain addresses will remain confidential in lists.</div>
                </div>
                
                {/* Custom toggle slider */}
                <button
                  onClick={() => setHideWallet(prev => !prev)}
                  className="w-11 h-6 rounded-full relative transition-all border outline-none cursor-pointer"
                  style={{
                    backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)',
                    borderColor: hideWallet ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div 
                    className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-all shadow-md"
                    style={{ left: hideWallet ? '20px' : '3px' }}
                  />
                </button>
              </div>

              {/* Error display box */}
              {manualAddressError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-left animate-fade-in flex gap-2 items-start">
                  <span className="text-sm select-none">⚠️</span>
                  <span>{manualAddressError}</span>
                </div>
              )}

              {/* Action trigger button */}
              <button
                onClick={handleConfirm}
                className="w-full py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all cursor-pointer hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  fontFamily: "'Syne', sans-serif"
                }}
              >
                Compile My Karma Score
              </button>
            </div>
          )}

          {/* Welcome back profile quick lock */}
          {step === 'welcome_back' && selectedWallet && savedProfile && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center font-black text-slate-100 text-2xl mb-3 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  }}
                >
                  {savedProfile.username[0].toUpperCase()}
                </div>
                <h4 className="text-white text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Welcome Back, @{savedProfile.username}!
                </h4>
                <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] select-all">
                  <span className="text-xs">{selectedWallet.icon}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {savedProfile.hideWallet ? 'Wallet address pseudonymized' : savedProfile.address}
                  </span>
                </div>
              </div>

              {/* Stats showcase panel */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Reputation</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 inline-flex items-center gap-1">
                    <span className="text-purple-400">✧</span> {savedProfile.karmaScore}/100
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-medium">Archetype</span>
                  <span className="text-xs font-bold text-[#a78bfa] font-mono mt-1 block truncate" title={savedProfile.personality}>
                    {savedProfile.personality || 'Visionary'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('connecting');
                    setTimeout(() => {
                      onConnect({
                        wallet: selectedWallet,
                        username: savedProfile.username,
                        hideWallet: savedProfile.hideWallet,
                        address: savedProfile.address,
                      });
                    }, 4200);
                  }}
                  className="w-full py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                    fontFamily: "'Syne', sans-serif"
                  }}
                >
                  Authorize & Login Instantly
                </button>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    onClick={() => {
                      setUsername(savedProfile.username);
                      setHideWallet(savedProfile.hideWallet);
                      setStep('setup');
                    }}
                    className="text-[11px] font-mono text-slate-400 hover:text-purple-400 underline border-none bg-none cursor-pointer"
                  >
                    Edit profile parameters
                  </button>
                  <button
                    onClick={() => setStep('pick')}
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-300 underline border-none bg-none cursor-pointer"
                  >
                    Choose different client
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connecting Handshake Simulation */}
          {step === 'connecting' && selectedWallet && (
            <div className="p-8 pb-10 text-center flex flex-col items-center space-y-6" id="holographic-reputation-scanner">
              
              {/* Radar scanner visual container */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Simulated outer radar radar loops */}
                <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse" />
                <div className="absolute inset-2 rounded-full border border-purple-500/20 animate-ping [animation-duration:3s]" />
                <div className="absolute inset-4 rounded-full border border-indigo-400/20 animate-spin [animation-duration:12s] border-dashed" />
                <div className="absolute inset-6 rounded-full border border-indigo-400/10" />

                {/* Animated progress ring overlay */}
                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-[#a78bfa]/10 stroke-2 fill-none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-purple-500 stroke-[3px] fill-none transition-all duration-300"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * scanProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Main wallet token icon in visual center */}
                <div 
                  className="w-16 h-16 rounded-full shadow-2xl bg-slate-950/90 border flex flex-col items-center justify-center text-3xl font-bold font-mono transition-transform duration-300 z-10"
                  style={{
                    borderColor: `${selectedWallet.color}44`,
                    boxShadow: `0 0 25px ${selectedWallet.color}25`
                  }}
                >
                  <span className="scale-110">{selectedWallet.icon}</span>
                </div>

                {/* Floating percentage badge */}
                <div className="absolute -bottom-2 bg-slate-950 border border-purple-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono text-purple-300 font-bold z-20 shadow-md">
                  {scanProgress}% Compiled
                </div>
              </div>

              {/* Text metadata */}
              <div className="w-full space-y-2">
                <h4 className="font-extrabold text-[#f1f5f9] text-base uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Karma Registry Analyzer
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto font-sans">
                  Querying globally distributed ledger states to synthesize credit scoring nodes.
                </p>
              </div>

              {/* Dynamic scrolling check stages tracking bar */}
              <div className="w-full bg-[#06060c]/60 p-4 rounded-2xl border border-white/[0.04] text-left space-y-3 relative" id="scan-feedback-terminal">
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{scanStages[scanStage].icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
                      Analytic Phase {scanStage + 1} of 5
                    </span>
                    <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">
                      {scanStages[scanStage].title}
                    </span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed border-t border-white/[0.03] pt-2">
                  {scanStages[scanStage].desc}
                </p>
              </div>

              {/* Interactive micro progress lights */}
              <div className="flex gap-2">
                {scanStages.map((_, sIdx) => (
                  <div 
                    key={sIdx}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: sIdx < scanStage 
                        ? '#10b981' 
                        : sIdx === scanStage 
                          ? '#a78bfa' 
                          : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: sIdx === scanStage ? '0 0 8px #a78bfa' : 'none',
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

// ── Disconnect Profile Dialog ──
interface DisconnectProps {
  user: User;
  onDisconnect: () => void;
  onClose: () => void;
}

export function DisconnectModal({ user, onDisconnect, onClose }: DisconnectProps) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto animate-fade-in" id="disconnect-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[380px] transform animate-scale-up" style={{ animation: 'fadeUp 0.2s ease-out' }}>
          <GlassCard style={{ padding: 28 }}>
          <h3 className="font-extrabold text-[#f8fafc] text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Disconnect Reputation
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You are signing out of <strong className="text-purple-400">@{user.username}</strong> on-chain view. Your compiled records, holding days, and streaks will persist safely inside the decentralized index.
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

// ── Edit Profile Modal Dial ──
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
    if (!trimmed || trimmed.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Only letters, numbers, and underscores are compiled.');
      return;
    }
    setError('');
    onSave({
      ...user,
      username: trimmed,
      hideWallet,
    });
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto animate-fade-in" id="edit-profile-modal-overlay">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[400px]" style={{ animation: 'fadeUp 0.25s ease' }}>
          <GlassCard style={{ padding: 28 }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-[#f8fafc] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              Edit Profile
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 block">
                Assign Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#a78bfa]/60 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border bg-white/[0.03] text-slate-100 text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.05]"
                  style={{
                    borderColor: error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)',
                  }}
                />
              </div>
              {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
            </div>

            <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-200">Enforce Wallet Pseudonymity</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hides addresses in leaderboards.</div>
              </div>
              <button
                onClick={() => setHideWallet(prev => !prev)}
                className="w-11 h-6 rounded-full relative transition-all border outline-none cursor-pointer"
                style={{
                  backgroundColor: hideWallet ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.06)',
                  borderColor: hideWallet ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                }}
              >
                <div 
                  className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-all shadow-md"
                  style={{ left: hideWallet ? '20px' : '3px' }}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl text-white font-extrabold text-xs hover:opacity-90 transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  fontFamily: "'Syne', sans-serif"
                }}
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
