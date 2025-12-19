'use client';

import { Suspense, ReactNode } from 'react';

interface SearchParamsWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that provides a Suspense boundary for components using useSearchParams().
 * This is required for Next.js static export when components use useSearchParams().
 */
export function SearchParamsWrapper({ children, fallback = null }: SearchParamsWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

