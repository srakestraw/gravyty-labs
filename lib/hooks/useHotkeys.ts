'use client';

import { useEffect, useRef } from 'react';

export type HotkeyHandler = (event: KeyboardEvent) => void;

export interface HotkeyConfig {
  [key: string]: HotkeyHandler;
}

/**
 * Hook for handling keyboard shortcuts
 * @param hotkeys - Object mapping key combinations to handlers
 * @param enabled - Whether the hotkeys are enabled (default: true)
 * @param target - Optional target element to attach listeners to (default: window)
 */
export function useHotkeys(
  hotkeys: HotkeyConfig,
  enabled: boolean = true,
  target: Window | HTMLElement | null = typeof window !== 'undefined' ? window : null
) {
  const hotkeysRef = useRef(hotkeys);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    hotkeysRef.current = hotkeys;
    enabledRef.current = enabled;
  }, [hotkeys, enabled]);

  useEffect(() => {
    if (!target || !enabled) return;

    const handleKeyDown = (event: Event) => {
      if (!enabledRef.current) return;

      const keyboardEvent = event as KeyboardEvent;

      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = keyboardEvent.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Build key string (e.g., "Meta+k", "j", "ArrowDown")
      const parts: string[] = [];
      if (keyboardEvent.metaKey) parts.push('Meta');
      if (keyboardEvent.ctrlKey) parts.push('Control');
      if (keyboardEvent.altKey) parts.push('Alt');
      if (keyboardEvent.shiftKey) parts.push('Shift');

      // Normalize key names
      let key = keyboardEvent.key;
      if (key === ' ') key = 'Space';
      if (key.startsWith('Arrow')) key = key.replace('Arrow', '');

      parts.push(key);

      const keyString = parts.join('+');
      const handler = hotkeysRef.current[keyString] || hotkeysRef.current[key];

      if (handler) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        handler(keyboardEvent);
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, enabled]);
}

