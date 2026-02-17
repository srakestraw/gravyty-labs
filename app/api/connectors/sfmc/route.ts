import { NextRequest, NextResponse } from "next/server";
import { listSfmcConnectors, createSfmcConnector, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, getBoundaryClaims, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary, connectorAllowedForBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/connectors/sfmc?workspaceId=...
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const claims = getBoundaryClaims(request);
    const list = listSfmcConnectors(workspaceId).filter(
      (c) => canAccessWithBoundary(claims, c) && connectorAllowedForBoundary(c, claims)
    );
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/connectors/sfmc", e);
    return apiError("Failed to list SFMC connectors", 500);
  }
}

/**
 * POST /api/connectors/sfmc
 * clientIdRef/clientSecretRef: placeholder refs to secrets. TODO: real secret storage.
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { workspaceId, name, subdomain, authType, clientIdRef, clientSecretRef, isActive, boundary, allowlist } = body;
    if (!workspaceId || !name || !subdomain || !clientIdRef || !clientSecretRef) {
      return apiError("workspaceId, name, subdomain, clientIdRef, clientSecretRef required", 400);
    }
    const connector = createSfmcConnector({
      workspaceId,
      name,
      subdomain,
      authType: authType ?? "client_credentials",
      clientIdRef,
      clientSecretRef,
      isActive: isActive !== false,
      boundary: boundary ?? undefined,
      allowlist: allowlist ?? undefined,
    });
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "CONNECTOR_CREATED",
      entityType: "connector_sfmc",
      entityId: connector.id,
      diffSummary: `SFMC connector created: ${connector.name}`,
    });
    logAgentEvent("connector_created", { type: "sfmc", connectorId: connector.id, workspaceId });
    return NextResponse.json(connector);
  } catch (e) {
    console.error("POST /api/connectors/sfmc", e);
    return apiError("Failed to create SFMC connector", 500);
  }
}
