'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useScrollShadow } from '../motion';
import { cn } from '@/lib/utils';

const PORTAL_HREF = '/portal';

type HubMode = 'student' | 'alumni';

interface StudentHubHeaderProps {
  mode: HubMode;
  onModeChange: (mode: HubMode) => void;
}

export function StudentHubHeader({ mode, onModeChange }: StudentHubHeaderProps) {
  const sublabel = mode === 'student' ? 'Student Hub' : 'Alumni Hub';
  const headerRef = useRef<HTMLElement>(null);
  const hasShadow = useScrollShadow(headerRef, 8);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 flex flex-col gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-white/90 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6',
        hasShadow && 'shadow-md'
      )}
    >
      {/* Row 1: Back to Portal | Toggle | Profile | Row 2: Title (mobile) */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:flex-initial">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={PORTAL_HREF}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            aria-label="Back to Portal"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Portal</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 sm:hidden">
          <div
            role="group"
            aria-label="Switch between Student and Alumni experience"
            className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
          >
            <button
              type="button"
              onClick={() => onModeChange('student')}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                mode === 'student' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
              aria-pressed={mode === 'student'}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => onModeChange('alumni')}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                mode === 'alumni' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
              aria-pressed={mode === 'alumni'}
            >
              Alumni
            </button>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
            JD
          </span>
        </div>
      </div>

      {/* Middle: Title + sublabel (desktop) */}
      <div className="hidden min-w-0 flex-1 sm:block sm:pl-2">
        <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
          Engagement Hub
        </h1>
        <p className="truncate text-xs text-gray-500">{sublabel}</p>
      </div>

      {/* Middle-right: Toggle (desktop) */}
      <div className="hidden shrink-0 items-center sm:flex">
        <div
          role="group"
          aria-label="Switch between Student and Alumni experience"
          className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
        >
          <button
            type="button"
            onClick={() => onModeChange('student')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === 'student'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
            aria-pressed={mode === 'student'}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => onModeChange('alumni')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === 'alumni'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
            aria-pressed={mode === 'alumni'}
          >
            Alumni
          </button>
        </div>
      </div>

      {/* Right: Profile chip (desktop) */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700"
          aria-hidden
        >
          JD
        </span>
        <span className="text-sm font-medium text-gray-700">Profile</span>
      </div>

      {/* Mobile: Title + sublabel */}
      <div className="sm:hidden">
        <h1 className="text-lg font-semibold text-gray-900">Engagement Hub</h1>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </header>
  );
}
