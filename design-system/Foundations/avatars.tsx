/**
 * Avatars Foundation
 * 
 * Avatar component following MUI patterns with custom styling.
 * Supports images, initials, icons, and fallbacks.
 */

'use client';

import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Avatar size variants
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Extended Avatar props
 */
export interface AvatarProps extends Omit<MuiAvatarProps, 'sx'> {
  size?: AvatarSize;
  showBorder?: boolean;
  borderColor?: string;
}

/**
 * Size mapping
 */
const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Styled Avatar component
 */
const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'showBorder' && prop !== 'borderColor',
})<AvatarProps>(({ theme, size = 'md', showBorder, borderColor }) => ({
  width: sizeMap[size],
  height: sizeMap[size],
  fontSize: size === 'xs' ? '0.625rem' : size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : size === 'lg' ? '1rem' : '1.25rem',
  fontWeight: 500,
  ...(showBorder && {
    border: `2px solid ${borderColor || theme.palette.background.paper}`,
    boxShadow: theme.custom?.shadows?.soft,
  }),
}));

/**
 * Avatar component
 * 
 * @example
 * <Avatar src="/user.jpg" alt="User" size="md" />
 * <Avatar>JD</Avatar>
 * <Avatar><FontAwesomeIcon icon="fa-solid fa-user" /></Avatar>
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', showBorder = false, borderColor, ...props }, ref) => {
    return (
      <StyledAvatar
        ref={ref}
        size={size}
        showBorder={showBorder}
        borderColor={borderColor}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * Avatar group component for displaying multiple avatars
 */
export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  spacing?: 'dense' | 'normal' | 'comfortable';
  size?: AvatarSize;
}

const spacingMap = {
  dense: -8,
  normal: -12,
  comfortable: -16,
};

export function AvatarGroup({ 
  children, 
  max = 4, 
  spacing = 'normal',
  size = 'md'
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div style={{ display: 'flex', marginLeft: `${-spacingMap[spacing]}px` }}>
      {visibleAvatars.map((child, index) => (
        <div
          key={index}
          style={{
            marginLeft: `${spacingMap[spacing]}px`,
            border: '2px solid white',
            borderRadius: '50%',
          }}
        >
          {React.cloneElement(child as React.ReactElement, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: `${spacingMap[spacing]}px`,
            border: '2px solid white',
            borderRadius: '50%',
          }}
        >
          <Avatar size={size} sx={{ bgcolor: 'grey.400' }}>
            +{remainingCount}
          </Avatar>
        </div>
      )}
    </div>
  );
}

