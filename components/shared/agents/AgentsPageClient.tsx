"use client";

import * as React from "react";
import Link from "next/link";
import { AgentTypeBadge } from "@/components/shared/agents/AgentTypeBadge";
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import {
  AGENT_TEMPLATES,
  getTemplatesForWorkspace,
  getWorkspaceScopeFromContext,
  isTemplateAllowedInContext,
  templateHasDecisionIntelligence,
  workspaceScopeLabel,
  subWorkspaceLabel,
  type AgentTemplate,
  type SubWorkspaceId,
} from "@/app/(shell)/ai-assistants/templates/agent-templates";
import { MOCK_AGENTS, type MockAgent } from "@/lib/agents/mock-data";
import type { AgentType } from "@/lib/agents/types";

type Role =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

type RoleFilter = Role | "All";

type AgentStatus = "active" | "paused" | "error";

type AgentTypeFilter = "all" | AgentType;

interface AgentsPageClientProps {
  context?: AiPlatformPageContext;
}

const ROLES: Role[] = [
  "Admissions",
  "Registrar",
  "Student Success",
  "Career Services",
  "Alumni Engagement",
  "Advancement",
];

const ROLE_COPY: Record<
  Role,
  { subtitle: string; bullets: string[] }
> = {
  Admissions: {
    subtitle:
      "Create, monitor, and manage agents that keep applicants moving from inquiry to enrollment.",
    bullets: [
      "Reduce stalled or inactive applicants.",
      "Clear missing documents before deadlines.",
      "Prevent melt between admit, deposit, and arrival.",
    ],
  },
  Registrar: {
    subtitle:
      "Create, monitor, and manage agents that keep records accurate and students correctly enrolled.",
    bullets: [
      "Detect registration blockers and missing prerequisites.",
      "Identify students with schedule or credit load issues.",
      "Flag records that may affect graduation eligibility.",
    ],
  },
  "Student Success": {
    subtitle:
      "Create, monitor, and manage agents that support persistence, retention, and student wellbeing.",
    bullets: [
      "Identify at-risk students based on inactivity or performance.",
      "Surface outreach targets for advisors and coaches.",
      "Monitor follow-through on key success tasks.",
    ],
  },
  "Career Services": {
    subtitle:
      "Create, monitor, and manage agents that connect students and alumni to career opportunities.",
    bullets: [
      "Identify students who haven't engaged with career resources.",
      "Flag expiring internship or job opportunities.",
      "Nudge students to complete key career milestones.",
    ],
  },
  "Alumni Engagement": {
    subtitle:
      "Create, monitor, and manage agents that strengthen alumni relationships over time.",
    bullets: [
      "Spot declining engagement across events and communications.",
      "Highlight alumni likely to respond to mentoring or volunteering.",
      "Support segmentation for campaigns and outreach.",
    ],
  },
  Advancement: {
    subtitle:
      "Create, monitor, and manage agents that help you move prospects and donors toward their next gift.",
    bullets: [
      "Identify LYBUNT/SYBUNT donors who need follow-up.",
      "Flag high-potential prospects with stalled activity.",
      "Support portfolio hygiene and pipeline movement.",
    ],
  },
};

const roleLabelFromKey = (key: string): Role => {
  const map: Record<string, Role> = {
    admissions: "Admissions",
    registrar: "Registrar",
    studentSuccess: "Student Success",
    careerServices: "Career Services",
    alumniEngagement: "Alumni Engagement",
    advancement: "Advancement",
  };
  return map[key] ?? "Admissions";
};

/** Templates with context contract (excludes blank) */
const TEMPLATES_WITH_CONTEXT = AGENT_TEMPLATES.filter(
  (t): t is AgentTemplate & { contextContract: NonNullable<AgentTemplate["contextContract"]> } =>
    !!t.contextContract && t.key !== "blank"
);

function TemplateCardBadges({ template }: { template: AgentTemplate }) {
  const c = template.contextContract;
  if (!c) return null;
  const ws = c.workspace_scope;
  const narrative = c.narrative_dependency?.uses_narrative_messaging;
  const decision = templateHasDecisionIntelligence(template);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
        {workspaceScopeLabel(ws.workspace_id)}
      </span>
      {ws.sub_workspace_ids.slice(0, 2).map((id) => (
        <span key={id} className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
          {subWorkspaceLabel(id)}
        </span>
      ))}
      {narrative && (
        <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
          Narrative Messaging
        </span>
      )}
      {decision && (
        <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
          Decision Intelligence
        </span>
      )}
    </div>
  );
}

const renderStatusPill = (status: AgentStatus) => {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border";
  switch (status) {
    case "active":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
          Active
        </span>
      );
    case "paused":
      return (
        <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>
          Paused
        </span>
      );
    case "error":
      return (
        <span className={`${base} bg-rose-50 text-rose-700 border-rose-100`}>
          Error
        </span>
      );
  }
};

