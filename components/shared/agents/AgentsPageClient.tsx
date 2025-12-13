"use client";

import * as React from "react";
import Link from "next/link";
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';

type RoleKey =
  | "admissions"
  | "registrar"
  | "studentSuccess"
  | "careerServices"
  | "alumniEngagement"
  | "advancement";

type Role =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

type RoleFilter = Role | "All";

type AgentStatus = "active" | "paused" | "error";
type AgentType = "proactive" | "on-demand" | "workflow";

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
  {
    subtitle: string;
    bullets: string[];
  }
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

interface AgentTemplate {
  id: string;
  name: string;
  role: RoleKey;
  summary: string;
}

interface Agent {
  id: string;
  name: string;
  role: RoleKey;
  purpose: string;
  status: AgentStatus;
  lastRun: string | null; // null = never run
  priorityWeight?: 1 | 2 | 3 | 4 | 5; // optional for backward compatibility
}

const agentTemplates: AgentTemplate[] = [
  {
    id: "template-transcript-collector",
    name: "Transcript Collector Agent",
    role: "admissions",
    summary: "Automatically checks SIS for missing transcripts, sends reminders, and updates student records.",
  },
  {
    id: "template-document-intake",
    name: "Document Intake Agent",
    role: "registrar",
    summary: "Collects and validates required documents across Admissions, Registrar, or Financial Aid.",
  },
  {
    id: "template-donor-recovery",
    name: "Donor Recovery Agent",
    role: "advancement",
    summary: "Identifies LYBUNT/SYBUNT donors, triggers outreach, and monitors follow-ups.",
  },
  {
    id: "template-registration-blockers",
    name: "Registration Blocker Resolution Agent",
    role: "registrar",
    summary: "Detects registration blockers, notifies students, and escalates unresolved items.",
  },
];

const agents: Agent[] = [
  {
    id: "agent-transcript-helper",
    name: "Transcript Helper Agent",
    role: "admissions",
    purpose: "Clears missing transcripts and sends nudges.",
    status: "active",
    lastRun: "12 min ago",
    priorityWeight: 4,
  },
  {
    id: "agent-registration-requirements",
    name: "Registration Requirements Agent",
    role: "registrar",
    purpose: "Flags holds and notifies students.",
    status: "active",
    lastRun: "47 min ago",
    priorityWeight: 4,
  },
  {
    id: "agent-high-intent-prospect",
    name: "High-Intent Prospect Agent",
    role: "admissions",
    purpose: "Surfaces high-intent prospects for outreach.",
    status: "paused",
    lastRun: null,
    priorityWeight: 3,
  },
  {
    id: "agent-donor-warmup",
    name: "Donor Warm-Up Agent",
    role: "advancement",
    purpose: "Sends warm-up emails and scores replies.",
    status: "active",
    lastRun: "3 hours ago",
    priorityWeight: 2,
  },
  {
    id: "agent-international-visa",
    name: "International Visa Docs Agent",
    role: "admissions",
    purpose: "Identifies missing I-20 / visa documents.",
    status: "error",
    lastRun: "1 hour ago",
    priorityWeight: 5,
  },
];

const roleLabelFromKey = (key: RoleKey): Role => {
  switch (key) {
    case "admissions": return "Admissions";
    case "registrar": return "Registrar";
    case "studentSuccess": return "Student Success";
    case "careerServices": return "Career Services";
    case "alumniEngagement": return "Alumni Engagement";
    case "advancement": return "Advancement";
    default: return "Admissions";
  }
};

const roleKeyFromRole = (role: Role): RoleKey => {
  switch (role) {
    case "Admissions": return "admissions";
    case "Registrar": return "registrar";
    case "Student Success": return "studentSuccess";
    case "Career Services": return "careerServices";
    case "Alumni Engagement": return "alumniEngagement";
    case "Advancement": return "advancement";
  }
};

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

  const isAllRoles = selectedRole === "All";

  // Filter agents by role
  const filteredAgents = agents.filter((agent) => {
    if (!isAllRoles) {
      const agentRole = roleLabelFromKey(agent.role);
      if (agentRole !== selectedRole) return false;
    }
    if (statusFilter !== "all" && agent.status !== statusFilter) return false;
    if (
      search &&
      !agent.name.toLowerCase().includes(search.toLowerCase()) &&
      !agent.purpose.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter templates by role
  const visibleTemplates = isAllRoles
    ? agentTemplates
    : agentTemplates.filter((tpl) => roleLabelFromKey(tpl.role) === selectedRole);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header */}
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

      {/* Search & Filters */}
      <section className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Search & Filters</h2>
        
        {/* Search and Filters Row */}
        <div className="flex items-end gap-4">
          {/* Search */}
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Roles Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700">Roles:</label>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
            >
              <option value="All">All roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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
        </div>
      </section>

      {/* Recommended Templates */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {isAllRoles
              ? "Recommended agent templates"
              : `Recommended agent templates for ${selectedRole}`}
          </h2>
          <span className="text-xs text-gray-500">
            Jump-start with a pre-built pattern.
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:border-gray-300 hover:bg-gray-100"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {roleLabelFromKey(tpl.role)}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {tpl.name}
              </span>
              <span className="text-xs text-gray-600 line-clamp-2">
                {tpl.summary}
              </span>
              <span className="mt-1 text-xs font-medium text-gray-700">
                Use template →
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
          <Link
            href={`${basePath}/templates`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all agent templates →
          </Link>
        </div>
      </section>

      {/* Agents Table */}
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
              Try clearing your search or adjusting the role and status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-2">Agent Name</th>
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
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {roleLabelFromKey(agent.role)}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {agent.purpose}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {renderStatusPill(agent.status)}
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

