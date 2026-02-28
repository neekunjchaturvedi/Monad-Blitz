import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export type { Agent, AgentWallet, AgentLog, Category, AgentStatus } from '@prisma/client'
