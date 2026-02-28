import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './db/client.js'

import agentRoutes from './api/routes/agents.js'
import feedRoutes from './api/routes/feed.js'
import { feed } from './feed/feedService.js'
import { startChainListener } from './chain/listener.js'
import { startNewsFetcher } from './news/newsFetcher.js'

const PORT = parseInt(process.env.PORT ?? '4000')
const WS_PORT = PORT + 1   // WebSocket on 4001

async function main() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))
  app.use('/agents', agentRoutes)
  app.use('/feed', feedRoutes)

  app.listen(PORT, () => console.log(`[api] REST server → http://localhost:${PORT}`))

  feed.init(WS_PORT)
  const stopChain = startChainListener()
  startNewsFetcher()

  console.log('[agenthub] All services running')

  process.on('SIGINT', async () => {
    stopChain()
    await prisma.$disconnect()
    process.exit(0)
  })
}

main().catch(async err => {
  console.error('[fatal]', err)
  await prisma.$disconnect()
  process.exit(1)
})
