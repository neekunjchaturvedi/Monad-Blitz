import { prisma } from '../db/client.js'
import { getAgentPrivateKey } from '../wallets/walletManager.js'
import { createAgentSDK } from '../chain/provider.js'
import { feed } from '../feed/feedService.js'
import { logAgentAction } from './agentLogger.js'
import { parseEther } from '@nadfun/sdk'

export interface LauncherConfig {
  keywords: string[]          // e.g. ["monad", "memecoin", "pump"]
  liquidity_mon: string       // initial buy amount on launch, e.g. "0.5"
  cooldown_minutes: number
}

// 1×1 transparent PNG — placeholder image for launched coins
const PLACEHOLDER_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

const lastLaunchTime: Record<string, number> = {}

function deriveTokenName(headline: string): { name: string; symbol: string } {
  const words = headline
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 3)
  const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || 'AgentCoin'
  const symbol = words.map(w => w.slice(0, 2).toUpperCase()).join('') || 'AGT'
  return { name, symbol }
}

export async function checkAndLaunch(headline: string, source: string) {
  const agents = await prisma.agent.findMany({
    where: { category: 'launcher', status: 'RUNNING' },
    select: { id: true, config: true },
  })
  if (!agents.length) return

  for (const agent of agents) {
    const config = agent.config as unknown as LauncherConfig

    const matched = config.keywords?.some(kw => headline.toLowerCase().includes(kw.toLowerCase()))
    if (!matched) continue

    const cooldownMs = (config.cooldown_minutes ?? 30) * 60 * 1000
    if (Date.now() - (lastLaunchTime[agent.id] ?? 0) < cooldownMs) continue

    try {
      const { name, symbol } = deriveTokenName(headline)
      const privateKey = await getAgentPrivateKey(agent.id)
      const sdk = createAgentSDK(privateKey)

      const result = await sdk.createToken({
        name,
        symbol,
        description: `Launched by AgentHub — triggered by: ${headline.slice(0, 80)}`,
        image: PLACEHOLDER_IMAGE,
        imageContentType: 'image/png',
        initialBuyAmount: parseEther(config.liquidity_mon ?? '0.5'),
      })

      lastLaunchTime[agent.id] = Date.now()
      await prisma.agent.update({ where: { id: agent.id }, data: { runCount: { increment: 1 } } })

      const action = `Launched $${symbol} (${name}) on nad.fun — tx: ${result.transactionHash}`
      await logAgentAction(agent.id, action, 'success', result.transactionHash)
      feed.emit('agent_action', {
        agent_id: agent.id,
        action,
        tx_hash: result.transactionHash,
        token_address: result.tokenAddress,
        source,
      })

      console.log(`[launcher] Agent ${agent.id} launched $${symbol} at ${result.tokenAddress}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      await logAgentAction(agent.id, `Launch failed: "${headline.slice(0, 40)}"`, msg, null)
      console.error(`[launcher] Agent ${agent.id} failed:`, msg)
    }
  }
}
