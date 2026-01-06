/**
 * Loaders Foundation
 * 
 * Loading indicators and progress components following MUI patterns.
 * Includes spinners, progress bars, and skeleton loaders.
 */

'use client';

import React from 'react';
import { 
  CircularProgress, 
  LinearProgress, 
  Skeleton,
  Box,
  CircularProgressProps,
  LinearProgressProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Spinner component with size variants
 */
export type LoaderSize = 'small' | 'medium' | 'large';

const sizeMap: Record<LoaderSize, number> = {
  small: 24,
  medium: 40,
  large: 56,
};

export interface SpinnerProps extends Omit<CircularProgressProps, 'size'> {
  size?: LoaderSize | number;
}

export function Spinner({ size = 'medium', ...props }: SpinnerProps) {
  const sizeValue = typeof size === 'string' ? sizeMap[size] : size;
  
  return (
    <CircularProgress 
      size={sizeValue}
      {...props}
    />
  );
}

/**
 * Progress bar component
 */
export function ProgressBar(props: LinearProgressProps) {
  return <LinearProgress {...props} />;
}

/**
 * Skeleton loader with variants
 */
export interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
  animation?: 'pulse' | 'wave' | false;
}

export function SkeletonLoader({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  count = 1,
  animation = 'pulse',
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          animation={animation}
          sx={{ mb: count > 1 ? 1 : 0 }}
        />
      ))}
    </>
  );
}

/**
 * Full page loader
 */
export interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Spinner size="large" />
      {message && (
        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
          {message}
        </Box>
      )}
    </Box>
  );
}

/**
 * Inline loader (for buttons, etc.)
 */
export function InlineLoader({ size = 'small' }: { size?: LoaderSize }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Spinner size={size} />
    </Box>
  );
}

/**
 * Button loader (replaces button content while loading)
 */
export function ButtonLoader() {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Spinner size="small" sx={{ color: 'inherit' }} />
    </Box>
  );
}

