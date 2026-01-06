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
// Note: Import useTheme and useMediaQuery directly from @mui/material when needed
// export { useTheme } from '@mui/material'; // Temporarily removed to fix MUI v7 compatibility
export type { PaletteMode, Breakpoint } from '@mui/material';

