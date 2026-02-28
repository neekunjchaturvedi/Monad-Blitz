/**
 * nad.fun SDK factory
 * Call `createAgentSDK(privateKey)` to get a fully configured SDK instance
 * bound to a specific agent wallet.
 */
import { initSDK, type NadFunSDK } from '@nadfun/sdk'

export function createAgentSDK(privateKey: `0x${string}`): NadFunSDK {
  return initSDK({
    rpcUrl: process.env.MONAD_RPC_URL ?? 'https://rpc.monad.xyz',
    wsUrl: process.env.NADFUN_WS_URL,
    privateKey,
    network: 'testnet',
  })
}
