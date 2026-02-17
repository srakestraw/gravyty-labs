import { NextRequest, NextResponse } from "next/server";
import { listAuditLogs } from "@/lib/agents/store";
import type { AuditEntityType } from "@/lib/agents/audit-types";
import { requirePermission, getActor, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * GET /api/audit-logs?workspaceId=...&entityType=...&entityId=...&limit=20
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;

  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);

    const entityType = request.nextUrl.searchParams.get("entityType") as AuditEntityType | null;
    const entityId = request.nextUrl.searchParams.get("entityId") ?? undefined;
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 100);

    const list = listAuditLogs(workspaceId, {
      entityType: entityType ?? undefined,
      entityId,
      limit,
    });
    logAgentEvent("audit_logs_listed", { workspaceId, count: list.length });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/audit-logs", e);
    return apiError("Failed to list audit logs", 500);
  }
}
