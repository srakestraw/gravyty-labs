/**
 * Icons Foundation
 * 
 * Icon system integration with Font Awesome Pro.
 * Provides consistent icon usage patterns following MUI guidelines.
 */

'use client';

import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

/**
 * Icon size variants matching MUI standards
 */
export type IconSize = 'small' | 'medium' | 'large' | 'inherit';

/**
 * Icon color variants
 */
export type IconColor = 
  | 'inherit' 
  | 'primary' 
  | 'secondary' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'success' 
  | 'action' 
  | 'disabled';

/**
 * FontAwesome Icon Props
 */
export interface FAIconProps {
  icon: string;
  size?: IconSize | string;
  color?: IconColor | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon size mapping
 */
const iconSizeMap: Record<IconSize, string> = {
  small: '0.875rem',   // 14px
  medium: '1.25rem',   // 20px
  large: '1.5rem',      // 24px
  inherit: 'inherit',
};

/**
 * Icon component wrapper for Font Awesome
 * 
 * @example
 * <Icon icon="fa-solid fa-house" size="medium" color="primary" />
 * <Icon icon="fa-regular fa-circle-check" size="large" />
 */
export function Icon({ 
  icon, 
  size = 'medium', 
  color = 'inherit',
  className,
  style,
  ...props 
}: FAIconProps) {
  const sizeValue = typeof size === 'string' && size in iconSizeMap 
    ? iconSizeMap[size as IconSize]
    : size;

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{
        fontSize: sizeValue,
        color: color === 'inherit' ? 'inherit' : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * MUI-compatible Icon component
 * Wraps Font Awesome icons in MUI SvgIcon for consistency
 */
export interface MuiIconProps extends Omit<SvgIconProps, 'children'> {
  icon: string;
  faSize?: IconSize | string;
}

export function MuiIcon({ icon, faSize = 'medium', ...props }: MuiIconProps) {
  return (
    <SvgIcon {...props}>
      <FontAwesomeIcon 
        icon={icon} 
        style={{ 
          width: '100%', 
          height: '100%',
          fontSize: typeof faSize === 'string' && faSize in iconSizeMap
            ? iconSizeMap[faSize as IconSize]
            : faSize,
        }} 
      />
    </SvgIcon>
  );
}

/**
 * Common icon set for quick reference
 */
export const commonIcons = {
  // Navigation
  home: 'fa-solid fa-house',
  menu: 'fa-solid fa-bars',
  close: 'fa-solid fa-xmark',
  back: 'fa-solid fa-arrow-left',
  forward: 'fa-solid fa-arrow-right',
  up: 'fa-solid fa-chevron-up',
  down: 'fa-solid fa-chevron-down',
  
  // Actions
  add: 'fa-solid fa-plus',
  edit: 'fa-solid fa-pencil',
  delete: 'fa-solid fa-trash',
  save: 'fa-solid fa-floppy-disk',
  cancel: 'fa-solid fa-xmark',
  search: 'fa-solid fa-magnifying-glass',
  filter: 'fa-solid fa-filter',
  
  // Status
  check: 'fa-solid fa-check',
  error: 'fa-solid fa-circle-exclamation',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-circle-info',
  success: 'fa-solid fa-circle-check',
  
  // User
  user: 'fa-solid fa-user',
  users: 'fa-solid fa-users',
  settings: 'fa-solid fa-gear',
  
  // Data
  download: 'fa-solid fa-download',
  upload: 'fa-solid fa-upload',
  export: 'fa-solid fa-file-export',
  import: 'fa-solid fa-file-import',
} as const;

