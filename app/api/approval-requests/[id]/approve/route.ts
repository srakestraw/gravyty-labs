import { NextRequest, NextResponse } from "next/server";
import { getApprovalRequest, approveApprovalRequest } from "@/lib/agents/store";
import { requirePermission, getActor, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { emitApprovalResolved } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/approval-requests/[id]/approve
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
    const updated = approveApprovalRequest(id, reviewerId);
    if (!updated) return apiError("Not found", 404);
    logAgentEvent("approval_approved", { approvalId: id, reviewerId });
    emitApprovalResolved(existing.workspaceId, id, "approval.approved");
    return NextResponse.json(updated);
  } catch (e) {
    console.error("POST /api/approval-requests/[id]/approve", e);
    return apiError("Failed to approve", 500);
  }
}
