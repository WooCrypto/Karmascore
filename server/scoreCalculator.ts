import { ethers } from 'ethers';
import { UserProfile } from './db';

// Deterministic hashing helper
function getAddressHash(address: string): number {
  const clean = (address || '').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface OnChainMetrics {
  balanceETH: number;
  txCount: number;
  chainId: number;
}

// Fetch actual blockchain metrics across multiple major chains in parallel with timeouts
export async function fetchOnChainMetrics(address: string): Promise<OnChainMetrics> {
  const mainnetUrl = 'https://cloudflare-eth.com';
  const baseUrl = 'https://mainnet.base.org';
  const polygonUrl = 'https://polygon-rpc.com';

  let totalBalanceETH = 0;
  let totalTxCount = 0;
  let detectedChainId = 1;

  try {
    const mainnetProvider = new ethers.JsonRpcProvider(mainnetUrl);
    const baseProvider = new ethers.JsonRpcProvider(baseUrl);
    const polyProvider = new ethers.JsonRpcProvider(polygonUrl);

    const runCallWithTimeout = async <T>(promise: Promise<T>, timeoutMs = 1800): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
      ]);
    };

    const [mainnetBal, mainnetTx, baseBal, baseTx, polyBal, polyTx] = await Promise.all([
      runCallWithTimeout(mainnetProvider.getBalance(address)),
      runCallWithTimeout(mainnetProvider.getTransactionCount(address)),
      runCallWithTimeout(baseProvider.getBalance(address)),
      runCallWithTimeout(baseProvider.getTransactionCount(address)),
      runCallWithTimeout(polyProvider.getBalance(address)),
      runCallWithTimeout(polyProvider.getTransactionCount(address))
    ]);

    if (mainnetBal) {
      totalBalanceETH += parseFloat(ethers.formatEther(mainnetBal));
    }
    if (mainnetTx) {
      totalTxCount += Number(mainnetTx);
    }
    if (baseBal) {
      totalBalanceETH += parseFloat(ethers.formatEther(baseBal));
    }
    if (baseTx) {
      totalTxCount += Number(baseTx);
    }
    if (polyBal) {
      const MATIC_PRICE = 0.55;
      const ETH_PRICE = 3500;
      const maticValue = parseFloat(ethers.formatEther(polyBal)) * MATIC_PRICE;
      totalBalanceETH += maticValue / ETH_PRICE;
    }
    if (polyTx) {
      totalTxCount += Number(polyTx);
    }

    console.log(`[ON-CHAIN METRICS RESOLVED] Address: ${address} | Total Bal: ${totalBalanceETH.toFixed(5)} ETH | Total Tx: ${totalTxCount}`);
  } catch (err) {
    console.warn('[ON-CHAIN METRICS] Error querying public RPC gateways:', err);
  }

  return {
    balanceETH: totalBalanceETH,
    txCount: totalTxCount,
    chainId: detectedChainId
  };
}

