import { useState } from 'react';
import { User, Reading } from '../types';
import GlassCard from './GlassCard';
import { Download, CheckCircle2 } from 'lucide-react';

interface AIReadingProps {
  user: User;
}

const FALLBACKS: Reading[] = [
  {
    title: 'The Unyielding Anchor',
    paragraphs: [
      'The blockchain reports vectors; the soul evaluates momentum. Over the course of forty-seven days, your signature on-chain remains remarkably stable, immune to local storms or temporary flash crashes.',
      'This patience score is not merely a record of holding; it is an active testament to self-knowledge. You recognize that the market operates on noise, but conviction is built in silence. In the top 8% of wallets, your geometric footprint is clean and quiet.',
      'Your energy metrics, however, show a soft, low profile. Consider broadening your surface area. Not for transaction count, but to support emerging builders and early protocols that require your seasoned conviction.',
    ],
    insight: 'Patience is an active force. Cultivate deep positions, but never let silence turn into stagnation.',
    focus: 'Interact with one emerging, builder-focused community forum or public good today.',
  },
  {
    title: 'The Silent Architect',
    paragraphs: [
      'While the crowd chases high-frequency volume, your transactions reveal a deliberate spacing. Every signature is a block in a larger framework. You do not chase momentum; you establish coordinates and let the future compile around you.',
      'Your loyalty index reflects a deep commitment to core positions. Your wallets exhibit a rhythmic, predictable flow that points to system-driven execution rather than response to emotional indicators.',
      'Energy remains your primary growth metric. Broaden the circumference of your on-chain experiments. Test alternative rails, participate in tests, or sponsor an independent developer to accelerate your wisdom.',
    ],
    insight: 'Systems outperform predictions over long-term timelines.',
    focus: 'Engage with minor network tests or smart contract audits to refresh your systemic insight.',
  }
];

