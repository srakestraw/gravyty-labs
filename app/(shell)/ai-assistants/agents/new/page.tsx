"use client";

import * as React from "react";
import { AgentForm } from "../_components/agent-form";

type Role =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

type AgentTemplateKey =
  | "stalled-applicant-recovery"
  | "missing-document-followup"
  | "melt-prevention"
  | "registration-blocker-resolution"
  | "at-risk-early-warning"
  | "internship-application-coach"
  | "volunteer-activation"
  | "lybunt-recovery"
  | "blank";

const ROLE_TEMPLATES: Record<Role, { key: AgentTemplateKey; name: string; description: string }[]> = {
  Admissions: [
    {
      key: "stalled-applicant-recovery",
      name: "Stalled Applicant Recovery",
      description: "Identify and re-engage applicants who have stopped progressing.",
    },
    {
      key: "missing-document-followup",
      name: "Missing Document Follow-up",
      description: "Track and nudge applicants who are missing required documents.",
    },
    {
      key: "melt-prevention",
      name: "Melt Prevention",
      description: "Monitor admitted-but-not-enrolled students and reduce melt risk.",
    },
  ],
  Registrar: [
    {
      key: "registration-blocker-resolution",
      name: "Registration Blocker Resolution",
      description: "Identify and resolve holds and blockers that prevent registration.",
    },
  ],
  "Student Success": [
    {
      key: "at-risk-early-warning",
      name: "At-Risk Early Warning",
      description: "Surface students showing early signs of academic or engagement risk.",
    },
  ],
  "Career Services": [
    {
      key: "internship-application-coach",
      name: "Internship Application Coach",
      description: "Help students move from interest to completed internship applications.",
    },
  ],
  "Alumni Engagement": [
    {
      key: "volunteer-activation",
      name: "Volunteer Activation Agent",
      description: "Identify and activate alumni likely to respond to volunteer opportunities.",
    },
  ],
  Advancement: [
    {
      key: "lybunt-recovery",
      name: "LYBUNT Recovery",
      description: "Find last-year-but-not-this-year donors and drive re-engagement.",
    },
  ],
};

const BLANK_TEMPLATE = {
  key: "blank" as const,
  name: "Blank Agent",
  description: "Start from scratch with no pre-filled configuration.",
};

export default function NewAgentPage() {
  // Default to Admissions if no role is provided
  // In a real app, this might come from user context or URL params
  const role: Role = "Admissions";

  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState<AgentTemplateKey | null>(null);

  const templatesForRole = React.useMemo(() => {
    return [...(ROLE_TEMPLATES[role] ?? []), BLANK_TEMPLATE];
  }, [role]);

  const selectedTemplate =
    templatesForRole.find((t) => t.key === selectedTemplateKey) ?? null;

  // Build initial agent data from template
  const initialAgentConfig = React.useMemo(() => {
    if (!selectedTemplate || selectedTemplate.key === "blank") {
      return {
        name: "",
        purpose: "",
        role,
        goal: "",
      };
    }

    // Outcome-focused defaults based on template
    switch (selectedTemplate.key) {
      case "stalled-applicant-recovery":
        return {
          name: "Stalled Applicant Recovery",
          purpose: "Automatically identify and re-engage stalled applicants.",
          role,
          goal: "Reduce stalled applicants and inactivity",
        };
      case "missing-document-followup":
        return {
          name: "Missing Document Follow-up",
          purpose: "Help applicants complete their required documents on time.",
          role,
          goal: "Improve document submission timelines",
        };
      case "melt-prevention":
        return {
          name: "Melt Prevention",
          purpose: "Protect yield by monitoring melt risk before enrollment.",
          role,
          goal: "Reduce melt risk before enrollment",
        };
      case "registration-blocker-resolution":
        return {
          name: "Registration Blocker Resolution",
          purpose: "Reduce registration blockers and holds.",
          role,
          goal: "Reduce registration blockers and improve on-time enrollment rates",
        };
      case "at-risk-early-warning":
        return {
          name: "At-Risk Early Warning",
          purpose: "Spot students who may be at risk earlier.",
          role,
          goal: "Reduce academic risk through early identification",
        };
      case "internship-application-coach":
        return {
          name: "Internship Application Coach",
          purpose: "Help students complete key steps toward internships.",
          role,
          goal: "Increase internship and job placement rates",
        };
      case "volunteer-activation":
        return {
          name: "Volunteer Activation Agent",
          purpose: "Identify and activate alumni likely to volunteer.",
          role,
          goal: "Improve volunteer and mentorship activation",
        };
      case "lybunt-recovery":
        return {
          name: "LYBUNT Recovery",
          purpose: "Re-engage donors who gave last year but not this year.",
          role,
          goal: "Improve donor retention (LYBUNT/SYBUNT)",
        };
      default:
        return {
          name: "",
          purpose: "",
          role,
          goal: "",
        };
    }
  }, [selectedTemplate, role]);

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
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Recommended for your role ({role})
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {templatesForRole.map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => setSelectedTemplateKey(template.key)}
                className={[
                  "flex flex-col items-start rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  selectedTemplateKey === template.key
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white",
                ].join(" ")}
              >
                <div className="font-medium">
                  {template.name}
                  {template.key === "blank" && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700">
                      Blank
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] opacity-80">{template.description}</p>
              </button>
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

