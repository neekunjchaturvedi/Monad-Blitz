"use strict";
/**
 * Feed Service
 * - Simple in-process EventEmitter that collects all live events
 * - WebSocket server broadcasts them to connected frontend clients
 * - Event types: launch | agent_action | news
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.feed = void 0;
const events_1 = require("events");
const ws_1 = require("ws");
class FeedService extends events_1.EventEmitter {
    wss = null;
    recentEvents = []; // last 100 events for new connections
    init(port) {
        this.wss = new ws_1.WebSocketServer({ port });
        console.log(`[feed] WebSocket server on ws://localhost:${port}`);
        this.wss.on('connection', (ws) => {
            // Send recent history to newly connected client
            this.recentEvents.forEach(ev => ws.send(JSON.stringify(ev)));
            ws.on('error', err => console.error('[feed] WS error:', err));
        });
        // Broadcast every event to all connected clients
        this.on('launch', (data) => this.broadcast({ type: 'launch', data, ts: Date.now() }));
        this.on('agent_action', (data) => this.broadcast({ type: 'agent_action', data, ts: Date.now() }));
        this.on('news', (data) => this.broadcast({ type: 'news', data, ts: Date.now() }));
    }
    broadcast(event) {
        // Keep rolling buffer of last 100
        this.recentEvents.push(event);
        if (this.recentEvents.length > 100)
            this.recentEvents.shift();
        const msg = JSON.stringify(event);
        this.wss?.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN)
                client.send(msg);
        });
    }
}
exports.feed = new FeedService();
