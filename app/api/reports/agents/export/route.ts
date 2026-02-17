import { NextRequest, NextResponse } from "next/server";
import { getAgentsReport, agentsReportToCsv } from "@/lib/agents/reports";
import { requirePermission, getBoundaryClaims, apiError } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary } from "@/lib/agents/boundary";
import { listAgents } from "@/lib/agents/store";

/**
 * GET /api/reports/agents/export?workspaceId=...&range=30d
 * Returns CSV export.
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
    const report = getAgentsReport(workspaceId, rangeDays, { agentIds: agentsList.map((a) => a.id) });
    const csv = agentsReportToCsv(report);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="agents-report-${workspaceId}-${report.range}.csv"`,
      },
    });
  } catch (e) {
    console.error("GET /api/reports/agents/export", e);
    return apiError("Failed to export report", 500);
  }
}
