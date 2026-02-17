/**
 * Data retention policies and cleanup job interface.
 * Message bodies only in MessageArtifacts; allow retention policy. Action logs and audit logs have retention.
 * TODO: Wire to cron/scheduler; run cleanup periodically.
 */

export interface RetentionPolicies {
  messageArtifactsRetentionDays: number;
  actionLogsRetentionDays: number;
  auditLogsRetentionDays: number;
}

export const DEFAULT_RETENTION: RetentionPolicies = {
  messageArtifactsRetentionDays: 30,
  actionLogsRetentionDays: 90,
  auditLogsRetentionDays: 365,
};

/** Cleanup job interface. In-process runner; TODO: cron. */
export interface RetentionCleanupJob {
  run(policies?: Partial<RetentionPolicies>): Promise<{ deleted: { messageArtifacts: number; actionLogs: number; auditLogs: number } }>;
}

function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** In-process retention cleanup. TODO: Wire to cron/scheduler. */
export async function runRetentionCleanup(
  policies: Partial<RetentionPolicies> = {}
): Promise<{ deleted: { messageArtifacts: number; actionLogs: number; auditLogs: number } }> {
  const p = { ...DEFAULT_RETENTION, ...policies };
  const {
    deleteMessageArtifactsOlderThan,
    deleteAgentActionLogsOlderThan,
    deleteAuditLogsOlderThan,
  } = await import("./store");
  const messageArtifacts = deleteMessageArtifactsOlderThan(cutoffDate(p.messageArtifactsRetentionDays));
  const actionLogs = deleteAgentActionLogsOlderThan(cutoffDate(p.actionLogsRetentionDays));
  const auditLogs = deleteAuditLogsOlderThan(cutoffDate(p.auditLogsRetentionDays));
  return { deleted: { messageArtifacts, actionLogs, auditLogs } };
}
