"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_js_1 = require("../../db/client.js");
const router = (0, express_1.Router)();
// GET /feed/logs — recent activity across all agents
router.get('/logs', async (_req, res) => {
    const logs = await client_js_1.prisma.agentLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { agent: { select: { name: true, category: true } } },
    });
    return res.json(logs);
});
exports.default = router;
