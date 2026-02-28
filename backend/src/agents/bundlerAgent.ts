import { parseEther, formatEther } from '@nadfun/sdk'
import { prisma } from '../db/client.js'
import { getAgentPrivateKey } from '../wallets/walletManager.js'
import { createAgentSDK } from '../chain/provider.js'
import { feed } from '../feed/feedService.js'
import { logAgentAction } from './agentLogger.js'

export interface BundlerConfig {
  wallet_count: number        // 2–5 sub-wallets to spread buys across
  total_spend_mon: string     // total MON, split evenly
  slippage_pct?: number
}

/**
 * Fires `wallet_count` buys concurrently using the same agent private key
 * with increasing nonces — they land in the same block window on Monad's
 * fast chain, appearing as organic volume from one wallet.
 *
 * For true multi-wallet bundling, fund additional wallets and store their
 * keys linked to the agent in a future iteration.
 */
export async function runBundlerAgent(agentId: string, token: string, triggerSource: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { config: true, status: true },
  })
  if (!agent || agent.status !== 'RUNNING') return

  const config = agent.config as unknown as BundlerConfig
  const walletCount = Math.min(config.wallet_count ?? 3, 5)
  const totalSpend = parseEther(config.total_spend_mon ?? '0.3')
  const perBuy = totalSpend / BigInt(walletCount)

  const privateKey = await getAgentPrivateKey(agentId)
  const sdk = createAgentSDK(privateKey)

  // Get starting nonce then fire buys with sequential nonces
  const startNonce = await sdk.publicClient.getTransactionCount({ address: sdk.account.address })

  const results = await Promise.allSettled(
    Array.from({ length: walletCount }, (_, i) =>
      sdk.simpleBuy({
        token: token as `0x${string}`,
        amountIn: perBuy,
        slippagePercent: config.slippage_pct ?? 5,
        to: sdk.account.address,
        nonce: startNonce + i,
      })
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  const txHashes = results
    .filter((r): r is PromiseFulfilledResult<`0x${string}`> => r.status === 'fulfilled')
    .map(r => r.value)

  await prisma.agent.update({ where: { id: agentId }, data: { runCount: { increment: 1 } } })

  const summary = `Bundled ${succeeded}/${walletCount} buys for ${formatEther(totalSpend)} MON. Source: ${triggerSource}`
  await logAgentAction(agentId, summary, failed > 0 ? 'partial' : 'success', txHashes[0] ?? null)
  feed.emit('agent_action', { agent_id: agentId, action: summary, tx_hashes: txHashes, token, succeeded, failed })
}