export function AgentsPageClient({ context }: AgentsPageClientProps) {
  const basePath = getAiPlatformBasePath(context);
  const [search, setSearch] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<RoleFilter>("All");
  const [statusFilter, setStatusFilter] = React.useState<AgentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = React.useState<AgentTypeFilter>("all");
  const [viewAllTemplates, setViewAllTemplates] = React.useState(false);

  const isAllRoles = selectedRole === "All";

  const recommendedTemplates = React.useMemo(
    () => getTemplatesForWorkspace(context ?? {}),
    [context?.appId, context?.workspaceId]
  );
  const allTemplatesForViewAll = React.useMemo(() => {
    let list = TEMPLATES_WITH_CONTEXT;
    if (!isAllRoles) list = list.filter((t) => t.contextContract.category === selectedRole);
    return list;
  }, [isAllRoles, selectedRole]);
  const visibleTemplates = viewAllTemplates ? allTemplatesForViewAll : recommendedTemplates;

  /** Agents scoped to current workspace: Advancement shows only advancement agents; Student Lifecycle shows admissions/registrar/etc. */
  const agentsInWorkspace = React.useMemo(() => {
    const scope = getWorkspaceScopeFromContext(context ?? {});
    if (!scope) return MOCK_AGENTS;
    if (scope.workspaceScopeId === "advancement_giving_intelligence") {
      return MOCK_AGENTS.filter((a) => a.roleKey === "advancement");
    }
    if (scope.workspaceScopeId === "student_lifecycle_ai") {
      return MOCK_AGENTS.filter(
        (a) =>
          a.roleKey === "admissions" ||
          a.roleKey === "registrar" ||
          a.roleKey === "student-success" ||
          a.roleKey === "career-services" ||
          a.roleKey === "alumni-engagement"
      );
    }
    return MOCK_AGENTS;
  }, [context?.appId, context?.workspaceId]);

  const rolesInWorkspace = React.useMemo(() => {
    const roles = [...new Set(agentsInWorkspace.map((a) => roleLabelFromKey(a.roleKey)))];
    return roles.sort((a, b) => ROLES.indexOf(a) - ROLES.indexOf(b));
  }, [agentsInWorkspace]);

  // Reset role filter if it's no longer valid for this workspace
  React.useEffect(() => {
    if (
      selectedRole !== "All" &&
      !rolesInWorkspace.includes(selectedRole)
    ) {
      setSelectedRole("All");
    }
  }, [selectedRole, rolesInWorkspace]);

  const filteredAgents = agentsInWorkspace.filter((agent: MockAgent) => {
    if (!isAllRoles && roleLabelFromKey(agent.roleKey) !== selectedRole) return false;
    if (statusFilter !== "all" && agent.status !== statusFilter) return false;
    if (typeFilter !== "all" && agent.type !== typeFilter) return false;
    if (
      search &&
      !agent.name.toLowerCase().includes(search.toLowerCase()) &&
      !agent.purpose.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {isAllRoles ? "Agents" : `Agents — ${selectedRole}`}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isAllRoles
              ? "Create, monitor, and manage agentic AI that acts on your behalf."
              : ROLE_COPY[selectedRole as Role].subtitle}
          </p>
          {!isAllRoles && (
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              {ROLE_COPY[selectedRole as Role].bullets.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Link
            href={`${basePath}/agents/new`}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Create Agent
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Search & Filters</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700">Roles:</label>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
            >
              <option value="All">All roles</option>
              {rolesInWorkspace.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700">Status:</label>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AgentStatus | "all")}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700">Agent Type:</label>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AgentTypeFilter)}
            >
              <option value="all">All</option>
              <option value="AUTONOMOUS">Autonomous</option>
              <option value="FLOW">Flow Builder</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {viewAllTemplates
              ? "All agent templates"
              : "Recommended for this workspace"}
          </h2>
          <span className="text-xs text-gray-500">
            Jump-start with a pre-built pattern.
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleTemplates.map((tpl) => {
            const allowed = isTemplateAllowedInContext(tpl, context ?? {});
            const content = (
              <>
                <TemplateCardBadges template={tpl} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {tpl.role !== "All" ? tpl.role : (tpl.contextContract?.category ?? "")}
                  </span>
                  <AgentTypeBadge type={tpl.type as AgentType} />
                </div>
                <span className="text-sm font-medium text-gray-900">{tpl.name}</span>
                <span className="text-xs text-gray-600 line-clamp-2">{tpl.description}</span>
                <span className="mt-1 text-xs font-medium text-gray-700">
                  {allowed ? "Use template →" : "Not available in this workspace"}
                </span>
              </>
            );
            return allowed ? (
              <Link
                key={tpl.key}
                href={`${basePath}/agents/new?template=${tpl.key}`}
                className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:border-gray-300 hover:bg-gray-100"
              >
                {content}
              </Link>
            ) : (
              <div
                key={tpl.key}
                className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left opacity-75"
              >
                {content}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setViewAllTemplates(!viewAllTemplates)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {viewAllTemplates ? "Show recommended for this workspace" : "View all agent templates →"}
          </button>
          <span className="mx-2 text-gray-300">|</span>
          <Link
            href={`${basePath}/templates`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Template library
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Your agents</h2>
          <p className="text-xs text-gray-500">
            {filteredAgents.length} agents{search ? " (filtered)" : ""}.
          </p>
        </div>
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No agents match your current filters.
            </p>
            <p className="max-w-sm text-xs text-gray-500">
              Try clearing your search or adjusting the role, status, and type filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-2">Agent Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Purpose</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Last Run</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top font-medium text-gray-900">
                      {agent.name}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      <AgentTypeBadge type={agent.type} />
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {roleLabelFromKey(agent.roleKey)}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {agent.purpose}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {renderStatusPill(agent.status as AgentStatus)}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {agent.lastRun ?? "Not run yet"}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-xs">
                      <Link
                        href={`${basePath}/agents/${agent.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
