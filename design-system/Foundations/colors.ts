/**
 * Color Foundation
 * 
 * Defines the color palette for Gravyty Labs design system.
 * Colors are integrated with MUI theme and can be extended with brand colors.
 */

import { PaletteOptions } from '@mui/material/styles';

/**
 * Base color palette following MUI structure
 * Brand colors will be added when provided
 */
export const colorPalette: PaletteOptions = {
  primary: {
    main: '#0052CC', // Jira blue
    light: '#2684FF',
    dark: '#0065FF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6554C0', // Purple
    light: '#8777D9',
    dark: '#5243AA',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#DE350B',
    light: '#FF5630',
    dark: '#BF2600',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFAB00',
    light: '#FFC400',
    dark: '#FF8B00',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#00B8D9', // Teal
    light: '#00D9F5',
    dark: '#00A3BF',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#36B37E',
    light: '#4BCE97',
    dark: '#00875A',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFBFC',
    100: '#F4F5F7',
    200: '#EBECF0',
    300: '#DFE1E6',
    400: '#C1C7D0',
    500: '#8993A4',
    600: '#6B778C',
    700: '#42526E',
    800: '#253858',
    900: '#172B4D',
  },
  text: {
    primary: '#172B4D',
    secondary: '#6B778C',
    disabled: '#8993A4',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  divider: '#DFE1E6',
};

/**
 * Semantic color tokens for common use cases
 */
export const semanticColors = {
  // Status colors
  status: {
    active: '#36B37E',
    inactive: '#6B778C',
    pending: '#FFAB00',
    error: '#DE350B',
  },
  // Background colors
  background: {
    default: '#FFFFFF',
    subtle: '#F4F5F7',
    hover: '#EBECF0',
    selected: '#E3FCEF',
  },
  // Border colors
  border: {
    default: '#DFE1E6',
    focus: '#0052CC',
    error: '#DE350B',
    subtle: '#EBECF0',
  },
} as const;

/**
 * Dark mode color overrides
 */
export const darkModeColors: Partial<PaletteOptions> = {
  primary: {
    main: '#2172E5',
    light: '#4C9AFF',
    dark: '#0052CC',
  },
  background: {
    default: '#0A1A2F',
    paper: '#1A2A3F',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3BAC5',
  },
  divider: '#344563',
};

/**
 * Color utility functions
 */
export const colorUtils = {
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Get contrast color (black or white) for a given background
   */
  getContrastText: (backgroundColor: string): string => {
    // Simple contrast calculation - can be enhanced
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },
};

/**
 * Brand colors placeholder
 * Will be populated when brand colors are provided
 */
export interface BrandColors {
  brandPrimary?: string;
  brandSecondary?: string;
  brandAccent?: string;
  [key: string]: string | undefined;
}

export const brandColors: BrandColors = {
  // Placeholder - will be updated with actual brand colors
};

