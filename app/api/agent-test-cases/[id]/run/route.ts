import { NextRequest, NextResponse } from "next/server";
import { getAgentTestCase, getAgentTestCaseResults, saveAgentTestCaseResult } from "@/lib/agents/store";
import type { AgentTestCaseExpectedChecks } from "@/lib/agents/api-types";

/**
 * POST /api/agent-test-cases/[id]/run
 * Runs single test case (eval harness); returns result.
 * TODO: Call real /api/agent-eval; for now simulated PASS/FAIL.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testCaseId } = await params;
    const tc = getAgentTestCase(testCaseId);
    if (!tc) return NextResponse.json({ error: "Test case not found" }, { status: 404 });

    let expectedChecks: AgentTestCaseExpectedChecks;
    try {
      expectedChecks = JSON.parse(tc.expectedChecksJson) as AgentTestCaseExpectedChecks;
    } catch {
      expectedChecks = { expectedOutcome: "PASS" };
    }

    // Simulated eval: always PASS for scaffolding. TODO: wire to real agent-eval.
    const outcome: "PASS" | "FAIL" = expectedChecks.expectedOutcome ?? "PASS";
    const result = {
      testCaseId,
      runAt: new Date().toISOString(),
      outcome,
      expectedChecks,
      actualChecks: { blockedTopics: [], allowedTopics: [], requiresApproval: false },
      diff: undefined as string | undefined,
    };
    saveAgentTestCaseResult(result);

    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/agent-test-cases/[id]/run", e);
    return NextResponse.json({ error: "Failed to run test case" }, { status: 500 });
  }
}

/**
 * GET /api/agent-test-cases/[id]/run - list last results for this test case
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testCaseId } = await params;
    const results = getAgentTestCaseResults(testCaseId, 10);
    return NextResponse.json(results);
  } catch (e) {
    console.error("GET /api/agent-test-cases/[id]/run", e);
    return NextResponse.json({ error: "Failed to get results" }, { status: 500 });
  }
}
