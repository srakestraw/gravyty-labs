import { NextRequest, NextResponse } from "next/server";
import { addSseSender } from "@/lib/agent-ops/events/publish";

/**
 * GET /api/agent-ops/stream?workspaceId=...
 * Server-sent events stream for queue updates. Scoped by workspaceId.
 * No PII; events include itemId, type, status, severity, updatedAt only.
 * Client should pass workspaceId from current context.
 */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 }
    );
  }

  // TODO: Enforce boundary/auth so client only receives events for workspaces they can access

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch (_) {
          // Client may have closed
        }
      };

      const unsub = addSseSender(workspaceId, send);

      const onAbort = () => {
        unsub();
        try {
          controller.close();
        } catch (_) {}
      };

      request.signal?.addEventListener("abort", onAbort);

      // Send initial comment so client sees connection open
      send(": connected\n\n");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Connection: "keep-alive",
    },
  });
}
