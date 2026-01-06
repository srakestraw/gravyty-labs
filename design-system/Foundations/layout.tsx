/**
 * Layout Foundation
 * 
 * Layout components and grid system following MUI patterns.
 * Provides containers, grids, and spacing utilities.
 */

'use client';

import React from 'react';
import { Container, Grid, Box, Stack, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Layout container with max-width constraints
 */
export const LayoutContainer = styled(Container)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

/**
 * Section wrapper with consistent spacing
 */
export const Section = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

/**
 * Content wrapper with max-width
 */
export const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  width: '100%',
}));

/**
 * Card container with elevation
 */
export const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

/**
 * Spacing utilities
 */
export const spacing = {
  xs: 1,   // 8px
  sm: 2,   // 16px
  md: 3,   // 24px
  lg: 4,   // 32px
  xl: 6,   // 48px
  '2xl': 8, // 64px
} as const;

/**
 * Layout components re-export
 */
export { Container, Grid, Box, Stack, Paper } from '@mui/material';
export type { ContainerProps, GridProps, BoxProps, StackProps, PaperProps } from '@mui/material';

