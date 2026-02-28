import type { BackendAgent, AgentLog, AgentStatus, AgentCategory } from '@/types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

function h(wallet?: string): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (wallet) headers['x-wallet-address'] = wallet.toLowerCase()
  return headers
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}

// ── Agents ─────────────────────────────────────────────────────────────────

export async function getAgents(params?: { category?: string }): Promise<BackendAgent[]> {
  const qs = params?.category && params.category !== 'All'
    ? `?category=${params.category.toLowerCase()}`
    : ''
  return json(await fetch(`${BASE}/agents${qs}`))
}

export async function getMyAgents(wallet: string): Promise<BackendAgent[]> {
  return json(await fetch(`${BASE}/agents/mine`, { headers: h(wallet) }))
}

export async function getAgent(id: string): Promise<BackendAgent> {
  return json(await fetch(`${BASE}/agents/${id}`))
}

export interface CreateAgentPayload {
  name: string
  description: string
  category: AgentCategory
  config: Record<string, unknown>
  is_public: boolean
}

export async function createAgent(
  payload: CreateAgentPayload,
  wallet: string
): Promise<{ id: string; wallet_address: string }> {
  return json(
    await fetch(`${BASE}/agents`, {
      method: 'POST',
      headers: h(wallet),
      body: JSON.stringify(payload),
    })
  )
}

export async function setAgentStatus(
  id: string,
  status: AgentStatus,
  wallet: string
): Promise<{ ok: boolean }> {
  return json(
    await fetch(`${BASE}/agents/${id}/status`, {
      method: 'PATCH',
      headers: h(wallet),
      body: JSON.stringify({ status }),
    })
  )
}

export async function deleteAgent(id: string, wallet: string): Promise<{ ok: boolean }> {
  return json(
    await fetch(`${BASE}/agents/${id}`, {
      method: 'DELETE',
      headers: h(wallet),
    })
  )
}

export async function getAgentLogs(id: string): Promise<AgentLog[]> {
  return json(await fetch(`${BASE}/agents/${id}/logs`))
}

export async function getAgentWallet(
  id: string
): Promise<{ address: string; balance_mon: string; createdAt: string }> {
  return json(await fetch(`${BASE}/agents/${id}/wallet`))
}

// ── Feed ────────────────────────────────────────────────────────────────────

export async function getFeedLogs(): Promise<AgentLog[]> {
  return json(await fetch(`${BASE}/feed/logs`))
}
