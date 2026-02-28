/**
 * Chain Listener
 * Uses @nadfun/sdk CurveIndexer to poll Monad RPC directly for new token launches.
 * No external WebSocket URL needed — reads straight from the blockchain.
 * Polls every 3 seconds, tracks last processed block to avoid duplicates.
 */

import { createCurveIndexer, formatEther, type CreateEvent } from '@nadfun/sdk'
import { feed } from '../feed/feedService.js'
import { runSniperAgents } from '../agents/sniperAgent.js'

const RPC_URL = process.env.MONAD_RPC_URL ?? 'https://rpc.monad.xyz'
const POLL_INTERVAL_MS = 3_000
const BLOCK_LOOKBACK = 5n   // safety window in case we miss a block

export interface LaunchEvent {
  token: string
  creator: string
  name: string
  symbol: string
  virtualMonReserve: string
  riskScore: number
  riskFlags: string[]
  blockNumber: string
  txHash: string
  tokenURI?: string
}

// ── Risk scoring (no extra RPC calls — pure from event data) ───────────────

function scoreRisk(e: CreateEvent): { score: number; flags: string[] } {
  const flags: string[] = []
  let score = 0

  const reserveMON = parseFloat(formatEther(e.virtualMon))
  if (reserveMON < 1) { flags.push('low_virtual_reserve'); score += 30 }
  if (!e.symbol || e.symbol.length < 2) { flags.push('no_symbol'); score += 20 }
  if (!e.name || e.name.length < 2) { flags.push('no_name'); score += 20 }
  if (!e.tokenURI || e.tokenURI === '') { flags.push('no_metadata'); score += 25 }

  return { score: Math.min(score, 100), flags }
}

// ── Poller ─────────────────────────────────────────────────────────────────

export function startChainListener() {
  const indexer = createCurveIndexer({ rpcUrl: RPC_URL, network: 'testnet' })
  let lastBlock: bigint | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  async function poll() {
    try {
      const latest = await indexer.getLatestBlock()

      // On first run, just set the cursor — don't replay old history
      if (lastBlock === null) {
        lastBlock = latest
        console.log(`[chain] CurveIndexer ready at block ${latest}`)
        return
      }

      if (latest <= lastBlock) return

      const from = lastBlock - BLOCK_LOOKBACK > 0n ? lastBlock - BLOCK_LOOKBACK : 0n
      const events = await indexer.getCreateEvents(from, latest)

      for (const e of events) {
        const { score, flags } = scoreRisk(e)

        const launch: LaunchEvent = {
          token: e.token,
          creator: e.creator,
          name: e.name,
          symbol: e.symbol,
          virtualMonReserve: formatEther(e.virtualMon),
          riskScore: score,
          riskFlags: flags,
          blockNumber: e.blockNumber.toString(),
          txHash: e.transactionHash,
          tokenURI: e.tokenURI,
        }

        console.log(
          `[chain] 🚀 New launch: ${e.name} ($${e.symbol}) ` +
          `block=${e.blockNumber} risk=${score} tx=${e.transactionHash.slice(0, 10)}…`
        )

        feed.emit('launch', launch)

        await runSniperAgents(launch).catch(err =>
          console.error('[chain] Sniper error:', err)
        )
      }

      lastBlock = latest
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[chain] Poll error:', msg)
    }
  }

  // Start polling immediately then every POLL_INTERVAL_MS
  poll()
  timer = setInterval(poll, POLL_INTERVAL_MS)
  console.log(`[chain] CurveIndexer polling every ${POLL_INTERVAL_MS / 1000}s via ${RPC_URL}`)

  return () => {
    if (timer) clearInterval(timer)
  }
}
