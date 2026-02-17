"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AgentForm } from "@/app/(shell)/ai-assistants/agents/_components/agent-form";
import {
  AGENT_TEMPLATES,
  getDefaultVoiceFromContext,
  getTemplatesForWorkspace,
  isTemplateAllowedInContext,
  type AgentRole,
  type AgentTemplate,
  type SubWorkspaceId,
} from "@/app/(shell)/ai-assistants/templates/agent-templates";
import { TemplateCard } from "@/app/(shell)/ai-assistants/templates/TemplateCard";
import { FlowBuilderSection } from "@/components/shared/agents/FlowBuilderSection";
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import type { AgentType } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: AgentRole[] = [
  "Admissions",
  "Registrar",
  "Student Success",
  "Career Services",
  "Alumni Engagement",
  "Advancement",
];

const AGENT_TYPE_OPTIONS: { type: AgentType; label: string; description: string }[] = [
  { type: "AUTONOMOUS", label: "Autonomous Agent", description: "AI-powered agent that reasons and acts on your behalf." },
  { type: "FLOW", label: "No-Code Flow Builder", description: "Rule-based workflow with triggers, conditions, and actions." },
];

/** Default role from app/workspace context */
function getDefaultRoleFromContext(context?: AiPlatformPageContext): AgentRole {
  if (!context?.appId) return "Admissions";
  if (context.appId === "advancement") return "Advancement";
  const w = context.workspaceId;
  const map: Record<string, AgentRole> = {
    admissions: "Admissions",
    registrar: "Registrar",
    "financial-aid": "Registrar",
    bursar: "Registrar",
    housing: "Student Success",
    "student-success": "Student Success",
  };
  return map[w ?? ""] ?? "Admissions";
}

