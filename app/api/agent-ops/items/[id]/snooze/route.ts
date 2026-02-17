import { NextRequest, NextResponse } from "next/server";
import { setSnoozed } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/agent-ops/items/[id]/snooze
 * Body: { until: string }. Query: workspaceId (optional).
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
    const until = typeof body.until === "string" ? body.until : undefined;
    if (!until) {
      return NextResponse.json(
        { error: "Missing or invalid body.until (ISO date string)" },
        { status: 400 }
      );
    }
    const state = setSnoozed(id, until);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { status: state.status, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/snooze", e);
    return NextResponse.json(
      { error: "Failed to snooze item" },
      { status: 500 }
    );
  }
}
