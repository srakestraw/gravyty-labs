import { NextRequest, NextResponse } from "next/server";
import { listMessageArtifacts } from "@/lib/agents/store";
import { requirePermission, apiError } from "@/lib/agents/api-helpers";

/**
 * GET /api/message-artifacts?agentId=...&runId=...&limit=100
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    if (!agentId) return apiError("agentId is required", 400);
    const runId = request.nextUrl.searchParams.get("runId") ?? undefined;
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 100, 200);
    const list = listMessageArtifacts(agentId, { runId, limit });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/message-artifacts", e);
    return apiError("Failed to list message artifacts", 500);
  }
}
