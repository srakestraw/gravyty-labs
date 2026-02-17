import { NextRequest, NextResponse } from "next/server";
import { setSeverity } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

type AgentSeverity = "INFO" | "WARN" | "ERROR";

/**
 * POST /api/agent-ops/items/[id]/update-severity
 * Body: { severity: "INFO" | "WARN" | "ERROR" }. Query: workspaceId (optional).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const severity = body.severity as AgentSeverity | undefined;
    if (
      !severity ||
      !["INFO", "WARN", "ERROR"].includes(severity)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid body.severity (INFO | WARN | ERROR)" },
        { status: 400 }
      );
    }
    const state = setSeverity(id, severity);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { agentSeverity: severity, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/update-severity", e);
    return NextResponse.json(
      { error: "Failed to update severity" },
      { status: 500 }
    );
  }
}
