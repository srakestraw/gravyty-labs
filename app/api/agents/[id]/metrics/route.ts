import { NextRequest, NextResponse } from "next/server";
import { getAgentMetrics } from "@/lib/agents/store";

/**
 * GET /api/agents/[id]/metrics?range=7d|30d
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const range = (request.nextUrl.searchParams.get("range") as "7d" | "30d") ?? "7d";
    const metrics = getAgentMetrics(id, range);
    return NextResponse.json(metrics);
  } catch (e) {
    console.error("GET /api/agents/[id]/metrics", e);
    return NextResponse.json({ error: "Failed to get metrics" }, { status: 500 });
  }
}
