import { NextRequest, NextResponse } from "next/server";
import { getWebhookConnector, updateWebhookConnector, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, requireBoundaryAccess, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * GET /api/connectors/webhooks/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const connector = getWebhookConnector(id);
    if (!connector) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, connector);
    if (boundaryDenied) return boundaryDenied;
    return NextResponse.json(connector);
  } catch (e) {
    console.error("GET /api/connectors/webhooks/[id]", e);
    return apiError("Failed to get webhook connector", 500);
  }
}

/**
 * PUT /api/connectors/webhooks/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const existing = getWebhookConnector(id);
    if (!existing) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, existing);
    if (boundaryDenied) return boundaryDenied;
    const body = await request.json();
    const updated = updateWebhookConnector(id, body);
    if (!updated) return apiError("Not found", 404);
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId: updated.workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "CONNECTOR_UPDATED",
      entityType: "connector_webhook",
      entityId: id,
      diffSummary: `Webhook connector updated: ${updated.name}`,
    });
    logAgentEvent("connector_updated", { type: "webhook", connectorId: id });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/connectors/webhooks/[id]", e);
    return apiError("Failed to update webhook connector", 500);
  }
}
