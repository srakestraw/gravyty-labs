# Icon System Usage Guide

## Overview

The icon system has been designed to work with SVG icons from your Figma design system. It provides a type-safe, organized way to use icons throughout the application.

## Architecture

```
design-system/Foundations/icons/
├── icon-registry.ts      # Icon name types and registry
├── icon-component.tsx    # React Icon component
├── index.ts             # Public exports
└── README.md            # Detailed documentation
```

## How It Works

### 1. Icon Registry

The `icon-registry.ts` file defines:
- **Icon categories** - Matching Figma organization (navigation, actions, users, etc.)
- **Icon names** - Type-safe icon name types
- **Icon weights** - Regular, Dynamic, Default, Weight2
- **Path resolver** - Generates paths to SVG files

### 2. Icon Component

The `Icon` component:
- Loads SVG files from `public/assets/icons/`
- Parses SVG content on the client side
- Renders icons using MUI's `SvgIcon` component
- Supports all MUI icon props (color, size, sx, etc.)

### 3. File Structure

Icons should be stored as:
```
public/assets/icons/
  navigation/
    arrow-left-regular.svg
    arrow-left-dynamic.svg
    arrow-right-regular.svg
    ...
  users/
    user-regular.svg
    user-dynamic.svg
    ...
```

## Usage Examples

### Basic Usage

```tsx
import { Icon } from '@/design-system/Foundations/icons';

// Simple icon
<Icon name="arrow-left" />

// With size
<Icon name="user" size="large" />

// With category
<Icon name="user" category="users" />

// With weight variant
<Icon name="arrow-left" weight="dynamic" />
```

### With MUI Integration

```tsx
import { Icon } from '@/design-system/Foundations/icons';
import { Box, Button } from '@mui/material';

// In a button
<Button startIcon={<Icon name="download" />}>
  Download
</Button>

// With color
<Box sx={{ display: 'flex', gap: 2 }}>
  <Icon name="check-circle" color="success" />
  <Icon name="warning-triangle" color="warning" />
  <Icon name="info-empty" color="info" />
</Box>
```

### Size Variants

```tsx
<Icon name="user" size="small" />   // 16px
<Icon name="user" size="medium" />  // 20px (default)
<Icon name="user" size="large" />   // 24px
<Icon name="user" size="2rem" />   // Custom size
```

## Migration from Font Awesome

The system maintains backward compatibility. You can migrate gradually:

```tsx
// Old (still works)
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
<FontAwesomeIcon icon="fa-solid fa-house" />

// New (recommended)
import { Icon } from '@/design-system/Foundations/icons';
<Icon name="home" category="navigation" />
```

## Next Steps

1. **Export Icons from Figma**
   - Export each icon as SVG
   - Use naming: `{icon-name}-{weight}.svg`
   - Save to appropriate category folder

2. **Add Icons to Registry**
   - Add icon names to `IconName` type in `icon-registry.ts`
   - Add metadata to `iconRegistry` object

3. **Update Components**
   - Replace Font Awesome icons with new Icon component
   - Use type-safe icon names

4. **Test**
   - Visit `/design-system/icons` to see icon showcase
   - Verify icons render correctly
   - Check all size variants

## Icon Categories from Figma

Based on your Figma design, icons are organized into these categories:

- **Navigation** - 50+ arrow and navigation icons
- **Organization** - Star, label, bookmark, filter, search icons
- **Actions** - Add, delete, edit, save, download, upload icons
- **Analytics** - Charts, graphs, statistics icons
- **Users** - User profiles, groups, communities
- **System** - Settings, battery, windows, system controls
- **Communication** - Messages, mail, phone, notifications
- **And 30+ more categories...**

## Type Safety

All icon names are type-checked:

```tsx
// ✅ Valid - TypeScript autocomplete works
<Icon name="arrow-left" />

// ❌ Invalid - TypeScript error
<Icon name="non-existent" />
```

## Performance

- Icons are loaded on-demand
- SVG parsing happens client-side only
- Icons can be cached by the browser
- Future: Consider icon sprite sheets for better performance

## Showcase Page

Visit `/design-system/icons` to see:
- All available icons organized by category
- Size variants demonstration
- Usage examples
- Implementation notes

