/**
 * Icons Foundation
 * 
 * Unified icon system supporting both:
 * 1. SVG icons from Figma design system (primary)
 * 2. Font Awesome Pro (fallback/legacy support)
 * 
 * @module design-system/Foundations/icons
 */

'use client';

// Re-export new SVG icon system
export {
  Icon,
  InlineIcon,
  iconRegistry,
  getIconPath,
  iconHelpers,
} from './icons/index';
export type {
  IconProps,
  InlineIconProps,
  IconName,
  IconCategory,
  IconWeight,
  IconSize,
  IconMetadata,
} from './icons/index';

// Legacy Font Awesome support (for backward compatibility)

import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

/**
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
 */
export type IconSize = 'small' | 'medium' | 'large' | 'inherit';

/**
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
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
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
 */
export interface FAIconProps {
  icon: string;
  size?: IconSize | string;
  color?: IconColor | string;
  className?: string;
  style?: React.CSSProperties;
}

const iconSizeMap: Record<IconSize, string> = {
  small: '0.875rem',   // 14px
  medium: '1.25rem',   // 20px
  large: '1.5rem',      // 24px
  inherit: 'inherit',
};

/**
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
 */
export function FontAwesomeIconWrapper({ 
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
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
 */
export interface MuiIconProps extends Omit<SvgIconProps, 'children'> {
  icon: string;
  faSize?: IconSize | string;
}

/**
 * @deprecated Use Icon from './icons' instead. This is kept for backward compatibility.
 */
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
 * Maps common icon names to Figma icon names
 */
export const commonIcons = {
  // Navigation
  home: 'arrow-left', // Map to Figma icon name
  menu: 'menu',
  close: 'cancel',
  back: 'arrow-left',
  forward: 'arrow-right',
  up: 'arrow-up',
  down: 'arrow-down',
  
  // Actions
  add: 'add-square',
  edit: 'edit',
  delete: 'delete-circle',
  save: 'save-action-floppy',
  cancel: 'cancel',
  search: 'search',
  filter: 'filter',
  
  // Status
  check: 'check',
  error: 'warning-triangle',
  warning: 'warning-circle',
  info: 'info-empty',
  success: 'check-circle',
  
  // User
  user: 'user',
  users: 'group',
  settings: 'settings',
  
  // Data
  download: 'download',
  upload: 'upload',
  export: 'download',
  import: 'upload',
} as const;

