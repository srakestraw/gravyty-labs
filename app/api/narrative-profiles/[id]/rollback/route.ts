import { NextRequest, NextResponse } from "next/server";
import { rollbackNarrativeProfile } from "@/lib/agents/store";

/**
 * POST /api/narrative-profiles/[id]/rollback?version=#
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versionStr = request.nextUrl.searchParams.get("version");
    const version = versionStr ? parseInt(versionStr, 10) : NaN;
    if (isNaN(version) || version < 1) {
      return NextResponse.json({ error: "version query param required (integer >= 1)" }, { status: 400 });
    }
    const actorId = request.headers.get("x-actor-id") ?? undefined;
    const profile = rollbackNarrativeProfile(id, version, actorId);
    if (!profile) return NextResponse.json({ error: "Version not found or rollback failed" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (e) {
    console.error("POST /api/narrative-profiles/[id]/rollback", e);
    return NextResponse.json({ error: "Failed to rollback" }, { status: 500 });
  }
}
