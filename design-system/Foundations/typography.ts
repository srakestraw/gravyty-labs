/**
 * Typography Foundation
 * 
 * Defines typography scale, font families, and text styles.
 * Follows MUI typography system with custom Gravyty Labs styling.
 */

import { TypographyOptions } from '@mui/material/styles/createTypography';

/**
 * Typography configuration
 * Uses Inter font family with custom scale
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
  
  // Heading styles
  h1: {
    fontSize: '2.5rem', // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem', // 32px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem', // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // Body styles
  body1: {
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  // Button styles
  button: {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
  },
  
  // Caption styles
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  // Overline styles
  overline: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  
  // Subtitle styles
  subtitle1: {
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    fontWeight: 500,
  },
};

/**
 * Custom typography variants
 */
export const customTypographyVariants = {
  // Display text (larger than h1)
  display: {
    fontSize: '3rem', // 48px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.03em',
  },
  
  // Large body text
  bodyLarge: {
    fontSize: '1.125rem', // 18px
    lineHeight: 1.6,
    fontWeight: 400,
  },
  
  // Small text
  small: {
    fontSize: '0.8125rem', // 13px
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  // Label text
  label: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    fontWeight: 500,
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
    fontSize: '0.875rem',
    lineHeight: 1.5,
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
 * Font size scale (in rem)
 */
export const fontSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.75rem', // 28px
  '4xl': '2rem',   // 32px
  '5xl': '2.5rem', // 40px
  '6xl': '3rem',   // 48px
} as const;

/**
 * Line height scale
 */
export const lineHeights = {
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

