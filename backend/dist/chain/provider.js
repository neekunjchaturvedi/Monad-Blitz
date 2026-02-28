"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentSDK = createAgentSDK;
/**
 * nad.fun SDK factory
 * Call `createAgentSDK(privateKey)` to get a fully configured SDK instance
 * bound to a specific agent wallet.
 */
const sdk_1 = require("@nadfun/sdk");
function createAgentSDK(privateKey) {
    return (0, sdk_1.initSDK)({
        rpcUrl: process.env.MONAD_RPC_URL ?? 'https://rpc.monad.xyz',
        wsUrl: process.env.NADFUN_WS_URL,
        privateKey,
        network: 'testnet',
    });
}
