# Gravyty Labs Design System

A comprehensive design system based on Material-UI (MUI) principles with custom Gravyty Labs styling.

## Overview

This design system provides a consistent, accessible, and scalable foundation for building user interfaces across the Gravyty Labs platform.

## Structure

```
design-system/
├── core/              # Core theme, provider, and utilities
├── Foundations/      # Design tokens and base styles
├── Components/       # Reusable UI components
└── Patterns/         # Component combinations and patterns
```

## Getting Started

### Installation

```bash
npm install @mui/material @mui/system @emotion/react @emotion/cache @emotion/styled
```

### Setup

1. Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from '@/design-system/core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

2. Use components and theme utilities:

```tsx
import { Button } from '@mui/material';
import { useTheme } from '@/design-system/core';

export function MyComponent() {
  const theme = useTheme();
  
  return (
    <Button variant="contained" color="primary">
      Click me
    </Button>
  );
}
```

## Categories

### Foundations
Base design tokens: colors, typography, spacing, shadows, etc.

### Components
Reusable UI elements built on MUI with custom styling.

### Patterns
Combinations of components that solve common UI problems.

## Principles

- **Consistency** - Follow MUI patterns and conventions
- **Accessibility** - WCAG 2.1 AA compliant
- **Customization** - Custom styling while maintaining MUI structure
- **Type Safety** - Full TypeScript support
- **Documentation** - Clear usage guidelines and examples

## Integration

This design system integrates with:
- **Tailwind CSS** - Existing utility classes
- **Radix UI** - Some components may use Radix primitives
- **Next.js** - App Router compatible
- **TypeScript** - Full type safety

