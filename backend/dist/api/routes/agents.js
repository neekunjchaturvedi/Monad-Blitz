"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const client_js_1 = require("../../db/client.js");
const walletManager_js_1 = require("../../wallets/walletManager.js");
const router = (0, express_1.Router)();
// GET /agents — all public agents
router.get('/', async (req, res) => {
    const { category, status } = req.query;
    const agents = await client_js_1.prisma.agent.findMany({
        where: {
            isPublic: true,
            ...(category ? { category: category } : {}),
            ...(status ? { status: status } : {}),
        },
        include: { wallet: { select: { address: true, balanceMon: true } } },
        orderBy: { runCount: 'desc' },
    });
    return res.json(agents);
});
// GET /agents/mine
router.get('/mine', async (req, res) => {
    const owner = req.headers['x-wallet-address'];
    if (!owner)
        return res.status(401).json({ error: 'x-wallet-address header required' });
    const agents = await client_js_1.prisma.agent.findMany({
        where: { ownerWallet: owner.toLowerCase() },
        include: { wallet: { select: { address: true, balanceMon: true } } },
        orderBy: { createdAt: 'desc' },
    });
    return res.json(agents);
});
// GET /agents/:id
router.get('/:id', async (req, res) => {
    const agent = await client_js_1.prisma.agent.findUnique({
        where: { id: req.params.id },
        include: { wallet: { select: { address: true, balanceMon: true } } },
    });
    if (!agent)
        return res.status(404).json({ error: 'Agent not found' });
    return res.json(agent);
});
// POST /agents — deploy new agent
router.post('/', async (req, res) => {
    const owner = req.headers['x-wallet-address'];
    if (!owner)
        return res.status(401).json({ error: 'x-wallet-address header required' });
    const { name, description, category, config, is_public } = req.body;
    if (!name || !category)
        return res.status(400).json({ error: 'name and category required' });
    const id = (0, uuid_1.v4)();
    const agent = await client_js_1.prisma.agent.create({
        data: {
            id,
            ownerWallet: owner.toLowerCase(),
            name,
            description: description ?? '',
            category: category,
            isPublic: is_public ?? false,
            config: config ?? {},
        },
    });
    const { address } = await (0, walletManager_js_1.createAgentWallet)(id);
    return res.status(201).json({ id: agent.id, wallet_address: address });
});
// PATCH /agents/:id/status
router.patch('/:id/status', async (req, res) => {
    const owner = req.headers['x-wallet-address'];
    const { status } = req.body;
    const validStatuses = ['RUNNING', 'PAUSED', 'IDLE'];
    if (!validStatuses.includes(status))
        return res.status(400).json({ error: 'Invalid status' });
    try {
        await client_js_1.prisma.agent.updateMany({
            where: { id: req.params.id, ownerWallet: owner.toLowerCase() },
            data: { status },
        });
        return res.json({ ok: true, status });
    }
    catch {
        return res.status(500).json({ error: 'Update failed' });
    }
});
// DELETE /agents/:id
router.delete('/:id', async (req, res) => {
    const owner = req.headers['x-wallet-address'];
    await client_js_1.prisma.agent.deleteMany({
        where: { id: req.params.id, ownerWallet: owner.toLowerCase() },
    });
    return res.json({ ok: true });
});
// GET /agents/:id/logs
router.get('/:id/logs', async (req, res) => {
    const logs = await client_js_1.prisma.agentLog.findMany({
        where: { agentId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    return res.json(logs);
});
// GET /agents/:id/wallet
router.get('/:id/wallet', async (req, res) => {
    try {
        const balance = await (0, walletManager_js_1.syncWalletBalance)(req.params.id);
        const wallet = await client_js_1.prisma.agentWallet.findUnique({
            where: { agentId: req.params.id },
            select: { address: true, balanceMon: true, createdAt: true },
        });
        return res.json({ ...wallet, balance_mon: balance });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ error: msg });
    }
});
exports.default = router;
