/**
 * Audit Logging for Program Match
 * 
 * Tracks important configuration and publishing changes:
 * - Quiz publish/rollback
 * - Configuration changes
 * - Program updates
 * - Readiness rubric changes
 */

import type { Quiz, Program, ReadinessRubric } from './types';

export type AuditLogAction =
  | 'quiz_published'
  | 'quiz_rolled_back'
  | 'quiz_created'
  | 'quiz_updated'
  | 'program_created'
  | 'program_updated'
  | 'program_archived'
  | 'readiness_rubric_updated'
  | 'config_updated'
  | 'gate_config_updated'
  | 'voice_tone_changed';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditLogAction;
  userId: string;
  userEmail?: string;
  institutionId: string;
  quizId?: string;
  programId?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  metadata?: Record<string, unknown>;
}

// In-memory audit log store (in production, use database)
const auditLogStore: AuditLogEntry[] = [];

/**
 * Create audit log entry
 */
export function createAuditLogEntry(
  action: AuditLogAction,
  userId: string,
  institutionId: string,
  options?: {
    userEmail?: string;
    quizId?: string;
    programId?: string;
    changes?: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
    metadata?: Record<string, unknown>;
  }
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    userId,
    userEmail: options?.userEmail,
    institutionId,
    quizId: options?.quizId,
    programId: options?.programId,
    changes: options?.changes,
    metadata: options?.metadata,
  };

  auditLogStore.push(entry);

  // In production, persist to database
  // await persistAuditLog(entry);

  return entry;
}

/**
 * Log quiz publish
 */
export function logQuizPublish(
  userId: string,
  institutionId: string,
  quiz: Quiz,
  userEmail?: string
): AuditLogEntry {
  return createAuditLogEntry('quiz_published', userId, institutionId, {
    userEmail,
    quizId: quiz.quiz_id,
    metadata: {
      version_id: quiz.version_id,
      question_count: quiz.questions.length,
      status: quiz.status,
    },
  });
}

/**
 * Log quiz rollback
 */
export function logQuizRollback(
  userId: string,
  institutionId: string,
  quizId: string,
  fromVersion: string,
  toVersion: string,
  userEmail?: string
): AuditLogEntry {
  return createAuditLogEntry('quiz_rolled_back', userId, institutionId, {
    userEmail,
    quizId,
    changes: [
      {
        field: 'version_id',
        oldValue: fromVersion,
        newValue: toVersion,
      },
    ],
    metadata: {
      from_version: fromVersion,
      to_version: toVersion,
    },
  });
}

/**
 * Log program update
 */
export function logProgramUpdate(
  userId: string,
  institutionId: string,
  programId: string,
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>,
  userEmail?: string
): AuditLogEntry {
  return createAuditLogEntry('program_updated', userId, institutionId, {
    userEmail,
    programId,
    changes,
  });
}

/**
 * Log configuration change
 */
export function logConfigChange(
  userId: string,
  institutionId: string,
  quizId: string,
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>,
  userEmail?: string
): AuditLogEntry {
  return createAuditLogEntry('config_updated', userId, institutionId, {
    userEmail,
    quizId,
    changes,
  });
}

/**
 * Get audit logs with filters
 */
export function getAuditLogs(filters?: {
  institutionId?: string;
  quizId?: string;
  programId?: string;
  action?: AuditLogAction;
  startDate?: string;
  endDate?: string;
  userId?: string;
}): AuditLogEntry[] {
  let logs = [...auditLogStore];

  if (filters?.institutionId) {
    logs = logs.filter((log) => log.institutionId === filters.institutionId);
  }

  if (filters?.quizId) {
    logs = logs.filter((log) => log.quizId === filters.quizId);
  }

  if (filters?.programId) {
    logs = logs.filter((log) => log.programId === filters.programId);
  }

  if (filters?.action) {
    logs = logs.filter((log) => log.action === filters.action);
  }

  if (filters?.userId) {
    logs = logs.filter((log) => log.userId === filters.userId);
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate);
    logs = logs.filter((log) => new Date(log.timestamp) >= start);
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate);
    logs = logs.filter((log) => new Date(log.timestamp) <= end);
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return logs;
}

/**
 * Get audit log by ID
 */
export function getAuditLog(id: string): AuditLogEntry | null {
  return auditLogStore.find((log) => log.id === id) || null;
}