export function AgentNewPageClient({ context }: { context?: AiPlatformPageContext }) {
  const basePath = getAiPlatformBasePath(context);
  const searchParams = useSearchParams();
  const templateFromUrl = searchParams.get("template");

  const [selectedAgentType, setSelectedAgentType] = React.useState<AgentType | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<AgentRole>(() => getDefaultRoleFromContext(context));
  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState<string | null>(templateFromUrl);

  const recommendedByWorkspace = React.useMemo(() => getTemplatesForWorkspace(context ?? {}), [context?.appId, context?.workspaceId]);

  // Templates for step 1: recommended for this workspace (or all allowed) + blank, filtered by type and role
  const templatesForRoleAndType: AgentTemplate[] = React.useMemo(() => {
    const typeFilter = selectedAgentType ?? "AUTONOMOUS";
    const allowed = AGENT_TEMPLATES.filter((t) => t.key === "blank" || isTemplateAllowedInContext(t, context ?? {}));
    const forRoleAndType = allowed.filter((t) => {
      const roleMatch = t.role === selectedRole || t.role === "All";
      const typeMatch = t.type === typeFilter || t.type === "All";
      return roleMatch && typeMatch;
    });
    const blank = forRoleAndType.find((t) => t.key === "blank");
    const withContract = forRoleAndType.filter((t) => t.key !== "blank" && t.contextContract);
    const rest = forRoleAndType.filter((t) => t.key !== "blank" && !t.contextContract);
    return blank ? [blank, ...withContract, ...rest] : [...withContract, ...rest];
  }, [selectedRole, selectedAgentType, context?.appId, context?.workspaceId]);

  const selectedTemplate =
    templatesForRoleAndType.find((t) => t.key === selectedTemplateKey) ?? null;
  const templateNotAllowed =
    selectedTemplateKey &&
    selectedTemplate &&
    selectedTemplate.key !== "blank" &&
    !isTemplateAllowedInContext(selectedTemplate, context ?? {});

  // Build initial agent data from template; lock workspace scope when from template
  const initialAgentConfig = React.useMemo(() => {
    const role = selectedTemplate?.contextContract?.category ?? selectedRole;
    const type = (selectedTemplate?.type === "All" ? selectedAgentType : selectedTemplate?.type) ?? selectedAgentType ?? "AUTONOMOUS";
    const base = {
      name: selectedTemplate?.name ?? "",
      purpose: selectedTemplate?.description ?? "",
      role,
      goal: "",
      type: type as AgentType,
    };
    if (!selectedTemplate || selectedTemplate.key === "blank") {
      return base;
    }
    const c = selectedTemplate.contextContract;
    const subWorkspaceId = context?.workspaceId ?? (c?.workspace_scope.sub_workspace_ids[0] as string | undefined);
    const defaultVoice = c?.default_voice ?? getDefaultVoiceFromContext(context ?? {});
    const lockedScope =
      c && context
        ? {
            workspaceScopeId: c.workspace_scope.workspace_id,
            subWorkspaceId: subWorkspaceId as SubWorkspaceId | undefined,
            defaultVoice,
          }
        : undefined;
    return { ...base, lockedScope };
  }, [selectedTemplate, selectedRole, selectedAgentType, context]);

  const isFlow = selectedAgentType === "FLOW";

  // If URL template is not allowed in this workspace, clear selection
  React.useEffect(() => {
    if (templateFromUrl && selectedTemplate && selectedTemplate.key !== "blank" && !isTemplateAllowedInContext(selectedTemplate, context ?? {})) {
      setSelectedTemplateKey(null);
    }
  }, [templateFromUrl, selectedTemplate?.key, context?.appId, context?.workspaceId]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create new agent
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose the agent type, then select a template or start from scratch.
        </p>
      </header>

      {/* STEP 0 — Choose Agent Type */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Step 0 — Choose Agent Type
        </h2>
        <p className="text-xs text-gray-600">
          Select how you want to build your agent: AI-powered autonomous or rule-based flow.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {AGENT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => {
                setSelectedAgentType(opt.type);
                setSelectedTemplateKey(null);
              }}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition",
                selectedAgentType === opt.type
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
              <span className="text-xs text-gray-600">{opt.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 0b — Template or Blank selection (only after type selected) */}
      {selectedAgentType && (
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Step 1 — Choose how to start
          </h2>
          <p className="text-xs text-gray-600">
            Pick a recommended template for your role or start with a blank agent.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Recommended for this workspace
              </p>
              <div className="inline-flex gap-1 rounded-full bg-gray-50 p-1">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setSelectedTemplateKey(null);
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      selectedRole === role
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-white"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {templatesForRoleAndType.map((template) => (
                <TemplateCard
                  key={template.key}
                  template={template}
                  selected={selectedTemplateKey === template.key}
                  selectable={true}
                  onSelect={setSelectedTemplateKey}
                  showBlankBadge={template.key === "blank"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {templateNotAllowed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          This template is not available in the current workspace. Choose a template recommended for this workspace or start from blank.
        </div>
      )}

      {/* Autonomous: AgentForm with Narrative Messaging */}
      {selectedTemplate && selectedAgentType === "AUTONOMOUS" && !templateNotAllowed && (
        <AgentForm
          key={selectedTemplateKey}
          mode="create"
          agentType="AUTONOMOUS"
          workspaceId={context?.workspaceId ?? ('lockedScope' in initialAgentConfig ? initialAgentConfig.lockedScope?.subWorkspaceId : undefined) ?? "admissions"}
          initialData={initialAgentConfig}
          basePath={basePath}
        />
      )}

      {/* Flow: Flow Builder + minimal form shell */}
      {selectedTemplate && selectedAgentType === "FLOW" && !templateNotAllowed && (
        <FlowBuilderCreateForm
          key={selectedTemplateKey}
          initialData={initialAgentConfig}
          basePath={basePath}
        />
      )}
    </div>
  );
}

/** Minimal form for Flow Builder create: name, purpose, role, + FlowBuilderSection */
function FlowBuilderCreateForm({
  initialData,
  basePath,
}: {
  initialData: { name: string; purpose: string; role: AgentRole; goal: string };
  basePath: string;
}) {
  const [name, setName] = React.useState(initialData.name);
  const [purpose, setPurpose] = React.useState(initialData.purpose);
  const [flowDef, setFlowDef] = React.useState<{ nodes: unknown[]; edges: unknown[] }>({ nodes: [], edges: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/agents (flow type)
    console.log("Creating flow agent:", { name, purpose, flowDef });
  };

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div>
        <Link
          href={`${basePath}/agents`}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to Agents
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Flow Agent Summary
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Agent Name</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter agent name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Purpose</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe what this flow does"
              />
            </div>
          </div>
        </section>

        <FlowBuilderSection
          definition={flowDef.nodes.length ? { nodes: flowDef.nodes as never[], edges: flowDef.edges as never[] } : undefined}
          readOnly={false}
          onDefinitionChange={(def) => setFlowDef({ nodes: def.nodes, edges: def.edges })}
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          <Link
            href={`${basePath}/agents`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:text-indigo-700"
          >
            Create Agent
          </button>
        </div>
      </form>
    </div>
  );
}
