import { NextRequest, NextResponse } from "next/server";
import { listFlowDefinitionVersions } from "@/lib/agents/store";

/**
 * GET /api/flow-definitions/versions?agentId=...
 */
export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }
    const versions = listFlowDefinitionVersions(agentId);
    return NextResponse.json(versions);
  } catch (e) {
    console.error("GET /api/flow-definitions/versions", e);
    return NextResponse.json({ error: "Failed to list versions" }, { status: 500 });
  }
}
