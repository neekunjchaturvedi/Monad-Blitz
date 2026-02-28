import { prisma } from '../db/client.js'

export async function logAgentAction(
  agentId: string,
  action: string,
  result: string,
  txHash: string | null
) {
  await prisma.agentLog.create({
    data: { agentId, action, result, txHash },
  })
}
