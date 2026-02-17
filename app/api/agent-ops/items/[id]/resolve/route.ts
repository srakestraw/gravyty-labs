import { NextRequest, NextResponse } from "next/server";
import { setResolved } from "@/lib/agent-ops/queue-action-store";
import { emitItemUpdated } from "@/lib/agent-ops/events/publish";

/**
 * POST /api/agent-ops/items/[id]/resolve
 * Query: workspaceId (optional) for real-time broadcast.
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
    const state = setResolved(id);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (workspaceId) {
      emitItemUpdated(workspaceId, id, { status: state.status, updatedAt: state.updatedAt });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("POST /api/agent-ops/items/[id]/resolve", e);
    return NextResponse.json(
      { error: "Failed to resolve item" },
      { status: 500 }
    );
  }
}
