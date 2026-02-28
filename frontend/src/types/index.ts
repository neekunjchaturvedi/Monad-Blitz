// ── Backend shapes ─────────────────────────────────────────────────────────

export type AgentCategory = 'sniper' | 'bundler' | 'launcher' | 'custom'
export type AgentStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR'

export interface BackendAgent {
  id: string
  ownerWallet: string
  name: string
  description: string
  category: AgentCategory
  status: AgentStatus
  isPublic: boolean
  config: Record<string, unknown>
  runCount: number
  createdAt: string
  wallet?: { address: string; balanceMon: string }
}

export interface AgentLog {
  id: string
  agentId: string
  action: string
  result: string
  txHash: string | null
  createdAt: string
  agent?: { name: string; category: string }
}

// ── WebSocket feed events ──────────────────────────────────────────────────

export interface LaunchFeedEvent {
  token: string
  creator: string
  name: string
  symbol: string
  virtualMonReserve: string
  riskScore: number
  riskFlags: string[]
  blockNumber: string
  txHash: string
}

export interface AgentActionFeedEvent {
  agent_id: string
  action: string
  tx_hash?: string
  tx_hashes?: string[]
  token?: string
  token_address?: string
  source?: string
  succeeded?: number
  failed?: number
}

export interface NewsFeedEvent {
  headline: string
  source: string
  ts: number
}

export type FeedEvent =
  | { type: 'launch'; data: LaunchFeedEvent; ts: number }
  | { type: 'agent_action'; data: AgentActionFeedEvent; ts: number }
  | { type: 'news'; data: NewsFeedEvent; ts: number }

// ── Display helpers ────────────────────────────────────────────────────────

export function displayCategory(cat: AgentCategory): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export function displayStatus(status: AgentStatus): string {
  const map: Record<AgentStatus, string> = {
    IDLE: 'Idle',
    RUNNING: 'Running',
    PAUSED: 'Paused',
    ERROR: 'Error',
  }
  return map[status]
}

export function riskLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score <= 30) return 'Low'
  if (score <= 60) return 'Medium'
  return 'High'
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}
