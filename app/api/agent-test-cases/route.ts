import { NextRequest, NextResponse } from "next/server";
import { listAgentTestCases, createAgentTestCase } from "@/lib/agents/store";

/**
 * GET /api/agent-test-cases?agentId=...
 */
export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }
    const list = listAgentTestCases(agentId);
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/agent-test-cases", e);
    return NextResponse.json({ error: "Failed to list test cases" }, { status: 500 });
  }
}

/**
 * POST /api/agent-test-cases
 * Body: { agentId, workspaceId, name, inputContextJson, expectedChecksJson }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, workspaceId, name, inputContextJson, expectedChecksJson } = body;
    if (!agentId || !workspaceId || !name) {
      return NextResponse.json({ error: "agentId, workspaceId, name required" }, { status: 400 });
    }
    const tc = createAgentTestCase(
      agentId,
      workspaceId,
      name,
      typeof inputContextJson === "string" ? inputContextJson : JSON.stringify(inputContextJson ?? {}),
      typeof expectedChecksJson === "string" ? expectedChecksJson : JSON.stringify(expectedChecksJson ?? { expectedOutcome: "PASS" })
    );
    return NextResponse.json(tc);
  } catch (e) {
    console.error("POST /api/agent-test-cases", e);
    return NextResponse.json({ error: "Failed to create test case" }, { status: 500 });
  }
}
