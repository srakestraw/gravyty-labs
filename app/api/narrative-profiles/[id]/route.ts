import { NextRequest, NextResponse } from "next/server";
import { getNarrativeProfile, updateNarrativeProfile, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, requireBoundaryAccess, apiError } from "@/lib/agents/api-helpers";

/**
 * GET /api/narrative-profiles/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_NARRATIVE_PROFILES");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const profile = getNarrativeProfile(id);
    if (!profile) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, profile);
    if (boundaryDenied) return boundaryDenied;
    return NextResponse.json(profile);
  } catch (e) {
    console.error("GET /api/narrative-profiles/[id]", e);
    return apiError("Failed to get profile", 500);
  }
}

/**
 * PUT /api/narrative-profiles/[id]
 * Creates a new version row (previous snapshot) before updating.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "MANAGE_NARRATIVE_PROFILES");
  if (forbidden) return forbidden;
  try {
    const { id } = await params;
    const existingProfile = getNarrativeProfile(id);
    if (!existingProfile) return apiError("Not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, existingProfile);
    if (boundaryDenied) return boundaryDenied;
    const body = await request.json();
    const { userId, email } = getActor(request);
    const updated = updateNarrativeProfile(id, body, userId ?? undefined);
    if (!updated) return apiError("Not found", 404);
    appendAuditLog({
      workspaceId: updated.workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "NARRATIVE_PROFILE_UPDATED",
      entityType: "narrative_profile",
      entityId: id,
      diffSummary: `Updated profile: ${updated.name}`,
      metadata: { fields: Object.keys(body) },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/narrative-profiles/[id]", e);
    return apiError("Failed to update profile", 500);
  }
}
