import { NextRequest, NextResponse } from "next/server";
import { getApprovalRequest, rejectApprovalRequest } from "@/lib/agents/store";
import { requirePermission, getActor, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { emitApprovalResolved } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/approval-requests/[id]/reject
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_AGENTS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const existing = getApprovalRequest(id);
    if (!existing) return apiError("Not found", 404);
    if (existing.status !== "PENDING") return apiError("Approval request is not pending", 400);
    const { userId } = getActor(request);
    const reviewerId = userId ?? "system";
    const updated = rejectApprovalRequest(id, reviewerId);
    if (!updated) return apiError("Not found", 404);
    logAgentEvent("approval_rejected", { approvalId: id, reviewerId });
    emitApprovalResolved(existing.workspaceId, id, "approval.rejected");
    return NextResponse.json(updated);
  } catch (e) {
    console.error("POST /api/approval-requests/[id]/reject", e);
    return apiError("Failed to reject", 500);
  }
}
