import { NextRequest, NextResponse } from "next/server";
import { listComplianceByEntity, upsertComplianceEntry, getAgent } from "@/lib/agents/store";
import { requirePermission, requireBoundaryAccess, apiError } from "@/lib/agents/api-helpers";
import type { ComplianceControlId, ComplianceStatus } from "@/lib/agents/compliance-types";
import { COMPLIANCE_CONTROL_IDS } from "@/lib/agents/compliance-types";

/**
 * GET /api/compliance-registry?entityType=agent&entityId=...
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const entityType = request.nextUrl.searchParams.get("entityType");
    const entityId = request.nextUrl.searchParams.get("entityId");
    if (!entityType || !entityId) return apiError("entityType and entityId required", 400);
    if (entityType === "agent") {
      const agent = getAgent(entityId);
      if (!agent) return apiError("Agent not found", 404);
      const boundaryDenied = requireBoundaryAccess(request, agent);
      if (boundaryDenied) return boundaryDenied;
    }
    const list = listComplianceByEntity(entityType, entityId);
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/compliance-registry", e);
    return apiError("Failed to list compliance", 500);
  }
}

/**
 * PUT /api/compliance-registry
 * Body: { entityType, entityId, controlId, status, evidenceLink? }
 */
export async function PUT(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_AGENTS");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { entityType, entityId, controlId, status, evidenceLink } = body;
    if (!entityType || !entityId || !controlId || !status) {
      return apiError("entityType, entityId, controlId, status required", 400);
    }
    if (!COMPLIANCE_CONTROL_IDS.includes(controlId as ComplianceControlId)) {
      return apiError("Invalid controlId", 400);
    }
    if (!["PASS", "FAIL", "NA"].includes(status)) {
      return apiError("status must be PASS, FAIL, or NA", 400);
    }
    if (entityType === "agent") {
      const agent = getAgent(entityId);
      if (!agent) return apiError("Agent not found", 404);
      const boundaryDenied = requireBoundaryAccess(request, agent);
      if (boundaryDenied) return boundaryDenied;
    }
    const entry = upsertComplianceEntry(
      entityType,
      entityId,
      controlId as ComplianceControlId,
      status as ComplianceStatus,
      evidenceLink
    );
    return NextResponse.json(entry);
  } catch (e) {
    console.error("PUT /api/compliance-registry", e);
    return apiError("Failed to upsert compliance", 500);
  }
}
