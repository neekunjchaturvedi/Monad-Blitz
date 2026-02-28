/**
 * AgentRegistry contract ABI + address.
 * After deploying contracts/, paste the address into VITE_REGISTRY_ADDRESS in .env
 */

export const REGISTRY_ADDRESS = (
  import.meta.env.VITE_REGISTRY_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`

export const REGISTRY_ABI = [
  {
    name: 'registerAgent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name',     type: 'string'  },
      { name: 'category', type: 'uint8'   },  // 0=Sniper 1=Bundler 2=Launcher 3=Custom
      { name: 'isPublic', type: 'bool'    },
    ],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    name: 'deactivateAgent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'AgentRegistered',
    type: 'event',
    inputs: [
      { name: 'agentId',  type: 'uint256', indexed: true  },
      { name: 'owner',    type: 'address', indexed: true  },
      { name: 'name',     type: 'string',  indexed: false },
      { name: 'category', type: 'uint8',   indexed: false },
      { name: 'isPublic', type: 'bool',    indexed: false },
    ],
  },
] as const

// Map our AgentCategory string → contract uint8
export const CATEGORY_TO_UINT: Record<string, number> = {
  sniper:  0,
  bundler: 1,
  launcher: 2,
  custom:  3,
}
