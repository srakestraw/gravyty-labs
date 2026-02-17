import { NextRequest, NextResponse } from "next/server";
import { listNarrativeProfileVersions } from "@/lib/agents/store";

/**
 * GET /api/narrative-profiles/[id]/versions
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = listNarrativeProfileVersions(id);
    return NextResponse.json(versions);
  } catch (e) {
    console.error("GET /api/narrative-profiles/[id]/versions", e);
    return NextResponse.json({ error: "Failed to list versions" }, { status: 500 });
  }
}
