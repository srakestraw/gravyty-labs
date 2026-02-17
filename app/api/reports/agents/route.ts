import { NextRequest, NextResponse } from "next/server";
import { getAgentsReport } from "@/lib/agents/reports";
import { requirePermission, getBoundaryClaims, apiError } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary } from "@/lib/agents/boundary";
import { listAgents } from "@/lib/agents/store";

/**
 * GET /api/reports/agents?workspaceId=...&range=30d
 * Returns adoption, runs, approvals, blocked, success rate, top blocked topics, top connectors.
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const rangeParam = request.nextUrl.searchParams.get("range") ?? "30d";
    const rangeDays = rangeParam === "7d" ? 7 : rangeParam === "90d" ? 90 : 30;
    const claims = getBoundaryClaims(request);
    const agentsList = listAgents(workspaceId).filter((a) => canAccessWithBoundary(claims, a));
    if (agentsList.length === 0) {
      return NextResponse.json(getAgentsReport(workspaceId, rangeDays, { agentIds: [] }));
    }
    const report = getAgentsReport(workspaceId, rangeDays, { agentIds: agentsList.map((a) => a.id) });
    return NextResponse.json(report);
  } catch (e) {
    console.error("GET /api/reports/agents", e);
    return apiError("Failed to get report", 500);
  }
}
