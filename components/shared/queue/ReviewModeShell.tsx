'use client';

import React, { ReactNode, useEffect } from 'react';
import { FocusModePage } from '@/components/shared/ai-platform/FocusModePage';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { isTextInteractionTarget } from './reviewModeKeyboardUtils';

interface ReviewModeShellProps {
  enabled: boolean;
  onExit: () => void;
  topBar?: ReactNode;
  bottomBar?: ReactNode;
  children: ReactNode;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}

/**
 * Review Mode Shell - Provides a minimal, distraction-free layout for reviewing queue items.
 * Hides global chrome and provides top and bottom bars for navigation and actions.
 * 
 * Usage:
 * - Wrap your queue detail content with this component
 * - Provide topBar for split tabs and navigation
 * - Provide bottomBar for action buttons
 * - Use onExit to handle back navigation
 */
export function ReviewModeShell({
  enabled,
  onExit,
  topBar,
  bottomBar,
  children,
  onNavigateNext,
  onNavigatePrev,
}: ReviewModeShellProps) {
  // Arrow key navigation (Review Mode only)
  useEffect(() => {
    if (!enabled || (!onNavigateNext && !onNavigatePrev)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle ArrowUp/ArrowDown
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }

      // Safety guard: don't hijack arrow keys in editable contexts
      if (isTextInteractionTarget(event.target)) {
        return;
      }

      // Navigate based on arrow key
      if (event.key === 'ArrowDown' && onNavigateNext) {
        event.preventDefault();
        event.stopPropagation();
        onNavigateNext();
      } else if (event.key === 'ArrowUp' && onNavigatePrev) {
        event.preventDefault();
        event.stopPropagation();
        onNavigatePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, onNavigateNext, onNavigatePrev]);

  // Default top bar with clear Review Mode indicators
  const defaultTopBar = (
    <div className="flex items-center justify-between px-4 h-14 border-b bg-indigo-50/30 border-indigo-200">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="text-sm"
          aria-label="Back to Queue"
        >
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>
        <span className="text-xs text-gray-600">
          Exit review (<span className="font-mono bg-gray-200 px-1 py-0.5 rounded">Esc</span>)
        </span>
      </div>
    </div>
  );

  return (
    <FocusModePage
      enabled={enabled}
      onExit={onExit}
      hideChrome={{
        header: true,
        sidebar: true,
        workingMode: true,
      }}
      hideHeader={true}
      topBar={topBar || defaultTopBar}
    >
      <div className="flex flex-col h-full bg-indigo-50/20">
        {/* Main Content - Full height, centered for reading */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </div>

        {/* Bottom Action Bar */}
        {bottomBar && (
          <div className="flex-shrink-0 border-t border-indigo-200 bg-white">
            {bottomBar}
          </div>
        )}
      </div>
    </FocusModePage>
  );
}

