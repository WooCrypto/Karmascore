import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, initializeFirestore } from 'firebase/firestore';

// Load Firebase configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('[DB] Failed to load firebase-applet-config.json:', err);
}

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId || '(default)');

// Helper to wrap Firestore promises with a fast timeout fallback
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Firebase operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('[DB] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  address: string;
  username: string;
  hideWallet: boolean;
  wallet: {
    id: string;
    name: string;
    icon: string;
    color: string;
    desc: string;
  };
  streak: number;
  connectedAt: string;
  karmaScore: number;
  personality: string;
  auraPoints: number;
  lastClaimedAt: string;
  activities: any[];
  categories: { label: string; value: number; color: string; icon: string }[];
  scores: {
    walletAge: number;
    holdingBehavior: number;
    txQuality: number;
    staking: number;
    governance: number;
    community: number;
    protocolRep: number;
  };
  metrics: {
    firstTxDate: string;
    walletAgeDays: number;
    totalTransactions: number;
    activeDays: number;
    tokenBalancesUSD: number;
    nftCount: number;
    stakedAmountUSD: number;
    stakedDurationDays: number;
    daoVotes: number;
    earlyMintsCount: number;
    riskInteractionsCount: number;
  };
  history: { time: string; reputation: number; activityVolume: number; gasSaved: number }[];
}

export interface AuthChallenge {
  address: string;
  challenge: string;
  createdAt: number;
}

// In-Memory redis-style cache for high throughput optimization
const cacheMap = new Map<string, { record: UserProfile; cachedAt: number }>();

export function getCachedScore(address: string): UserProfile | null {
  const cached = cacheMap.get(address.toLowerCase());
  if (!cached) return null;
  // Cache expiration: 10 minutes for fast reactive alignment
  if (Date.now() - cached.cachedAt > 10 * 60 * 1000) {
    cacheMap.delete(address.toLowerCase());
    return null;
  }
  return cached.record;
}

export function setCachedScore(address: string, profile: UserProfile): void {
  cacheMap.set(address.toLowerCase(), {
    record: profile,
    cachedAt: Date.now()
  });
}

export function clearCache(address: string): void {
  cacheMap.delete(address.toLowerCase());
}

// --- Challenges Store (Web Interface Auth Handshaking) ---
export async function createChallenge(address: string): Promise<string> {
  const normalized = address.toLowerCase();
  const challenge = crypto.randomUUID();
  const pathStr = `challenges/${normalized}`;
  try {
    await withTimeout(setDoc(doc(db, 'challenges', normalized), {
      address: normalized,
      challenge,
      createdAt: Date.now()
    }), 2500);
    return challenge;
  } catch (err) {
    console.warn(`[DB WARNING] createChallenge failed or timed out: ${err instanceof Error ? err.message : String(err)}. Returning local challenge.`);
    return challenge;
  }
}

export async function getChallenge(address: string): Promise<string | null> {
  const normalized = address.toLowerCase();
  const pathStr = `challenges/${normalized}`;
  try {
    const docRef = doc(db, 'challenges', normalized);
    const snap = await withTimeout(getDoc(docRef), 2500);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (Date.now() - data.createdAt > 5 * 60 * 1000) {
      try {
        await withTimeout(deleteDoc(docRef), 2500);
      } catch (_) {}
      return null;
    }
    return data.challenge;
  } catch (err) {
    console.warn(`[DB WARNING] getChallenge failed or timed out: ${err instanceof Error ? err.message : String(err)}.`);
    return null;
  }
}

export interface ChallengeRecord {
  address: string;
  challenge: string;
  createdAt: number;
}

export async function getChallengeRecord(address: string): Promise<ChallengeRecord | null> {
  const normalized = address.toLowerCase();
  const pathStr = `challenges/${normalized}`;
  try {
    const docRef = doc(db, 'challenges', normalized);
    const snap = await withTimeout(getDoc(docRef), 2500);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (Date.now() - data.createdAt > 5 * 60 * 1000) {
      try {
        await withTimeout(deleteDoc(docRef), 2500);
      } catch (_) {}
      return null;
    }
    return {
      address: data.address,
      challenge: data.challenge,
      createdAt: data.createdAt
    };
  } catch (err) {
    console.warn(`[DB WARNING] getChallengeRecord failed or timed out: ${err instanceof Error ? err.message : String(err)}.`);
    return null;
  }
}

