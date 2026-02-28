import { useEffect, useRef, useState, useCallback } from 'react'
import type { FeedEvent, LaunchFeedEvent, AgentActionFeedEvent, NewsFeedEvent } from '@/types'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4001'

export function useFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as FeedEvent
        setEvents(prev => [event, ...prev].slice(0, 300))
      } catch { /* ignore bad frames */ }
    }

    ws.onclose = () => {
      setConnected(false)
      timerRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [connect])

  const launches = events
    .filter((e): e is { type: 'launch'; data: LaunchFeedEvent; ts: number } => e.type === 'launch')
    .map(e => e.data)

  const agentActions = events
    .filter((e): e is { type: 'agent_action'; data: AgentActionFeedEvent; ts: number } => e.type === 'agent_action')
    .map(e => e.data)

  const news = events
    .filter((e): e is { type: 'news'; data: NewsFeedEvent; ts: number } => e.type === 'news')
    .map(e => e.data)

  return { events, launches, agentActions, news, connected }
}
