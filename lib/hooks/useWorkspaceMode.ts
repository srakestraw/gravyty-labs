'use client';

import { useState, useEffect } from 'react';
import type { WorkingMode } from '@/app/(shell)/student-lifecycle/lib/workspaces';

const STORAGE_PREFIX = 'workspaceMode:';

/**
 * Shared hook for managing workspace working mode state.
 * Persists mode selection per user per workspace in localStorage.
 * 
 * @param workspaceId - The workspace ID (e.g., 'admissions')
 * @param defaultMode - Default mode if no stored value exists (defaults to 'operator')
 * @returns Object with current mode and setter function
 */
export function useWorkspaceMode(
  workspaceId: string | undefined,
  defaultMode: WorkingMode = 'operator'
): { mode: WorkingMode; setMode: (mode: WorkingMode) => void } {
  const [mode, setModeState] = useState<WorkingMode>(defaultMode);

  // Load from localStorage on mount
  useEffect(() => {
    if (!workspaceId || typeof window === 'undefined') {
      setModeState(defaultMode);
      return;
    }

    const storageKey = `${STORAGE_PREFIX}${workspaceId}`;
    const stored = window.localStorage.getItem(storageKey);
    
    // Validate stored value
    if (stored === 'operator' || stored === 'leadership') {
      setModeState(stored);
    } else {
      setModeState(defaultMode);
    }
  }, [workspaceId, defaultMode]);

  const setMode = (newMode: WorkingMode) => {
    if (!workspaceId || typeof window === 'undefined') return;
    
    setModeState(newMode);
    const storageKey = `${STORAGE_PREFIX}${workspaceId}`;
    window.localStorage.setItem(storageKey, newMode);
  };

  return { mode, setMode };
}

