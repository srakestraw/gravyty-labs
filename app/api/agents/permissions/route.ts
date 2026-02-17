import { NextRequest, NextResponse } from "next/server";
import { getAgentPermissions } from "@/lib/agents/permissions";
import { getActor } from "@/lib/agents/api-helpers";

/**
 * GET /api/agents/permissions
 * Returns capability-scoped permissions for the current actor (for UI disable/hide).
 * TODO: Wire to real session; currently uses x-user-id / x-actor-id headers or allows all.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = getActor(request);
    const permissions = getAgentPermissions(userId);
    return NextResponse.json(permissions);
  } catch (e) {
    console.error("GET /api/agents/permissions", e);
    return NextResponse.json(
      {
        VIEW_AGENTS: false,
        MANAGE_AGENTS: false,
        RUN_AGENTS: false,
        MANAGE_NARRATIVE_PROFILES: false,
        MANAGE_CONNECTORS: false,
      },
      { status: 500 }
    );
  }
}
