"use strict";
/**
 * News Fetcher
 * - Polls CryptoPanic RSS + CoinDesk RSS every 60s
 * - Pushes headlines to feed WebSocket
 * - Calls checkAndLaunch so launcher agents can react
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNewsFetcher = startNewsFetcher;
const node_cron_1 = __importDefault(require("node-cron"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const feedService_js_1 = require("../feed/feedService.js");
const launcherAgent_js_1 = require("../agents/launcherAgent.js");
const parser = new rss_parser_1.default();
const RSS_FEEDS = [
    { url: 'https://feeds.feedburner.com/CoinDesk', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
];
// CryptoPanic API (optional — better quality, requires key)
async function fetchCryptoPanic() {
    const key = process.env.CRYPTOPANIC_API_KEY;
    if (!key)
        return [];
    try {
        const res = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${key}&filter=hot&public=true`);
        const json = await res.json();
        return (json.results ?? []).map(r => ({ title: r.title, source: 'CryptoPanic' }));
    }
    catch {
        return [];
    }
}
async function fetchRSS(feedUrl, source) {
    try {
        const feed = await parser.parseURL(feedUrl);
        return (feed.items ?? []).slice(0, 10).map(item => ({
            title: item.title ?? '',
            source,
        }));
    }
    catch {
        return [];
    }
}
const seenHeadlines = new Set();
async function fetchAndBroadcast() {
    const rssResults = await Promise.all(RSS_FEEDS.map(f => fetchRSS(f.url, f.source)));
    const cpResults = await fetchCryptoPanic();
    const allItems = [...rssResults.flat(), ...cpResults];
    for (const item of allItems) {
        if (!item.title || seenHeadlines.has(item.title))
            continue;
        seenHeadlines.add(item.title);
        // Keep set from growing unbounded
        if (seenHeadlines.size > 2000) {
            const first = seenHeadlines.values().next().value;
            if (first)
                seenHeadlines.delete(first);
        }
        const newsEvent = { headline: item.title, source: item.source, ts: Date.now() };
        feedService_js_1.feed.emit('news', newsEvent);
        // Let launcher agents react
        await (0, launcherAgent_js_1.checkAndLaunch)(item.title, item.source).catch(err => console.error('[news] launcher check error:', err));
    }
}
function startNewsFetcher() {
    console.log('[news] Starting news fetcher (every 60s)');
    fetchAndBroadcast(); // run immediately on start
    node_cron_1.default.schedule('* * * * *', fetchAndBroadcast); // then every minute
}
