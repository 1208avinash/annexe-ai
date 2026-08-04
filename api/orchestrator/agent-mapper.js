// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.13
// Agent Mapper
//
// Central mapping between workflow agent names,
// execution worker names and API routes.
// ───────────────────────────────────────────────────────────────

const AGENT_MAP = new Map([

    // Planning
    ["architect_agent", "architect_worker"],
    ["technology_agent", "technology_worker"],
    ["backend_agent", "backend_worker"],
    ["frontend_agent", "frontend_worker"],
    ["ai_agent", "ai_worker"],
    ["testing_agent", "testing_worker"],
    ["review_agent", "review_worker"],

    // Generation
    ["generation_agent", "generation_worker"],
    ["repository_agent", "repository_worker"],
    ["build_agent", "build_worker"],
    ["delivery_agent", "delivery_worker"],

    // Recovery
    ["debug_agent", "debug_worker"],
    ["execution_agent", "execution_worker"],
    ["repair_agent", "repair_worker"],
    ["rebuild_agent", "rebuild_worker"],
    ["retest_agent", "retest_worker"],
    ["quality_gate_agent", "quality_gate_worker"],
    ["rollback_agent", "rollback_worker"],

    // Engineering
    ["risk_agent", "risk_worker"],
    ["dependency_agent", "dependency_worker"],
    ["architecture_validator_agent", "architecture_validator_worker"],
    ["security_agent", "security_worker"],
    ["performance_agent", "performance_worker"],
    ["engineering_intelligence_agent", "engineering_intelligence_worker"],
    ["engineering_orchestrator_agent", "engineering_orchestrator_worker"]

]);

const ROUTE_MAP = new Map([

    ["architect_worker", "/api/agents/architect/design"],
    ["technology_worker", "/api/agents/technology/intelligence"],
    ["backend_worker", "/api/agents/backend/worker"],
    ["frontend_worker", "/api/agents/frontend/worker"],
    ["ai_worker", "/api/agents/ai/worker"],
    ["testing_worker", "/api/agents/testing/worker"],
    ["review_worker", "/api/agents/review/worker"],

    ["generation_worker", "/api/agents/generation/worker"],
    ["repository_worker", "/api/agents/repository/worker"],
    ["build_worker", "/api/agents/build/worker"],
    ["delivery_worker", "/api/agents/delivery/worker"],

    ["debug_worker", "/api/agents/debug/worker"],
    ["execution_worker", "/api/agents/execution/worker"],
    ["repair_worker", "/api/agents/repair/worker"],
    ["rebuild_worker", "/api/agents/rebuild/worker"],
    ["retest_worker", "/api/agents/retest/worker"],
    ["quality_gate_worker", "/api/agents/quality-gate/worker"],
    ["rollback_worker", "/api/agents/rollback/worker"],

    ["risk_worker", "/api/agents/risk/worker"],
    ["dependency_worker", "/api/agents/dependency/worker"],
    ["architecture_validator_worker", "/api/agents/architecture-validator/worker"],
    ["security_worker", "/api/agents/security/worker"],
    ["performance_worker", "/api/agents/performance/worker"],
    ["engineering_intelligence_worker", "/api/agents/engineering-intelligence/worker"],
    ["engineering_orchestrator_worker", "/api/agents/engineering-orchestrator/worker"]

]);

export class AgentMapper {

    mapAgent(agentName) {

        return AGENT_MAP.get(agentName) || agentName;

    }

    getRoute(workerName) {

        return ROUTE_MAP.get(workerName) || null;

    }

}

export function getAgentRoute(workerName) {

    return ROUTE_MAP.get(workerName) || null;

}

export default AgentMapper;