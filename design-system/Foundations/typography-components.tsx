/**
 * Typography Components
 * 
 * React components for typography styles from Gravyty Design System.
 * Client-side only components.
 */

'use client';

// @ts-ignore - MUI not installed yet
import { Typography } from '@mui/material';
// @ts-ignore - MUI not installed yet
import { styled } from '@mui/material/styles';

/**
 * Headline Components (H1-H5)
 * Usage: <H1>Heading</H1> or <H1 variant="h1" component="h1">Heading</H1>
 */
export const H1 = styled(Typography)({
  fontSize: '48px',
  fontWeight: 600,
  lineHeight: '58px',
  letterSpacing: '0',
});

export const H2 = styled(Typography)({
  fontSize: '40px',
  fontWeight: 600,
  lineHeight: '48px',
  letterSpacing: '0',
});

export const H3 = styled(Typography)({
  fontSize: '32px',
  fontWeight: 600,
  lineHeight: '38px',
  letterSpacing: '0',
});

export const H4 = styled(Typography)({
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: '34px',
  letterSpacing: '0',
});

export const H5 = styled(Typography)({
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: '28px',
  letterSpacing: '0',
});

/**
 * Subtitle Components (S1-S2)
 */
export const S1 = styled(Typography)({
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '28px',
  letterSpacing: '0',
});

export const S2 = styled(Typography)({
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '24px',
  letterSpacing: '0',
});

/**
 * Body Components (B1-B6)
 */
export const B1 = styled(Typography)({
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 400,
  letterSpacing: '0',
});

export const B2 = styled(Typography)({
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 500,
  letterSpacing: '0',
});

export const B3 = styled(Typography)({
  fontSize: '13px',
  lineHeight: '20px',
  fontWeight: 400,
  letterSpacing: '0',
});

export const B4 = styled(Typography)({
  fontSize: '13px',
  lineHeight: '20px',
  fontWeight: 500,
  letterSpacing: '0',
});

export const B5 = styled(Typography)({
  fontSize: '12px',
  lineHeight: '18px',
  fontWeight: 400,
  letterSpacing: '0',
});

export const B6 = styled(Typography)({
  fontSize: '12px',
  lineHeight: '18px',
  fontWeight: 500,
  letterSpacing: '0',
});

/**
 * Caption Components (C1-C3)
 */
export const C1 = styled(Typography)({
  fontSize: '11px',
  lineHeight: '16px',
  fontWeight: 400,
  letterSpacing: '0',
});

export const C2 = styled(Typography)({
  fontSize: '11px',
  lineHeight: '16px',
  fontWeight: 500,
  letterSpacing: '0',
});

export const C3 = styled(Typography)({
  fontSize: '10px',
  lineHeight: '14px',
  fontWeight: 500,
  letterSpacing: '0',
});

/**
 * Label Component
 */
export const Label = styled(Typography)({
  fontSize: '12px',
  lineHeight: '16px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0',
});

/**
 * Button Text Components
 * Matching Figma Button Font specifications
 */
export const ButtonGiant = styled(Typography)({
  fontSize: '17px',
  lineHeight: '24px',
  fontWeight: 500, // Medium
  letterSpacing: '0',
});

export const ButtonLarge = styled(Typography)({
  fontSize: '15px',
  lineHeight: '20px',
  fontWeight: 500, // Medium
  letterSpacing: '0',
});

export const ButtonMedium = styled(Typography)({
  fontSize: '13px',
  lineHeight: '16px',
  fontWeight: 500, // Medium
  letterSpacing: '0',
});

export const ButtonSmall = styled(Typography)({
  fontSize: '11px',
  lineHeight: '16px',
  fontWeight: 500, // Medium
  letterSpacing: '0',
});

export const ButtonTiny = styled(Typography)({
  fontSize: '9px',
  lineHeight: '12px',
  fontWeight: 500, // Medium
  letterSpacing: '0',
});

