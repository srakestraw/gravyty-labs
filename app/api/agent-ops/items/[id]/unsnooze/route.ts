import { NextRequest, NextResponse } from "next/server";
import { setUnsnoozed } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/agent-ops/items/[id]/unsnooze
 * Query: workspaceId (optional).
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
    const state = setUnsnoozed(id);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { status: state.status, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/unsnooze", e);
    return NextResponse.json(
      { error: "Failed to unsnooze item" },
      { status: 500 }
    );
  }
}
