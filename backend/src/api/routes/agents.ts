import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { prisma } from '../../db/client.js'
import { createAgentWallet, syncWalletBalance } from '../../wallets/walletManager.js'
import type { Category, AgentStatus } from '@prisma/client'

const router = Router()

// GET /agents — all public agents
router.get('/', async (req, res) => {
  const { category, status } = req.query

  const agents = await prisma.agent.findMany({
    where: {
      isPublic: true,
      ...(category ? { category: category as Category } : {}),
      ...(status ? { status: status as AgentStatus } : {}),
    },
    include: { wallet: { select: { address: true, balanceMon: true } } },
    orderBy: { runCount: 'desc' },
  })

  return res.json(agents)
})

// GET /agents/mine
router.get('/mine', async (req, res) => {
  const owner = req.headers['x-wallet-address'] as string
  if (!owner) return res.status(401).json({ error: 'x-wallet-address header required' })

  const agents = await prisma.agent.findMany({
    where: { ownerWallet: owner.toLowerCase() },
    include: { wallet: { select: { address: true, balanceMon: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return res.json(agents)
})

// GET /agents/:id
router.get('/:id', async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: { id: req.params.id },
    include: { wallet: { select: { address: true, balanceMon: true } } },
  })
  if (!agent) return res.status(404).json({ error: 'Agent not found' })
  return res.json(agent)
})

// POST /agents — deploy new agent
router.post('/', async (req, res) => {
  const owner = req.headers['x-wallet-address'] as string
  if (!owner) return res.status(401).json({ error: 'x-wallet-address header required' })

  const { name, description, category, config, is_public } = req.body
  if (!name || !category) return res.status(400).json({ error: 'name and category required' })

  const id = uuid()

  const agent = await prisma.agent.create({
    data: {
      id,
      ownerWallet: owner.toLowerCase(),
      name,
      description: description ?? '',
      category: category as Category,
      isPublic: is_public ?? false,
      config: config ?? {},
    },
  })

  const { address } = await createAgentWallet(id)
  return res.status(201).json({ id: agent.id, wallet_address: address })
})

// PATCH /agents/:id/status
router.patch('/:id/status', async (req, res) => {
  const owner = req.headers['x-wallet-address'] as string
  const { status } = req.body

  const validStatuses = ['RUNNING', 'PAUSED', 'IDLE']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  try {
    await prisma.agent.updateMany({
      where: { id: req.params.id, ownerWallet: owner.toLowerCase() },
      data: { status },
    })
    return res.json({ ok: true, status })
  } catch {
    return res.status(500).json({ error: 'Update failed' })
  }
})

// DELETE /agents/:id
router.delete('/:id', async (req, res) => {
  const owner = req.headers['x-wallet-address'] as string

  await prisma.agent.deleteMany({
    where: { id: req.params.id, ownerWallet: owner.toLowerCase() },
  })

  return res.json({ ok: true })
})

// GET /agents/:id/logs
router.get('/:id/logs', async (req, res) => {
  const logs = await prisma.agentLog.findMany({
    where: { agentId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return res.json(logs)
})

// GET /agents/:id/wallet
router.get('/:id/wallet', async (req, res) => {
  try {
    const balance = await syncWalletBalance(req.params.id)
    const wallet = await prisma.agentWallet.findUnique({
      where: { agentId: req.params.id },
      select: { address: true, balanceMon: true, createdAt: true },
    })
    return res.json({ ...wallet, balance_mon: balance })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: msg })
  }
})

export default router
