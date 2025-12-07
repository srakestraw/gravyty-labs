'use client';

export const dynamic = 'force-static';

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import {
  AGENT_TEMPLATES,
  type AgentRole,
  type AgentTemplate,
} from "./agent-templates";
import { TemplateCard } from "./TemplateCard";

const ROLE_OPTIONS: AgentRole[] = [
  "Admissions",
  "Registrar",
  "Student Success",
  "Career Services",
  "Alumni Engagement",
  "Advancement",
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = canManageAssistants(user?.email || user?.uid);
  const [selectedRole, setSelectedRole] = React.useState<AgentRole | "All">("All");

  // Filter templates by role
  const filteredTemplates: AgentTemplate[] = React.useMemo(() => {
    if (selectedRole === "All") {
      return AGENT_TEMPLATES.filter((t) => t.key !== "blank");
    }
    return AGENT_TEMPLATES.filter(
      (t) => (t.role === selectedRole || t.role === "All") && t.key !== "blank"
    );
  }, [selectedRole]);

  const handleOpenTemplate = (template: AgentTemplate) => {
    if (canManage) {
      router.push(`/ai-assistants/agents/new?template=${template.key}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
        <p className="text-gray-600 mt-1">
          Choose from pre-configured assistant templates to get started quickly
        </p>
      </div>

      {/* Role Filter */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700">Filter by role:</p>
        <div className="inline-flex gap-1 rounded-full bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setSelectedRole("All")}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              selectedRole === "All"
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-white",
            ].join(" ")}
          >
            All
          </button>
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                selectedRole === role
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-white",
              ].join(" ")}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.key}
            template={template}
            selected={false}
            selectable={false}
            onClickNavigate={canManage ? () => handleOpenTemplate(template) : undefined}
          />
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">About Templates</h3>
        <p className="text-sm text-gray-600">
          Templates provide pre-configured settings and guardrails for common use cases.
          You can customize any template after creating an assistant from it.
        </p>
      </div>
    </div>
  );
}
