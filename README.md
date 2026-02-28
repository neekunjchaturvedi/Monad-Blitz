# AgentHub

**The AI agent marketplace for Monad.** Deploy autonomous trading agents that snipe, bundle, and launch memecoins on [nad.fun](https://nad.fun) — fully on-chain, with dedicated wallets per agent.

Built for the Monad Hackathon.

---

## What is AgentHub?

AgentHub is a platform where anyone can publish, discover, and deploy AI trading agents that operate autonomously on the Monad blockchain. Each agent gets its own on-chain wallet, is registered via a smart contract, and executes trades on nad.fun without any manual intervention.

Think GitHub for agents — but they actually run.

---

## Agent Types

### Sniper Agent
Listens to the nad.fun bonding curve factory for new token deploys. On each new launch, runs an automated risk check (virtual reserve, metadata presence, symbol validity). If the token passes — buys in the same block using the agent's dedicated wallet. Auto-sells at a configurable profit target or stop-loss.

### Bundler Agent
Fires coordinated buys across multiple sub-wallets in a single Monad block window. Simulates organic volume, avoids front-running, and reports total cost + average entry price.

### News-Triggered Launcher
Monitors live crypto news from CoinDesk, CoinTelegraph, and CryptoPanic RSS feeds. When a configured keyword appears in a headline (e.g. "Monad", "memecoin", "pump") it autonomously calls nad.fun's `createToken` to launch a coin — name and symbol derived from the headline.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing — hero, feature tiles, live activity ticker |
| `/explore` | Marketplace — browse and filter all published agents |
| `/agent/:id` | Agent detail — config, stats, deploy, activity log |
| `/dashboard` | Control center — manage your agents, fund wallets, kill switch |
| `/feed` | Live feed — nad.fun launches + agent actions in real time |
| `/create` | Publish a new agent to the on-chain registry |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│  React 19 + Vite + Tailwind + Wagmi + RainbowKit    │
│  Connects to Monad Testnet via wallet               │
└────────────────────┬────────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼────────────────────────────────┐
│                     Backend                         │
│  Node.js + Express + TypeScript                     │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Chain       │  │ Agent Runner │  │ News      │  │
│  │ Listener   │  │ (sniper /    │  │ Fetcher   │  │
│  │ CurveIndexer│  │  bundler /   │  │ RSS +     │  │
│  │ polls RPC  │  │  launcher)   │  │ CryptoPanic│  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐                  │
│  │ Wallet Mgr  │  │ Feed Service │                  │
│  │ per-agent   │  │ WS broadcast │                  │
│  │ AES-256 enc │  │ port 4001    │                  │
│  └─────────────┘  └──────────────┘                  │
└────────────────────┬────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────┐
│             PostgreSQL (local)                      │
│  agents · agent_wallets · agent_logs                │
└─────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          Monad Testnet (Chain ID 10143)              │
│                                                     │
│  AgentRegistry.sol  — on-chain agent identity       │
│  nad.fun Bonding Curve Router                       │
│  WMON token                                         │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Wallet | Wagmi v2, RainbowKit, viem |
| Backend | Node.js, Express, TypeScript, tsx |
| Chain interaction | @nadfun/sdk (viem-based) |
| Live feed | CurveIndexer (polls Monad RPC every 3s), WebSocket (ws) |
| Database | PostgreSQL + Prisma ORM |
| Smart contracts | Solidity 0.8, Hardhat + hardhat-toolbox-viem |
| News | CoinDesk / CoinTelegraph RSS, CryptoPanic API |

---

## Project Structure

```
agenthub-monad/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── Pages/     # All 6 routes
│       ├── components/# Navbar, WalletModal, Ticker
│       ├── hooks/     # useFeed (WebSocket)
│       ├── lib/       # api.ts, registry.ts
│       └── types/     # Shared TypeScript types
│
├── backend/           # Node.js API + agent runtime
│   ├── src/
│   │   ├── agents/    # sniperAgent, bundlerAgent, launcherAgent
│   │   ├── chain/     # listener (CurveIndexer), provider
│   │   ├── wallets/   # walletManager (per-agent EOAs)
│   │   ├── feed/      # feedService (WebSocket broadcast)
│   │   ├── news/      # newsFetcher (RSS + CryptoPanic)
│   │   └── api/       # Express routes
│   └── prisma/
│       └── schema.prisma
│
└── contracts/         # Solidity (Hardhat)
    └── src/
        └── AgentRegistry.sol
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Monad testnet MON (faucet in Monad Discord)

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, WALLET_ENCRYPTION_KEY
npm install
npm run db:migrate        # runs prisma migrate dev
npm run dev               # starts on port 4000, WS on 4001
```

### 2. Contracts

```bash
cd contracts
npm install
cp .env.example .env      # fill in DEPLOYER_PRIVATE_KEY
npx hardhat run scripts/deploy.ts --network monad
# copy the printed address into frontend/.env as VITE_REGISTRY_ADDRESS
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # fill in VITE_WALLETCONNECT_PROJECT_ID, VITE_REGISTRY_ADDRESS
npm install
npm run dev               # starts on http://localhost:5173
```

---

## Key Contracts (Monad Testnet)

| Contract | Address |
|---|---|
| nad.fun Bonding Curve Router | `0x865054F0F6A288adaAc30261731361EA7E908003` |
| WMON | `0x5a4E0bFDeF88C9032CB4d24338C5EB3d3870BfDd` |
| AgentRegistry (deploy yours) | _see contracts/deploy output_ |

---

## Environment Variables

### Backend `.env`
```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agenthub
MONAD_RPC_URL=https://rpc.monad.xyz
WALLET_ENCRYPTION_KEY=<32 char secret>
CRYPTOPANIC_API_KEY=<optional>
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4001
VITE_WALLETCONNECT_PROJECT_ID=<your project id>
VITE_REGISTRY_ADDRESS=<deployed AgentRegistry address>
```
