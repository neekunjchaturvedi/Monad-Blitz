/**
 * Feed Service
 * - Simple in-process EventEmitter that collects all live events
 * - WebSocket server broadcasts them to connected frontend clients
 * - Event types: launch | agent_action | news
 */

import { EventEmitter } from 'events'
import { WebSocketServer, WebSocket } from 'ws'

class FeedService extends EventEmitter {
  private wss: WebSocketServer | null = null
  private recentEvents: object[] = []   // last 100 events for new connections

  init(port: number) {
    this.wss = new WebSocketServer({ port })
    console.log(`[feed] WebSocket server on ws://localhost:${port}`)

    this.wss.on('connection', (ws: WebSocket) => {
      // Send recent history to newly connected client
      this.recentEvents.forEach(ev => ws.send(JSON.stringify(ev)))

      ws.on('error', err => console.error('[feed] WS error:', err))
    })

    // Broadcast every event to all connected clients
    this.on('launch', (data) => this.broadcast({ type: 'launch', data, ts: Date.now() }))
    this.on('agent_action', (data) => this.broadcast({ type: 'agent_action', data, ts: Date.now() }))
    this.on('news', (data) => this.broadcast({ type: 'news', data, ts: Date.now() }))
  }

  private broadcast(event: object) {
    // Keep rolling buffer of last 100
    this.recentEvents.push(event)
    if (this.recentEvents.length > 100) this.recentEvents.shift()

    const msg = JSON.stringify(event)
    this.wss?.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg)
    })
  }
}

export const feed = new FeedService()
