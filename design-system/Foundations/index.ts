/**
 * Foundations - Main Export
 * 
 * Exports all foundation modules for the design system
 */

// Colors
export * from './colors';
export type { BrandColors } from './colors';

// Typography
export * from './typography';
export * from './typography-components';

// Shadows
export * from './shadows';

// Avatars
export * from './avatars';
export type { AvatarSize, AvatarProps, AvatarGroupProps } from './avatars';

// Icons
export * from './icons';
export type { 
  IconProps, 
  InlineIconProps,
  IconName, 
  IconCategory, 
  IconWeight, 
  IconSize, 
  IconMetadata,
  // Legacy types
  IconSize as LegacyIconSize,
  IconColor,
  FAIconProps,
  MuiIconProps,
} from './icons';

// Navigation
export * from './navigation';
export type { NavigationItemProps, NavigationGroupProps } from './navigation';

// Layout
export * from './layout';

// Loaders
export * from './loaders';
export type { LoaderSize, SpinnerProps, SkeletonLoaderProps, FullPageLoaderProps } from './loaders';

// Page Headers
export * from './page-headers';
export type { PageHeaderProps, SectionHeaderProps } from './page-headers';

