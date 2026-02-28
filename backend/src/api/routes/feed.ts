import { Router } from 'express'
import { prisma } from '../../db/client.js'

const router = Router()

// GET /feed/logs — recent activity across all agents
router.get('/logs', async (_req, res) => {
  const logs = await prisma.agentLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { agent: { select: { name: true, category: true } } },
  })
  return res.json(logs)
})

export default router
