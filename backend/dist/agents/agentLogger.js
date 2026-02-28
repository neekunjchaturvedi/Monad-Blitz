"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAgentAction = logAgentAction;
const client_js_1 = require("../db/client.js");
async function logAgentAction(agentId, action, result, txHash) {
    await client_js_1.prisma.agentLog.create({
        data: { agentId, action, result, txHash },
    });
}
