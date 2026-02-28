import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { formatEther } from '@nadfun/sdk'
import crypto from 'crypto'
import { prisma } from '../db/client.js'
import { createAgentSDK } from '../chain/provider.js'

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from(process.env.WALLET_ENCRYPTION_KEY!.padEnd(32).slice(0, 32))

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(payload: string): string {
  const [ivHex, encHex] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const enc = Buffer.from(encHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}

/** Generate a fresh EOA, encrypt the private key, persist to DB */
export async function createAgentWallet(agentId: string) {
  const privateKey = generatePrivateKey()               // 0x-prefixed hex
  const address = privateKeyToAddress(privateKey)

  const record = await prisma.agentWallet.create({
    data: {
      agentId,
      address,
      encryptedPrivateKey: encrypt(privateKey),
      balanceMon: '0',
    },
  })

  return { address, record }
}

/** Decrypt and return the raw private key — only used internally by agent runners */
export async function getAgentPrivateKey(agentId: string): Promise<`0x${string}`> {
  const record = await prisma.agentWallet.findUniqueOrThrow({
    where: { agentId },
    select: { encryptedPrivateKey: true },
  })
  return decrypt(record.encryptedPrivateKey) as `0x${string}`
}

export async function getAgentWalletAddress(agentId: string): Promise<string> {
  const record = await prisma.agentWallet.findUniqueOrThrow({
    where: { agentId },
    select: { address: true },
  })
  return record.address
}

/** Fetch on-chain MON balance and persist it */
export async function syncWalletBalance(agentId: string): Promise<string> {
  const privateKey = await getAgentPrivateKey(agentId)
  const sdk = createAgentSDK(privateKey)

  const address = await getAgentWalletAddress(agentId)
  const balanceWei = await sdk.publicClient.getBalance({ address: address as `0x${string}` })
  const formatted = formatEther(balanceWei)

  await prisma.agentWallet.update({
    where: { agentId },
    data: { balanceMon: formatted },
  })

  return formatted
}
