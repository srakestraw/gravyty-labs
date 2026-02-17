/**
 * Advancement Pipeline Assistant - Intent Detection
 *
 * Deterministic regex matching for advancement pipeline prompts.
 * No LLM; used for routing only.
 */

export type AdvancementPipelineIntent =
  | 'LIKELY_TO_GIVE_30'
  | 'PRIORITY_LIST_TODAY'
  | 'STALLED_THIS_WEEK'
  | 'NEEDS_NUDGE'
  | 'AT_RISK_LAPSING'
  | null;

const INTENT_PATTERNS: Array<{ intent: AdvancementPipelineIntent; pattern: RegExp }> = [
  {
    intent: 'LIKELY_TO_GIVE_30',
    pattern: /people\s+likely\s+to\s+give\s+(?:in\s+)?(\d+)?\s*days?|likely\s+to\s+give\s+(?:in\s+)?(\d+)?\s*days?|give\s+in\s+30\s+days/i,
  },
  {
    intent: 'PRIORITY_LIST_TODAY',
    pattern: /build\s+my\s+priority\s+list|priority\s+list\s+for\s+today|today'?s?\s+priority\s+list/i,
  },
  {
    intent: 'STALLED_THIS_WEEK',
    pattern: /who\s+stalled\s+this\s+week|stalled\s+this\s+week|prospects\s+stalled/i,
  },
  {
    intent: 'NEEDS_NUDGE',
    pattern: /who\s+needs\s+a\s+nudge|needs\s+a\s+nudge|nudge\s+to\s+keep\s+going/i,
  },
  {
    intent: 'AT_RISK_LAPSING',
    pattern: /who\s+is\s+at\s+risk\s+of\s+lapsing|at\s+risk\s+of\s+lapsing|risk\s+lapsing/i,
  },
];

/**
 * Detect intent from user prompt (deterministic, no LLM)
 */
export function detectAdvancementPipelineIntent(prompt: string): AdvancementPipelineIntent {
  const trimmed = prompt.trim();
  if (!trimmed) return null;

  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return intent;
    }
  }
  return null;
}

/**
 * Map intent to results route segment
 */
export function intentToResultsRoute(intent: AdvancementPipelineIntent): string | null {
  if (!intent) return null;
  const map: Record<Exclude<AdvancementPipelineIntent, null>, string> = {
    LIKELY_TO_GIVE_30: 'likely-to-give',
    PRIORITY_LIST_TODAY: 'priority-list',
    STALLED_THIS_WEEK: 'stalled-this-week',
    NEEDS_NUDGE: 'needs-nudge',
    AT_RISK_LAPSING: 'at-risk-lapsing',
  };
  return map[intent];
}
