"use client";

import Link from "next/link";
import { AgentForm } from "@/app/(shell)/ai-assistants/agents/_components/agent-form";
import { FlowBuilderSection } from "@/components/shared/agents/FlowBuilderSection";
import { AgentDetailLayout } from "@/components/shared/agents/AgentDetailLayout";
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import { getMockAgentById } from "@/lib/agents/mock-data";
import type { AgentType } from "@/lib/agents/types";

interface AgentDetailPageClientProps {
  agentId: string;
  context?: AiPlatformPageContext;
}

export function AgentDetailPageClient({ agentId, context }: AgentDetailPageClientProps) {
  const basePath = getAiPlatformBasePath(context);
  const workspaceId = context?.workspaceId ?? "admissions";
  const agent = getMockAgentById(agentId);

  const agentType: AgentType = agent?.type ?? "AUTONOMOUS";
  const agentName = agent?.name ?? `Agent ${agentId}`;
  const purpose = agent?.purpose ?? "Agent purpose description";
  const role = agent?.role ?? "Admissions";
  const status = agent?.status ?? "Active";
  const lastRun = agent?.lastRun ?? "Never";
  const nextRun = agent?.nextRun ?? "Not scheduled";

  if (agentType === "FLOW") {
    return (
      <AgentDetailLayout
        agentId={agentId}
        workspaceId={workspaceId}
        basePath={basePath}
        agentName={agentName}
      >
        <FlowBuilderEditClient
          agentId={agentId}
          agentName={agentName}
          purpose={purpose}
          role={role}
          status={status}
          lastRun={lastRun}
          flowDefinition={agent?.flowDefinition}
          basePath={basePath}
          embedInLayout
        />
      </AgentDetailLayout>
    );
  }

  return (
    <AgentDetailLayout
      agentId={agentId}
      workspaceId={workspaceId}
      basePath={basePath}
      agentName={agentName}
    >
      <AgentForm
        mode="edit"
        agentId={agentId}
        workspaceId={workspaceId}
        embedInLayout
        agentType="AUTONOMOUS"
        initialData={{
          name: agentName,
          purpose,
          role,
          status,
          lastRun,
          nextRun,
          narrativeConfig: agent?.narrativeConfig,
        }}
        basePath={basePath}
      />
    </AgentDetailLayout>
  );
}

function FlowBuilderEditClient({
  agentId,
  agentName,
  purpose,
  role,
  status,
  lastRun,
  flowDefinition,
  basePath,
  embedInLayout = false,
}: {
  agentId: string;
  agentName: string;
  purpose: string;
  role: string;
  status: string;
  lastRun: string | null;
  flowDefinition?: { nodes: unknown[]; edges: unknown[] } | null;
  basePath: string;
  embedInLayout?: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: PUT /api/agents/[id]
    console.log("Updating flow agent:", agentId);
  };

  return (
    <div className="space-y-6">
      {!embedInLayout && (
        <>
          <div>
            <Link
              href={`${basePath}/agents`}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              ← Back to Agents
            </Link>
          </div>
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              EDIT AGENT — {agentName}
            </h1>
          </header>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Step 1 — Agent Summary
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Agent Name</label>
              <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                {agentName}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Purpose</label>
              <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                {purpose}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Agent Type</label>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                  Flow Builder
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Status: </span>
                <span className="text-xs font-medium text-emerald-700">{status}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Last Run: </span>
                <span className="text-xs text-gray-700">{lastRun ?? "Not run yet"}</span>
              </div>
            </div>
          </div>
        </section>

        <FlowBuilderSection
          definition={
            flowDefinition?.nodes?.length
              ? { nodes: flowDefinition.nodes as never[], edges: (flowDefinition.edges ?? []) as never[] }
              : undefined
          }
          readOnly={true}
          lastRun={lastRun}
          agentId={agentId}
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          <Link
            href={`${basePath}/agents`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Run Now
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:text-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}