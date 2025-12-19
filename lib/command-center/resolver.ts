/**
 * Shared resolver for Command Center content instances.
 * Maps (appId, workspaceId, mode) to unique instance keys.
 */

import type { WorkingMode } from './workingModeUtils';
import { normalizeWorkingMode } from './workingModeUtils';

export type { WorkingMode } from './workingModeUtils';

export type CommandCenterInstanceKey = string;

/**
 * Resolves a Command Center content instance key from app, workspace, and mode.
 * 
 * @param appId - The app ID (e.g., 'student-lifecycle', 'career-services')
 * @param workspaceId - The workspace ID (e.g., 'admissions', 'registrar')
 * @param mode - The working mode ('team' or 'leadership', accepts legacy 'operator' for backwards compatibility)
 * @returns Instance key in format: <appId>:<workspaceId>:<mode>
 */
export function resolveCommandCenterInstance(
  appId: string | undefined,
  workspaceId: string | undefined,
  mode: WorkingMode | 'operator' // Accept legacy 'operator' for backwards compatibility
): CommandCenterInstanceKey {
  // Normalize mode: accept 'operator' or 'team', always return 'team' or 'leadership'
  const normalizedMode: WorkingMode = normalizeWorkingMode(mode);
  
  // For single-app cases (Career Services, Alumni Engagement, Advancement, Housing),
  // use the appId as both app and workspace if workspaceId is not provided
  const effectiveAppId = appId || 'unknown';
  const effectiveWorkspaceId = workspaceId || appId || 'unknown';
  
  return `${effectiveAppId}:${effectiveWorkspaceId}:${normalizedMode}`;
}

/**
 * Checks if an instance key represents an existing content instance.
 * Used to determine whether to render existing content or placeholder.
 */
export function isExistingInstance(key: CommandCenterInstanceKey): boolean {
  const existingInstances: CommandCenterInstanceKey[] = [
    'student-lifecycle:admissions:team',
    'student-lifecycle:admissions:leadership',
    'student-lifecycle:registrar:team',
    'student-lifecycle:student-success:team',
    'student-lifecycle:financial-aid:team',
    'student-lifecycle:housing:team',
    'career-services:career-services:team',
    'alumni-engagement:alumni-engagement:team',
    'advancement:advancement:team',
    'advancement:advancement:leadership',
    // Legacy support: also accept 'operator' keys for backwards compatibility
    'student-lifecycle:admissions:operator',
    'student-lifecycle:registrar:operator',
    'student-lifecycle:student-success:operator',
    'student-lifecycle:financial-aid:operator',
    'student-lifecycle:housing:operator',
    'career-services:career-services:operator',
    'alumni-engagement:alumni-engagement:operator',
    'advancement:advancement:operator',
  ];
  
  return existingInstances.includes(key);
}

