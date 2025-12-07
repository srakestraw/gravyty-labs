"use client";

import * as React from "react";
import { AgentForm } from "../_components/agent-form";
import {
  AGENT_TEMPLATES,
  type AgentRole,
  type AgentTemplate,
} from "@/app/(shell)/ai-assistants/templates/agent-templates";
import { TemplateCard } from "@/app/(shell)/ai-assistants/templates/TemplateCard";

const ROLE_OPTIONS: AgentRole[] = [
  "Admissions",
  "Registrar",
  "Student Success",
  "Career Services",
  "Alumni Engagement",
  "Advancement",
];

export default function NewAgentPage() {
  // Default to Admissions if no role is provided
  // In a real app, this might come from user context or URL params
  const [selectedRole, setSelectedRole] = React.useState<AgentRole>("Admissions");
  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState<string | null>(null);

  // Compute the templates for the role, always placing blank first
  const templatesForRole: AgentTemplate[] = React.useMemo(() => {
    const forRole = AGENT_TEMPLATES.filter(
      (t) => t.role === selectedRole || t.role === "All"
    );

    const blank = forRole.find((t) => t.key === "blank");
    const rest = forRole.filter((t) => t.key !== "blank");

    return blank ? [blank, ...rest] : rest;
  }, [selectedRole]);

  const selectedTemplate =
    templatesForRole.find((t) => t.key === selectedTemplateKey) ?? null;

  // Build initial agent data from template
  const initialAgentConfig = React.useMemo(() => {
    if (!selectedTemplate || selectedTemplate.key === "blank") {
      return {
        name: "",
        purpose: "",
        role: selectedRole,
        goal: "",
      };
    }

    // Outcome-focused defaults based on template
    switch (selectedTemplate.key) {
      case "stalled-applicant-recovery":
        return {
          name: "Stalled Applicant Recovery",
          purpose: "Automatically identify and re-engage stalled applicants.",
          role: selectedRole,
          goal: "Reduce stalled applicants and inactivity",
        };
      case "missing-document-followup":
        return {
          name: "Missing Document Follow-up",
          purpose: "Help applicants complete their required documents on time.",
          role: selectedRole,
          goal: "Improve document submission timelines",
        };
      case "melt-prevention":
        return {
          name: "Melt Prevention",
          purpose: "Protect yield by monitoring melt risk before enrollment.",
          role: selectedRole,
          goal: "Reduce melt risk before enrollment",
        };
      case "registration-blocker-resolution":
        return {
          name: "Registration Blocker Resolution",
          purpose: "Reduce registration blockers and holds.",
          role: selectedRole,
          goal: "Reduce registration blockers and improve on-time enrollment rates",
        };
      case "at-risk-early-warning":
        return {
          name: "At-Risk Early Warning",
          purpose: "Spot students who may be at risk earlier.",
          role: selectedRole,
          goal: "Reduce academic risk through early identification",
        };
      case "internship-application-coach":
        return {
          name: "Internship Application Coach",
          purpose: "Help students complete key steps toward internships.",
          role: selectedRole,
          goal: "Increase internship and job placement rates",
        };
      case "volunteer-activation":
        return {
          name: "Volunteer Activation Agent",
          purpose: "Identify and activate alumni likely to volunteer.",
          role: selectedRole,
          goal: "Improve volunteer and mentorship activation",
        };
      case "lybunt-recovery":
        return {
          name: "LYBUNT Recovery",
          purpose: "Re-engage donors who gave last year but not this year.",
          role: selectedRole,
          goal: "Improve donor retention (LYBUNT/SYBUNT)",
        };
      default:
        return {
          name: "",
          purpose: "",
          role: selectedRole,
          goal: "",
        };
    }
  }, [selectedTemplate, selectedRole]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create new agent
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Start from a template or a blank agent, then refine the outcome, scope, and actions.
        </p>
      </header>

      {/* STEP 0 — Template or Blank selection */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Step 0 — Choose how to start
        </h2>
        <p className="text-xs text-gray-600">
          Pick a recommended template for your role or start with a blank agent.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Recommended for your role
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
          <div className="grid gap-3 md:grid-cols-2">
            {templatesForRole.map((template) => (
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

      {/* Only show AgentForm after a template is selected */}
      {selectedTemplate && (
        <AgentForm 
          key={selectedTemplateKey} 
          mode="create" 
          initialData={initialAgentConfig} 
        />
      )}
    </div>
  );
}
