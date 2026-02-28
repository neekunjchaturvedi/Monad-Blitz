# AgentHub — Pages & Features (Lean MVP)

---

## 1. Landing Page `/`
**Goal:** Hook → CTA → Connect wallet

- Hero headline + one-liner ("AI Agents that trade for you on Monad")
- 3 feature tiles: Sniper Agent / Bundler Agent / Live Feed
- "Launch an Agent" CTA button (opens wallet connect)
- Live ticker at bottom — scrolling real-time agent activity (coins sniped, launched, bundled)

---

## 2. Explore (Marketplace) `/explore`
**Goal:** Browse all published agents

- Search bar + filter chips (Sniper / Bundler / Launcher / Custom)
- Agent cards grid — name, category tag, # of runs, creator wallet (truncated), deploy button
- Each card shows agent's live status (Active / Idle / Running)
- No pagination — infinite scroll, keep it simple

---

## 3. Agent Detail Page `/agent/:id`
**Goal:** Understand the agent, deploy it

- Agent name, description, category badge
- Stats row: Total Runs / Total Volume / Avg PnL / Created date
- "What it does" — 3–4 bullet points describing the agent's logic
- Trigger config panel — set inputs (e.g. min liquidity, slippage, coin keywords)
- Deploy button → creates an on-chain instance + spins up a dedicated wallet for this agent
- Activity log — last 20 runs with timestamp, action taken, result

---

## 4. My Dashboard `/dashboard`
**Goal:** Control center for user's deployed agents

- My Agents list — each with: name, status toggle (ON/OFF), wallet address + balance, last action
- Fund Wallet button per agent — send MON to agent's wallet
- Kill switch — pause or delete an agent
- Summary stats at top: Total Agents / Total Spent / Total Gained

---

## 5. Live Feed `/feed`
**Goal:** Real-time view of what's happening on nad.fun + what agents are doing

- Left panel: nad.fun new launches stream — coin name, deploy time, initial liquidity, risk score (auto-calc)
- Right panel: Agent activity stream — which agent did what (sniped X, launched Y, bundled Z)
- Top bar: news ticker — crypto headlines pulled from RSS/APIs that agents use as signals
- Click any launch → opens nad.fun link + shows which agents acted on it

---

## 6. Create Agent `/create`
**Goal:** Publish a new agent (for builders)

- Agent name + description fields
- Category selector (Sniper / Bundler / Launcher / Custom)
- Trigger picker — choose from preset triggers (new nad.fun launch, price threshold, keyword in news)
- Logic field — paste agent code or select a template
- Visibility toggle (Public / Private)
- Publish button → deploys to Monad registry contract

---

## Built-in Agent Templates (ship these for hackathon)

### Sniper Agent
- Listens to nad.fun factory contract for new deploys
- Runs risk check (liquidity floor, dev wallet %, honeypot scan)
- If passes → buys in same block using agent's wallet
- Auto-sell at +X% or stop-loss at -Y%

### Bundler Agent
- User pre-loads wallets (2–5 wallets)
- On trigger, sends coordinated buys across all wallets in one bundle tx
- Avoids front-running, looks like organic volume
- Reports total cost and avg entry price

### News-Triggered Launcher
- Monitors live news feed for configurable keywords (e.g. "Monad", "memecoin", "pump")
- When keyword hit + sentiment is bullish → autonomously calls nad.fun to launch a coin
- Coin name auto-generated from the news headline

---

## Wallet Per Agent (Core mechanic)
- Every deployed agent gets a fresh EOA wallet generated on deploy
- User funds it with MON
- Agent signs txs with that wallet autonomously
- Dashboard shows balance + full tx history per agent wallet
- User can withdraw unused funds anytime

---

## Tech Stack (Quick ref)
- Frontend: Next.js + Tailwind + shadcn/ui
- Chain: Monad testnet (EVM)
- Agent runtime: Node.js workers (hosted, simple)
- nad.fun: direct contract calls via ethers.js
- News feed: CryptoPanic API / RSS aggregator
- Wallet gen: ethers.js `Wallet.createRandom()`
- DB: Supabase (agent metadata, logs)
