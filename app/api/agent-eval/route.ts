import { NextRequest, NextResponse } from "next/server";
import { getAgent, getNarrativeProfile } from "@/lib/agents/store";
import { requirePermission, apiError, logAgentEvent } from "@/lib/agents/api-helpers";
import type { NarrativeProfile } from "@/lib/agents/api-types";

/** Simple keyword-based topic detection (allowlist of phrases per topic). */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Deadlines: ["deadline", "due date", "submit by", "before"],
  Documents: ["document", "transcript", "form", "upload", "missing"],
  "Financial aid": ["financial aid", "fafsa", "scholarship", "loan", "aid"],
  Holds: ["hold", "registrar", "clear"],
  Enrollment: ["enroll", "registration", "enrollment"],
  "Academic progress": ["gpa", "grades", "progress", "academic"],
  Events: ["event", "webinar", "session", "workshop"],
};

function detectTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) found.push(topic);
  }
  return [...new Set(found)];
}

/** Detect personalization placeholders like {{First name}}, {{Deadline date}}. */
function detectPersonalizationFields(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
  return matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim());
}

export interface AgentEvalResult {
  outcome: "PASS" | "FAIL";
  profileName?: string;
  profileVersion?: number;
  topicsDetected: string[];
  checks: {
    blockedTopicDetected: boolean;
    allowedTopicsRespected: boolean;
    personalizationAllowedOnly: boolean;
    narrativeConfidenceLow?: boolean;
  };
  remediation?: string;
}

/**
 * POST /api/agent-eval
 * Body: { agentId: string, sampleContext?: { messagePreview?: string } }
 * Returns eval result: topic detection, allowlist/denylist, personalization checks.
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "VIEW_AGENTS");
  if (forbidden) return forbidden;
  try {
    const body = await request.json();
    const { agentId, sampleContext } = body as { agentId: string; sampleContext?: { messagePreview?: string } };
    if (!agentId) return apiError("agentId is required", 400);

    const agent = getAgent(agentId);
    if (!agent) return apiError("Agent not found", 404);

    const profileId = agent.narrative?.profileId;
    const profile: NarrativeProfile | undefined = profileId ? getNarrativeProfile(profileId) : undefined;
    const messagePreview = sampleContext?.messagePreview ?? "Sample message with deadline and document reminder.";
    const topicsDetected = detectTopics(messagePreview);
    const personalizationUsed = detectPersonalizationFields(messagePreview);

    const blockedTopics = profile
      ? [...(profile.blockedTopics ?? []), ...(agent.narrative?.overrides?.blockedTopics ?? [])]
      : [];
    const allowedTopics = profile
      ? [...(profile.allowedTopics ?? []), ...(agent.narrative?.overrides?.allowedTopics ?? [])]
      : [];
    const allowedPersonalization = profile
      ? [...(profile.allowedPersonalizationFields ?? []), ...(agent.narrative?.overrides?.allowedPersonalizationFields ?? [])]
      : [];

    const blockedTopicDetected = blockedTopics.length > 0 && topicsDetected.some((t) => blockedTopics.includes(t));
    const hasAllowedTopics = allowedTopics.length === 0 || topicsDetected.some((t) => allowedTopics.includes(t));
    const allowedTopicsRespected = !blockedTopicDetected && (allowedTopics.length === 0 || topicsDetected.every((t) => allowedTopics.includes(t)));
    const personalizationAllowedOnly =
      allowedPersonalization.length === 0 ||
      personalizationUsed.every((p) => allowedPersonalization.some((a) => a.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(a.toLowerCase())));

    const failReasons: string[] = [];
    if (blockedTopicDetected) failReasons.push("Message touches a blocked topic.");
    if (!allowedTopicsRespected) failReasons.push("Message uses topics not on the allowed list.");
    if (!personalizationAllowedOnly) failReasons.push("Message uses personalization fields not allowed by the narrative profile.");
    const outcome = failReasons.length === 0 ? "PASS" : "FAIL";
    const remediation =
      failReasons.length > 0
        ? `Remediation: ${failReasons.join(" ")} Update the message or narrative profile allowlist/blocklist.`
        : undefined;

    const result: AgentEvalResult = {
      outcome,
      profileName: profile?.name,
      profileVersion: profile?.version,
      topicsDetected,
      checks: {
        blockedTopicDetected,
        allowedTopicsRespected,
        personalizationAllowedOnly,
      },
      remediation,
    };

    logAgentEvent("agent_eval_run", { agentId, outcome, topicsDetected: result.topicsDetected.length });
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/agent-eval", e);
    return apiError("Failed to run agent eval", 500);
  }
}
