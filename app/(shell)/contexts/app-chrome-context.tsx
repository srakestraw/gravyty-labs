'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ChromeVisibility {
  header?: boolean;
  sidebar?: boolean;
  workingMode?: boolean;
}

interface AppChromeContextValue {
  chromeVisibility: ChromeVisibility;
  setChromeVisibility: (visibility: ChromeVisibility) => void;
}

const AppChromeContext = createContext<AppChromeContextValue | undefined>(undefined);

const DEFAULT_VISIBILITY: ChromeVisibility = {
  header: true,
  sidebar: true,
  workingMode: true,
};

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const [chromeVisibility, setChromeVisibilityState] = useState<ChromeVisibility>(DEFAULT_VISIBILITY);

  const setChromeVisibility = useCallback((visibility: ChromeVisibility) => {
    setChromeVisibilityState((prev) => ({
      ...DEFAULT_VISIBILITY,
      ...prev,
      ...visibility,
    }));
  }, []);

  // Reset to default when component unmounts (page navigation)
  useEffect(() => {
    return () => {
      setChromeVisibilityState(DEFAULT_VISIBILITY);
    };
  }, []);

  return (
    <AppChromeContext.Provider value={{ chromeVisibility, setChromeVisibility }}>
      {children}
    </AppChromeContext.Provider>
  );
}

export function useAppChrome() {
  const context = useContext(AppChromeContext);
  if (!context) {
    throw new Error('useAppChrome must be used within AppChromeProvider');
  }
  return context;
}

