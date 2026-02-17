import { NextResponse } from "next/server";
import { getAllActionState } from "@/lib/agent-ops/queue-action-store";

/**
 * GET /api/agent-ops/action-state
 * Returns persisted action state for all queue items (status, snoozedUntil, assignedTo, severity).
 * Used by data provider to merge state when listing queue items.
 */
export async function GET() {
  try {
    const state = getAllActionState();
    return NextResponse.json(state);
  } catch (e) {
    console.error("GET /api/agent-ops/action-state", e);
    return NextResponse.json(
      { error: "Failed to get action state" },
      { status: 500 }
    );
  }
}
