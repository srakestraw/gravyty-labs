import { NextRequest, NextResponse } from "next/server";
import { getAgentTestCase, updateAgentTestCase } from "@/lib/agents/store";

/**
 * PUT /api/agent-test-cases/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateAgentTestCase(id, {
      name: body.name,
      inputContextJson: body.inputContextJson,
      expectedChecksJson: body.expectedChecksJson,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/agent-test-cases/[id]", e);
    return NextResponse.json({ error: "Failed to update test case" }, { status: 500 });
  }
}
