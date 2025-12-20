'use client';

import { useState, useEffect } from 'react';

/**
 * Feature flag utilities
 * In v1, these are mocked but structured for future backend integration
 */

const MOCK_FEATURE_FLAGS: Record<string, boolean> = {
  ai_assistants: true, // Enable AI Assistants for v1
  queueReviewMode: true, // Enable Review Mode for Queue
  queueFocusWorkbenchV2: true, // Enable Superhuman-style Focus Mode workbench
};

/**
 * Check if a feature flag is enabled (hook)
 * @param flag - Feature flag name
 * @returns true if enabled, false otherwise
 */
export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState<boolean>(MOCK_FEATURE_FLAGS[flag] ?? false);

  useEffect(() => {
    // In v1, this is a simple mock
    // In production, this would fetch from a backend or config service
    setEnabled(MOCK_FEATURE_FLAGS[flag] ?? false);
  }, [flag]);

  return enabled;
}

/**
 * Get all enabled feature flags
 * @returns Record of feature flags
 */
export function getFeatureFlags(): Record<string, boolean> {
  return { ...MOCK_FEATURE_FLAGS };
}

