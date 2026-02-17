/**
 * Guardrails, approvals, and narrative enforcement.
 */

import type { Agent, NarrativeProfile } from "../api-types";
import type { DraftMessage } from "./types";

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

function detectPersonalizationFields(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
  return matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim());
}

/** Check if message passes narrative: blocked topics, allowed topics, personalization. */
export function checkNarrativePolicy(
  profile: NarrativeProfile,
  overrides: { blockedTopics?: string[]; allowedTopics?: string[]; allowedPersonalizationFields?: string[] } | undefined,
  body: string,
  subject?: string
): { allowed: boolean; topicsDetected: string[]; personalizationUsed: string[]; blockReason?: string } {
  const text = [subject, body].filter(Boolean).join(" ");
  const topicsDetected = detectTopics(text);
  const personalizationUsed = detectPersonalizationFields(text);

  const blockedTopics = [...(profile.blockedTopics ?? []), ...(overrides?.blockedTopics ?? [])];
  const allowedTopics = overrides?.allowedTopics ?? profile.allowedTopics ?? [];
  const allowedPersonalization = overrides?.allowedPersonalizationFields ?? profile.allowedPersonalizationFields ?? [];

  for (const t of topicsDetected) {
    if (blockedTopics.includes(t)) {
      return {
        allowed: false,
        topicsDetected,
        personalizationUsed,
        blockReason: `Blocked topic: ${t}`,
      };
    }
  }
  if (allowedTopics.length > 0 && topicsDetected.some((t) => !allowedTopics.includes(t))) {
    return {
      allowed: false,
      topicsDetected,
      personalizationUsed,
      blockReason: "Topic not in allowed list",
    };
  }
  const personalizationOk =
    allowedPersonalization.length === 0 ||
    personalizationUsed.every((p) =>
      allowedPersonalization.some((a) => a.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(a.toLowerCase()))
    );
  if (!personalizationOk) {
    return {
      allowed: false,
      topicsDetected,
      personalizationUsed,
      blockReason: "Disallowed personalization field used",
    };
  }
  return { allowed: true, topicsDetected, personalizationUsed };
}

/** Whether external message (email/sms) requires approval by agent config. */
export function messageRequiresApproval(agent: Agent): boolean {
  const email = agent.tools?.email;
  const sms = agent.tools?.sms;
  if (email?.requiresApproval === false && sms?.requiresApproval === false) return false;
  return true;
}

/** Whether webhook/SFMC action requires approval. */
export function connectorActionRequiresApproval(agent: Agent, type: "webhook" | "sfmc"): boolean {
  if (type === "webhook") return agent.tools?.webhook?.requiresApproval !== false;
  if (type === "sfmc") return agent.tools?.sfmc?.requiresApproval !== false;
  return true;
}

/** Build a draft message and run narrative check. */
export function buildDraftMessage(
  agent: Agent,
  profile: NarrativeProfile,
  personId: string,
  channel: "EMAIL" | "SMS",
  body: string,
  subject?: string
): DraftMessage {
  const overrides = agent.narrative?.overrides;
  const check = checkNarrativePolicy(profile, overrides, body, subject);
  return {
    channel,
    personId,
    subject,
    body,
    narrativeProfileId: profile.id,
    narrativeVersion: profile.version,
    topicsDetected: check.topicsDetected,
    personalizationFieldsUsed: check.personalizationUsed,
    blocked: !check.allowed,
    blockReason: check.blockReason,
  };
}
