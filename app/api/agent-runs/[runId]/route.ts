import { NextRequest, NextResponse } from "next/server";
import { getAgentRun } from "@/lib/agents/store";

/**
 * GET /api/agent-runs/[runId]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = getAgentRun(runId);
    if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(run);
  } catch (e) {
    console.error("GET /api/agent-runs/[runId]", e);
    return NextResponse.json({ error: "Failed to get run" }, { status: 500 });
  }
}
