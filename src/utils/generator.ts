import { Wallet, User, ActivityEvent } from '../types';

export function generateUserProfile(
  wallet: Wallet,
  username: string,
  address: string,
  hideWallet: boolean
): User {
  let karmaScore = 87;
  let streak = 47;
  let personality = 'Visionary';
  let categories: { label: string; value: number; color: string; icon: string }[] = [];
  let activities: ActivityEvent[] = [];

  // If we have a custom or real address, calculate highly realistic deterministic stats
  const cleanAddress = address ? address.toLowerCase().trim() : '';
  const isCustomOrRealAddress = cleanAddress.startsWith('0x') && cleanAddress.length > 25;

  if (isCustomOrRealAddress) {
    // Elegant character summation hash
    let hash = 0;
    for (let i = 0; i < cleanAddress.length; i++) {
      hash = (hash << 5) - hash + cleanAddress.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);

    // Score ranges beautifully from 62 to 98
    karmaScore = 62 + (hash % 37);
    // Streak ranges from 3 to 145 days
    streak = 3 + (hash % 143);

    const personalities = ['Diamond', 'Visionary', 'Builder', 'Sage', 'Guardian', 'Explorer', 'Phoenix', 'Pioneer'];
    personality = personalities[hash % personalities.length];

    categories = [
      { label: 'Patience', value: 65 + (hash % 31), color: '#a78bfa', icon: '◈' },
      { label: 'Loyalty', value: 60 + ((hash >> 1) % 36), color: '#60a5fa', icon: '◆' },
      { label: 'Wisdom', value: 70 + ((hash >> 2) % 26), color: '#fbbf24', icon: '⊕' },
      { label: 'Generosity', value: 55 + ((hash >> 3) % 41), color: '#34d399', icon: '⬡' },
      { label: 'Energy', value: 60 + ((hash >> 4) % 36), color: '#f472b6', icon: '◉' },
    ];

    const assets = ['ETH', 'USDC', 'USDT', 'WBTC', 'ARB', 'OP', 'POL'];
    const txTypes = ['Trade', 'Stake', 'Mint', 'Transfer', 'Vote'] as const;

    // Construct 3 highly customized transactions
    activities = [
      {
        id: `tx-det-${hash % 1000}-1`,
        timestamp: 'Just now',
        type: txTypes[hash % txTypes.length],
        txHash: cleanAddress.slice(0, 6) + '...' + (hash % 9999).toString().padStart(4, '0'),
        amount: Number((1.2 + (hash % 8) * 3.1).toFixed(2)),
        asset: assets[(hash >> 1) % assets.length],
        scoreDelta: 3 + (hash % 3),
        patienceImpact: 2 + (hash % 4),
        loyaltyImpact: 1 + ((hash >> 1) % 5),
        wisdomImpact: 2 + ((hash >> 2) % 4),
      },
      {
        id: `tx-det-${hash % 1000}-2`,
        timestamp: '4h ago',
        type: txTypes[(hash + 1) % txTypes.length],
        txHash: cleanAddress.slice(0, 6) + '...' + ((hash + 123) % 9999).toString().padStart(4, '0'),
        amount: Number((0.5 + ((hash + 2) % 6) * 12).toFixed(1)),
        asset: assets[(hash >> 2) % assets.length],
        scoreDelta: 2 + ((hash + 1) % 3),
        patienceImpact: 1 + ((hash + 1) % 5),
        loyaltyImpact: 2 + ((hash + 2) % 4),
        wisdomImpact: 1 + ((hash + 3) % 5),
      },
      {
        id: `tx-det-${hash % 1000}-3`,
        timestamp: '1d ago',
        type: txTypes[(hash + 2) % txTypes.length],
        txHash: cleanAddress.slice(0, 6) + '...' + ((hash + 456) % 9999).toString().padStart(4, '0'),
        amount: Number((5 + ((hash + 5) % 12) * 50)),
        asset: assets[(hash >> 3) % assets.length],
        scoreDelta: 1 + ((hash + 2) % 3),
        patienceImpact: 2 + ((hash + 2) % 4),
        loyaltyImpact: 1 + ((hash + 3) % 4),
        wisdomImpact: 3 + ((hash + 4) % 3),
      }
    ];
  } else {
    // Normal static preset compilation routes
    switch (wallet.id) {
    case 'metamask':
      karmaScore = 91;
      streak = 88;
      personality = 'Diamond';
      categories = [
        { label: 'Patience', value: 94, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 92, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 89, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 78, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 65, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-meta-1',
          timestamp: 'Just now',
          type: 'Stake',
          txHash: '0x4af1...109b',
          amount: 14.5,
          asset: 'ETH',
          scoreDelta: 4,
          patienceImpact: 5,
          loyaltyImpact: 4,
          wisdomImpact: 2,
        },
        {
          id: 'tx-meta-2',
          timestamp: '3h ago',
          type: 'Trade',
          txHash: '0x391c...817d',
          amount: 2.4,
          asset: 'ETH',
          scoreDelta: 3,
          patienceImpact: 5,
          loyaltyImpact: 2,
          wisdomImpact: 3,
        },
        {
          id: 'tx-meta-3',
          timestamp: '1d ago',
          type: 'Transfer',
          txHash: '0x81fa...9a01',
          amount: 5.0,
          asset: 'USDC',
          scoreDelta: 2,
          patienceImpact: 3,
          loyaltyImpact: 1,
          wisdomImpact: 1,
        },
      ];
      break;

    case 'coinbase':
      karmaScore = 84;
      streak = 12;
      personality = 'Builder';
      categories = [
        { label: 'Patience', value: 81, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 85, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 82, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 90, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 87, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-coin-1',
          timestamp: 'Just now',
          type: 'Mint',
          txHash: '0x4f12...bb90',
          amount: 1,
          asset: 'Base Founder Card',
          scoreDelta: 3,
          patienceImpact: 1,
          loyaltyImpact: 4,
          wisdomImpact: 1,
        },
        {
          id: 'tx-coin-2',
          timestamp: '2h ago',
          type: 'Stake',
          txHash: '0x82f1...cc34',
          amount: 5000,
          asset: 'USDC',
          scoreDelta: 4,
          patienceImpact: 4,
          loyaltyImpact: 5,
          wisdomImpact: 2,
        },
        {
          id: 'tx-coin-3',
          timestamp: '6h ago',
          type: 'Trade',
          txHash: '0x2bf9...aa07',
          amount: 0.45,
          asset: 'BTC',
          scoreDelta: 2,
          patienceImpact: 2,
          loyaltyImpact: 2,
          wisdomImpact: 3,
        },
      ];
      break;

    case 'trust':
      karmaScore = 78;
      streak = 140;
      personality = 'Sage';
      categories = [
        { label: 'Patience', value: 89, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 76, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 95, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 81, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 59, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-trust-1',
          timestamp: 'Just now',
          type: 'Vote',
          txHash: '0xbf91...127a',
          amount: 140,
          asset: 'dGov Voting Tokens',
          scoreDelta: 4,
          patienceImpact: 1,
          loyaltyImpact: 2,
          wisdomImpact: 5,
        },
        {
          id: 'tx-trust-2',
          timestamp: '30m ago',
          type: 'Stake',
          txHash: '0x81af...99cd',
          amount: 1500,
          asset: 'USDC',
          scoreDelta: 3,
          patienceImpact: 4,
          loyaltyImpact: 3,
          wisdomImpact: 4,
        },
        {
          id: 'tx-trust-3',
          timestamp: '12h ago',
          type: 'Transfer',
          txHash: '0x3fa1...c092',
          amount: 2.5,
          asset: 'ETH',
          scoreDelta: 2,
          patienceImpact: 3,
          loyaltyImpact: 1,
          wisdomImpact: 3,
        },
      ];
      break;

    case 'rabby':
      karmaScore = 95;
      streak = 30;
      personality = 'Pioneer';
      categories = [
        { label: 'Patience', value: 88, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 91, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 94, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 86, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 98, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-rabby-1',
          timestamp: 'Just now',
          type: 'Mint',
          txHash: '0xce23...92f1',
          amount: 1,
          asset: 'Rabby Genesis Badge',
          scoreDelta: 5,
          patienceImpact: 2,
          loyaltyImpact: 5,
          wisdomImpact: 3,
        },
        {
          id: 'tx-rabby-2',
          timestamp: '4h ago',
          type: 'Trade',
          txHash: '0xfa89...7c12',
          amount: 1.85,
          asset: 'ETH',
          scoreDelta: 3,
          patienceImpact: 2,
          loyaltyImpact: 3,
          wisdomImpact: 4,
        },
        {
          id: 'tx-rabby-3',
          timestamp: '23h ago',
          type: 'Trade',
          txHash: '0xab42...f08d',
          amount: 2500,
          asset: 'USDT',
          scoreDelta: 3,
          patienceImpact: 3,
          loyaltyImpact: 2,
          wisdomImpact: 4,
        },
      ];
      break;

    case 'walletconnect':
      karmaScore = 68;
      streak = 9;
      personality = 'Explorer';
      categories = [
        { label: 'Patience', value: 61, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 55, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 74, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 72, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 88, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-wc-1',
          timestamp: 'Just now',
          type: 'Trade',
          txHash: '0xbe82...aa88',
          amount: 450,
          asset: 'POL',
          scoreDelta: 3,
          patienceImpact: 2,
          loyaltyImpact: 1,
          wisdomImpact: 3,
        },
        {
          id: 'tx-wc-2',
          timestamp: '1h ago',
          type: 'Mint',
          txHash: '0x9c34...29ff',
          amount: 1,
          asset: 'DeFi Domain Voucher',
          scoreDelta: 2,
          patienceImpact: 1,
          loyaltyImpact: 2,
          wisdomImpact: 3,
        },
        {
          id: 'tx-wc-3',
          timestamp: '3h ago',
          type: 'Stake',
          txHash: '0x12bb...e8dd',
          amount: 100,
          asset: 'DAE',
          scoreDelta: 3,
          patienceImpact: 3,
          loyaltyImpact: 3,
          wisdomImpact: 2,
        },
      ];
      break;

    case 'rainbow':
      karmaScore = 75;
      streak = 24;
      personality = 'Phoenix';
      categories = [
        { label: 'Patience', value: 72, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 69, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 78, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 85, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 83, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-rb-1',
          timestamp: 'Just now',
          type: 'Trade',
          txHash: '0x4ee1...f328',
          amount: 2.1,
          asset: 'ETH',
          scoreDelta: 3,
          patienceImpact: 2,
          loyaltyImpact: 1,
          wisdomImpact: 4,
        },
        {
          id: 'tx-rb-2',
          timestamp: '5h ago',
          type: 'Mint',
          txHash: '0x3bf1...bb90',
          amount: 1,
          asset: 'Rainbow Art NFT Editions',
          scoreDelta: 2,
          patienceImpact: 1,
          loyaltyImpact: 3,
          wisdomImpact: 2,
        },
        {
          id: 'tx-rb-3',
          timestamp: '2d ago',
          type: 'Vote',
          txHash: '0x992d...df11',
          amount: 450,
          asset: 'Network Ballot Rails',
          scoreDelta: 3,
          patienceImpact: 2,
          loyaltyImpact: 2,
          wisdomImpact: 3,
        },
      ];
      break;

    default:
      karmaScore = 85;
      streak = 4;
      personality = 'Visionary';
      categories = [
        { label: 'Patience', value: 85, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 80, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 80, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 80, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 80, color: '#f472b6', icon: '◉' },
      ];
      activities = [
        {
          id: 'tx-default-1',
          timestamp: 'Just now',
          type: 'Trade',
          txHash: '0x88f2...ae12',
          amount: 1.0,
          asset: 'ETH',
          scoreDelta: 3,
          patienceImpact: 3,
          loyaltyImpact: 3,
          wisdomImpact: 3,
        },
      ];
  }
  }

  return {
    username,
    address,
    hideWallet,
    wallet,
    streak,
    connectedAt: new Date().toISOString(),
    karmaScore: 300 + Math.round(karmaScore * 5.5),
    personality,
    categories,
    activities,
  };
}
