import { NextRequest, NextResponse } from "next/server";
import {
  getAgent,
  createAgentRun,
  checkRateLimitsAndMaybePause,
  createExplainabilityEvent,
  appendAuditLog,
} from "@/lib/agents/store";
import { requirePermission, getActor, apiError, logAgentEvent } from "@/lib/agents/api-helpers";

/**
 * POST /api/agents/[id]/run
 * Creates a run record; enforces rate limits. Returns 429 if limited.
 * TODO: Wire to real execution engine; currently simulated.
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

    const check = checkRateLimitsAndMaybePause(agentId);
    if (!check.allowed) {
      createExplainabilityEvent(
        agentId,
        agent.workspaceId,
        "GUARDRAIL_TRIGGERED",
        "Run blocked: " + (check.reason ?? "rate limit"),
        { reason: check.reason }
      );
      return NextResponse.json(
        { error: "Rate limit exceeded", reason: check.reason },
        { status: 429 }
      );
    }

    // Simulated run: create run record and a few explainability events
    const run = createAgentRun(
      agentId,
      agent.workspaceId,
      "SUCCESS",
      "Simulated run completed",
      { messagesSent: 3, tasksCreated: 1 },
      ["Step 1: Segment query", "Step 2: 3 candidates", "Step 3: Messages sent"]
    );

    const { userId, email } = getActor(request);
    appendAuditLog({
      workspaceId: agent.workspaceId,
      actorId: userId,
      actorEmail: email,
      actionType: "RUN_REQUESTED",
      entityType: "run",
      entityId: run.id,
      diffSummary: `Run started for agent ${agentId}`,
      metadata: { agentId, runId: run.id, status: run.status },
    });
    logAgentEvent("run_requested", { agentId, runId: run.id, workspaceId: agent.workspaceId });

    createExplainabilityEvent(
      agentId,
      agent.workspaceId,
      "SELECTION_RATIONALE",
      "Selected 3 persons: missing transcript + inactive > 7d",
      { personIds: ["p1", "p2", "p3"], criteria: "missing_transcript,inactive_7d" },
      run.id
    );
    createExplainabilityEvent(
      agentId,
      agent.workspaceId,
      "MESSAGE_RATIONALE",
      "Used profile Admissions Reminder; tone Warm",
      { profileId: agent.narrative?.profileId ?? "default" },
      run.id
    );

    return NextResponse.json(run);
  } catch (e) {
    console.error("POST /api/agents/[id]/run", e);
    return apiError("Failed to start run", 500);
  }
}
