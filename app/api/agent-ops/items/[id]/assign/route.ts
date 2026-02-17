import { NextRequest, NextResponse } from "next/server";
import { setAssign } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/agent-ops/items/[id]/assign
 * Body: { assigneeId: string | null }. Query: workspaceId (optional).
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
    const assigneeId =
      body.assigneeId === null || body.assigneeId === undefined
        ? null
        : typeof body.assigneeId === "string"
          ? body.assigneeId
          : null;
    const state = setAssign(id, assigneeId);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { assigneeId, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/assign", e);
    return NextResponse.json(
      { error: "Failed to assign item" },
      { status: 500 }
    );
  }
}
