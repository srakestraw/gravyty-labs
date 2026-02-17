import { NextRequest, NextResponse } from "next/server";
import { setHold } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/agent-ops/items/[id]/hold
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
    const state = setHold(id);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { status: state.status, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/hold", e);
    return NextResponse.json(
      { error: "Failed to hold item" },
      { status: 500 }
    );
  }
}
