'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ShortcutFooterProps {
  className?: string;
  showReviewModeShortcuts?: boolean;
}

export function ShortcutFooter({ className, showReviewModeShortcuts = false }: ShortcutFooterProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-3',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-auto inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/60',
          'bg-white/80 bg-gradient-to-r from-indigo-50/80 via-white/90 to-indigo-50/80',
          'px-5 py-2 text-[11px] font-medium text-slate-600 shadow-[0_10px_40px_rgba(15,23,42,0.12)]',
          'backdrop-blur-md',
          'md:gap-6'
        )}
      >
        {showReviewModeShortcuts ? (
          <>
            <div className="flex items-center gap-1">
              <ShortcutHint keyLabel="J" text="" />
              <span className="text-[10px] text-slate-500">or</span>
              <ShortcutHint keyLabel="↑" text="" />
              <span className="text-slate-600">previous</span>
            </div>
            <Divider />
            <div className="flex items-center gap-1">
              <ShortcutHint keyLabel="K" text="" />
              <span className="text-[10px] text-slate-500">or</span>
              <ShortcutHint keyLabel="↓" text="" />
              <span className="text-slate-600">next</span>
            </div>
            <Divider />
            <ShortcutHint keyLabel="E" text="resolve" />
            <Divider />
            <ShortcutHint keyLabel="S" text="snooze" />
            <Divider />
            <ShortcutHint keyLabel="Z" text="undo" />
            <Divider />
            <ShortcutHint keyLabel="Esc" text="exit" />
          </>
        ) : (
          <>
            <ShortcutHint keyLabel="J" text="previous" />
            <Divider />
            <ShortcutHint keyLabel="K" text="next" />
            <Divider />
            <ShortcutHint keyLabel="E" text="to resolve" />
            <Divider />
            <ShortcutHint keyLabel="S" text="to snooze" />
            <Divider />
            <ShortcutHint keyLabel="H" text="to put on hold" />
            <Divider />
            <ShortcutHint keyLabel="Enter" text="review mode" />
          </>
        )}
      </div>
    </div>
  );
}

function ShortcutHint({ keyLabel, text }: { keyLabel: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-300 bg-white px-1 text-[10px] font-semibold text-slate-700 shadow-sm">
        {keyLabel}
      </span>
      <span>{text}</span>
    </div>
  );
}

function Divider() {
  return <span className="h-4 w-px bg-slate-200" />;
}

