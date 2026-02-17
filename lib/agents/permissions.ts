/**
 * Agent-scoped permissions for governance.
 * TODO: Wire to real auth/session; extract userId from request in API layer.
 */

export const AGENT_PERMISSIONS = [
  "VIEW_AGENTS",
  "MANAGE_AGENTS",
  "RUN_AGENTS",
  "MANAGE_NARRATIVE_PROFILES",
  "MANAGE_CONNECTORS",
] as const;

export type AgentPermission = (typeof AGENT_PERMISSIONS)[number];

/** In production: resolve from session/JWT. For now, placeholder that allows all when no userId. */
export function getAgentPermissions(userId: string | null | undefined): Record<AgentPermission, boolean> {
  // TODO: Replace with real role/permission resolution from backend
  if (!userId) {
    return {
      VIEW_AGENTS: true,
      MANAGE_AGENTS: true,
      RUN_AGENTS: true,
      MANAGE_NARRATIVE_PROFILES: true,
      MANAGE_CONNECTORS: true,
    };
  }
  // Mock: grant all to any authenticated user for dev
  return {
    VIEW_AGENTS: true,
    MANAGE_AGENTS: true,
    RUN_AGENTS: true,
    MANAGE_NARRATIVE_PROFILES: true,
    MANAGE_CONNECTORS: true,
  };
}

export function canViewAgents(userId: string | null | undefined): boolean {
  return getAgentPermissions(userId).VIEW_AGENTS;
}

export function canManageAgents(userId: string | null | undefined): boolean {
  return getAgentPermissions(userId).MANAGE_AGENTS;
}

export function canRunAgents(userId: string | null | undefined): boolean {
  return getAgentPermissions(userId).RUN_AGENTS;
}

export function canManageNarrativeProfiles(userId: string | null | undefined): boolean {
  return getAgentPermissions(userId).MANAGE_NARRATIVE_PROFILES;
}

export function canManageConnectors(userId: string | null | undefined): boolean {
  return getAgentPermissions(userId).MANAGE_CONNECTORS;
}

/** Extract actor from request. TODO: use session/auth middleware. */
export function getActorFromRequest(request: Request): { userId: string | null; email?: string } {
  const userId = request.headers.get("x-user-id") ?? request.headers.get("x-actor-id") ?? null;
  const email = request.headers.get("x-user-email") ?? request.headers.get("x-actor-email") ?? undefined;
  return { userId, email };
}
