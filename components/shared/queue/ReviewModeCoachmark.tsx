'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'queue-review-mode-coachmark-dismissed';

interface ReviewModeCoachmarkProps {
  onDismiss?: () => void;
}

/**
 * One-time coachmark for Review Mode discovery.
 * Shows once per user (persisted in localStorage).
 */
export function ReviewModeCoachmark({ onDismiss }: ReviewModeCoachmarkProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute top-16 right-4 z-50 max-w-xs',
        'bg-white border border-indigo-200 rounded-lg shadow-lg p-4',
        'animate-in fade-in slide-in-from-top-2 duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Start review to move fast</h4>
          <p className="text-xs text-gray-600 mb-2">
            Press <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Enter</span> or click "Start review" to enter full-screen mode. Use <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">J</span>/<span className="font-mono bg-gray-100 px-1 py-0.5 rounded">K</span> to navigate, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Esc</span> to exit.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-xs h-6 px-2"
          >
            Got it
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}




