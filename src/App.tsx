import { useState, useEffect } from 'react';
import { User, Wallet } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import AIReading from './components/AIReading';
import Lenders from './components/Lenders';
import { WalletModal, DisconnectModal, EditProfileModal } from './components/ProfileModal';
import { generateUserProfile } from './utils/generator';
import { Twitter, Github, Send, Smartphone } from 'lucide-react';
import KarmaLogo from './components/KarmaLogo';
import { useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import WhitepaperModal from './components/WhitepaperModal';
import KarmaManifestoModal from './components/KarmaManifestoModal';
import InstallPromptHelper from './components/InstallPromptHelper';
import { getAura } from './constants';
import { Aura } from './types';
import AuraToastNotification from './components/AuraToastNotification';

// Standard typography imports are now natively declared in index.html for high-efficiency loading.

// Nav Header component
interface NavProps {
  page: string;
  setPage: (p: string) => void;
  user: User | null;
  onShowConnect: () => void;
  onShowDisconnect: () => void;
  onShowEdit: () => void;
  onShowInstall: () => void;
}

function Nav({ page, setPage, user, onShowConnect, onShowDisconnect, onShowEdit, onShowInstall }: NavProps) {
  const connected = !!user;
  const { t } = useLanguage();

  const tabs = [
    { id: 'Home', label: t('nav.home') },
    { id: 'Dashboard', label: t('nav.dashboard') },
    { id: 'Lenders', label: t('nav.lenders') },
    { id: 'Leaderboard', label: t('nav.leaderboard') },
    { id: 'AI Reading', label: t('nav.aiReading') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-3 sm:px-6 flex items-center justify-between border-b border-white/[0.04] bg-[#05050a]/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Dynamic horizontal glow accent divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 via-emerald-500/30 via-cyan-500/25 to-transparent pointer-events-none" />
      
      {/* Brand Identity logo */}
      <button 
        onClick={() => setPage('Home')} 
        className="flex items-center gap-2 border-none bg-transparent cursor-pointer outline-none font-black shrink-0 relative group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[#a78bfa]/15 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <KarmaLogo size={34} className="shrink-0 animate-pulse-slow relative z-10" />
        </div>
        <span 
          className="text-white tracking-tight font-extrabold text-sm hidden xs:inline uppercase"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '0.05em' }}
        >
          KARMA <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-black">AI</span>
        </span>
      </button>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/[0.04] overflow-x-auto scrollbar-none max-w-[42vw] xs:max-w-[50vw] sm:max-w-none">
        {tabs.filter(t => t.id === 'Home' || t.id === 'Leaderboard' || connected).map(tab => {
          const isActive = page === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className="px-2.5 xs:px-3 py-1.5 rounded-lg text-[9px] xs:text-[10px] sm:text-xs font-bold cursor-pointer transition-all border-none whitespace-nowrap uppercase tracking-wider font-sans select-none"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)' : 'transparent',
                color: isActive ? '#d8b4fe' : 'rgba(241, 245, 249, 0.5)',
                border: isActive ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid transparent',
                textShadow: isActive ? '0 0 8px rgba(167, 139, 250, 0.2)' : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile details / Language switcher trigger group */}
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0 relative z-10">
        
        {/* Install Mobile Web App trigger badge */}
        <button
          onClick={onShowInstall}
          className="flex items-center gap-1 px-1.5 xs:px-2 py-1 xs:py-1.5 rounded-lg xs:rounded-xl bg-purple-500/10 hover:bg-[#14F195]/15 border border-purple-500/25 hover:border-[#14F195]/40 text-[#c084fc] hover:text-[#14F195] text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold cursor-pointer transition-all active:scale-95 select-none"
          title="Save app to mobile Home Screen"
        >
          <Smartphone size={11} className="shrink-0 sm:w-3 sm:h-3" />
          <span className="hidden sm:inline">Add to Home Screen</span>
          <span className="inline sm:hidden">App</span>
        </button>

        <LanguageSwitcher />

        {connected && user ? (
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg xs:rounded-xl pl-1.5 xs:pl-2 sm:pl-3.5 pr-1 xs:pr-1.5 sm:pr-2 py-1 sm:py-1.5 animate-fade-in relative group hover:border-[#14F195]/20 hover:bg-white/[0.04] transition-all">
            
            {/* Green active status indicator */}
            <div className="absolute -top-1 -left-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195]/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#14F195]"></span>
            </div>

            <div className="text-left select-none max-w-[80px] xs:max-w-[120px] md:inline hidden">
              <div className="text-xs font-extrabold text-slate-200 truncate flex items-center gap-1">
                @{user.username}
              </div>
              <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5" title={user.hideWallet ? `@${user.username}` : user.address}>
                {user.hideWallet ? 'SANDBOX SECURE' : (user.address.length > 12 ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : user.address)}
              </div>
            </div>

            {/* Avatar block with quick edit / sign out controls */}
            <button
              onClick={onShowEdit}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm sm:rounded-lg bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center font-black text-slate-950 text-[10px] sm:text-xs cursor-pointer border-none transition-all hover:scale-105 shadow"
            >
              {user.username[0].toUpperCase()}
            </button>

            {/* Sign Out Trigger pin */}
            <button
              onClick={onShowDisconnect}
              className="px-1 xs:px-1.5 py-1 border-none bg-transparent hover:text-rose-400 text-slate-500 transition-colors text-xs cursor-pointer ml-0.5"
              title="Sign Out Reputation Workspace"
            >
              ⏻
            </button>
          </div>
        ) : (
          <button
            onClick={onShowConnect}
            className="px-2 xs:px-3 sm:px-5 py-1 xs:py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-none text-slate-950 font-black text-[9.5px] xs:text-[10px] sm:text-xs transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer select-none whitespace-nowrap uppercase tracking-wider shadow-[0_0_20px_rgba(167,139,250,0.15)] hover:shadow-[0_0_25px_rgba(167,139,250,0.35)]"
            style={{
              background: 'linear-gradient(135deg, #14F195, #a78bfa)',
              fontFamily: "'Syne', sans-serif"
            }}
          >
            <span className="hidden xs:inline">{t('nav.connect')}</span>
            <span className="inline xs:hidden">{t('nav.connect').split(' ')[0]}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<string>('Home');
  const [user, setUser] = useState<User | null>(null);

  const [showConnect, setShowConnect] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showManifesto, setShowManifesto] = useState(true);
  const [showInstallHelper, setShowInstallHelper] = useState(false);

  // States to track Aura updates in real-time
  const [prevAura, setPrevAura] = useState<Aura | null>(null);
  const [currAura, setCurrAura] = useState<Aura | null>(null);
  const [toastTriggerKey, setToastTriggerKey] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Monitor score transitions and fire the Aura Ascension Toast when crossing brackets
  useEffect(() => {
    if (user) {
      const currentScore = user.karmaScore;
      if (lastScore !== null && lastScore !== currentScore) {
        const oldA = getAura(lastScore);
        const newA = getAura(currentScore);
        if (oldA.name !== newA.name) {
          setPrevAura(oldA);
          setCurrAura(newA);
          setToastTriggerKey(prev => prev + 1);
        }
      }
      setLastScore(currentScore);
    } else {
      setLastScore(null);
    }
  }, [user?.karmaScore]);

  // Load session persistence securely from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('karma_user_session');
      if (cached) {
        setUser(JSON.parse(cached));
        setPage('Dashboard');
      }
    } catch (err) {
      console.warn('Sandbox localStorage permissions denied, operating with in-memory session rules:', err);
    }
  }, []);

  // Auto scroll to top on page navigation or user connection with multiple scheduled frames to prevent race conditions during rendering
  useEffect(() => {
    const triggerScroll = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };
    
    // Reset immediately
    triggerScroll();
    
    // Reset on next layout draw
    requestAnimationFrame(triggerScroll);
    
    // Scheduled callbacks to counteract async component expansions
    const t1 = setTimeout(triggerScroll, 80);
    const t2 = setTimeout(triggerScroll, 200);
    const t3 = setTimeout(triggerScroll, 450);
    const t4 = setTimeout(triggerScroll, 800);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [page, user]);

  function handleConnect(data: { wallet: Wallet; username: string; hideWallet: boolean; address: string; profile?: User }) {
    let profile: User;
    
    if (data.profile) {
      profile = data.profile;
    } else {
      profile = generateUserProfile(data.wallet, data.username, data.address, data.hideWallet);
    }

    setUser(profile);
    setShowConnect(false);
    setPage('Dashboard');
    
    try {
      localStorage.setItem('karma_user_session', JSON.stringify(profile));
    } catch (err) {
      console.warn('Sandbox storage failed:', err);
    }
  }

  function handleDisconnect() {
    setUser(null);
    setShowDisconnect(false);
    setPage('Home');
    
    try {
      localStorage.removeItem('karma_user_session');
    } catch (err) {
      console.warn('Sandbox storage failed:', err);
    }
  }

  async function handleProfileSave(updated: User) {
    setUser(updated);
    setShowEdit(false);
    
    try {
      localStorage.setItem('karma_user_session', JSON.stringify(updated));
      
      // Update persistent database dynamically
      await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: updated.address,
          signature: 'sandbox_sig', // Bypass since it's already an active authenticated session
          username: updated.username,
          hideWallet: updated.hideWallet,
          wallet: updated.wallet
        })
      });
    } catch (err) {
      console.warn('Backend sync failed:', err);
    }
  }

  // Redirect guard: protect dashboards
  useEffect(() => {
    if (!user && ['Dashboard', 'Lenders', 'AI Reading'].includes(page)) {
      setPage('Home');
    }
  }, [user, page]);

  return (
    <div className="min-h-screen bg-[#04040a] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      
      {/* Universal Navigation bar */}
      <Nav
        page={page}
        setPage={setPage}
        user={user}
        onShowConnect={() => setShowConnect(true)}
        onShowDisconnect={() => setShowDisconnect(true)}
        onShowEdit={() => setShowEdit(true)}
        onShowInstall={() => setShowInstallHelper(true)}
      />

      {/* Pages Router container */}
      <main className="flex-1 w-full relative">
        {page === 'Home' && (
          <Landing 
            onShowConnect={() => setShowConnect(true)} 
            onShowManifesto={() => setShowManifesto(true)} 
            user={user}
          />
        )}
        
        {page === 'Dashboard' && user && (
          <Dashboard 
            user={user} 
            onDisconnect={() => setShowDisconnect(true)} 
            onUpdateUser={handleProfileSave}
            onNavigatePage={setPage}
          />
        )}
        
        {page === 'Lenders' && user && <Lenders user={user} />}
        
        {page === 'Leaderboard' && <Leaderboard user={user} />}
        
        {page === 'AI Reading' && user && <AIReading user={user} />}
      </main>

      {/* Modern Global Web3 Footer */}
      <Footer 
        page={page}
        setPage={setPage} 
        user={user} 
        onShowWhitepaper={() => setShowWhitepaper(true)} 
        onShowManifesto={() => setShowManifesto(true)}
        onShowInstall={() => setShowInstallHelper(true)}
      />

      {/* Security Modals layers */}
      {showWhitepaper && (
        <WhitepaperModal onClose={() => setShowWhitepaper(false)} />
      )}
      {showManifesto && (
        <KarmaManifestoModal 
          isOpen={showManifesto} 
          onClose={() => {
            setShowManifesto(false);
            try {
              sessionStorage.setItem('karma_manifesto_session_seen_v2', 'true');
              localStorage.setItem('karma_manifesto_seen_v1', 'true');
            } catch (err) {
              console.warn('Could not save seen status in local sandbox:', err);
            }
          }} 
        />
      )}

      {showConnect && (
        <WalletModal
          onConnect={handleConnect}
          onClose={() => setShowConnect(false)}
        />
      )}

      {showDisconnect && user && (
        <DisconnectModal
          user={user}
          onDisconnect={handleDisconnect}
          onClose={() => setShowDisconnect(false)}
        />
      )}

      {showEdit && user && (
        <EditProfileModal
          user={user}
          onSave={handleProfileSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showInstallHelper && (
        <InstallPromptHelper
          isOpen={showInstallHelper}
          onClose={() => setShowInstallHelper(false)}
        />
      )}

      {/* Aura Crossing Celebration Toast Overlay */}
      <AuraToastNotification
        prevAura={prevAura}
        currAura={currAura}
        triggerKey={toastTriggerKey}
        onClose={() => {
          setPrevAura(null);
          setCurrAura(null);
        }}
      />
    </div>
  );
}

interface FooterProps {
  page: string;
  setPage: (p: string) => void;
  user: User | null;
  onShowWhitepaper: () => void;
  onShowManifesto: () => void;
  onShowInstall: () => void;
}

function Footer({ page, setPage, user, onShowWhitepaper, onShowManifesto, onShowInstall }: FooterProps) {
  const { t } = useLanguage();
  const [hoveredStamp, setHoveredStamp] = useState<number | null>(null);
  
  const aura = user ? getAura(user.karmaScore) : null;

  // Configure custom dynamic content stamp for the footer based on current active tab
  const getPageKarmaDetails = () => {
    switch (page) {
      case 'Dashboard':
        return {
          title: 'MY KARMA REP PASSPORT',
          desc: user 
            ? `Your decentralized reputation signature is active. @${user.username} is maintaining a score of ${user.karmaScore}/1000 within the '${aura?.name || 'Initiate'}' Aura bracket. Your sovereign holding streak has successfully reached ${user.streak} active diurnal cycles.`
            : `Sovereign reputation ledger initialized. Connect your sandbox keyset to register.`,
          status: user ? 'VERIFIED' : 'UNREGISTERED',
          hash: user ? `0x${user.address.substring(2, 6).toUpperCase()}...${user.address.substring(user.address.length - 4).toUpperCase()}` : '0x0000...0000',
          badge: aura?.badge || 'INIT_CITIZEN',
          color: aura?.color || '#a78bfa'
        };
      case 'Lenders':
        return {
          title: 'CREDIT ELIGIBILITY CERTIFICATION',
          desc: user 
            ? `Verified credit credentials synced. Your Reputation Quotient of ${user.karmaScore} guarantees pre-qualification under Tier ${user.karmaScore >= 740 ? 'A (Elite)' : 'B (Standard)'} debt routing models. Third-party lending pools can query this index dynamically.`
            : `Syncing credit credentials. Link your on-chain keyset to begin evaluation.`,
          status: user ? 'APPROVED' : 'UNVERIFIED',
          hash: 'LND_SYN_V2',
          badge: user ? (user.karmaScore >= 740 ? 'TIER_A_ELITE' : 'TIER_B_RELIABLE') : 'CREDIT_INITIAL',
          color: '#14F195'
        };
      case 'Leaderboard':
        return {
          title: 'GLOBAL LEDGER INDEX',
          desc: user 
            ? `Sandbox directory comparison synced. @${user.username} ranks at ${user.karmaScore} rating amongst the global registry of connected address conviction signatures. Keep holding assets in your sandbox wallet to scale the ranks.`
            : `Viewing global memory pool. Synchronize your custom profile to join the leaderboard database.`,
          status: 'REP_RANKED',
          hash: 'GBL_MEM_V4',
          badge: 'ACTIVE_LEDGER',
          color: '#38bdf8'
        };
      case 'AI Reading':
        return {
          title: 'COGNITIVE WISDOM INSIGHTS',
          desc: user
            ? `Diagnostic audit compiled. The Karma AI model has successfully computed velocity ratios and recommended a customized improvement checklist targeted to boost your score to ${user.karmaScore + 65} rating.`
            : `AI Diagnostic model ready. Initialize reputation telemetry to unlock custom analytics.`,
          status: 'COMPILED',
          hash: 'AI_COGN_V1',
          badge: 'GROWTH_ACTIVE',
          color: '#fbbf24'
        };
      default: // Home or fallback
        return {
          title: 'GENESIS NETWORK CORE',
          desc: user 
            ? `Connected to sovereign network block. Current reputation metric is ${user.karmaScore}/1000 within the '${aura?.name || 'Initiate'}' Aura. Use the navigation buttons above to guide your credit assets.`
            : `Welcome to the future of undercollateralized trust metadata. Connect your secure Web3 wallet signature to claim your custom handle and initial credit stats.`,
          status: user ? 'CONNECTED' : 'DISCONNECTED',
          hash: user ? `0x${user.address.substring(2, 8).toUpperCase()}` : 'SANDBOX_ENV',
          badge: 'GEN_CITIZEN',
          color: '#a78bfa'
        };
    }
  };

  const details = getPageKarmaDetails();

  return (
    <footer className="relative z-20 border-t border-white/[0.05] bg-[#05050b] text-slate-400 py-12 px-6 sm:px-12 mt-auto select-none" id="global-footer-system">
      <div className="max-w-[1080px] mx-auto mb-10">
        {/* Dynamic Page-Aware Karma Footer Stamp */}
        <div 
          className="relative rounded-2xl border p-5 bg-[#030308]/60 backdrop-blur-md overflow-hidden transition-all duration-300"
          style={{ borderColor: `${details.color}25`, boxShadow: `0 0 30px ${details.color}05` }}
        >
          {/* Subtle colored glow corner */}
          <div 
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none transition-all duration-500"
            style={{ backgroundColor: details.color }}
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full inline-block animate-ping" style={{ backgroundColor: details.color }} />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: details.color }}>
                  {details.title}
                </span>
                <span className="text-[8px] font-mono text-slate-600 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded uppercase">
                  PAGE-SENSITIVE FOOTER
                </span>
              </div>
              <p className="text-xs text-slate-450 leading-relaxed max-w-3xl">
                {details.desc}
              </p>
            </div>
            
            <div className="flex gap-4 font-mono text-[9px] shrink-0 border-t border-white/[0.04] md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
              <div 
                className="flex-1 md:flex-initial p-3 bg-slate-950/80 rounded-xl border flex flex-col justify-between items-start min-w-[110px] cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredStamp === 1 ? 'scale(1.05)' : 'scale(1)',
                  borderColor: hoveredStamp === 1 ? `${details.color}50` : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: hoveredStamp === 1 ? `0 0 15px ${details.color}25` : 'none'
                }}
                onMouseEnter={() => setHoveredStamp(1)}
                onMouseLeave={() => setHoveredStamp(null)}
              >
                <span className="text-slate-600 text-[8px] uppercase tracking-wider block mb-1">STAMP_STATUS</span>
                <span className="font-bold uppercase tracking-tight" style={{ color: details.color }}>
                  {details.status}
                </span>
              </div>
              <div 
                className="flex-1 md:flex-initial p-3 bg-slate-950/80 rounded-xl border flex flex-col justify-between items-start min-w-[110px] cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredStamp === 2 ? 'scale(1.05)' : 'scale(1)',
                  borderColor: hoveredStamp === 2 ? `${details.color}50` : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: hoveredStamp === 2 ? `0 0 15px ${details.color}25` : 'none'
                }}
                onMouseEnter={() => setHoveredStamp(2)}
                onMouseLeave={() => setHoveredStamp(null)}
              >
                <span className="text-slate-600 text-[8px] uppercase tracking-wider block mb-1">PASSPORT_ID</span>
                <span className="font-bold text-slate-300 font-mono">
                  {details.badge}
                </span>
              </div>
              <div 
                className="flex-1 md:flex-initial p-3 bg-slate-950/80 rounded-xl border flex flex-col justify-between items-start min-w-[110px] cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredStamp === 3 ? 'scale(1.05)' : 'scale(1)',
                  borderColor: hoveredStamp === 3 ? `${details.color}50` : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: hoveredStamp === 3 ? `0 0 15px ${details.color}25` : 'none'
                }}
                onMouseEnter={() => setHoveredStamp(3)}
                onMouseLeave={() => setHoveredStamp(null)}
              >
                <span className="text-slate-600 text-[8px] uppercase tracking-wider block mb-1">SIG_STAMP</span>
                <span className="font-semibold text-slate-500 font-mono">
                  {details.hash}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Column 1: Brand & Bio */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <KarmaLogo size={24} className="shrink-0" />
            <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-sm tracking-tight">
              KARMA <span className="text-[#a78bfa]">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {t('footer.brand')}
          </p>
          <div className="text-[10px] font-mono text-slate-600 mt-2">
            © 2026 - present KARMA AI, Protocol Inc. All rights reserved. Registered Sandbox Stage Ledger environment.
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider">{t('footer.ecosystem')}</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button 
                onClick={() => setPage('Home')} 
                className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ {t('nav.home')}
              </button>
            </li>
            {user && (
              <>
                <li>
                  <button 
                    onClick={() => setPage('Dashboard')} 
                    className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
                  >
                    ✦ {t('nav.dashboard')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setPage('Lenders')} 
                    className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
                  >
                    ✦ {t('nav.lenders')}
                  </button>
                </li>
              </>
            )}
            <li>
              <button 
                onClick={() => setPage('Leaderboard')} 
                className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ {t('nav.leaderboard')}
              </button>
            </li>
            <li>
              <button 
                onClick={onShowManifesto} 
                className="hover:text-[#a78bfa] text-purple-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ Creed Manifesto Code
              </button>
            </li>
            <li>
              <button 
                onClick={onShowInstall} 
                className="hover:text-[#14F195] text-emerald-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ 📱 Save App to Phone / Home Screen
              </button>
            </li>
            <li className="pt-1 mt-1 border-t border-white/[0.04]">
              <button 
                onClick={onShowWhitepaper} 
                className="hover:text-[#14F195] text-emerald-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ Whitepaper & Roadmap
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Tech parameters */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider">{t('footer.infrastructure')}</h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-500 font-mono">
            <li>FICO Sandbox Core</li>
            <li>Sybil Shield SDK</li>
            <li>Zero-Data Passport</li>
            <li>Optimism Attestations</li>
          </ul>
        </div>

        {/* Column 4: Community Resources */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider text-left md:text-right">{t('footer.socialVectors')}</h4>
          <div className="flex gap-3 justify-start md:justify-end items-center flex-wrap">
            <a 
              href="https://x.com/karmaaiscore" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="Follow on X"
            >
              <Twitter size={15} />
            </a>
            <a 
              href="https://t.me/KarmaScore" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-[#05050b] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="Telegram Channel"
            >
              <Send size={15} />
            </a>
            <a 
              href="https://github.com/WooCrypto/Karma" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-[#05050b] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="GitHub Repository"
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
