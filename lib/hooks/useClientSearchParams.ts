'use client';

import { useState, useEffect } from 'react';

/**
 * Client-side only hook to read URL search parameters.
 * This avoids the need for Suspense boundaries required by Next.js useSearchParams()
 * and works with static export.
 * 
 * @returns URLSearchParams object that updates on navigation
 */
export function useClientSearchParams(): URLSearchParams {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window === 'undefined') {
      return new URLSearchParams();
    }
    return new URLSearchParams(window.location.search);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateParams = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', updateParams);
    
    // Also listen for Next.js router navigation (pushState/replaceState)
    // We need to poll or use a MutationObserver since Next.js doesn't fire popstate
    // for programmatic navigation. We'll use a small interval to check for changes.
    let lastSearch = window.location.search;
    const checkInterval = setInterval(() => {
      if (window.location.search !== lastSearch) {
        lastSearch = window.location.search;
        updateParams();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('popstate', updateParams);
      clearInterval(checkInterval);
    };
  }, []);

  return searchParams;
}



