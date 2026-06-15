import { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  return (
    <div className="relative shrink-0 select-none text-[12px]" ref={dropdownRef} id="nav-language-switcher">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/35 hover:bg-purple-500/5 text-slate-300 hover:text-white transition-all cursor-pointer outline-none text-xs font-semibold"
      >
        <Globe size={13} className="text-purple-400" />
        <span className="font-mono text-[11px] font-bold">{activeLang.flag} {activeLang.code}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-400' : 'text-slate-500'}`} />
      </button>

      {/* Styled Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090913]/95 border border-white/[0.06] shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl py-1.5 z-50 animate-fade-in divide-y divide-white/[0.02]">
          {/* Section Header */}
          <div className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 select-none">
            Choose Language
          </div>

          <div className="py-1">
            {supportedLanguages.map(lang => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors cursor-pointer text-left border-none font-medium text-xs leading-none"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && (
                    <Check size={12} className="text-[#a78bfa] font-bold" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
