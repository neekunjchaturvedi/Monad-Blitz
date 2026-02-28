"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSniperAgents = runSniperAgents;
const sdk_1 = require("@nadfun/sdk");
const client_js_1 = require("../db/client.js");
const walletManager_js_1 = require("../wallets/walletManager.js");
const provider_js_1 = require("../chain/provider.js");
const feedService_js_1 = require("../feed/feedService.js");
const agentLogger_js_1 = require("./agentLogger.js");
async function runSniperAgents(launch) {
    const agents = await client_js_1.prisma.agent.findMany({
        where: { category: 'sniper', status: 'RUNNING' },
        select: { id: true, config: true },
    });
    if (!agents.length)
        return;
    for (const agent of agents) {
        const config = agent.config;
        // ── Filters ─────────────────────────────────────────────────────────
        if (launch.riskScore > (config.max_risk_score ?? 60))
            continue;
        const reserve = parseFloat(launch.virtualMonReserve);
        if (reserve < (config.min_virtual_reserve ?? 1))
            continue;
        if (config.keyword_filter?.length) {
            const target = (launch.name + launch.symbol).toLowerCase();
            if (!config.keyword_filter.some(kw => target.includes(kw.toLowerCase())))
                continue;
        }
        // ── Execute buy via SDK ──────────────────────────────────────────────
        try {
            const privateKey = await (0, walletManager_js_1.getAgentPrivateKey)(agent.id);
            const sdk = (0, provider_js_1.createAgentSDK)(privateKey);
            const amountIn = (0, sdk_1.parseEther)(config.buy_amount_mon ?? '0.05');
            const txHash = await sdk.simpleBuy({
                token: launch.token,
                amountIn,
                slippagePercent: config.slippage_pct ?? 5,
                to: sdk.account.address,
            });
            await client_js_1.prisma.agent.update({ where: { id: agent.id }, data: { runCount: { increment: 1 } } });
            const action = `Sniped $${launch.symbol} for ${config.buy_amount_mon} MON`;
            await (0, agentLogger_js_1.logAgentAction)(agent.id, action, 'success', txHash);
            feedService_js_1.feed.emit('agent_action', { agent_id: agent.id, action, tx_hash: txHash, token: launch.symbol });
            scheduleAutoSell(agent.id, launch.token, amountIn, config);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            await (0, agentLogger_js_1.logAgentAction)(agent.id, `Snipe failed: $${launch.symbol}`, msg, null);
            console.error(`[sniper] Agent ${agent.id} failed:`, msg);
        }
    }
}
function scheduleAutoSell(agentId, token, spent, config) {
    const entryMON = parseFloat((0, sdk_1.formatEther)(spent));
    const tpTarget = entryMON * (1 + config.take_profit_pct / 100);
    const slTarget = entryMON * (1 - config.stop_loss_pct / 100);
    console.log(`[sniper] Auto-sell watcher — TP: ${tpTarget.toFixed(4)} MON  SL: ${slTarget.toFixed(4)} MON`);
    // Poll every 10s — replace with real price check once nad.fun price API is known
    const interval = setInterval(async () => {
        try {
            const privateKey = await (0, walletManager_js_1.getAgentPrivateKey)(agentId);
            const sdk = (0, provider_js_1.createAgentSDK)(privateKey);
            const { amount: quoteOut } = await sdk.getAmountOut(token, spent, false);
            const currentMON = parseFloat((0, sdk_1.formatEther)(quoteOut));
            if (currentMON >= tpTarget || currentMON <= slTarget) {
                const reason = currentMON >= tpTarget ? 'take-profit' : 'stop-loss';
                const txHash = await sdk.simpleSell({
                    token: token,
                    amountIn: spent,
                    slippagePercent: 5,
                    to: sdk.account.address,
                });
                await (0, agentLogger_js_1.logAgentAction)(agentId, `Auto-sell (${reason}) $${token.slice(0, 8)}`, 'success', txHash);
                feedService_js_1.feed.emit('agent_action', { agent_id: agentId, action: `Auto-sold (${reason})`, tx_hash: txHash });
                clearInterval(interval);
            }
        }
        catch {
            // silently ignore polling errors
        }
    }, 10_000);
    // Safety cutoff after 24h
    setTimeout(() => clearInterval(interval), 24 * 60 * 60 * 1000);
}
