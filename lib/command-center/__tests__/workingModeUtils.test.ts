/**
 * Unit tests for working mode normalization
 * Verifies backwards compatibility with legacy 'operator' value
 */

import { normalizeWorkingMode } from '../workingModeUtils';

describe('normalizeWorkingMode', () => {
  it('normalizes "operator" to "team"', () => {
    expect(normalizeWorkingMode('operator')).toBe('team');
  });

  it('normalizes "team" to "team"', () => {
    expect(normalizeWorkingMode('team')).toBe('team');
  });

  it('normalizes "leadership" to "leadership"', () => {
    expect(normalizeWorkingMode('leadership')).toBe('leadership');
  });

  it('defaults to "team" for invalid values', () => {
    expect(normalizeWorkingMode('invalid')).toBe('team');
    expect(normalizeWorkingMode(null)).toBe('team');
    expect(normalizeWorkingMode(undefined)).toBe('team');
  });
});









