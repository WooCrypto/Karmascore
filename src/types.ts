/**
 * Shared Type Definitions for Karma AI
 * @license Apache-2.0
 */

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface Aura {
  name: string;
  min: number;
  max: number;
  color: string;
  glow: string;
  badge: string;
}

export interface Personality {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface AuraClaimRecord {
  id: string;
  timestamp: string;
  amount: number;
  multiplier: number;
  streak: number;
  txHash: string;
  status: 'Settled' | 'Pending Distribution';
}

export interface User {
  username: string;
  address: string;
  hideWallet: boolean;
  wallet: Wallet;
  streak: number;
  connectedAt: string;
  karmaScore: number;
  personality?: string;
  auraPoints?: number;
  totalAuraClaimed?: number;
  lastClaimedAt?: string;
  auraClaimHistory?: AuraClaimRecord[];
  activities?: ActivityEvent[];
  categories?: { label: string; value: number; color: string; icon: string }[];
}

export interface LeaderboardRow {
  rank: number;
  wallet: string;
  username: string;
  hideWallet: boolean;
  personality: string;
  score: number;
  aura: string;
  streak: number;
  isMe?: boolean;
}

export interface Reading {
  title: string;
  paragraphs: string[];
  insight: string;
  focus: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'Trade' | 'Mint' | 'Stake' | 'Vote' | 'Transfer';
  txHash: string;
  amount: number;
  asset: string;
  scoreDelta: number;
  patienceImpact: number;
  loyaltyImpact: number;
  wisdomImpact: number;
}

export interface ChartDataPoint {
  time: string;
  reputation: number;
  activityVolume: number;
  gasSaved: number;
}