export function computeKarmaProfile(
  address: string,
  username: string,
  walletId: string,
  walletName: string,
  walletIcon: string,
  walletColor: string,
  walletDesc: string,
  hideWallet: boolean,
  realMetrics?: OnChainMetrics
): UserProfile {
  const hash = getAddressHash(address);
  const useReal = realMetrics !== undefined;
  
  // --- Create Deterministic or On-chain Metrics ---
  const realTxCount = realMetrics?.txCount ?? 0;
  const realBalUSD = (realMetrics?.balanceETH ?? 0) * 3500; // approximation in USD

  const walletAgeDays = useReal
    ? (realTxCount > 100 ? 730 : realTxCount > 20 ? 180 : realTxCount > 0 ? 45 : 3)
    : 30 + (hash % 1200); // 30 days to 3 years

  const firstTxDate = new Date(Date.now() - walletAgeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const totalTransactions = useReal ? realTxCount : 5 + (hash % 850);
  const activeDays = useReal
    ? Math.max(1, Math.min(365, Math.floor(realTxCount * 0.45)))
    : Math.max(2, Math.floor(totalTransactions * 0.45) % 365);

  const monthlyActivity = Number((totalTransactions / (walletAgeDays / 30.4)).toFixed(1)) || 1.2;
  const tokenBalancesUSD = useReal ? realBalUSD : (hash % 100 < 5) ? 0 : 50 + (hash % 24500); // stable holdings
  
  const nftCount = useReal ? Math.min(15, Math.floor(realTxCount / 10)) : hash % 15;
  const stakedAmountUSD = useReal ? Math.floor(realBalUSD * 0.20) : (hash % 3 === 0) ? Math.floor(tokenBalancesUSD * 0.4) : 0;
  const stakedDurationDays = stakedAmountUSD > 0 ? (useReal ? 60 : 10 + (hash % 300)) : 0;
  const daoVotes = useReal ? Math.min(12, Math.floor(realTxCount / 30)) : hash % 22;
  const earlyMintsCount = useReal ? Math.min(8, Math.floor(realTxCount / 50)) : hash % 8;
  const riskInteractionsCount = useReal ? 0 : (hash % 100 < 12 ? (hash % 3) + 1 : 0); // Real addresses clean by default


  // --- Compile Weighted Dimensions (each 0 - 100 scale) ---
  
  // 1. Wallet Age (20% weight) -> older wallets get higher ratings
  let walletAgeScore = 20;
  if (walletAgeDays > 1000) walletAgeScore = 100;
  else if (walletAgeDays > 365) walletAgeScore = 85;
  else if (walletAgeDays > 180) walletAgeScore = 65;
  else if (walletAgeDays > 90) walletAgeScore = 45;

  // 2. Holding Behavior (20% weight) -> streak + balance + nft
  const holdingBehaviorScore = Math.min(100, Math.floor(
    (tokenBalancesUSD > 5000 ? 50 : tokenBalancesUSD > 500 ? 30 : 15) + 
    (nftCount > 5 ? 30 : nftCount > 0 ? 15 : 0) + 
    (walletAgeDays > 300 ? 20 : 10)
  ));

  // 3. Transaction Quality (15% weight) -> total transactions + active cycle freq
  const txQualityScore = Math.min(100, Math.floor(
    (totalTransactions > 300 ? 55 : totalTransactions > 50 ? 35 : 15) + 
    (monthlyActivity > 15 ? 45 : monthlyActivity > 2 ? 30 : 15)
  ));

  // 4. Staking Activities (15% weight)
  const stakingScore = stakedAmountUSD > 0 
    ? Math.min(100, 40 + Math.floor(stakedDurationDays * 0.2)) 
    : 10; // Low rating if no staking

  // 5. Governance Action (10% weight)
  const governanceScore = Math.min(100, 15 + (daoVotes * 4));

  // 6. Community Signals (10% weight)
  const communityScore = Math.min(100, 20 + (earlyMintsCount * 8) + (nftCount > 2 ? 15 : 0));

  // 7. Protocol Reputation / Security Shield (10% weight)
  const protocolRepScore = Math.max(10, 100 - (riskInteractionsCount * 25));

  // --- Calculate Final Weighted Score ---
  // KarmaScore = (Age*0.2 + Hold*0.2 + Tx*0.15 + Stake*0.15 + Gov*0.10 + Comm*0.10 + Rep*0.10) * 10
  const weightedFloat = 
    (walletAgeScore * 0.20) +
    (holdingBehaviorScore * 0.20) +
    (txQualityScore * 0.15) +
    (stakingScore * 0.15) +
    (governanceScore * 0.10) +
    (communityScore * 0.10) +
    (protocolRepScore * 0.10);
  
  const karmaScore = Math.max(100, Math.min(1000, Math.round(weightedFloat * 10)));

  // Determine Archetype Personality
  const personalities = ['Diamond', 'Visionary', 'Builder', 'Sage', 'Guardian', 'Explorer', 'Phoenix', 'Pioneer'];
  const personality = personalities[hash % personalities.length];

  // Map to beautiful Category wheels
  const categories = [
    { label: 'Patience', value: Math.round(holdingBehaviorScore), color: '#a78bfa', icon: '◈' },
    { label: 'Loyalty', value: Math.round(walletAgeScore), color: '#60a5fa', icon: '◆' },
    { label: 'Wisdom', value: Math.round(txQualityScore), color: '#fbbf24', icon: '⊕' },
    { label: 'Generosity', value: Math.round(stakingScore), color: '#34d399', icon: '⬡' },
    { label: 'Energy', value: Math.round(governanceScore), color: '#f472b6', icon: '◉' },
  ];

  // Assemble deterministic mock activity events
  const assets = [walletName === 'Solana' ? 'SOL' : 'ETH', 'USDC', 'USDT', 'WBTC', 'ARB', 'OP', 'POL'];
  const txSymbols = ['Trade', 'Stake', 'Mint', 'Transfer', 'Vote'] as const;

  const activities = [
    {
      id: `tx-real-${hash % 10000}-1`,
      timestamp: 'Just now',
      type: txSymbols[hash % txSymbols.length],
      txHash: address.slice(0, 6) + '...' + (hash % 8999 + 1000).toString(),
      amount: Number((1.5 + (hash % 5) * 4.2).toFixed(2)),
      asset: assets[(hash >> 1) % assets.length],
      scoreDelta: Math.floor(Math.random() * 5) + 2,
      patienceImpact: Math.floor(Math.random() * 4) + 1,
      loyaltyImpact: Math.floor(Math.random() * 3) + 1,
      wisdomImpact: Math.floor(Math.random() * 4) + 1,
    },
    {
      id: `tx-real-${hash % 10000}-2`,
      timestamp: '5h ago',
      type: txSymbols[(hash + 1) % txSymbols.length],
      txHash: address.slice(0, 6) + '...' + ((hash + 125) % 8999 + 1000).toString(),
      amount: Number((0.4 + ((hash + 2) % 4) * 8.5).toFixed(1)),
      asset: assets[(hash >> 2) % assets.length],
      scoreDelta: Math.floor(Math.random() * 4) + 2,
      patienceImpact: Math.floor(Math.random() * 3) + 1,
      loyaltyImpact: Math.floor(Math.random() * 4) + 1,
      wisdomImpact: Math.floor(Math.random() * 3) + 1,
    },
    {
      id: `tx-real-${hash % 10000}-3`,
      timestamp: '2d ago',
      type: txSymbols[(hash + 3) % txSymbols.length],
      txHash: address.slice(0, 6) + '...' + ((hash + 456) % 8999 + 1000).toString(),
      amount: Number((10 + ((hash + 5) % 15) * 20)),
      asset: assets[(hash >> 3) % assets.length],
      scoreDelta: Math.floor(Math.random() * 3) + 1,
      patienceImpact: Math.floor(Math.random() * 2) + 1,
      loyaltyImpact: Math.floor(Math.random() * 3) + 1,
      wisdomImpact: Math.floor(Math.random() * 4) + 1,
    }
  ];

  // Assemble multi-node historical trends
  const history = [];
  const startRepHistory = Math.max(100, karmaScore - 45);
  for (let i = 0; i < 5; i++) {
    const historicalScore = Math.min(1000, startRepHistory + (i * 9) + (hash % 4));
    const dt = new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000);
    const dateLabel = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    history.push({
      time: dateLabel,
      reputation: historicalScore,
      activityVolume: 3 + (hash % 4) + i,
      gasSaved: Number((0.02 + i * 0.015 + (hash % 10) * 0.005).toFixed(3))
    });
  }

  return {
    address: address.toLowerCase(),
    username,
    hideWallet,
    wallet: {
      id: walletId,
      name: walletName,
      icon: walletIcon,
      color: walletColor,
      desc: walletDesc,
    },
    streak: 3 + (hash % 64),
    connectedAt: new Date().toISOString(),
    karmaScore,
    personality,
    auraPoints: 50 + (hash % 500),
    lastClaimedAt: '',
    activities,
    categories,
    scores: {
      walletAge: walletAgeScore,
      holdingBehavior: holdingBehaviorScore,
      txQuality: txQualityScore,
      staking: stakingScore,
      governance: governanceScore,
      community: communityScore,
      protocolRep: protocolRepScore,
    },
    metrics: {
      firstTxDate,
      walletAgeDays,
      totalTransactions,
      activeDays,
      tokenBalancesUSD,
      nftCount,
      stakedAmountUSD,
      stakedDurationDays,
      daoVotes,
      earlyMintsCount,
      riskInteractionsCount,
    },
    history,
  };
}
