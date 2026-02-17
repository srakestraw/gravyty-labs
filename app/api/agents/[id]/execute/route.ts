import { NextRequest, NextResponse } from "next/server";
import { getAgent } from "@/lib/agents/store";
import { requirePermission, requireBoundaryAccess, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import { enqueueExecute, runExecuteJob } from "@/lib/agents/queue/agent-execute-job";

/**
 * POST /api/agents/[id]/execute
 * Body: { mode?: 'DRY_RUN' | 'LIVE', sampleTargets?: string[] }
 * Header: Idempotency-Key (optional) - same key within 10 min returns existing runId.
 * Enqueues a job and processes immediately (in-process); returns jobId and runId.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requirePermission(request, "RUN_AGENTS");
  if (forbidden) return forbidden;

  try {
    const { id: agentId } = await params;
    const agent = getAgent(agentId);
    if (!agent) return apiError("Agent not found", 404);
    const boundaryDenied = requireBoundaryAccess(request, agent);
    if (boundaryDenied) return boundaryDenied;

    const workspaceId = agent.workspaceId;
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "LIVE" ? "LIVE" : "DRY_RUN";
    const sampleTargets = Array.isArray(body.sampleTargets) ? body.sampleTargets : undefined;
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

    const jobId = await enqueueExecute({
      agentId,
      workspaceId,
      mode,
      sampleTargets,
      idempotencyKey,
    });

    const result = await runExecuteJob(jobId);

    logAgentEvent("execute_called", {
      agentId,
      jobId,
      runId: result.runId,
      mode,
      status: result.status,
    });

    return NextResponse.json({
      jobId,
      runId: result.runId,
      summary: result.summary,
      counts: result.counts,
      status: result.status,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Execution failed";
    if (message.includes("Rate limit") || message.includes("exceeded")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    if (message.includes("not found")) {
      return apiError(message, 404);
    }
    if (message.includes("already in progress") || message.includes("concurrent job limit")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    console.error("POST /api/agents/[id]/execute", e);
    return apiError(message, 500);
  }
}
