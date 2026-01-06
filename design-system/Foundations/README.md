# Foundations

Foundations are the building blocks of the design system. They define the core visual language and principles.

## Available Foundations

### 🎨 Colors
- **File**: `colors.ts`
- **Description**: Color palette, semantic colors, and brand color placeholders
- **Usage**: 
  ```tsx
  import { colorPalette, semanticColors } from '@/design-system/Foundations';
  ```

### ✍️ Typography
- **File**: `typography.ts`
- **Description**: Font families, sizes, weights, line heights, and text styles
- **Usage**: Typography is integrated into the MUI theme automatically

### 🌑 Shadows
- **File**: `shadows.ts`
- **Description**: Elevation system with 24 shadow levels and semantic shadows
- **Usage**:
  ```tsx
  import { semanticShadows, getShadowByElevation } from '@/design-system/Foundations';
  ```

### 👤 Avatars
- **File**: `avatars.tsx`
- **Description**: Avatar components with size variants and groups
- **Usage**:
  ```tsx
  import { Avatar, AvatarGroup } from '@/design-system/Foundations';
  <Avatar src="/user.jpg" size="md" />
  ```

### 🎯 Icons
- **File**: `icons.tsx`
- **Description**: Icon system integration with Font Awesome Pro
- **Usage**:
  ```tsx
  import { Icon, commonIcons } from '@/design-system/Foundations';
  <Icon icon={commonIcons.home} size="medium" color="primary" />
  ```

### 🧭 Navigation
- **File**: `navigation.tsx`
- **Description**: Navigation items and groups following MUI patterns
- **Usage**:
  ```tsx
  import { NavigationItem, NavigationGroup } from '@/design-system/Foundations';
  ```

### 📐 Layout
- **File**: `layout.tsx`
- **Description**: Layout components, containers, and spacing utilities
- **Usage**:
  ```tsx
  import { LayoutContainer, Section, ContentWrapper } from '@/design-system/Foundations';
  ```

### ⏳ Loaders
- **File**: `loaders.tsx`
- **Description**: Loading indicators, spinners, progress bars, and skeletons
- **Usage**:
  ```tsx
  import { Spinner, ProgressBar, SkeletonLoader, FullPageLoader } from '@/design-system/Foundations';
  ```

### 📄 Page Headers
- **File**: `page-headers.tsx`
- **Description**: Page header components with titles, breadcrumbs, and actions
- **Usage**:
  ```tsx
  import { PageHeader, SectionHeader } from '@/design-system/Foundations';
  ```

## Integration

All foundations are integrated with the MUI theme system and can be accessed through:

1. **Direct imports**: Import specific foundations as needed
2. **Theme integration**: Colors, typography, and shadows are part of the theme
3. **Component usage**: Use foundation components directly in your code

## Adding Brand Colors

When brand colors are provided, update `colors.ts`:

```tsx
export const brandColors: BrandColors = {
  brandPrimary: '#YOUR_COLOR',
  brandSecondary: '#YOUR_COLOR',
  // ...
};
```

Then integrate them into the theme in `core/theme.ts`.
