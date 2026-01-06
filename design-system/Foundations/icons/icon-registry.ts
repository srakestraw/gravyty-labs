/**
 * Icon Registry
 * 
 * Type-safe catalog of all available icons from the Figma design system.
 * Icons are organized by category matching the Figma structure.
 * 
 * Each icon should have an SVG file in: public/assets/icons/{category}/{icon-name}.svg
 */

/**
 * Icon categories matching Figma organization
 */
export type IconCategory =
  | 'navigation'
  | 'organization'
  | 'actions'
  | 'analytics'
  | 'development'
  | 'users'
  | 'emojis'
  | 'activities'
  | 'design-tools'
  | '3d-editor'
  | 'animations'
  | 'audio'
  | 'animals'
  | 'buildings'
  | 'business'
  | 'clothing'
  | 'cloud'
  | 'communication'
  | 'connectivity'
  | 'database'
  | 'docs'
  | 'editor'
  | 'finance'
  | 'food'
  | 'gaming'
  | 'git'
  | 'gestures'
  | 'health'
  | 'home'
  | 'layout'
  | 'maps'
  | 'music'
  | 'other'
  | 'nature'
  | 'photos-videos'
  | 'security'
  | 'shapes'
  | 'shopping'
  | 'science'
  | 'social'
  | 'system'
  | 'transport'
  | 'tools'
  | 'weather'
  | 'identity'
  | 'devices';

/**
 * Icon weight/style variants
 */
export type IconWeight = 'regular' | 'dynamic' | 'default' | 'weight2';

/**
 * Icon size variants
 */
export type IconSize = 'small' | 'medium' | 'large' | 'inherit' | string;

/**
 * Icon name type - ensures type safety for icon names
 */
