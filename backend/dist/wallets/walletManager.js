"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentWallet = createAgentWallet;
exports.getAgentPrivateKey = getAgentPrivateKey;
exports.getAgentWalletAddress = getAgentWalletAddress;
exports.syncWalletBalance = syncWalletBalance;
const accounts_1 = require("viem/accounts");
const sdk_1 = require("@nadfun/sdk");
const crypto_1 = __importDefault(require("crypto"));
const client_js_1 = require("../db/client.js");
const provider_js_1 = require("../chain/provider.js");
const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.WALLET_ENCRYPTION_KEY.padEnd(32).slice(0, 32));
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(payload) {
    const [ivHex, encHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const enc = Buffer.from(encHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, KEY, iv);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
/** Generate a fresh EOA, encrypt the private key, persist to DB */
async function createAgentWallet(agentId) {
    const privateKey = (0, accounts_1.generatePrivateKey)(); // 0x-prefixed hex
    const address = (0, accounts_1.privateKeyToAddress)(privateKey);
    const record = await client_js_1.prisma.agentWallet.create({
        data: {
            agentId,
            address,
            encryptedPrivateKey: encrypt(privateKey),
            balanceMon: '0',
        },
    });
    return { address, record };
}
/** Decrypt and return the raw private key — only used internally by agent runners */
async function getAgentPrivateKey(agentId) {
    const record = await client_js_1.prisma.agentWallet.findUniqueOrThrow({
        where: { agentId },
        select: { encryptedPrivateKey: true },
    });
    return decrypt(record.encryptedPrivateKey);
}
async function getAgentWalletAddress(agentId) {
    const record = await client_js_1.prisma.agentWallet.findUniqueOrThrow({
        where: { agentId },
        select: { address: true },
    });
    return record.address;
}
/** Fetch on-chain MON balance and persist it */
async function syncWalletBalance(agentId) {
    const privateKey = await getAgentPrivateKey(agentId);
    const sdk = (0, provider_js_1.createAgentSDK)(privateKey);
    const address = await getAgentWalletAddress(agentId);
    const balanceWei = await sdk.publicClient.getBalance({ address: address });
    const formatted = (0, sdk_1.formatEther)(balanceWei);
    await client_js_1.prisma.agentWallet.update({
        where: { agentId },
        data: { balanceMon: formatted },
    });
    return formatted;
}
