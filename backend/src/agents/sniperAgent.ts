import { parseEther, formatEther } from '@nadfun/sdk'
import { prisma } from '../db/client.js'
import { getAgentPrivateKey } from '../wallets/walletManager.js'
import { createAgentSDK } from '../chain/provider.js'
import { feed } from '../feed/feedService.js'
import { logAgentAction } from './agentLogger.js'
import type { LaunchEvent } from '../chain/listener.js'

export interface SniperConfig {
  max_risk_score: number        // skip if riskScore > this (0–100)
  buy_amount_mon: string        // MON to spend, e.g. "0.1"
  take_profit_pct: number       // auto-sell at +X%
  stop_loss_pct: number         // auto-sell at -Y%
  min_virtual_reserve: number   // skip if virtualMonReserve < this
  slippage_pct?: number         // default 5
  keyword_filter?: string[]     // only snipe if name/symbol contains these
}

export async function runSniperAgents(launch: LaunchEvent) {
  const agents = await prisma.agent.findMany({
    where: { category: 'sniper', status: 'RUNNING' },
    select: { id: true, config: true },
  })
  if (!agents.length) return

  for (const agent of agents) {
    const config = agent.config as unknown as SniperConfig

    // ── Filters ─────────────────────────────────────────────────────────
    if (launch.riskScore > (config.max_risk_score ?? 60)) continue

    const reserve = parseFloat(launch.virtualMonReserve)
    if (reserve < (config.min_virtual_reserve ?? 1)) continue

    if (config.keyword_filter?.length) {
      const target = (launch.name + launch.symbol).toLowerCase()
      if (!config.keyword_filter.some(kw => target.includes(kw.toLowerCase()))) continue
    }

    // ── Execute buy via SDK ──────────────────────────────────────────────
    try {
      const privateKey = await getAgentPrivateKey(agent.id)
      const sdk = createAgentSDK(privateKey)

      const amountIn = parseEther(config.buy_amount_mon ?? '0.05')
      const txHash = await sdk.simpleBuy({
        token: launch.token as `0x${string}`,
        amountIn,
        slippagePercent: config.slippage_pct ?? 5,
        to: sdk.account.address,
      })

      await prisma.agent.update({ where: { id: agent.id }, data: { runCount: { increment: 1 } } })

      const action = `Sniped $${launch.symbol} for ${config.buy_amount_mon} MON`
      await logAgentAction(agent.id, action, 'success', txHash)
      feed.emit('agent_action', { agent_id: agent.id, action, tx_hash: txHash, token: launch.symbol })

      scheduleAutoSell(agent.id, launch.token, amountIn, config)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      await logAgentAction(agent.id, `Snipe failed: $${launch.symbol}`, msg, null)
      console.error(`[sniper] Agent ${agent.id} failed:`, msg)
    }
  }
}

function scheduleAutoSell(agentId: string, token: string, spent: bigint, config: SniperConfig) {
  const entryMON = parseFloat(formatEther(spent))
  const tpTarget = entryMON * (1 + config.take_profit_pct / 100)
  const slTarget = entryMON * (1 - config.stop_loss_pct / 100)
  console.log(`[sniper] Auto-sell watcher — TP: ${tpTarget.toFixed(4)} MON  SL: ${slTarget.toFixed(4)} MON`)

  // Poll every 10s — replace with real price check once nad.fun price API is known
  const interval = setInterval(async () => {
    try {
      const privateKey = await getAgentPrivateKey(agentId)
      const sdk = createAgentSDK(privateKey)
      const { amount: quoteOut } = await sdk.getAmountOut(token as `0x${string}`, spent, false)
      const currentMON = parseFloat(formatEther(quoteOut))

      if (currentMON >= tpTarget || currentMON <= slTarget) {
        const reason = currentMON >= tpTarget ? 'take-profit' : 'stop-loss'
        const txHash = await sdk.simpleSell({
          token: token as `0x${string}`,
          amountIn: spent,
          slippagePercent: 5,
          to: sdk.account.address,
        })
        await logAgentAction(agentId, `Auto-sell (${reason}) $${token.slice(0, 8)}`, 'success', txHash)
        feed.emit('agent_action', { agent_id: agentId, action: `Auto-sold (${reason})`, tx_hash: txHash })
        clearInterval(interval)
      }
    } catch {
      // silently ignore polling errors
    }
  }, 10_000)

  // Safety cutoff after 24h
  setTimeout(() => clearInterval(interval), 24 * 60 * 60 * 1000)
}
