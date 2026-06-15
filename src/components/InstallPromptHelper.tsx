import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, X, CheckCircle, HelpCircle, ArrowRight, Star, Moon, Zap } from 'lucide-react';

interface InstallPromptHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPromptHelper({ isOpen, onClose }: InstallPromptHelperProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState<boolean>(false);

  // Auto-detect environment parameters on mount
  useEffect(() => {
    // Check if app is already running in standalone (PWA) mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (navigator as any).standalone === true;
    setIsStandalone(isPWA);

    // Detect user-agent
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Catch standard install prompt request
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstallTrigger = async () => {
    if (!deferredPrompt) {
      // Fallback - show success mockup / prompt trigger
      setShowInstallSuccess(true);
      setTimeout(() => setShowInstallSuccess(false), 4000);
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[70] overflow-y-auto bg-black/95 backdrop-blur-md cursor-pointer flex justify-center items-start sm:items-center p-4 sm:p-6"
      >
        
        {/* Animated fluid orb backdrop decoration */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-indigo-500/10 blur-[80px] top-1/4 left-1/4 pointer-events-none" />
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[#14F195]/10 blur-[80px] bottom-1/4 right-1/4 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#070710] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-8 text-left cursor-default my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all border-none bg-transparent cursor-pointer"
            title="Dismiss Install Guide"
          >
            <X size={16} />
          </button>

          {/* Icon and Title */}
          <div className="flex items-center gap-3.5 mb-5 select-none">
            <div className="w-12 h-12 rounded-2.5xl bg-gradient-to-tr from-purple-500/20 to-[#14F195]/20 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Smartphone size={22} className="text-purple-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#14F195] block font-black">
                MOBILE APPLICATION SUITE
              </span>
              <h3 className="text-lg font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                Add Karma to Home Screen
              </h3>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            Turn this website into a permanent, immersive full-screen application. Experience Karma AI without the browser navigation bar, with instant launch physics and lightning-fast sandbox updates.
          </p>

          {/* Benefits grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
              <span className="text-xs p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">📱</span>
              <div>
                <h5 className="text-[11px] font-bold text-slate-200">Borderless Play</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Removes Safari/Chrome addresses for pure display space.</p>
              </div>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
              <span className="text-xs p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">⚡</span>
              <div>
                <h5 className="text-[11px] font-bold text-slate-200">Zero App Store</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Instant setup, zero downloads or developer certificates needed.</p>
              </div>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
              <span className="text-xs p-1 rounded-md bg-purple-500/10 text-[#14F195] shrink-0">🔥</span>
              <div>
                <h5 className="text-[11px] font-bold text-[#14F195]">Speedy Sandbox</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Loads assets from client-side caches for instant startups.</p>
              </div>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
              <span className="text-xs p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">🔒</span>
              <div>
                <h5 className="text-[11px] font-bold text-slate-200">Sandbox Secure</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Leverages sandboxed browser storage protocols safely.</p>
              </div>
            </div>
          </div>

          {/* Tab selector for Mobile Instructions */}
          <div className="bg-slate-950 p-1 rounded-xl border border-white/[0.04] flex gap-1 mb-5 select-none">
            {['ios', 'android', 'desktop'].map((tab) => {
              const isActive = deviceType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setDeviceType(tab as any)}
                  className="flex-1 py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border-none"
                  style={{
                    background: isActive ? 'rgba(167, 139, 250, 0.12)' : 'transparent',
                    color: isActive ? '#a78bfa' : '#64748b',
                    border: isActive ? '1px solid rgba(167, 139, 250, 0.2)' : '1px solid transparent'
                  }}
                >
                  {tab === 'ios' ? ' Apple iOS' : tab === 'android' ? '🤖 Android' : '🖥️ Desktop'}
                </button>
              );
            })}
          </div>

          {/* Dynamic Instructions text based on device style */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.03] space-y-3.5 mb-6">
            {deviceType === 'ios' && (
              <div className="space-y-3">
                <span className="text-[8.5px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  iOS Safari Installation Instructions
                </span>
                <ol className="text-xs space-y-2.5 text-slate-300 pl-4 list-decimal leading-relaxed">
                  <li>
                    Open this app inside the native <strong className="text-white">Safari Browser</strong>.
                  </li>
                  <li>
                    Tap the native <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white">Share</span> button at the bottom toolbar bar.
                  </li>
                  <li>
                    Scroll down through the choices panel and hit <span className="text-[#a78bfa] font-bold">"Add to Home Screen"</span>.
                  </li>
                  <li>
                    Give the app a clean title, click <strong className="text-white">"Add"</strong>, and launch Karma instantly from your homepage!
                  </li>
                </ol>
              </div>
            )}

            {deviceType === 'android' && (
              <div className="space-y-3">
                <span className="text-[8.5px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  Android Chrome / Edge Instructions
                </span>
                <ol className="text-xs space-y-2.5 text-slate-300 pl-4 list-decimal leading-relaxed">
                  <li>
                    Tap the vertical <strong className="text-white">Three-Dot Menu</strong> icon at the top-right corner of Chrome.
                  </li>
                  <li>
                    Select <span className="text-emerald-400 font-bold">"Install app"</span> or <strong className="text-white">"Add to Home Screen"</strong>.
                  </li>
                  <li>
                    Follow the platform confirmation dialog and tap <strong className="text-slate-100">"Add Automatically"</strong>.
                  </li>
                  <li>
                    A high-contrast Karma launch icon will resolve on your native screen instantly!
                  </li>
                </ol>
              </div>
            )}

            {deviceType === 'desktop' && (
              <div className="space-y-3">
                <span className="text-[8.5px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  Standard Desktop Layout Shortcut
                </span>
                <ol className="text-xs space-y-2.5 text-slate-300 pl-4 list-decimal leading-relaxed">
                  <li>
                    Look at your browser's URL address bar on the right-hand side.
                  </li>
                  <li>
                    Click the native <span className="text-[#a78bfa] font-bold">"Install Karma"</span> desktop monitor icon (or find the option in the browser main menu).
                  </li>
                  <li>
                    Confirm installation to launch Karma in a dedicated desktop workspace.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Trigger/Status button */}
          <div className="space-y-3 select-none">
            {showInstallSuccess ? (
              <motion.div 
                initial={{ scale: 0.95 }} 
                animate={{ scale: 1 }} 
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Installed Device Sandbox Registered!
              </motion.div>
            ) : (
              <button
                onClick={handleNativeInstallTrigger}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_22px_rgba(124,58,237,0.45)] active:scale-95"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                <Download size={14} />
                {deferredPrompt ? '⚙️ Install Seamless Web App' : '📲 Configure Home Screen Shortcut'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all text-[10px] font-mono uppercase tracking-widest text-center border border-white/[0.02] cursor-pointer"
            >
              Continue inside default browser tab ➜
            </button>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/[0.04] text-[8.5px] font-mono text-slate-500 text-center uppercase tracking-wide">
            {isStandalone ? '📱 App running as Standalone PWA environment' : '🌐 Browser session mode active'}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
