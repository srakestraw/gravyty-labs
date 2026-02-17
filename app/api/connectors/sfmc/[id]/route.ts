import { NextRequest, NextResponse } from "next/server";
import { getSfmcConnector, updateSfmcConnector, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, requireBoundaryAccess, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * GET /api/connectors/sfmc/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const connector = getSfmcConnector(id);
    if (!connector) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, connector);
    if (boundaryDenied) return boundaryDenied;
    return NextResponse.json(connector);
  } catch (e) {
    console.error("GET /api/connectors/sfmc/[id]", e);
    return apiError("Failed to get SFMC connector", 500);
  }
}

/**
 * PUT /api/connectors/sfmc/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const existing = getSfmcConnector(id);
    if (!existing) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, existing);
    if (boundaryDenied) return boundaryDenied;
    const body = await request.json();
    const updated = updateSfmcConnector(id, body);
    if (!updated) return apiError("Not found", 404);
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId: updated.workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "CONNECTOR_UPDATED",
      entityType: "connector_sfmc",
      entityId: id,
      diffSummary: `SFMC connector updated: ${updated.name}`,
    });
    logAgentEvent("connector_updated", { type: "sfmc", connectorId: id });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/connectors/sfmc/[id]", e);
    return apiError("Failed to update SFMC connector", 500);
  }
}
