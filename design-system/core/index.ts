/**
 * Gravyty Labs Design System - Core
 * 
 * This is the core module of the design system, providing:
 * - Theme configuration and provider
 * - Base utilities and helpers
 * - Type definitions
 */

// Theme
export { createGravytyTheme, defaultTheme } from './theme';
export type { Theme } from '@mui/material/styles';

// Theme Provider
export { ThemeProvider, useThemeContext } from './ThemeProvider';

// Re-export commonly used MUI utilities
export { useTheme, useMediaQuery } from '@mui/material';
export type { PaletteMode, Breakpoint } from '@mui/material';