export async function clearChallenge(address: string): Promise<void> {
  const normalized = address.toLowerCase();
  const pathStr = `challenges/${normalized}`;
  try {
    await withTimeout(deleteDoc(doc(db, 'challenges', normalized)), 2500);
  } catch (err) {
    console.warn(`[DB WARNING] clearChallenge failed or timed out: ${err instanceof Error ? err.message : String(err)}.`);
  }
}

// --- Permanent Database System via Cloud Firestore ---
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const pathStr = `profiles/${profile.address.toLowerCase()}`;
  try {
    // Keep cached in-memory instantly to guarantee responsive operations
    setCachedScore(profile.address, profile);
    await withTimeout(setDoc(doc(db, 'profiles', profile.address.toLowerCase()), profile), 2500);
  } catch (err) {
    console.warn(`[DB WARNING] saveUserProfile failed or timed out: ${err instanceof Error ? err.message : String(err)}. Falling back to in-memory caching.`);
  }
}

export async function getUserProfile(address: string): Promise<UserProfile | null> {
  // Try Cache first to bypass network overhead
  const cached = getCachedScore(address);
  if (cached) {
    console.log(`[DB] In-Memory Cache HIT for wallet address: ${address}`);
    return cached;
  }
  
  console.log(`[DB] Cache MISS. Loading Firestore database record for: ${address}`);
  const pathStr = `profiles/${address.toLowerCase()}`;
  try {
    const snap = await withTimeout(getDoc(doc(db, 'profiles', address.toLowerCase())), 2500);
    if (!snap.exists()) return null;
    const profile = snap.data() as UserProfile;
    setCachedScore(address, profile);
    return profile;
  } catch (err) {
    console.warn(`[DB WARNING] Loaded getUserProfile failed or timed out: ${err instanceof Error ? err.message : String(err)}. Operating with default state fallback.`);
    return null;
  }
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const pathStr = 'profiles';
  try {
    const snap = await withTimeout(getDocs(collection(db, 'profiles')), 2500);
    const list: UserProfile[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as UserProfile);
    });
    return list;
  } catch (err) {
    console.warn(`[DB WARNING] getAllProfiles failed or timed out: ${err instanceof Error ? err.message : String(err)}. Returning active cached profiles.`);
    const fallbackList: UserProfile[] = [];
    cacheMap.forEach((cached) => {
      fallbackList.push(cached.record);
    });
    return fallbackList;
  }
}

export async function triggerDailyScoreUpdates(): Promise<void> {
  console.log('[CRON] Initiating scheduled 24h updates database engine sweeping cycle via Firestore...');
  try {
    const profiles = await getAllProfiles();
    let count = 0;
    for (const profile of profiles) {
      // Tick active holding streak calendar
      profile.streak += 1;
      profile.auraPoints = (profile.auraPoints || 0) + Math.floor(Math.random() * 20) + 10;
      
      // Simulate score shifts
      const shift = Math.floor(Math.random() * 9) - 4; // -4 to +4 rating swing
      profile.karmaScore = Math.max(0, Math.min(1000, profile.karmaScore + shift));
      
      // Save historical rating cycle records
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      profile.history.push({
        time: currentDate,
        reputation: profile.karmaScore,
        activityVolume: profile.history[profile.history.length - 1]?.activityVolume || 5,
        gasSaved: (profile.history[profile.history.length - 1]?.gasSaved || 0.1) + Number((Math.random() * 0.05).toFixed(3))
      });
      // Cap historical array size to 10 nodes
      if (profile.history.length > 10) {
        profile.history.shift();
      }
      
      await saveUserProfile(profile);
      count++;
    }
    
    if (count > 0) {
      console.log(`[CRON] Success. Synchronized and compiled holding indices for ${count} active reputation identities.`);
    }
  } catch (err) {
    console.error('[CRON] Failed to sweep database profiles during daily cron updates:', err);
  }
}

