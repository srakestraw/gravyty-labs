/**
 * Slack notification stubs for agent-ops (SLA breach, approvals backlog).
 * No PII; deep links only. No Slack OAuth in this step.
 * TODO: Production: wire to existing Slack integration if present; otherwise
 * implement channel webhook or OAuth app with channel scope.
 */

/** Configured channel ID or name for agent-ops alerts (env or config). */
const SLACK_AGENT_OPS_CHANNEL = process.env.SLACK_AGENT_OPS_CHANNEL ?? "";

/**
 * Notify on SLA breach. Payload: workspaceId, itemId, deep link. No message bodies or PII.
 */
export function notifySlaBreach(workspaceId: string, itemId: string, deepLink: string): void {
  if (!SLACK_AGENT_OPS_CHANNEL) return; // no-op when not configured
  // TODO: Post to Slack channel: e.g. "SLA breached" + deepLink, workspaceId, itemId
  console.debug("[notifications/slack] SLA breach stub", { workspaceId, itemId, deepLink });
}

/**
 * Notify when approvals backlog exceeds threshold. Summary only; no PII.
 */
export function notifyApprovalsBacklog(workspaceId: string, count: number, deepLink: string): void {
  if (!SLACK_AGENT_OPS_CHANNEL) return;
  // TODO: Post to Slack channel: e.g. "Approvals backlog: N items" + deepLink
  console.debug("[notifications/slack] Approvals backlog stub", { workspaceId, count, deepLink });
}

/**
 * Notify on ERROR severity item created/updated. No PII; include deep link.
 */
export function notifyErrorSeverityItem(workspaceId: string, itemId: string, deepLink: string): void {
  if (!SLACK_AGENT_OPS_CHANNEL) return;
  // TODO: Post to Slack channel
  console.debug("[notifications/slack] ERROR severity stub", { workspaceId, itemId, deepLink });
}
