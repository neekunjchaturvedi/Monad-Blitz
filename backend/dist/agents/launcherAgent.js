"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndLaunch = checkAndLaunch;
const client_js_1 = require("../db/client.js");
const walletManager_js_1 = require("../wallets/walletManager.js");
const provider_js_1 = require("../chain/provider.js");
const feedService_js_1 = require("../feed/feedService.js");
const agentLogger_js_1 = require("./agentLogger.js");
const sdk_1 = require("@nadfun/sdk");
// 1×1 transparent PNG — placeholder image for launched coins
const PLACEHOLDER_IMAGE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const lastLaunchTime = {};
function deriveTokenName(headline) {
    const words = headline
        .replace(/[^a-zA-Z\s]/g, '')
        .split(' ')
        .filter(w => w.length > 3)
        .slice(0, 3);
    const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || 'AgentCoin';
    const symbol = words.map(w => w.slice(0, 2).toUpperCase()).join('') || 'AGT';
    return { name, symbol };
}
async function checkAndLaunch(headline, source) {
    const agents = await client_js_1.prisma.agent.findMany({
        where: { category: 'launcher', status: 'RUNNING' },
        select: { id: true, config: true },
    });
    if (!agents.length)
        return;
    for (const agent of agents) {
        const config = agent.config;
        const matched = config.keywords?.some(kw => headline.toLowerCase().includes(kw.toLowerCase()));
        if (!matched)
            continue;
        const cooldownMs = (config.cooldown_minutes ?? 30) * 60 * 1000;
        if (Date.now() - (lastLaunchTime[agent.id] ?? 0) < cooldownMs)
            continue;
        try {
            const { name, symbol } = deriveTokenName(headline);
            const privateKey = await (0, walletManager_js_1.getAgentPrivateKey)(agent.id);
            const sdk = (0, provider_js_1.createAgentSDK)(privateKey);
            const result = await sdk.createToken({
                name,
                symbol,
                description: `Launched by AgentHub — triggered by: ${headline.slice(0, 80)}`,
                image: PLACEHOLDER_IMAGE,
                imageContentType: 'image/png',
                initialBuyAmount: (0, sdk_1.parseEther)(config.liquidity_mon ?? '0.5'),
            });
            lastLaunchTime[agent.id] = Date.now();
            await client_js_1.prisma.agent.update({ where: { id: agent.id }, data: { runCount: { increment: 1 } } });
            const action = `Launched $${symbol} (${name}) on nad.fun — tx: ${result.transactionHash}`;
            await (0, agentLogger_js_1.logAgentAction)(agent.id, action, 'success', result.transactionHash);
            feedService_js_1.feed.emit('agent_action', {
                agent_id: agent.id,
                action,
                tx_hash: result.transactionHash,
                token_address: result.tokenAddress,
                source,
            });
            console.log(`[launcher] Agent ${agent.id} launched $${symbol} at ${result.tokenAddress}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            await (0, agentLogger_js_1.logAgentAction)(agent.id, `Launch failed: "${headline.slice(0, 40)}"`, msg, null);
            console.error(`[launcher] Agent ${agent.id} failed:`, msg);
        }
    }
}
