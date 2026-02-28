export interface Agent {
  id: string;
  name: string;
  description: string;
  category: "Sniper" | "Bundler" | "Launcher" | "Custom";
  status: "Active" | "Idle" | "Running";
  runs: number;
  volume: number;
  pnl: number;
  creator: string;
  createdAt: string;
  logic: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "1",
    name: "Monad Sniper v1",
    description:
      "Ultra-fast sniper that listens to the factory contract for new deploys. Includes honeypot detection.",
    category: "Sniper",
    status: "Active",
    runs: 1240,
    volume: 450000,
    pnl: 12.5,
    creator: "0x71C...9A2",
    createdAt: "2024-01-15",
    logic: [
      "Listens to nad.fun factory contract",
      "Checks liquidity > $5k",
      "Verifies dev wallet holdings < 10%",
      "Auto-sells at +50% or -15% stop loss",
    ],
  },
  {
    id: "2",
    name: "Volume Bundler Pro",
    description:
      "Simulate organic volume by coordinating buys across multiple wallets. Perfect for launching.",
    category: "Bundler",
    status: "Running",
    runs: 85,
    volume: 1200000,
    pnl: 0,
    creator: "0x3A2...B11",
    createdAt: "2024-02-01",
    logic: [
      "Coordinates 5 wallets",
      "Randomized buy intervals (1-5s)",
      "Distributes buy amounts",
      "Gas optimization",
    ],
  },
  {
    id: "3",
    name: "News Launcher",
    description:
      "Deploys coins based on breaking news keywords. Catch the narrative before anyone else.",
    category: "Launcher",
    status: "Idle",
    runs: 12,
    volume: 50000,
    pnl: 45.2,
    creator: "0x99F...2C4",
    createdAt: "2024-02-10",
    logic: [
      "Monitors CryptoPanic API",
      "Keywords: 'Monad', 'Pepe', 'Dog'",
      "Sentiment analysis > 0.8",
      "Auto-deploys to nad.fun",
    ],
  },
  {
    id: "4",
    name: "Arb Bot X",
    description: "Exploits price differences between nad.fun and other DEXs.",
    category: "Custom",
    status: "Active",
    runs: 5600,
    volume: 890000,
    pnl: 8.4,
    creator: "0x1D4...E55",
    createdAt: "2024-01-20",
    logic: [
      "Watches 3 DEX pairs",
      "Calculates gas-adjusted spread",
      "Executes flash loan arb",
      "MEV protection",
    ],
  },
];

export const LIVE_ACTIVITY = [
  {
    id: 1,
    type: "SNIPE",
    agent: "Monad Sniper v1",
    coin: "PEPE2",
    time: "2s ago",
    profit: "+12%",
  },
  {
    id: 2,
    type: "LAUNCH",
    agent: "News Launcher",
    coin: "ELONMON",
    time: "5s ago",
    profit: "0%",
  },
  {
    id: 3,
    type: "BUNDLE",
    agent: "Volume Bundler Pro",
    coin: "CHAD",
    time: "12s ago",
    profit: "N/A",
  },
  {
    id: 4,
    type: "SNIPE",
    agent: "Alpha Hunter",
    coin: "WOJAK",
    time: "24s ago",
    profit: "+45%",
  },
  {
    id: 5,
    type: "EXIT",
    agent: "Safe Guard",
    coin: "SCAM",
    time: "45s ago",
    profit: "-2%",
  },
];

export const NEW_LAUNCHES = [
  {
    id: 1,
    name: "Super Monad",
    ticker: "SMON",
    time: "1m ago",
    liquidity: "$12k",
    risk: "Low",
  },
  {
    id: 2,
    name: "Degen Pepe",
    ticker: "DPEPE",
    time: "3m ago",
    liquidity: "$4k",
    risk: "High",
  },
  {
    id: 3,
    name: "Safe Moon 2",
    ticker: "SFM2",
    time: "5m ago",
    liquidity: "$25k",
    risk: "Medium",
  },
  {
    id: 4,
    name: "Based Giga",
    ticker: "GIGA",
    time: "12m ago",
    liquidity: "$8k",
    risk: "Low",
  },
];
