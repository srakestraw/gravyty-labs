'use client';

import React, { useEffect, useMemo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { useAppChrome } from '@/app/(shell)/contexts/app-chrome-context';

interface FocusModePageProps {
  enabled: boolean;
  onExit: () => void;
  hideChrome?: {
    header?: boolean;
    sidebar?: boolean;
    workingMode?: boolean;
  };
  topBar?: ReactNode;
  hideHeader?: boolean;
  children: ReactNode;
}

/**
 * Reusable page-level Focus Mode wrapper.
 * Hides app chrome and renders a minimal top bar when enabled.
 * Completely independent of Game Plan or any page-specific content.
 */
export function FocusModePage({
  enabled,
  onExit,
  hideChrome = {
    header: true,
    sidebar: true,
    workingMode: true,
  },
  topBar,
  hideHeader = false,
  children,
}: FocusModePageProps) {
  const { setChromeVisibility } = useAppChrome();

  // Memoize hideChrome to prevent unnecessary re-renders
  const memoizedHideChrome = useMemo(() => hideChrome, [
    hideChrome.header,
    hideChrome.sidebar,
    hideChrome.workingMode,
  ]);

  // Control chrome visibility based on focus mode
  useEffect(() => {
    if (enabled) {
      setChromeVisibility({
        header: !memoizedHideChrome.header,
        sidebar: !memoizedHideChrome.sidebar,
        workingMode: !memoizedHideChrome.workingMode,
      });
    } else {
      // Reset to default (all visible) when exiting focus mode
      setChromeVisibility({
        header: true,
        sidebar: true,
        workingMode: true,
      });
    }

    // Cleanup: reset chrome visibility when component unmounts or when enabled changes
    return () => {
      setChromeVisibility({
        header: true,
        sidebar: true,
        workingMode: true,
      });
    };
  }, [enabled, memoizedHideChrome, setChromeVisibility]);

  // Escape key to exit focus mode
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [enabled, onExit]);

  if (enabled) {
    return (
      <div className="flex flex-col h-full">
        {/* Minimal Focus Mode Top Bar */}
        {!hideHeader && (
          <header className="flex items-center justify-between px-4 h-14 border-b bg-background flex-shrink-0">
            {topBar || (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-sm"
              >
                <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </header>
        )}

        {/* Focus Mode Content - renders page content as-is */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  // Not in focus mode: render children normally
  return <>{children}</>;
}


