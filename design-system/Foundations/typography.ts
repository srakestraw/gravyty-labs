/**
 * Typography Foundation
 * 
 * Defines typography scale, font families, and text styles.
 * Based on Gravyty Design System Figma specifications.
 * Follows MUI typography system with custom Gravyty Labs styling.
 * 
 * NOTE: This file is server-safe. React components are in typography-components.tsx
 * 
 * Reference: https://www.figma.com/design/rGLG1CGxkfk26LTHctRgJk/Gravyty-Design-System?node-id=5439-16170
 */

// Note: MUI types will be available once @mui/material is installed
// @ts-ignore - MUI not installed yet
import type { TypographyOptions } from '@mui/material/styles';

/**
 * Typography configuration
 * Uses Inter font family with Gravyty Design System scale
 * All measurements match Figma design specifications
 */
export const typographyConfig: TypographyOptions = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  
  // Headlines (H1-H5) - Semi Bold, various sizes
  h1: {
    fontSize: '48px', // 3rem
    fontWeight: 600, // Semi Bold
    lineHeight: '58px', // 3.625rem
    letterSpacing: '0',
  },
  h2: {
    fontSize: '40px', // 2.5rem
    fontWeight: 600, // Semi Bold
    lineHeight: '48px', // 3rem
    letterSpacing: '0',
  },
  h3: {
    fontSize: '32px', // 2rem
    fontWeight: 600, // Semi Bold
    lineHeight: '38px', // 2.375rem
    letterSpacing: '0',
  },
  h4: {
    fontSize: '28px', // 1.75rem
    fontWeight: 600, // Semi Bold
    lineHeight: '34px', // 2.125rem
    letterSpacing: '0',
  },
  h5: {
    fontSize: '24px', // 1.5rem
    fontWeight: 600, // Semi Bold
    lineHeight: '28px', // 1.75rem
    letterSpacing: '0',
  },
  h6: {
    // Using S2 Subtitle as h6
    fontSize: '16px', // 1rem
    fontWeight: 600, // Semi Bold
    lineHeight: '24px', // 1.5rem
    letterSpacing: '0',
  },
  
  // Subtitles (S1-S2) - Semi Bold
  subtitle1: {
    fontSize: '18px', // 1.125rem - S1
    fontWeight: 600, // Semi Bold
    lineHeight: '28px', // 1.75rem
    letterSpacing: '0',
  },
  subtitle2: {
    fontSize: '16px', // 1rem - S2
    fontWeight: 600, // Semi Bold
    lineHeight: '24px', // 1.5rem
    letterSpacing: '0',
  },
  
  // Body styles (B1-B6) - Regular and Medium weights
  body1: {
    fontSize: '14px', // 0.875rem - B1
    lineHeight: '20px', // 1.25rem
    fontWeight: 400, // Regular
    letterSpacing: '0',
  },
  body2: {
    fontSize: '13px', // 0.8125rem - B3
    lineHeight: '20px', // 1.25rem
    fontWeight: 400, // Regular
    letterSpacing: '0',
  },
  
  // Button styles - matches Button Font from Figma (defaults to Large)
  button: {
    textTransform: 'none',
    fontWeight: 500, // Medium
    fontSize: '15px', // Large - default button size
    lineHeight: '20px',
    letterSpacing: '0',
  },
  
  // Caption styles (C1-C3)
  caption: {
    fontSize: '11px', // 0.6875rem - C1
    lineHeight: '16px', // 1rem
    fontWeight: 400, // Regular
    letterSpacing: '0',
  },
  
  // Overline/Label
  overline: {
    fontSize: '12px', // 0.75rem - LABEL
    lineHeight: '16px', // 1rem
    fontWeight: 500, // Medium
    textTransform: 'uppercase',
    letterSpacing: '0',
  },
};

/**
 * Custom typography variants
 * Additional text styles from Gravyty Design System
 */
export const customTypographyVariants = {
  // Body variants (B1-B6)
  body1Regular: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  body2Medium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  body3Regular: {
    fontSize: '13px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  body4Medium: {
    fontSize: '13px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  body5Regular: {
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  body6Medium: {
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  
  // Caption variants (C1-C3)
  caption1: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  caption2: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  caption3: {
    fontSize: '10px',
    lineHeight: '14px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  
  // Label
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0',
  },
  
  // Button font variants (matching Figma Button Font)
  buttonGiant: {
    fontSize: '17px',
    lineHeight: '24px',
    fontWeight: 500, // Medium
    letterSpacing: '0',
  },
  buttonLarge: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: 500, // Medium
    letterSpacing: '0',
  },
  buttonMedium: {
    fontSize: '13px',
    lineHeight: '16px',
    fontWeight: 500, // Medium
    letterSpacing: '0',
  },
  buttonSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500, // Medium
    letterSpacing: '0',
  },
  buttonTiny: {
    fontSize: '9px',
    lineHeight: '12px',
    fontWeight: 500, // Medium
    letterSpacing: '0',
  },
  
  // Code/monospace
  code: {
    fontFamily: [
      'Monaco',
      'Menlo',
      '"Ubuntu Mono"',
      'Consolas',
      '"source-code-pro"',
      'monospace',
    ].join(','),
    fontSize: '14px',
    lineHeight: '20px',
  },
} as const;

/**
 * Font weight scale
 */
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Font size scale (matching Figma specifications)
 */
export const fontSizes = {
  // Button Font sizes (matching Figma)
  tiny: '9px',
  small: '11px',
  medium: '13px',
  large: '15px',
  giant: '17px',
  
  // Text Font sizes
  caption3: '10px',
  caption1: '11px',
  caption2: '11px',
  body5: '12px',
  body6: '12px',
  label: '12px',
  body3: '13px',
  body4: '13px',
  body1: '14px',
  body2: '14px',
  subtitle2: '16px',
  subtitle1: '18px',
  h5: '24px',
  h4: '28px',
  h3: '32px',
  h2: '40px',
  h1: '48px',
} as const;

/**
 * Line height scale (matching Figma specifications)
 */
export const lineHeights = {
  // Specific line heights from design system (matching Figma)
  tiny: '12px',
  small: '16px',
  medium: '16px',
  large: '20px',
  giant: '24px',
  caption3: '14px',
  caption1: '16px',
  caption2: '16px',
  body5: '18px',
  body6: '18px',
  label: '16px',
  body1: '20px',
  body2: '20px',
  body3: '20px',
  body4: '20px',
  subtitle2: '24px',
  subtitle1: '28px',
  h5: '28px',
  h4: '34px',
  h3: '38px',
  h2: '48px',
  h1: '58px',
  
  // Relative line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
} as const;

/**
 * Letter spacing scale
 */
export const letterSpacings = {
  tighter: '-0.03em',
  tight: '-0.02em',
  normal: '0em',
  wide: '0.02em',
  wider: '0.08em',
} as const;

// React components are exported from typography-components.tsx
// This file only contains server-safe configuration

