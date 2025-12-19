'use client';

import { ReactNode } from 'react';
import { ChartEmptyState } from './ChartEmptyState';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Shared wrapper component for charts that matches existing Card styling.
 * Handles loading skeleton and empty state consistently.
 */
export function ChartCard({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available yet.',
  className,
}: ChartCardProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {isLoading ? (
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      ) : isEmpty ? (
        <ChartEmptyState message={emptyMessage} />
      ) : (
        children
      )}
    </div>
  );
}





