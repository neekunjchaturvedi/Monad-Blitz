import hre from 'hardhat'

async function main() {
  console.log('Deploying AgentRegistry to Monad Testnet…')

  const registry = await hre.viem.deployContract('AgentRegistry')

  console.log(`✅ AgentRegistry deployed at: ${registry.address}`)
  console.log()
  console.log('Add this to your .env files:')
  console.log(`AGENT_REGISTRY_ADDRESS=${registry.address}`)
  console.log(`VITE_REGISTRY_ADDRESS=${registry.address}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
