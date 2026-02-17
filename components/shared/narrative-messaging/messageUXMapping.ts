/**
 * UX mapping: content-creator-facing labels and choices map to backend (Narrative Asset / Delivery Play).
 * Messages -> NarrativeAsset, Supporting Details -> ProofBlock, Usage Rules -> DeliveryPlay.
 *
 * When used chips (user-facing) -> moment + message_intent (backend):
 * - Re-engagement  -> moment: cultivation (or opportunity), message_intent: reminder
 * - Opportunity    -> moment: solicitation, message_intent: nudge
 * - Follow-up       -> moment: cultivation, message_intent: explain
 * - Stewardship     -> moment: stewardship_touch, message_intent: update
 * - Update          -> moment: stewardship_touch, message_intent: update
 * - General         -> moment: default, message_intent: nudge
 *
 * Use mode (Create form) -> play_category (if creating implicit Delivery Play):
 * - Suggest to staff -> staff_assist (AI recommends to staff)
 * - Auto-send        -> lifecycle_automation
 * - Manual only      -> portfolio_recommendation (staff chooses when to use)
 */

export const WHEN_USED_CHIPS = [
  { id: 're_engagement', label: 'Re-engagement', moment: 'cultivation', message_intent: 'reminder' as const },
  { id: 'opportunity', label: 'Opportunity', moment: 'solicitation', message_intent: 'nudge' as const },
  { id: 'follow_up', label: 'Follow-up', moment: 'cultivation', message_intent: 'explain' as const },
  { id: 'stewardship', label: 'Stewardship', moment: 'stewardship_touch', message_intent: 'update' as const },
  { id: 'update', label: 'Update', moment: 'stewardship_touch', message_intent: 'update' as const },
  { id: 'general', label: 'General', moment: 'default', message_intent: 'nudge' as const },
] as const;

export type WhenUsedId = (typeof WHEN_USED_CHIPS)[number]['id'];

export function getWhenUsedLabel(moment: string, message_intent: string): string {
  const match = WHEN_USED_CHIPS.find(
    (c) => c.moment === moment && c.message_intent === message_intent
  );
  return (match?.label ?? [moment, message_intent].filter(Boolean).join(' / ')) || 'General';
}

export function getWhenUsedFromMomentAndIntent(moment: string, message_intent: string): WhenUsedId {
  const match = WHEN_USED_CHIPS.find(
    (c) => c.moment === moment && c.message_intent === message_intent
  );
  return match?.id ?? 'general';
}

export const USE_MODES = [
  { value: 'suggest_to_staff', label: 'Suggest to staff', play_category: 'staff_assist' as const },
  { value: 'auto_send', label: 'Auto-send', play_category: 'lifecycle_automation' as const },
  { value: 'manual_only', label: 'Manual only', play_category: 'portfolio_recommendation' as const },
] as const;

export type UseModeValue = (typeof USE_MODES)[number]['value'];

export const WHY_NOW_SIGNALS = [
  { id: 'high_propensity', label: 'High propensity' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'recent_event', label: 'Recent event' },
  { id: 'new_portfolio_assignment', label: 'New portfolio assignment' },
  { id: 'no_engagement', label: 'No engagement' },
] as const;

export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'portal_content', label: 'Portal' },
  { value: 'call_script', label: 'Call script' },
  { value: 'in_app', label: 'In-app' },
  { value: 'chat', label: 'Chat' },
] as const;

export const PREVIEW_MODES = ['email', 'sms', 'portal_content', 'call_script'] as const;
