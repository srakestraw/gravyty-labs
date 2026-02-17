import { NextRequest, NextResponse } from "next/server";
import { rollbackFlowDefinition } from "@/lib/agents/store";

/**
 * POST /api/flow-definitions/rollback?agentId=...&version=#
 */
export async function POST(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    const versionStr = request.nextUrl.searchParams.get("version");
    const version = versionStr ? parseInt(versionStr, 10) : NaN;
    if (!agentId || isNaN(version) || version < 1) {
      return NextResponse.json({ error: "agentId and version query params required" }, { status: 400 });
    }
    const def = rollbackFlowDefinition(agentId, version);
    if (!def) return NextResponse.json({ error: "Version not found or rollback failed" }, { status: 404 });
    return NextResponse.json(def);
  } catch (e) {
    console.error("POST /api/flow-definitions/rollback", e);
    return NextResponse.json({ error: "Failed to rollback" }, { status: 500 });
  }
}
