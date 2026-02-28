import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'wagmi/chains';

// Define Monad Testnet chain
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
});

// Note: Get your own project ID from https://cloud.walletconnect.com
// For development, you can use a placeholder but it won't work with WalletConnect
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'AgentHub',
  projectId,
  chains: [
    monadTestnet,
    mainnet,
    sepolia,
    polygon,
    arbitrum,
    optimism,
    base,
  ],
});
