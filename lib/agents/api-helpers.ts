/**
 * Shared helpers for agent API routes: permissions, actor, standard errors, structured logs, boundary.
 * TODO: Replace getActorFromRequest with real session/auth when available.
 */

import { NextResponse } from "next/server";
import {
  getActorFromRequest,
  canViewAgents,
  canManageAgents,
  canRunAgents,
  canManageNarrativeProfiles,
  canManageConnectors,
} from "./permissions";
import { getBoundaryClaimsFromRequest, canAccessWithBoundary, type BoundaryClaims } from "./boundary";

export type RequiredPermission =
  | "VIEW_AGENTS"
  | "MANAGE_AGENTS"
  | "RUN_AGENTS"
  | "MANAGE_NARRATIVE_PROFILES"
  | "MANAGE_CONNECTORS";

const CHECK: Record<RequiredPermission, (userId: string | null) => boolean> = {
  VIEW_AGENTS: canViewAgents,
  MANAGE_AGENTS: canManageAgents,
  RUN_AGENTS: canRunAgents,
  MANAGE_NARRATIVE_PROFILES: canManageNarrativeProfiles,
  MANAGE_CONNECTORS: canManageConnectors,
};

export function getActor(req: Request): { userId: string | null; email?: string } {
  return getActorFromRequest(req);
}

/** Returns 403 NextResponse if permission denied; otherwise null. */
export function requirePermission(
  request: Request,
  permission: RequiredPermission
): NextResponse | null {
  const { userId } = getActor(request);
  if (!CHECK[permission](userId)) {
    return NextResponse.json(
      { error: "Forbidden", message: `You do not have permission to ${permission.replace(/_/g, " ").toLowerCase()}.` },
      { status: 403 }
    );
  }
  return null;
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Get boundary claims from request. Null = no boundary filter (dev/admin). */
export function getBoundaryClaims(request: Request): BoundaryClaims | null {
  return getBoundaryClaimsFromRequest(request);
}

/** Returns 403 if user's boundary does not allow access to entity. */
export function requireBoundaryAccess<T extends { boundary?: { orgId: string; campusId?: string; departmentId?: string } | null }>(
  request: Request,
  entity: T | null | undefined
): NextResponse | null {
  if (!entity) return null;
  const claims = getBoundaryClaimsFromRequest(request);
  if (!canAccessWithBoundary(claims, entity)) {
    return NextResponse.json(
      { error: "Forbidden", message: "You do not have access to this resource (boundary)." },
      { status: 403 }
    );
  }
  return null;
}

/** Structured log for observability. In production, send to logging service. */
export function logAgentEvent(
  event: string,
  details: Record<string, unknown>
): void {
  console.log(JSON.stringify({ type: "agent_api", event, ...details, ts: new Date().toISOString() }));
}