export type IconName = 
  // Navigation
  | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'long-arrow-right-up' | 'long-arrow-left-down' | 'long-arrow-left-up'
  | 'long-arrow-down-right' | 'long-arrow-down-left' | 'long-arrow-right-down'
  | 'nav-arrow-left' | 'nav-arrow-right' | 'nav-arrow-up' | 'nav-arrow-down'
  | 'arrow-separate' | 'arrow-union' | 'arrow-separate-vertical' | 'arrow-union-vertical'
  | 'fast-arrow-right-box' | 'fast-arrow-left-box' | 'fast-arrow-up-box' | 'fast-arrow-down-box'
  | 'right-round-arrow' | 'left-round-arrow' | 'up-round-arrow' | 'down-round-arrow'
  | 'reduce-round-arrow' | 'enlarge-round-arrow'
  | 'fast-right-circle' | 'fast-left-circle' | 'fast-up-circle' | 'fast-down-circle'
  | 'arrow-down-circle' | 'arrow-left-circle' | 'arrow-up-circle' | 'arrow-right-circle'
  | 'more-horiz-circle' | 'more-vert-circle' | 'more-horiz' | 'more-vert'
  | 'sidebar-expand' | 'sidebar-collapse' | 'compass'
  | 'fast-arrow-down' | 'fast-arrow-left' | 'fast-arrow-right' | 'fast-arrow-up'
  | 'arrow-bl-circle' | 'arrow-br-square' | 'arrow-tl-circle' | 'arrow-tr-square'
  | 'arrow-tl-square' | 'arrow-tr-circle' | 'arrow-br-circle' | 'arrow-bl-square'
  | 'arrow-bl' | 'arrow-br' | 'arrow-tl' | 'arrow-tr'
  | 'drag' | 'divide' | 'horizontal-merge' | 'horizontal-split'
  | 'vertical-merge' | 'vertical-split' | 'shortcut'
  | 'page-down' | 'page-left' | 'page-right' | 'page-up'
  | 'divide-three' | 'path-arrow' | 'filter-list' | 'filter-list-circle'
  
  // Organization
  | 'star' | 'label' | 'bookmark-empty' | 'bookmark-circle'
  | 'filter' | 'input-search' | 'area-search'
  | 'star-dashed' | 'star-half-dashed' | 'zoom-in' | 'zoom-out' | 'search'
  | 'three-stars' | 'filter-alt' | 'pin' | 'remove-pin' | 'binocular'
  
  // Actions
  | 'download-square' | 'add-square' | 'minus-square' | 'remove-square'
  | 'redo-circle' | 'undo-circle' | 'share-ios' | 'menu' | 'redo' | 'undo'
  | 'redo-action' | 'undo-action' | 'menu-scale'
  | 'warning-triangle' | 'warning-circle' | 'double-check'
  | 'minus-circle' | 'info-empty' | 'minus' | 'add-circle'
  | 'delete-circle' | 'download-circle' | 'download' | 'plus'
  | 'share-android' | 'check' | 'check-circle'
  | 'eye-empty' | 'cancel' | 'refresh-double' | 'refresh'
  | 'upload' | 'warning-square' | 'upload-square' | 'eye-alt' | 'line-space'
  | 'wrap-text' | 'eye-off' | 'question-mark' | 'help-circle'
  | 'prohibition' | 'refresh-circular' | 'help-square'
  | 'save-action-floppy' | 'load-action-floppy' | 'open-in-window'
  | 'trash' | 'eye-close' | 'open-in-browser' | 'restart'
  | 'open-new-window' | 'paste-clipboard' | 'clipboard-check' | 'erase'
  
  // Analytics
  | 'percentage-circle' | 'percentage-square' | 'percentage'
  | 'graph-up' | 'graph-down' | 'stats-up-square' | 'stats-down-square'
  | 'stat-down' | 'stats-report' | 'report-columns' | 'reports' | 'stat-up'
  
  // Users
  | 'user' | 'add-user' | 'remove-user' | 'user-circle' | 'profile-circle'
  | 'group' | 'people-tag' | 'verified-user' | 'user-love' | 'user-star'
  | 'user-square' | 'community' | 'add-segment' | 'user-crown' | 'learning'
  
  // Communication
  | 'bubble-star' | 'chat-bubble' | 'bubble-outcome' | 'bubble-income'
  | 'bubble-download' | 'bubble-upload' | 'bubble-search' | 'chat-add'
  | 'chat-remove' | 'bubble-error' | 'bubble-warning' | 'chat-lines'
  | 'chat-bubble-error' | 'chat-bubble-question' | 'chat-bubble-check'
  | 'chat-bubble-warning' | 'phone-outcome' | 'phone-income'
  | 'phone-add' | 'phone-remove' | 'phone-delete' | 'phone-paused' | 'phone'
  | 'chat-bubble-translate' | 'chat-bubble-empty' | 'phone-disabled'
  | 'message-alert' | 'message' | 'mail-opened' | 'bell' | 'bell-off'
  | 'multi-bubble' | 'headset-help' | 'mail' | 'message-text'
  | 'bell-notification' | 'app-notification' | 'facetime'
  | 'quote-message' | 'quote' | 'www' | 'globe' | 'internet' | 'podcast'
  | 'arrow-email-forward' | 'reply-to-message' | 'forward-message'
  | 'mail-in' | 'mail-out' | 'send-mail' | 'send' | 'send-diagonal'
  | 'reply' | 'at-sign' | 'at-sign-circle' | 'time-zone'
  
  // System
  | 'battery-empty' | 'battery-warning' | 'battery-25' | 'battery-50'
  | 'battery-75' | 'battery-full' | 'no-battery' | 'switch-off' | 'switch-on'
  | 'cursor-pointer' | 'terminal-tag' | 'mac-dock' | 'cpu' | 'cpu-warning'
  | 'settings' | 'bin' | 'bin-half' | 'bin-full' | 'bin-add' | 'bin-minus'
  | 'calculator' | 'log-out' | 'log-in' | 'calendar'
  | 'log-denied' | 'type' | 'eject' | 'dashboard' | 'dashboard-speed'
  | 'dashboard-dots' | 'input-field' | 'battery-charging' | 'finder'
  | 'accessibility' | 'web-window' | 'mac-os-window'
  | 'web-window-close' | 'web-window-energy-consumption' | 'ios-settings'
  | 'settings-profiles' | 'off-tag' | 'on-tag' | 'terminal'
  | 'pc-mouse' | 'mouse-button-left' | 'mouse-button-right' | 'mouse-scroll-wheel'
  | 'mac-option-key' | 'mac-control-key' | 'lock-key' | 'control-slider'
  | 'multi-window' | 'multi-mac-os-window' | 'system-restart' | 'system-shut'
  | 'safari' | 'cookie' | 'half-cookie' | 'accessibility-tech'
  | 'accessibility-sign' | 'windows' | 'apple-mac' | 'linux'
  | 'new-tab' | 'search-engine' | 'app-window' | 'energy-usage-window'
  | 'search-window' | 'locked-window' | 'select-window' | 'no-access-window'
  | 'secure-window' | 'error-window' | 'reload-window' | 'warning-window'
  | 'check-window' | 'download-data-window' | 'upload-data-window'
  | 'pause-window' | 'fingerprint-window' | 'favourite-window'
  | 'brightness-window' | 'brightness' | 'input-output'
  | 'key-command' | 'calendar-plus' | 'calendar-minus'
  
  // Add more icon names as needed from Figma...

  // Fallback for any icon name (allows flexibility during migration)
  | string;

