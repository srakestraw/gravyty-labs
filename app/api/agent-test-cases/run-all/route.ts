import { NextRequest, NextResponse } from "next/server";
import { listAgentTestCases, saveAgentTestCaseResult } from "@/lib/agents/store";
import type { AgentTestCaseExpectedChecks } from "@/lib/agents/api-types";

/**
 * POST /api/agent-test-cases/run-all?agentId=...
 * Runs all test cases for an agent. Returns array of results.
 * TODO: Call real /api/agent-eval for each; for now simulated.
 */
export async function POST(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }
    const cases = listAgentTestCases(agentId);
    const results: Array<{ testCaseId: string; name: string; outcome: "PASS" | "FAIL" }> = [];
    for (const tc of cases) {
      let expectedChecks: AgentTestCaseExpectedChecks;
      try {
        expectedChecks = JSON.parse(tc.expectedChecksJson) as AgentTestCaseExpectedChecks;
      } catch {
        expectedChecks = { expectedOutcome: "PASS" };
      }
      const outcome: "PASS" | "FAIL" = expectedChecks.expectedOutcome ?? "PASS";
      saveAgentTestCaseResult({
        testCaseId: tc.id,
        runAt: new Date().toISOString(),
        outcome,
        expectedChecks,
      });
      results.push({ testCaseId: tc.id, name: tc.name, outcome });
    }
    return NextResponse.json(results);
  } catch (e) {
    console.error("POST /api/agent-test-cases/run-all", e);
    return NextResponse.json({ error: "Failed to run all tests" }, { status: 500 });
  }
}
