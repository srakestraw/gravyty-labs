import { NextRequest, NextResponse } from "next/server";
import { getAgent, updateAgent, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, requireBoundaryAccess, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * GET /api/agents/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const agent = getAgent(id);
    if (!agent) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, agent);
    if (boundaryDenied) return boundaryDenied;
    return NextResponse.json(agent);
  } catch (e) {
    console.error("GET /api/agents/[id]", e);
    return apiError("Failed to get agent", 500);
  }
}

/**
 * PUT /api/agents/[id]
 * Body: UpdateAgentBody (includes rateLimits). Status change to ACTIVE/PAUSED is audited.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_AGENTS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const existing = getAgent(id);
    if (!existing) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, existing);
    if (boundaryDenied) return boundaryDenied;
    const body = await request.json();
    const updated = updateAgent(id, body);
    if (!updated) return apiError("Not found", 404);
    const { userId, email } = getActor(request);
    const actionType =
      body.status === "ACTIVE" ? "AGENT_ACTIVATED" : body.status === "PAUSED" ? "AGENT_PAUSED" : "AGENT_UPDATED";
    appendAuditLog({
      workspaceId: updated.workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType,
      entityType: "agent",
      entityId: id,
      diffSummary: body.status ? `Status → ${body.status}` : "Updated",
      metadata: body.status ? undefined : { fields: Object.keys(body) },
    });
    logAgentEvent("agent_updated", { agentId: id, actionType });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/agents/[id]", e);
    return apiError("Failed to update agent", 500);
  }
}
