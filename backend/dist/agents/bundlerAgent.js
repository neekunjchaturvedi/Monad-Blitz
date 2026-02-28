"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBundlerAgent = runBundlerAgent;
const sdk_1 = require("@nadfun/sdk");
const client_js_1 = require("../db/client.js");
const walletManager_js_1 = require("../wallets/walletManager.js");
const provider_js_1 = require("../chain/provider.js");
const feedService_js_1 = require("../feed/feedService.js");
const agentLogger_js_1 = require("./agentLogger.js");
/**
 * Fires `wallet_count` buys concurrently using the same agent private key
 * with increasing nonces — they land in the same block window on Monad's
 * fast chain, appearing as organic volume from one wallet.
 *
 * For true multi-wallet bundling, fund additional wallets and store their
 * keys linked to the agent in a future iteration.
 */
async function runBundlerAgent(agentId, token, triggerSource) {
    const agent = await client_js_1.prisma.agent.findUnique({
        where: { id: agentId },
        select: { config: true, status: true },
    });
    if (!agent || agent.status !== 'RUNNING')
        return;
    const config = agent.config;
    const walletCount = Math.min(config.wallet_count ?? 3, 5);
    const totalSpend = (0, sdk_1.parseEther)(config.total_spend_mon ?? '0.3');
    const perBuy = totalSpend / BigInt(walletCount);
    const privateKey = await (0, walletManager_js_1.getAgentPrivateKey)(agentId);
    const sdk = (0, provider_js_1.createAgentSDK)(privateKey);
    // Get starting nonce then fire buys with sequential nonces
    const startNonce = await sdk.publicClient.getTransactionCount({ address: sdk.account.address });
    const results = await Promise.allSettled(Array.from({ length: walletCount }, (_, i) => sdk.simpleBuy({
        token: token,
        amountIn: perBuy,
        slippagePercent: config.slippage_pct ?? 5,
        to: sdk.account.address,
        nonce: startNonce + i,
    })));
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const txHashes = results
        .filter((r) => r.status === 'fulfilled')
        .map(r => r.value);
    await client_js_1.prisma.agent.update({ where: { id: agentId }, data: { runCount: { increment: 1 } } });
    const summary = `Bundled ${succeeded}/${walletCount} buys for ${(0, sdk_1.formatEther)(totalSpend)} MON. Source: ${triggerSource}`;
    await (0, agentLogger_js_1.logAgentAction)(agentId, summary, failed > 0 ? 'partial' : 'success', txHashes[0] ?? null);
    feedService_js_1.feed.emit('agent_action', { agent_id: agentId, action: summary, tx_hashes: txHashes, token, succeeded, failed });
}
