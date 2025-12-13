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

  // Load from localStorage on mount and listen for changes from other components
  useEffect(() => {
    if (!workspaceId || typeof window === 'undefined') {
      setModeState(defaultMode);
      return;
    }

    const storageKey = `${STORAGE_PREFIX}${workspaceId}`;
    
    const loadFromStorage = () => {
      const stored = window.localStorage.getItem(storageKey);
      
      // Validate stored value
      if (stored === 'operator' || stored === 'leadership') {
        setModeState(stored);
      } else {
        setModeState(defaultMode);
      }
    };

    // Load initial value
    loadFromStorage();

    // Listen for storage events (changes from other components/tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        if (e.newValue === 'operator' || e.newValue === 'leadership') {
          setModeState(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events for same-tab updates (storage event only fires across tabs)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === storageKey) {
        loadFromStorage();
      }
    };

    window.addEventListener('workspaceModeChange' as any, handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workspaceModeChange' as any, handleCustomStorageChange);
    };
  }, [workspaceId, defaultMode]);

  const setMode = (newMode: WorkingMode) => {
    if (!workspaceId || typeof window === 'undefined') return;
    
    setModeState(newMode);
    const storageKey = `${STORAGE_PREFIX}${workspaceId}`;
    window.localStorage.setItem(storageKey, newMode);
    
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('workspaceModeChange', {
      detail: { key: storageKey, value: newMode }
    }));
  };

  return { mode, setMode };
}

