import { NextRequest, NextResponse } from "next/server";
import { listAgentRuns } from "@/lib/agents/store";
import { requirePermission, getBoundaryClaims, apiError } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/agent-runs?agentId=...&limit=50
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    const limitStr = request.nextUrl.searchParams.get("limit");
    if (!agentId) return apiError("agentId is required", 400);
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const claims = getBoundaryClaims(request);
    const runs = listAgentRuns(agentId, isNaN(limit) ? 50 : limit + 50).filter((r) => canAccessWithBoundary(claims, r));
    return NextResponse.json(runs.slice(0, isNaN(limit) ? 50 : limit));
  } catch (e) {
    console.error("GET /api/agent-runs", e);
    return apiError("Failed to list runs", 500);
  }
}
