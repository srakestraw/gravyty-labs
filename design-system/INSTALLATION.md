# Design System Installation

## Prerequisites

- Node.js 18+
- npm or yarn
- Next.js 14+ project

## Step 1: Install Dependencies

```bash
npm install @mui/material @mui/system @emotion/react @emotion/cache @emotion/styled
```

Or with yarn:

```bash
yarn add @mui/material @mui/system @emotion/react @emotion/cache @emotion/styled
```

## Step 2: Configure Next.js for Emotion

Create or update `next.config.js` to support Emotion:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  compiler: {
    emotion: true,
  },
};

module.exports = nextConfig;
```

## Step 3: Add Theme Provider to Root Layout

Update `app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/design-system/core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {/* Your existing providers */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Step 4: Verify Installation

Create a test component to verify everything works:

```tsx
'use client';

import { Button } from '@mui/material';
import { useThemeContext } from '@/design-system/core';

export function TestComponent() {
  const { mode, toggleMode } = useThemeContext();
  
  return (
    <div>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
      <Button onClick={toggleMode}>
        Current mode: {mode}
      </Button>
    </div>
  );
}
```

## Troubleshooting

### Emotion CSS-in-JS Issues

If you see hydration errors, ensure:
1. Emotion cache is properly configured
2. `suppressHydrationWarning` is set on the `<html>` tag
3. All MUI components are client components (`'use client'`)

### TypeScript Errors

If you see TypeScript errors:
1. Ensure `@types/react` and `@types/react-dom` are installed
2. Restart your TypeScript server
3. Check that `tsconfig.json` includes the design-system directory

## Next Steps

- Explore Foundations for design tokens
- Check Components for reusable UI elements
- Review Patterns for common UI solutions

