"use strict";
/**
 * Chain Listener
 * Connects directly to wss://api-server.nad.fun/wss
 * Subscribes to order_subscribe (creation_time) for real-time new token events.
 * On each new coin: scores risk, pushes to our feed WebSocket, triggers sniper agents.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startChainListener = startChainListener;
const ws_1 = __importDefault(require("ws"));
const feedService_js_1 = require("../feed/feedService.js");
const sniperAgent_js_1 = require("../agents/sniperAgent.js");
const NADFUN_WS = process.env.NADFUN_WS_URL ?? 'wss://api-server.nad.fun/wss';
// ── Risk scoring (pure — no RPC calls) ────────────────────────────────────
function scoreRisk(data) {
    const flags = [];
    let score = 0;
    // Low initial market cap / reserve
    const mc = parseFloat(String(data.market_cap ?? data.marketCap ?? '0'));
    if (mc > 0 && mc < 100) {
        flags.push('micro_market_cap');
        score += 30;
    }
    // No image / metadata
    if (!data.image_uri && !data.imageUri) {
        flags.push('no_metadata');
        score += 20;
    }
    // Very short name or symbol
    const name = String(data.name ?? '');
    const symbol = String(data.symbol ?? data.ticker ?? '');
    if (name.length < 2) {
        flags.push('no_name');
        score += 25;
    }
    if (symbol.length < 2) {
        flags.push('no_symbol');
        score += 20;
    }
    return { score: Math.min(score, 100), flags };
}
// ── Normalise the raw nad.fun payload into our LaunchEvent ─────────────────
function parseLaunch(raw) {
    // The payload shape may vary — handle both camelCase and snake_case
    const token = String(raw.token_address ?? raw.tokenAddress ?? raw.contract_address ?? raw.address ?? '');
    if (!token || token === 'undefined')
        return null;
    const creator = String(raw.creator ?? raw.creator_address ?? '');
    const name = String(raw.name ?? raw.coin_name ?? '');
    const symbol = String(raw.symbol ?? raw.ticker ?? raw.coin_symbol ?? '');
    const imageUri = String(raw.image_uri ?? raw.imageUri ?? raw.image ?? '');
    const marketCap = String(raw.market_cap ?? raw.marketCap ?? '0');
    const txHash = String(raw.tx_hash ?? raw.txHash ?? raw.transaction_hash ?? '');
    const blockNumber = String(raw.block_number ?? raw.blockNumber ?? '0');
    const virtualMonReserve = String(raw.virtual_mon_reserve ?? raw.initialLiquidity ?? '0');
    const { score, flags } = scoreRisk(raw);
    return {
        token, creator, name, symbol, imageUri, marketCap,
        virtualMonReserve, riskScore: score, riskFlags: flags,
        blockNumber, txHash,
    };
}
// ── WebSocket connection with auto-reconnect ───────────────────────────────
function startChainListener() {
    let ws;
    let reconnectTimer = null;
    let pingTimer = null;
    function connect() {
        console.log(`[chain] Connecting to nad.fun WebSocket: ${NADFUN_WS}`);
        ws = new ws_1.default(NADFUN_WS);
        ws.on('open', () => {
            console.log('[chain] nad.fun WebSocket connected ✓');
            // Subscribe to all new coin creation events
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'order_subscribe',
                params: { order_type: 'creation_time' },
                id: 1,
            }));
            // Keep-alive ping every 20s
            pingTimer = setInterval(() => {
                if (ws.readyState === ws_1.default.OPEN)
                    ws.ping();
            }, 20_000);
        });
        ws.on('message', async (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                // Skip subscription ack messages
                if (msg.id !== undefined && !msg.method)
                    return;
                // Handle incoming event — method may be 'order_subscribe' or omitted
                const data = msg.params?.result ?? msg.result ?? msg.data ?? msg;
                if (!data || typeof data !== 'object')
                    return;
                // Only process creation events — filter by type if present
                const eventType = String(data.type ?? data.event_type ?? data.order_type ?? 'create');
                if (!eventType.toLowerCase().includes('creat'))
                    return;
                const launch = parseLaunch(data);
                if (!launch)
                    return;
                console.log(`[chain] 🚀 New launch: ${launch.name} ($${launch.symbol}) risk=${launch.riskScore}`);
                feedService_js_1.feed.emit('launch', launch);
                await (0, sniperAgent_js_1.runSniperAgents)(launch).catch(err => console.error('[chain] Sniper error:', err));
            }
            catch (err) {
                console.error('[chain] Message parse error:', err);
            }
        });
        ws.on('close', (code) => {
            console.warn(`[chain] WebSocket closed (${code}), reconnecting in 3s…`);
            if (pingTimer) {
                clearInterval(pingTimer);
                pingTimer = null;
            }
            reconnectTimer = setTimeout(connect, 3_000);
        });
        ws.on('error', (err) => {
            console.error('[chain] WebSocket error:', err.message);
            ws.terminate();
        });
        ws.on('pong', () => {
            // connection alive
        });
    }
    connect();
    // Return a stop function for graceful shutdown
    return () => {
        if (reconnectTimer)
            clearTimeout(reconnectTimer);
        if (pingTimer)
            clearInterval(pingTimer);
        ws?.terminate();
    };
}