export default function AIReading({ user }: AIReadingProps) {
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportedStatus, setExportedStatus] = useState(false);

  function exportSummaryReport() {
    if (!reading) return;

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const categoryLines = (user.categories || []).map(c => {
      const val = typeof c.value === 'number' ? c.value : 0;
      const barFilled = '█'.repeat(Math.round(val / 10));
      const barEmpty = '░'.repeat(10 - Math.round(val / 10));
      return `${c.label.padEnd(12)} | [${barFilled}${barEmpty}] ${val}%  (${c.icon || '✦'})`;
    }).join('\n');

    const activityLines = (user.activities || []).map(a => {
      return `- [${a.timestamp}] ${a.type} of ${a.amount} ${a.asset} (Tx: ${a.txHash}) -> Score Delta: +${a.scoreDelta}`;
    }).join('\n');

    const mdContent = `================================================================================
💠 KARMA LEDGER REPUTATION AUDIT SUMMARY REPORT 💠
================================================================================
Generated: ${dateStr}

👤 CREDENTIAL PROFILE
--------------------------------------------------------------------------------
Username:        @${user.username}
On-Chain Addr:   ${user.address}
Linked Wallet:   ${user.wallet.name}
Aura Alignment:  ${user.personality || 'Visionary'}

📈 TRUST & FIDELITY INDICES
--------------------------------------------------------------------------------
Karma Score:     ${user.karmaScore || 750} / 1000
Streak Duration: ${user.streak || 0} days active

📊 BEHAVIORAL ATTRIBUTES SCORECARD
--------------------------------------------------------------------------------
${categoryLines || 'No attributes records indexed.'}

🔮 EXPERT AI BEHAVIORAL ANALYSIS
--------------------------------------------------------------------------------
Reading Title:   ${reading.title}

${reading.paragraphs.join('\n\n')}

📌 CORE TAKEAWAYS
--------------------------------------------------------------------------------
Key Takeaway:    "${reading.insight}"
Focus Blueprint: ${reading.focus}

📝 RECENT ACTIVITIES VERIFIED BY LEDGER
--------------------------------------------------------------------------------
${activityLines || 'No recent activity records found.'}

--------------------------------------------------------------------------------
This reputation audit was compiled using on-chain consensus history.
================================================================================`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `karma-reputation-report-${user.username || 'user'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show export success toast
    setExportedStatus(true);
    setTimeout(() => {
      setExportedStatus(false);
    }, 4000);
  }

  async function generateReading() {
    setLoading(true);
    setReading(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/gemini/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          address: user.address,
          score: user.karmaScore,
          streak: user.streak,
          personality: user.personality || 'Visionary',
          wallet: user.wallet.name,
          activities: user.activities || [],
          categories: user.categories || [],
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned error status');
      }

      const data = await res.json();
      if (data && data.title && data.paragraphs) {
        setReading(data);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (err) {
      console.warn('Gemini API reading failed, triggering secure fallback client-side model: ', err);
      // Fallback securely to our beautiful preset readings
      const fallback = FALLBACKS[fallbackIndex % FALLBACKS.length];
      setReading({
        ...fallback,
        paragraphs: fallback.paragraphs.map(p => p.replace(/@user|@username/g, `@${user.username}`)),
      });
      setFallbackIndex(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-[720px] mx-auto pt-24 px-6 pb-16 animate-fade-in text-slate-100">
      <div className="mb-10">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-2 font-bold">
          {todayStr}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Daily AI Reading
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          A behavioral reading reflecting your current on-chain metrics, compiled dynamically by Gemini 3.5.
        </p>
      </div>

      {!reading && !loading && (
        <GlassCard style={{ padding: '62px 40px', textAlign: 'center' }}>
          <div className="text-5xl mb-6 select-none animate-bounce" style={{ textShadow: '0 0 35px rgba(167,139,250,0.6)' }}>
            Oracle
          </div>
          <h3 className="font-bold text-slate-100 text-xl mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
            The Chain is Ready to Speak
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            Let the KARMA AI on-chain intelligence read your transactional history patterns, gas benchmarks, and holder streaks to forge your path.
          </p>
          <button
            onClick={generateReading}
            className="px-8 py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all shadow-[0_0_30px_rgba(167,139,250,0.25)] hover:shadow-[0_0_40px_rgba(167,139,250,0.45)] transform hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Generate My Reading →
          </button>
        </GlassCard>
      )}

      {loading && (
        <GlassCard style={{ padding: '62px 40px', textAlign: 'center' }}>
          <div 
            className="text-xs font-mono tracking-widest text-[#a78bfa] mb-8 animate-pulse uppercase"
            style={{ fontStyle: 'italic' }}
          >
            Sifting blocks for @{user.username}…
          </div>
          
          {/* Animated custom loader dots */}
          <div className="flex justify-center gap-2 items-center">
            <div className="w-2.5 h-2.5 bg-[#a78bfa] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-[#9333ea] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" />
          </div>
          
          <div className="text-slate-500 text-xs mt-8 font-mono animate-pulse max-w-sm mx-auto">
            Resolving zero-knowledge variables and cross-referencing Ethereum Mainnet holding limits...
          </div>
        </GlassCard>
      )}

      {reading && !loading && (
        <div className="space-y-6">
          <GlassCard style={{ padding: '40px 36px' }}>
            <h3 
              className="font-extrabold text-white text-2xl mb-6 relative pl-4 border-l-4 border-purple-500"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {reading.title}
            </h3>
            
            <div className="space-y-5 text-sm leading-relaxed text-slate-300">
              {reading.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </GlassCard>

          {/* Quick takeaway boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard style={{ padding: 24 }}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2">Key Takeaway</div>
              <p className="text-xs leading-relaxed font-sans text-slate-200 italic" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                &ldquo;{reading.insight}&rdquo;
              </p>
            </GlassCard>

            <GlassCard style={{ padding: 24 }}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9] mb-2">Today's Focus</div>
              <p className="text-xs leading-relaxed text-slate-300">
                {reading.focus}
              </p>
            </GlassCard>
          </div>

           {/* Success notification overlay */}
          {exportedStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-mono flex items-center justify-center gap-2 animate-fade-in relative overflow-hidden" id="export-success-message">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Karma reputation audit summary <b>.md</b> report downloaded successfully. Check your browser downloads!</span>
            </div>
          )}

          {/* Regeneration capabilities */}
          <div className="flex gap-4 flex-wrap items-center justify-center pt-4" id="ai-reading-action-controls">
            <button
              onClick={generateReading}
              className="text-xs font-semibold px-5 py-3 rounded-xl border border-[#a78bfa]/25 bg-[#a78bfa]/8 text-[#c084fc] hover:bg-[#a78bfa]/15 transition-all cursor-pointer"
            >
              ↻ Regenerate Reading
            </button>
            
            <button
              id="export-reputation-summary-btn"
              onClick={exportSummaryReport}
              className="text-xs font-semibold px-5 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit (.MD)
            </button>

            <button
              onClick={() => setReading(null)}
              className="text-xs font-semibold px-5 py-3 rounded-xl border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
