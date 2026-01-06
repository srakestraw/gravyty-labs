/**
 * Shadows Foundation
 * 
 * Defines elevation and shadow system following Material Design principles.
 * Provides consistent depth and hierarchy throughout the UI.
 */

/**
 * MUI shadow scale (24 levels)
 * Based on Material Design elevation system
 */
export const shadowScale = [
  'none',
  '0px 1px 2px rgba(9, 30, 66, 0.08)',
  '0px 2px 4px rgba(9, 30, 66, 0.08)',
  '0px 4px 8px rgba(9, 30, 66, 0.08)',
  '0px 8px 16px rgba(9, 30, 66, 0.08)',
  '0px 12px 24px rgba(9, 30, 66, 0.12)',
  '0px 16px 32px rgba(9, 30, 66, 0.12)',
  '0px 20px 40px rgba(9, 30, 66, 0.16)',
  '0px 24px 48px rgba(9, 30, 66, 0.16)',
  '0px 28px 56px rgba(9, 30, 66, 0.2)',
  '0px 32px 64px rgba(9, 30, 66, 0.2)',
  '0px 36px 72px rgba(9, 30, 66, 0.24)',
  '0px 40px 80px rgba(9, 30, 66, 0.24)',
  '0px 44px 88px rgba(9, 30, 66, 0.28)',
  '0px 48px 96px rgba(9, 30, 66, 0.28)',
  '0px 52px 104px rgba(9, 30, 66, 0.32)',
  '0px 56px 112px rgba(9, 30, 66, 0.32)',
  '0px 60px 120px rgba(9, 30, 66, 0.36)',
  '0px 64px 128px rgba(9, 30, 66, 0.36)',
  '0px 68px 136px rgba(9, 30, 66, 0.4)',
  '0px 72px 144px rgba(9, 30, 66, 0.4)',
  '0px 76px 152px rgba(9, 30, 66, 0.44)',
  '0px 80px 160px rgba(9, 30, 66, 0.44)',
  '0px 84px 168px rgba(9, 30, 66, 0.48)',
] as const;

/**
 * Semantic shadow tokens for common use cases
 */
export const semanticShadows = {
  // Soft shadows for subtle elevation
  soft: '0px 2px 8px rgba(9, 30, 66, 0.08)',
  
  // Medium shadows for cards and panels
  medium: '0px 4px 16px rgba(9, 30, 66, 0.12)',
  
  // Strong shadows for modals and dialogs
  strong: '0px 8px 24px rgba(9, 30, 66, 0.16)',
  
  // Hover state shadow
  hover: '0px 4px 12px rgba(9, 30, 66, 0.15)',
  
  // Focus state shadow
  focus: '0px 0px 0px 3px rgba(0, 82, 204, 0.2)',
  
  // Inset shadow for inputs
  inset: 'inset 0px 1px 2px rgba(9, 30, 66, 0.08)',
} as const;

/**
 * Elevation levels mapping
 * Maps semantic names to shadow levels
 */
export const elevationLevels = {
  none: 0,
  xs: 1,      // Subtle separation
  sm: 2,      // Cards, panels
  md: 4,      // Elevated cards
  lg: 8,      // Modals, dialogs
  xl: 12,     // High elevation
  '2xl': 16,  // Maximum elevation
} as const;

/**
 * Get shadow by elevation level
 */
export function getShadowByElevation(level: keyof typeof elevationLevels): string {
  const elevation = elevationLevels[level];
  return shadowScale[elevation] || shadowScale[0];
}

/**
 * Shadow utilities
 */
export const shadowUtils = {
  /**
   * Get shadow with custom opacity
   */
  withOpacity: (shadow: string, opacity: number): string => {
    return shadow.replace(/rgba\(([^)]+)\)/, (match, rgba) => {
      const values = rgba.split(',').map((v: string) => v.trim());
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    });
  },
  
  /**
   * Create custom shadow
   */
  create: (
    x: number,
    y: number,
    blur: number,
    spread: number = 0,
    color: string = 'rgba(9, 30, 66, 0.08)'
  ): string => {
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  },
} as const;

