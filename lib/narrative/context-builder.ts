/**
 * Narrative Context Builder - Phase 3
 * Builds entity-aware context that maps to Outcome, Moment, Message Intent.
 * Text produced here is used for context embedding (similarity search).
 */

import type { EntityNarrativeContextInput, EntityNarrativeContext } from './types';

/**
 * Builds EntityNarrativeContext from raw inputs.
 * Outcome, moment, message_intent must be set for eligibility; if not provided,
 * they are derived from lifecycle_state / use_case (placeholder logic until taxonomy is fixed).
 */
export function buildEntityNarrativeContext(
  workspace: string,
  sub_workspace: string,
  input: EntityNarrativeContextInput
): EntityNarrativeContext {
  const outcome = input.outcome ?? deriveOutcome(input);
  const moment = input.moment ?? deriveMoment(input);
  const message_intent = input.message_intent ?? deriveMessageIntent(input);

  return {
    workspace,
    sub_workspace,
    outcome,
    moment,
    message_intent,
    role_persona: input.role_persona,
    lifecycle_state: input.lifecycle_state,
    relationship_context: input.relationship_context,
    risk_opportunity_signals: input.risk_opportunity_signals,
    channel: input.channel,
    use_case: input.use_case,
  };
}

/**
 * Produces the text to embed for this context (per contracts.md).
 * Concatenate: role/persona, lifecycle state, relationship context, risk/opportunity signals, channel/use_case.
 */
export function contextToEmbeddingText(context: EntityNarrativeContext): string {
  const parts: string[] = [];
  if (context.role_persona) parts.push(`role: ${context.role_persona}`);
  if (context.lifecycle_state) parts.push(`lifecycle: ${context.lifecycle_state}`);
  if (context.relationship_context) parts.push(`relationship: ${context.relationship_context}`);
  if (context.risk_opportunity_signals?.length) {
    parts.push(`signals: ${context.risk_opportunity_signals.join(', ')}`);
  }
  if (context.channel) parts.push(`channel: ${context.channel}`);
  if (context.use_case) parts.push(`use_case: ${context.use_case}`);
  parts.push(`outcome: ${context.outcome}`, `moment: ${context.moment}`, `intent: ${context.message_intent}`);
  return parts.join(' ');
}

function deriveOutcome(input: EntityNarrativeContextInput): string {
  if (input.use_case) return input.use_case;
  if (input.lifecycle_state) return input.lifecycle_state;
  return 'general';
}

function deriveMoment(input: EntityNarrativeContextInput): string {
  if (input.lifecycle_state) return input.lifecycle_state;
  if (input.risk_opportunity_signals?.length) return input.risk_opportunity_signals[0] ?? 'unknown';
  return 'default';
}

function deriveMessageIntent(input: EntityNarrativeContextInput): string {
  if (input.use_case) {
    const u = input.use_case.toLowerCase();
    if (u.includes('nudge') || u.includes('remind')) return 'reminder';
    if (u.includes('explain')) return 'explain';
    if (u.includes('thank')) return 'thank';
    if (u.includes('ask')) return 'ask';
  }
  return 'nudge';
}
