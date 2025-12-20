'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface Shortcut {
  key: string;
  label: string;
  description?: string;
}

interface ShortcutsOverlayProps {
  isReviewMode?: boolean;
  className?: string;
}

/**
 * ShortcutsOverlay - Floating "?" button that opens keyboard shortcuts help.
 * Replaces the persistent keyboard bar with an on-demand overlay.
 */
export function ShortcutsOverlay({ isReviewMode = false, className }: ShortcutsOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const standardShortcuts: Shortcut[] = [
    { key: 'J', label: 'Next item', description: 'Navigate to next item in list' },
    { key: 'K', label: 'Previous item', description: 'Navigate to previous item in list' },
    { key: 'Enter', label: 'Start review', description: 'Enter Review Mode for selected item' },
    { key: 'E', label: 'Resolve', description: 'Resolve current item' },
    { key: 'S', label: 'Snooze', description: 'Snooze current item' },
    { key: 'H', label: 'Hold', description: 'Put current item on hold' },
    { key: '?', label: 'Shortcuts', description: 'Show this help overlay' },
  ];

  const reviewShortcuts: Shortcut[] = [
    { key: 'J or ↑', label: 'Previous item', description: 'Navigate to previous item' },
    { key: 'K or ↓', label: 'Next item', description: 'Navigate to next item' },
    { key: 'E', label: 'Resolve', description: 'Resolve current item' },
    { key: 'S', label: 'Snooze', description: 'Snooze current item' },
    { key: 'Z', label: 'Undo', description: 'Undo last action' },
    { key: 'Esc', label: 'Exit review', description: 'Exit Review Mode' },
    { key: '?', label: 'Shortcuts', description: 'Show this help overlay' },
  ];

  const shortcuts = isReviewMode ? reviewShortcuts : standardShortcuts;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-30',
          'w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white',
          'shadow-lg flex items-center justify-center',
          'transition-all hover:scale-110',
          className
        )}
        title="Keyboard shortcuts (?)"
        aria-label="Show keyboard shortcuts"
      >
        <span className="text-lg font-bold">?</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded border border-gray-300 bg-gray-100 text-sm font-mono font-semibold text-gray-800">
                          {shortcut.key}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {shortcut.label}
                        </div>
                        {shortcut.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {shortcut.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Press <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">Esc</span> or click outside to close
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

