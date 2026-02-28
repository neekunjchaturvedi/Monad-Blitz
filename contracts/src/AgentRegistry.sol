// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * AgentRegistry — on-chain identity for every AgentHub agent.
 *
 * Flow:
 *   1. User calls registerAgent() from their wallet (pays gas only)
 *   2. Contract assigns an on-chain agentId and emits AgentRegistered
 *   3. Backend listens for the event, creates the off-chain record + dedicated wallet
 *   4. User funds the dedicated wallet with MON to activate the agent
 */
contract AgentRegistry {

    // ── Types ──────────────────────────────────────────────────────────────

    enum Category { Sniper, Bundler, Launcher, Custom }

    struct AgentRecord {
        uint256 agentId;
        address owner;
        string  name;
        Category category;
        bool    isPublic;
        uint256 registeredAt;
    }

    // ── State ──────────────────────────────────────────────────────────────

    uint256 private _nextId = 1;

    // agentId → record
    mapping(uint256 => AgentRecord) public agents;

    // owner → list of agentIds
    mapping(address => uint256[]) public ownerAgents;

    // ── Events ─────────────────────────────────────────────────────────────

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string  name,
        Category category,
        bool    isPublic
    );

    event AgentDeactivated(uint256 indexed agentId, address indexed owner);

    // ── Write ──────────────────────────────────────────────────────────────

    /**
     * Register a new agent on-chain.
     * No fee — user only pays gas. The backend picks up the event.
     */
    function registerAgent(
        string  calldata name,
        Category          category,
        bool              isPublic
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name required");

        agentId = _nextId++;

        agents[agentId] = AgentRecord({
            agentId:      agentId,
            owner:        msg.sender,
            name:         name,
            category:     category,
            isPublic:     isPublic,
            registeredAt: block.timestamp
        });

        ownerAgents[msg.sender].push(agentId);

        emit AgentRegistered(agentId, msg.sender, name, category, isPublic);
    }

    /**
     * Owner can deactivate their agent.
     * The backend listens for this and sets agent status to PAUSED.
     */
    function deactivateAgent(uint256 agentId) external {
        require(agents[agentId].owner == msg.sender, "Not owner");
        emit AgentDeactivated(agentId, msg.sender);
    }

    // ── Read ───────────────────────────────────────────────────────────────

    function getAgent(uint256 agentId) external view returns (AgentRecord memory) {
        return agents[agentId];
    }

    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }

    function totalAgents() external view returns (uint256) {
        return _nextId - 1;
    }
}
