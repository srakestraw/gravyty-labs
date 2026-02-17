import { NextRequest, NextResponse } from "next/server";
import { listApprovalRequests, createApprovalRequest } from "@/lib/agents/store";
import { requirePermission, getBoundaryClaims, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import type { ApprovalRequestStatus } from "@/lib/agents/store";
import { canAccessWithBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/approval-requests?workspaceId=...&status=PENDING
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const status = request.nextUrl.searchParams.get("status") as ApprovalRequestStatus | null;
    const claims = getBoundaryClaims(request);
    const list = listApprovalRequests(workspaceId, status ?? undefined).filter((r) => canAccessWithBoundary(claims, r));
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/approval-requests", e);
    return apiError("Failed to list approval requests", 500);
  }
}

/**
 * POST /api/approval-requests
 * Body: { workspaceId, agentId, actionType, payloadPreview?, runId? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, agentId, actionType, payloadPreview, runId } = body;
    if (!workspaceId || !agentId || !actionType) {
      return apiError("workspaceId, agentId, actionType required", 400);
    }
    const req = createApprovalRequest(
      workspaceId,
      agentId,
      actionType,
      typeof payloadPreview === "string" ? payloadPreview : "[redacted]",
      runId
    );
    logAgentEvent("approval_created", { approvalId: req.id, agentId, actionType });
    return NextResponse.json(req);
  } catch (e) {
    console.error("POST /api/approval-requests", e);
    return apiError("Failed to create approval request", 500);
  }
}
