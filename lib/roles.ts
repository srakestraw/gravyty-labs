/**
 * Role checking utilities
 * In v1, roles are mocked but structured for future backend integration
 */

export type Role = 
  | 'assistant_admin'
  | 'product_admin'
  | 'compliance_officer'
  | 'viewer'
  | 'admin';

/**
 * Mock user roles - in production, this would come from the backend/auth system
 * For now, we'll check user email or use a mock
 */
const MOCK_USER_ROLES: Record<string, Role[]> = {
  // Example: map user emails to roles
  // In production, this would be fetched from the backend
};

/**
 * Get user roles (mocked for v1)
 * @param userId - User ID or email
 * @returns Array of roles
 */
export function getUserRoles(userId?: string | null): Role[] {
  if (!userId) return [];
  
  // In v1, return mock roles based on email or default to admin for testing
  // In production, this would query the backend
  if (userId.includes('@')) {
    return MOCK_USER_ROLES[userId] || ['assistant_admin', 'product_admin'];
  }
  
  return ['assistant_admin', 'product_admin'];
}

/**
 * Check if user has a specific role
 * @param userId - User ID or email
 * @param role - Role to check
 * @returns true if user has the role
 */
export function hasRole(userId: string | null | undefined, role: Role): boolean {
  const roles = getUserRoles(userId);
  return roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 * @param userId - User ID or email
 * @param roles - Array of roles to check
 * @returns true if user has any of the roles
 */
export function hasAnyRole(userId: string | null | undefined, roles: Role[]): boolean {
  const userRoles = getUserRoles(userId);
  return roles.some(role => userRoles.includes(role));
}

/**
 * Check if user can access AI Assistants
 * Requires: assistant_admin, product_admin, or compliance_officer
 */
export function canAccessAIAssistants(userId: string | null | undefined): boolean {
  return hasAnyRole(userId, ['assistant_admin', 'product_admin', 'compliance_officer']);
}

/**
 * Check if user can create/edit assistants
 * Requires: assistant_admin or product_admin
 */
export function canManageAssistants(userId: string | null | undefined): boolean {
  return hasAnyRole(userId, ['assistant_admin', 'product_admin']);
}

/**
 * Check if user can edit guardrails
 * Requires: assistant_admin or product_admin
 */
export function canEditGuardrails(userId: string | null | undefined): boolean {
  return hasAnyRole(userId, ['assistant_admin', 'product_admin']);
}





