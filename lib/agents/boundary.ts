/**
 * Multi-tenant boundary model: org / campus / department.
 * Enforce access so users only see entities within their boundary claims.
 * TODO: SSO claims mapping for real org/campus/department from identity provider.
 */

export interface Boundary {
  orgId: string;
  campusId?: string;
  departmentId?: string;
}

/** User's boundary claims (from session/SSO). If absent, no boundary filter is applied (dev/admin). */
export interface BoundaryClaims {
  orgId: string;
  campusId?: string;
  departmentId?: string;
}

/** Entity has optional boundary; if missing, treat as org-scoped (visible to all in org). */
export function entityBoundary(entity: { boundary?: Boundary | null }): Boundary | null {
  return entity.boundary ?? null;
}

/**
 * User can access entity if:
 * - User has no claims (allow for dev) OR
 * - orgId matches AND
 * - entity has no campus/department (org-wide) OR user's campus/department is set and matches
 */
export function canAccessWithBoundary(
  userClaims: BoundaryClaims | null,
  entity: { boundary?: Boundary | null }
): boolean {
  if (!userClaims) return true;
  const b = entityBoundary(entity);
  if (!b) return true; // no boundary = org-scoped, allow if org matches when we have workspace→org mapping
  if (b.orgId !== userClaims.orgId) return false;
  if (!b.campusId && !b.departmentId) return true;
  if (b.campusId && userClaims.campusId && b.campusId !== userClaims.campusId) return false;
  if (b.departmentId && userClaims.departmentId && b.departmentId !== userClaims.departmentId) return false;
  return true;
}

/** Connector allowlist: restrict by campus/department. Empty = allow all in org. */
export interface ConnectorBoundaryAllowlist {
  campusIds?: string[];
  departmentIds?: string[];
}

export function connectorAllowedForBoundary(
  connector: { boundary?: Boundary | null } & { allowlist?: ConnectorBoundaryAllowlist },
  userClaims: BoundaryClaims | null
): boolean {
  if (!canAccessWithBoundary(userClaims, connector)) return false;
  const allow = connector.allowlist as ConnectorBoundaryAllowlist | undefined;
  if (!allow?.campusIds?.length && !allow?.departmentIds?.length) return true;
  if (userClaims?.campusId && allow?.campusIds?.length && !allow.campusIds.includes(userClaims.campusId)) return false;
  if (userClaims?.departmentId && allow?.departmentIds?.length && !allow.departmentIds.includes(userClaims.departmentId)) return false;
  return true;
}

/** Extract boundary claims from request. TODO: Replace with SSO/session claims. */
export function getBoundaryClaimsFromRequest(request: Request): BoundaryClaims | null {
  const orgId = request.headers.get("x-boundary-org-id");
  if (!orgId) return null;
  return {
    orgId,
    campusId: request.headers.get("x-boundary-campus-id") ?? undefined,
    departmentId: request.headers.get("x-boundary-department-id") ?? undefined,
  };
}
