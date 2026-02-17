import { NextRequest, NextResponse } from "next/server";
import { listAgents, createAgent, appendAuditLog } from "@/lib/agents/store";
import type { Agent } from "@/lib/agents/api-types";
import { requirePermission, getActor, getBoundaryClaims, requireBoundaryAccess, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { canAccessWithBoundary } from "@/lib/agents/boundary";

/**
 * GET /api/agents?workspaceId=...
 * Results filtered by user boundary claims when present.
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return apiError("workspaceId is required", 400);
    const claims = getBoundaryClaims(request);
    const list = listAgents(workspaceId).filter((a) => canAccessWithBoundary(claims, a));
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/agents", e);
    return apiError("Failed to list agents", 500);
  }
}

/**
 * POST /api/agents
 * Body: CreateAgentBody
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_AGENTS");
  if (forbidden) return forbidden;
  try {
    const body = (await request.json()) as Partial<Agent> & { workspaceId: string };
    const { workspaceId, name, purpose, role, type } = body;
    if (!workspaceId || !name || !role || !type) {
      return apiError("workspaceId, name, role, type required", 400);
    }
    const agentId = body.id ?? `agent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const agent = createAgent({
      ...body,
      id: agentId,
      workspaceId,
      name,
      purpose: purpose ?? "",
      role,
      type,
      status: body.status ?? "DRAFT",
      boundary: body.boundary,
    } as Parameters<typeof createAgent>[0]);
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "AGENT_CREATED",
      entityType: "agent",
      entityId: agent.id,
      diffSummary: `Created agent: ${agent.name}`,
    });
    logAgentEvent("agent_created", { agentId: agent.id, workspaceId });
    return NextResponse.json(agent);
  } catch (e) {
    console.error("POST /api/agents", e);
    return apiError("Failed to create agent", 500);
  }
}