/**
 * Icon path resolver
 * Generates the path to an icon SVG file
 */
export function getIconPath(
  category: IconCategory,
  name: IconName,
  weight: IconWeight = 'regular'
): string {
  // Normalize icon name (handle special cases)
  const normalizedName = name.replace(/\s+/g, '-').toLowerCase();
  
  // For now, return a path structure. In production, this would point to actual SVG files
  // Path format: /assets/icons/{category}/{name}-{weight}.svg
  return `/assets/icons/${category}/${normalizedName}-${weight}.svg`;
}

/**
 * Icon metadata
 */
export interface IconMetadata {
  name: IconName;
  category: IconCategory;
  weight?: IconWeight;
  description?: string;
  tags?: string[];
}

/**
 * Icon registry - maps icon names to their metadata
 * This can be expanded as icons are added
 */
export const iconRegistry: Record<string, IconMetadata> = {
  // Navigation icons
  'arrow-left': { name: 'arrow-left', category: 'navigation', description: 'Left arrow' },
  'arrow-right': { name: 'arrow-right', category: 'navigation', description: 'Right arrow' },
  'arrow-up': { name: 'arrow-up', category: 'navigation', description: 'Up arrow' },
  'arrow-down': { name: 'arrow-down', category: 'navigation', description: 'Down arrow' },
  
  // Organization icons
  'star': { name: 'star', category: 'organization', description: 'Star icon' },
  'search': { name: 'search', category: 'organization', description: 'Search icon' },
  'filter': { name: 'filter', category: 'organization', description: 'Filter icon' },
  
  // Actions icons
  'add': { name: 'add-square', category: 'actions', description: 'Add icon' },
  'delete': { name: 'delete-circle', category: 'actions', description: 'Delete icon' },
  'edit': { name: 'edit', category: 'actions', description: 'Edit icon' },
  'save': { name: 'save-action-floppy', category: 'actions', description: 'Save icon' },
  'download': { name: 'download', category: 'actions', description: 'Download icon' },
  'upload': { name: 'upload', category: 'actions', description: 'Upload icon' },
  
  // Users icons
  'user': { name: 'user', category: 'users', description: 'User icon' },
  'users': { name: 'group', category: 'users', description: 'Users icon' },
  
  // System icons
  'settings': { name: 'settings', category: 'system', description: 'Settings icon' },
  'menu': { name: 'menu', category: 'system', description: 'Menu icon' },
  
  // Add more as needed...
};

