import { NextRequest, NextResponse } from "next/server";
import { listFlowDefinitionsByAgent, createFlowDefinitionVersion, appendAuditLog } from "@/lib/agents/store";
import type { FlowBuilderNode, FlowBuilderEdge } from "@/lib/agents/api-types";
import { requirePermission, getActor, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * GET /api/flow-definitions?agentId=...
 */
export async function GET(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    if (!agentId) return apiError("agentId is required", 400);
    const list = listFlowDefinitionsByAgent(agentId);
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/flow-definitions", e);
    return apiError("Failed to list flow definitions", 500);
  }
}

/**
 * POST /api/flow-definitions
 * Body: { agentId, workspaceId, nodes, edges } - creates new version
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "MANAGE_AGENTS");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { agentId, workspaceId, nodes, edges } = body;
    if (!agentId || !workspaceId || !Array.isArray(nodes)) return apiError("agentId, workspaceId, nodes required", 400);
    const def = createFlowDefinitionVersion(
      agentId,
      workspaceId,
      nodes as FlowBuilderNode[],
      Array.isArray(edges) ? (edges as FlowBuilderEdge[]) : []
    );
    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "FLOW_DEFINITION_SAVED",
      entityType: "flow_definition",
      entityId: def.id,
      diffSummary: `Flow definition v${def.version} saved for agent ${agentId}`,
      metadata: { agentId, version: def.version },
    });
    logAgentEvent("flow_definition_saved", { agentId, definitionId: def.id });
    return NextResponse.json(def);
  } catch (e) {
    console.error("POST /api/flow-definitions", e);
    return apiError("Failed to create flow definition", 500);
  }
}
