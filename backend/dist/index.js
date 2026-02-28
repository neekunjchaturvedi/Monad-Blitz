"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_js_1 = require("./db/client.js");
const agents_js_1 = __importDefault(require("./api/routes/agents.js"));
const feed_js_1 = __importDefault(require("./api/routes/feed.js"));
const feedService_js_1 = require("./feed/feedService.js");
const listener_js_1 = require("./chain/listener.js");
const newsFetcher_js_1 = require("./news/newsFetcher.js");
const PORT = parseInt(process.env.PORT ?? '4000');
const WS_PORT = PORT + 1; // WebSocket on 4001
async function main() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
    app.use('/agents', agents_js_1.default);
    app.use('/feed', feed_js_1.default);
    app.listen(PORT, () => console.log(`[api] REST server → http://localhost:${PORT}`));
    feedService_js_1.feed.init(WS_PORT);
    const stopChain = (0, listener_js_1.startChainListener)();
    (0, newsFetcher_js_1.startNewsFetcher)();
    console.log('[agenthub] All services running');
    process.on('SIGINT', async () => {
        stopChain();
        await client_js_1.prisma.$disconnect();
        process.exit(0);
    });
}
main().catch(async (err) => {
    console.error('[fatal]', err);
    await client_js_1.prisma.$disconnect();
    process.exit(1);
});
