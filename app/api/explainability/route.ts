import { NextRequest, NextResponse } from "next/server";
import { listExplainabilityEvents } from "@/lib/agents/store";

/**
 * GET /api/explainability?agentId=...&runId=...&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    const runId = request.nextUrl.searchParams.get("runId") ?? undefined;
    const limitStr = request.nextUrl.searchParams.get("limit");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const events = listExplainabilityEvents(agentId, runId, isNaN(limit) ? 20 : limit);
    return NextResponse.json(events);
  } catch (e) {
    console.error("GET /api/explainability", e);
    return NextResponse.json({ error: "Failed to list events" }, { status: 500 });
  }
}
