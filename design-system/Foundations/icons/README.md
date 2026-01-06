# Icons Foundation

Unified icon system for the Gravyty Design System using SVG icons from Figma.

## Overview

This icon system provides:
- **Type-safe icon names** - All icons are typed and validated
- **Category organization** - Icons organized by category matching Figma structure
- **Multiple weight variants** - Support for Regular, Dynamic, Default, and Weight2 styles
- **MUI integration** - Seamless integration with Material-UI components
- **SSR compatible** - Works with Next.js server-side rendering

## Icon Categories

Icons are organized into categories matching the Figma design system:

- **Navigation** - Arrows, navigation controls
- **Organization** - Star, label, bookmark, filter, search
- **Actions** - Add, delete, edit, save, download, upload
- **Analytics** - Charts, graphs, statistics
- **Users** - User profiles, groups, communities
- **System** - Settings, battery, windows, system controls
- **Communication** - Messages, mail, phone, notifications
- And many more...

## Usage

### Basic Usage

```tsx
import { Icon } from '@/design-system/Foundations/icons';

// Simple icon
<Icon name="arrow-left" />

// With size
<Icon name="user" size="large" />

// With category and weight
<Icon name="user" category="users" weight="dynamic" size="medium" />
```

### With MUI Styling

```tsx
import { Icon } from '@/design-system/Foundations/icons';
import { Box } from '@mui/material';

<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
  <Icon name="check-circle" size="medium" color="success" />
  <Icon name="warning-triangle" size="medium" color="warning" />
  <Icon name="info-empty" size="medium" color="info" />
</Box>
```

### Inline SVG

If you have SVG content directly:

```tsx
import { InlineIcon } from '@/design-system/Foundations/icons';

const svgContent = '<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7z"/></svg>';

<InlineIcon svgContent={svgContent} size="large" />
```

## Icon Sizes

- `small` - 16px (1rem)
- `medium` - 20px (1.25rem) - Default
- `large` - 24px (1.5rem)
- `inherit` - Inherits from parent
- Custom string - Any valid CSS size value

## Icon Weights

- `regular` - Regular weight (default)
- `dynamic` - Dynamic weight variant
- `default` - Default weight variant
- `weight2` - Weight2 variant

## File Structure

Icons should be stored in the following structure:

```
public/
  assets/
    icons/
      navigation/
        arrow-left-regular.svg
        arrow-left-dynamic.svg
        arrow-right-regular.svg
        ...
      users/
        user-regular.svg
        user-dynamic.svg
        ...
      actions/
        add-square-regular.svg
        ...
```

## Exporting Icons from Figma

When exporting icons from Figma:

1. **Select the icon** in Figma
2. **Export as SVG** with these settings:
   - Format: SVG
   - Include "id" attribute: **No**
   - Outline stroke: **Yes** (if the icon has strokes)
   - Simplify stroke: **Yes**
3. **Save with naming convention**: `{icon-name}-{weight}.svg`
   - Example: `arrow-left-regular.svg`, `user-dynamic.svg`

## Type Safety

All icon names are type-checked:

```tsx
// ✅ Valid - TypeScript will autocomplete
<Icon name="arrow-left" />

// ❌ Invalid - TypeScript error
<Icon name="non-existent-icon" />
```

## Icon Registry

The icon registry maps icon names to metadata:

```tsx
import { iconRegistry, iconHelpers } from '@/design-system/Foundations/icons';

// Check if icon exists
if (iconHelpers.exists('arrow-left')) {
  // Icon is available
}

// Get icon metadata
const metadata = iconHelpers.getMetadata('arrow-left');
// Returns: { name: 'arrow-left', category: 'navigation', description: 'Left arrow' }
```

## Migration from Font Awesome

The system maintains backward compatibility with Font Awesome for gradual migration:

```tsx
// Old way (still works)
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
<FontAwesomeIcon icon="fa-solid fa-house" />

// New way (recommended)
import { Icon } from '@/design-system/Foundations/icons';
<Icon name="home" category="navigation" />
```

## Common Icons

Common icon mappings are available:

```tsx
import { commonIcons } from '@/design-system/Foundations/icons';

// commonIcons provides mappings like:
// home -> 'arrow-left'
// menu -> 'menu'
// user -> 'user'
// etc.
```

## Best Practices

1. **Always specify category** when possible for better organization
2. **Use semantic names** - Prefer `arrow-left` over `left-arrow`
3. **Consistent sizing** - Use standard sizes (small, medium, large) when possible
4. **Accessibility** - Icons are decorative by default. Add `aria-label` for meaningful icons:

```tsx
<Icon 
  name="search" 
  aria-label="Search" 
  role="img"
/>
```

## Troubleshooting

### Icon not showing

1. Check that the SVG file exists at the expected path
2. Verify the icon name matches the file name (without extension and weight)
3. Check browser console for 404 errors
4. Ensure the SVG file is valid

### TypeScript errors

1. Make sure the icon name is in the `IconName` type
2. Add new icon names to `icon-registry.ts` if needed
3. Check that category matches `IconCategory` type

## Future Enhancements

- [ ] Icon sprite sheet support for better performance
- [ ] Icon search/filter functionality
- [ ] Icon preview tool
- [ ] Automatic icon extraction from Figma API
- [ ] Icon optimization pipeline

