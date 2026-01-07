/**
 * Icons Foundation - Exports
 * 
 * Unified icon system for the Gravyty Design System.
 * Supports SVG icons from Figma design system.
 */

export { Icon, InlineIcon } from './icon-component';
export type { IconProps, InlineIconProps } from './icon-component';

export {
  iconRegistry,
  getIconPath,
} from './icon-registry';
export type {
  IconName,
  IconCategory,
  IconWeight,
  IconSize,
  IconMetadata,
} from './icon-registry';

// Import getIconPath for use in iconHelpers
import { getIconPath, iconRegistry } from './icon-registry';

/**
 * Icon helper functions
 */
export const iconHelpers = {
  /**
   * Get icon path for a given icon name and category
   */
  getPath: getIconPath,
  
  /**
   * Check if an icon exists in the registry
   */
  exists: (name: string): boolean => {
    return name in iconRegistry;
  },
  
  /**
   * Get icon metadata
   */
  getMetadata: (name: string) => {
    return iconRegistry[name];
  },
};

