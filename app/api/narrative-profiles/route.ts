import { NextRequest, NextResponse } from "next/server";
import { listNarrativeProfiles, createNarrativeProfile, appendAuditLog } from "@/lib/agents/store";
import { requirePermission, getActor, getBoundaryClaims, apiError } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/narrative-profiles?workspaceId=...
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_NARRATIVE_PROFILES");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const claims = getBoundaryClaims(request);
    const list = listNarrativeProfiles(workspaceId).filter((p) => canAccessWithBoundary(claims, p));
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/narrative-profiles", e);
    return apiError("Failed to list profiles", 500);
  }
}

/**
 * POST /api/narrative-profiles
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_NARRATIVE_PROFILES");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { workspaceId, name, tone, allowedTopics, blockedTopics, escalationMessage, allowedPersonalizationFields, boundary } = body;
    if (!workspaceId || !name) return apiError("workspaceId and name required", 400);
    const profile = createNarrativeProfile({
      workspaceId,
      name,
      tone: tone ?? "Professional",
      allowedTopics: Array.isArray(allowedTopics) ? allowedTopics : [],
      blockedTopics: Array.isArray(blockedTopics) ? blockedTopics : [],
      escalationMessage: escalationMessage ?? "",
      allowedPersonalizationFields: Array.isArray(allowedPersonalizationFields) ? allowedPersonalizationFields : [],
      boundary: boundary ?? undefined,
    });
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "NARRATIVE_PROFILE_CREATED",
      entityType: "narrative_profile",
      entityId: profile.id,
      diffSummary: `Created profile: ${profile.name}`,
    });
    return NextResponse.json(profile);
  } catch (e) {
    console.error("POST /api/narrative-profiles", e);
    return apiError("Failed to create profile", 500);
  }
}
