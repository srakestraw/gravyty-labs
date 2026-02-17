import { NextRequest, NextResponse } from "next/server";
import { listWebhookConnectors, createWebhookConnector, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, getBoundaryClaims, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary, connectorAllowedForBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/connectors/webhooks?workspaceId=...
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const claims = getBoundaryClaims(request);
    const list = listWebhookConnectors(workspaceId).filter(
      (c) => canAccessWithBoundary(claims, c) && connectorAllowedForBoundary(c, claims)
    );
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/connectors/webhooks", e);
    return apiError("Failed to list webhook connectors", 500);
  }
}

/**
 * POST /api/connectors/webhooks
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_CONNECTORS");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { workspaceId, name, baseUrl, allowedPaths, allowedMethods, headersTemplateRef, signing, isActive, boundary, allowlist } = body;
    if (!workspaceId || !name || !baseUrl) return apiError("workspaceId, name, baseUrl required", 400);
    const connector = createWebhookConnector({
      workspaceId,
      name,
      baseUrl,
      allowedPaths: Array.isArray(allowedPaths) ? allowedPaths : undefined,
      allowedMethods: Array.isArray(allowedMethods) ? allowedMethods : undefined,
      headersTemplateRef: headersTemplateRef ?? undefined,
      signing: signing ?? undefined,
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
      entityType: "connector_webhook",
      entityId: connector.id,
      diffSummary: `Webhook connector created: ${connector.name}`,
    });
    logAgentEvent("connector_created", { type: "webhook", connectorId: connector.id, workspaceId });
    return NextResponse.json(connector);
  } catch (e) {
    console.error("POST /api/connectors/webhooks", e);
    return apiError("Failed to create webhook connector", 500);
  }
}
