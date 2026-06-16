import { Wallet, Aura, Personality, LeaderboardRow } from './types';

export const PERSONALITIES: Record<string, Personality> = {
  Visionary: {
    name: 'Visionary',
    icon: '◈',
    color: '#a78bfa',
    desc: 'You discover opportunities before the crowd. You prefer conviction over hype. You build long-term positions and focus on future potential.',
  },
  Diamond: {
    name: 'Diamond',
    icon: '◆',
    color: '#67e8f9',
    desc: 'Unbreakable. You hold through storms others flee. Your hands are forged from pressure, your strategy from patience.',
  },
  Builder: {
    name: 'Builder',
    icon: '⬡',
    color: '#6ee7b7',
    desc: 'You construct ecosystems, not portfolios. Every position is a brick in something larger. You think in decades, not days.',
  },
  Sage: {
    name: 'Sage',
    icon: '⊕',
    color: '#fbbf24',
    desc: "Ancient knowledge, modern tools. You've seen cycles come and go. Wisdom earned through losses, strategy refined by time.",
  },
  Guardian: {
    name: 'Guardian',
    icon: '⬟',
    color: '#f472b6',
    desc: 'You protect. Capital. Community. Principles. You move with deliberate care and exit with surgical precision.',
  },
  Explorer: {
    name: 'Explorer',
    icon: '◉',
    color: '#fb923c',
    desc: 'The frontier is your comfort zone. Early, bold, and undeterred—you map territory others fear to enter.',
  },
  Phoenix: {
    name: 'Phoenix',
    icon: '⊛',
    color: '#f87171',
    desc: "You've burned. You've risen. Each cycle makes you stronger. Loss is your teacher, resilience your superpower.",
  },
  Pioneer: {
    name: 'Pioneer',
    icon: '⬢',
    color: '#818cf8',
    desc: 'First mover. Trend setter. While others wait for confirmation, you\'ve already moved on to the next horizon.',
  },
};

export const AURAS: Aura[] = [
  { name: 'Charcoal Aura', min: 0, max: 200, color: '#4b5563', glow: 'rgba(75,85,99,0.4)', badge: 'New Soul' },
  { name: 'Gray Aura', min: 201, max: 400, color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', badge: 'Contributor' },
  { name: 'Blue Aura', min: 401, max: 600, color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', badge: 'Builder' },
  { name: 'Purple Aura', min: 601, max: 800, color: '#a78bfa', glow: 'rgba(167,139,250,0.4)', badge: 'Guardian' },
  { name: 'Gold Aura', min: 801, max: 1000, color: '#fbbf24', glow: 'rgba(251,191,36,0.6)', badge: 'Legend' },
];

export const WALLETS: Wallet[] = [
  { id: 'walletconnect', name: 'WalletConnect', icon: '◈', color: '#3b99fc', desc: 'Any mobile wallet' },
];

export const BASE_LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, wallet: '0x7f3a...9c21', username: 'CryptoSage', hideWallet: true, personality: 'Diamond', score: 945, aura: 'Gold Aura', streak: 142 },
  { rank: 2, wallet: '0x2b8e...4d17', username: 'VisionaryX', hideWallet: false, personality: 'Visionary', score: 875, aura: 'Gold Aura', streak: 89 },
  { rank: 3, wallet: '0x9a1f...7e44', username: 'OraclePath', hideWallet: true, personality: 'Sage', score: 812, aura: 'Gold Aura', streak: 201 },
  { rank: 5, wallet: '0x1e2f...8a33', username: 'IronGuardian', hideWallet: false, personality: 'Guardian', score: 764, aura: 'Purple Aura', streak: 55 },
  { rank: 6, wallet: '0x6d9b...1c78', username: 'ChainPioneer', hideWallet: true, personality: 'Pioneer', score: 685, aura: 'Purple Aura', streak: 44 },
  { rank: 7, wallet: '0x3f7c...5e29', username: 'DeepExplorer', hideWallet: false, personality: 'Explorer', score: 512, aura: 'Blue Aura', streak: 33 },
  { rank: 8, wallet: '0x8a4e...0d61', username: 'RisingPhoenix', hideWallet: true, personality: 'Phoenix', score: 345, aura: 'Gray Aura', streak: 22 },
];

export function getAura(score: number): Aura {
  return AURAS.find(a => score >= a.min && score <= a.max) || AURAS[0];
}

export function truncateWallet(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
