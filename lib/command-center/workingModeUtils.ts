/**
 * Working mode utilities for normalization and backwards compatibility
 */

export type WorkingMode = 'team' | 'leadership';

/**
 * Normalizes a working mode value to the canonical form.
 * Accepts legacy 'operator' value for backwards compatibility.
 * Always returns 'team' | 'leadership'
 */
export function normalizeWorkingMode(mode: string | undefined | null): WorkingMode {
  if (mode === 'operator' || mode === 'team') {
    return 'team';
  }
  if (mode === 'leadership') {
    return 'leadership';
  }
  // Default to 'team' if invalid
  return 'team';
}

/**
 * Checks if a mode value is valid (including legacy 'operator')
 */
export function isValidWorkingMode(mode: string | undefined | null): mode is WorkingMode | 'operator' {
  return mode === 'team' || mode === 'operator' || mode === 'leadership';
}





