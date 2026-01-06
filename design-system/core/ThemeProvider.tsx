'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createGravytyTheme, Theme } from './theme';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  theme: Theme;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: PaletteMode;
}

/**
 * Gravyty Labs Design System Theme Provider
 * 
 * Provides MUI theme with custom styling and theme mode management.
 * Integrates with existing Tailwind CSS setup.
 */
export function ThemeProvider({ 
  children, 
  defaultMode = 'light' 
}: ThemeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>(defaultMode);
  
  const theme = useMemo(() => createGravytyTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      mode,
      theme,
      toggleMode,
      setMode,
    }),
    [mode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

