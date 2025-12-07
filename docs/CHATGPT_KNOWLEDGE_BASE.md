# Gravyty Labs Portal - ChatGPT Knowledge Base

## 📋 Overview

The **Gravyty Labs Portal** is a multi-application platform built with Next.js 14 that provides three core applications:
1. **Admissions Management** - Application tracking and enrollment management
2. **Student Information System (SIS)** - Comprehensive student data management
3. **AI Teammates** - AI-powered automation and intelligent workflows

The platform features a unified shell with shared navigation, authentication, and app switching capabilities.

---

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand (lightweight, no persistence currently)
- **Authentication**: Firebase Auth (Google OAuth with domain restrictions)
- **UI Components**: Radix UI primitives + custom components
- **Icons**: Font Awesome Pro (via CDN kit: `https://kit.fontawesome.com/a983b74f3b.js`)
- **Deployment**: Netlify (configured in `netlify.toml`)

### Project Structure

```
gravyty-labs/
├── app/                          # Next.js App Router
│   ├── (shell)/                 # Protected shell layout (route group)
│   │   ├── components/          # Shell-specific components
│   │   │   ├── app-header.tsx   # Main header with search, notifications
│   │   │   ├── app-sidebar.tsx  # Collapsible navigation sidebar
│   │   │   └── app-switcher.tsx # App switching dropdown
│   │   ├── admissions/          # Admissions app pages
│   │   ├── sis/                 # SIS app pages
│   │   ├── ai-teammates/        # AI Teammates app pages
│   │   ├── dashboard/           # Dashboard page
│   │   ├── admin/               # Admin pages
│   │   └── layout.tsx           # Shell layout wrapper
│   ├── api/                     # API routes
│   │   ├── auth/sync/          # Authentication sync endpoint
│   │   └── health/             # Health check endpoint
│   ├── login/                   # Login page (public)
│   ├── signup/                  # Signup page (public)
│   ├── globals.css              # Global styles and CSS variables
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # Reusable UI component library
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   └── font-awesome-icon.tsx # Font Awesome wrapper (prevents hydration issues)
│   └── shared/                  # Shared components (currently empty)
├── lib/
│   ├── firebase/
│   │   ├── config.ts            # Firebase initialization
│   │   └── auth-context.tsx     # Auth context provider and hook
│   ├── store.ts                 # Zustand platform store
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions (cn, etc.)
├── public/
│   └── logos/                   # Brand assets and logos
├── functions/                   # Netlify Functions (Firebase)
│   └── src/index.ts
├── middleware.ts                # Next.js middleware (currently minimal)
├── tailwind.config.ts           # Tailwind configuration
└── package.json
```

---

## 🔐 Authentication System

### Firebase Configuration

- **Project**: `gravyty-labs`
- **Auth Domain**: `gravyty-labs.firebaseapp.com`
- **Storage**: `gravyty-labs.firebasestorage.app`

### Authentication Flow

1. **Google OAuth Sign-In**:
   - User clicks "Sign In with Google"
   - Firebase Google Auth Provider initiates OAuth flow
   - After successful Google authentication, domain validation occurs
   - **Allowed domains**: `gravyty.com`, `rakestraw.com`, `gravytylabs.com`
   - If domain is not allowed, user is automatically signed out and shown error
   - If domain is allowed, user is authenticated and redirected to dashboard

2. **Auth Context** (`lib/firebase/auth-context.tsx`):
   - Provides `useAuth()` hook throughout the application
   - Manages user state via `onAuthStateChanged` listener
   - Exposes: `user`, `loading`, `signInWithGoogle()`, `signOut()`
   - Wraps entire app in root layout

3. **Protected Routes**:
   - Currently, middleware is minimal (no route protection yet)
   - Shell routes `(shell)/*` are protected by layout structure
   - Public routes: `/`, `/login`, `/signup`

### Domain Restrictions

The authentication system enforces strict domain restrictions:

```typescript
const allowedDomains = ['gravyty.com', 'rakestraw.com', 'gravytylabs.com'];
```

Users with emails from other domains are automatically signed out and cannot access the platform.

---

## 🎨 UI/UX Patterns

### Design System

**Color Palette**:
- **Primary Blue**: `#0052CC` (Jira blue)
- **Secondary Purple**: `#6554C0`
- **Accent Teal**: `#00B8D9`
- **Sidebar Dark Navy**: `#0A1A2F`
- **Sidebar Foreground**: `#B8C7D6`
- **Sidebar Accent**: `#1C2B3F`

**Typography**:
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Spacing & Layout**:
- Uses Tailwind's spacing scale
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Sidebar width: `64` (256px) when open, `16` (64px) when closed

### Component Patterns

#### Font Awesome Icons

**CRITICAL**: Always use the `FontAwesomeIcon` component, never raw `<i>` tags.

```typescript
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

// Correct usage
<FontAwesomeIcon icon="fa-solid fa-house" />
<FontAwesomeIcon icon="fa-solid fa-users" className="h-5 w-5" />
<FontAwesomeIcon icon="fa-regular fa-circle-check" />
<FontAwesomeIcon icon="fa-light fa-house" /> // Pro only
<FontAwesomeIcon icon="fa-thin fa-house" /> // Pro only
<FontAwesomeIcon icon="fa-duotone fa-house" /> // Pro only
```

**Icon Naming Convention**:
- Prefix: `fa-solid`, `fa-regular`, `fa-light`, `fa-thin`, `fa-duotone`
- Icon names use hyphens: `fa-house`, `fa-circle-check`, `fa-graduation-cap`
- Never use raw `<i>` tags - this causes hydration errors

The `FontAwesomeIcon` component handles SSR/hydration by rendering a placeholder div during server-side rendering.

#### Button Components

Uses Radix UI + custom styling:
- Variants: `default`, `outline`, `ghost`, `destructive`
- Sizes: `default`, `sm`, `lg`, `icon`

#### Responsive Design

- **Mobile-first**: Base styles for mobile, breakpoints for larger screens
- **Sidebar**: Collapses to icon-only on mobile, full width on desktop
- **Header**: Search bar hidden on mobile, shown on `md:` and up
- **Icons**: Smaller on mobile (`h-4 w-4`), larger on desktop (`h-5 w-5`)

---

## 🗄️ State Management

### Zustand Store (`lib/store.ts`)

The platform uses Zustand for global state management:

```typescript
interface PlatformStore {
  sidebarOpen: boolean;        // Sidebar expanded/collapsed state
  activeApp: App;              // Currently active application
  setActiveApp: (app: App) => void;
  toggleSidebar: () => void;
}
```

**Default App**: Dashboard (`/dashboard`)

**Usage**:
```typescript
import { usePlatformStore } from '@/lib/store';

const { sidebarOpen, activeApp, toggleSidebar, setActiveApp } = usePlatformStore();
```

**App Type** (`lib/types.ts`):
```typescript
interface App {
  id: string;
  name: string;
  shortName: string;
  icon: string;  // Font Awesome class string
  color: string; // Hex color code
  path: string;  // Route path
}
```

---

## 🧭 Navigation & Routing

### Route Structure

**Public Routes**:
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page

**Protected Routes** (within `(shell)` route group):
- `/dashboard` - Main dashboard
- `/admissions` - Admissions Management app
- `/sis` - Student Information System app
- `/ai-teammates` - AI Teammates app
- `/admin` - Admin pages

### Shell Layout

The `(shell)` route group provides:
- **AppHeader**: Fixed header with search, notifications, user menu
- **AppSidebar**: Collapsible sidebar with navigation
- **AppSwitcher**: Dropdown to switch between applications
- **Responsive Layout**: Adjusts padding based on sidebar state

### App Switching

The `AppSwitcher` component:
- Displays grid icon in header
- Shows dropdown with all available apps
- Each app shows: icon, short name, full name, color indicator
- Active app is marked with checkmark
- Clicking an app updates `activeApp` in store and navigates to app path

---

## 🧩 Key Components

### AppHeader (`app/(shell)/components/app-header.tsx`)

**Features**:
- Hamburger menu button (toggles sidebar)
- App switcher button
- Active app indicator (colored badge + name)
- Search bar (hidden on mobile)
- Notification bell (hidden on mobile)
- Help icon (hidden on mobile)
- Settings icon (hidden on mobile)
- User avatar dropdown with sign out

**Responsive Behavior**:
- Mobile: Shows hamburger, app switcher, mobile search button, avatar
- Desktop: Shows all elements including search bar

### AppSidebar (`app/(shell)/components/app-sidebar.tsx`)

**Features**:
- Fixed left sidebar
- Collapsible (64px when closed, 256px when open)
- Smooth 300ms transition
- Navigation items (currently just Dashboard)
- Active route highlighting
- Icon-only mode when collapsed

**Styling**:
- Background: `#0A1A2F` (sidebar color)
- Foreground: `#B8C7D6` (sidebar-foreground)
- Accent: `#1C2B3F` (sidebar-accent)

### AppSwitcher (`app/(shell)/components/app-switcher.tsx`)

**Features**:
- Grid icon trigger button
- Dropdown with 3-column grid of apps
- Each app card shows:
  - Colored icon background
  - App icon
  - Short name
  - Full name
  - Active indicator (checkmark)
- Clicking app updates store and navigates

**Available Apps**:
1. **Admissions** - `#00B8D9` (Teal)
2. **SIS** - `#0052CC` (Blue)
3. **AI Teammates** - `#6554C0` (Purple)

---

## 🔧 Development Guidelines

### File Naming

- Components: `kebab-case.tsx` (e.g., `app-header.tsx`)
- Pages: `page.tsx` (Next.js App Router convention)
- Utilities: `camelCase.ts` (e.g., `utils.ts`)

### Import Paths

Use `@/` alias for absolute imports:
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import { usePlatformStore } from '@/lib/store';
```

### Component Structure

1. **Client Components**: Mark with `'use client'` directive
2. **Server Components**: Default (no directive needed)
3. **Hooks**: Always in client components

### TypeScript

- Strict mode enabled
- Types defined in `lib/types.ts`
- Use interfaces for component props
- Avoid `any` types

### Styling

- Use Tailwind utility classes
- Use `cn()` utility for conditional classes
- Use CSS variables for theme colors
- Follow responsive design patterns

### Icon Usage

**ALWAYS** use `FontAwesomeIcon` component:
```typescript
// ✅ Correct
<FontAwesomeIcon icon="fa-solid fa-house" />

// ❌ Wrong - causes hydration errors
<i className="fa-solid fa-house" />
```

---

## 📡 API Routes

### `/api/auth/sync` (POST)

Synchronizes Firebase user with backend (currently placeholder):
- Receives: `uid`, `email`, `displayName`, `photoURL`
- Returns: User object
- TODO: Verify Firebase token, call NestJS backend, set httpOnly cookie

### `/api/health` (GET)

Health check endpoint:
- Returns: `{ status: 'healthy', timestamp: ISO string }`

---

## 🚀 Deployment

### Netlify Configuration

- Configured in `netlify.toml`
- Uses Netlify Functions (Firebase functions in `functions/` directory)
- Build command: `npm run build`
- Output directory: `.next`

### Environment Variables

Required Firebase environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 🎯 Current State & Future Work

### Implemented

✅ Multi-app platform shell
✅ Firebase authentication with Google OAuth
✅ Domain-based access control
✅ App switching functionality
✅ Responsive sidebar navigation
✅ Unified header with search and user menu
✅ Font Awesome Pro integration
✅ Zustand state management
✅ TypeScript throughout
✅ Tailwind CSS design system

### Placeholder/TODO

- Individual app features (Admissions, SIS, AI Teammates are placeholder pages)
- Backend integration (NestJS)
- Database schemas
- Route protection middleware
- App-specific navigation menus
- Search functionality implementation
- Notification system
- Settings pages

---

## 🔍 Key Code Patterns

### Using Auth

```typescript
'use client';

import { useAuth } from '@/lib/firebase/auth-context';

export function MyComponent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.displayName}</div>;
}
```

### Using Platform Store

```typescript
'use client';

import { usePlatformStore } from '@/lib/store';

export function MyComponent() {
  const { sidebarOpen, activeApp, toggleSidebar } = usePlatformStore();
  
  return (
    <button onClick={toggleSidebar}>
      Sidebar is {sidebarOpen ? 'open' : 'closed'}
    </button>
  );
}
```

### Conditional Styling

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  sidebarOpen ? 'open-classes' : 'closed-classes'
)}>
```

### Responsive Design

```typescript
<div className="
  text-sm          // Mobile default
  sm:text-base     // Small screens and up
  md:text-lg       // Medium screens and up
  lg:text-xl       // Large screens and up
">
```

---

## 📝 Important Notes for AI Assistants

1. **Always use FontAwesomeIcon component** - Never use raw `<i>` tags
2. **Domain restrictions are enforced** - Only `gravyty.com`, `rakestraw.com`, `gravytylabs.com` emails allowed
3. **Client components** - Any component using hooks or browser APIs must have `'use client'` directive
4. **Route groups** - `(shell)` is a route group, not a URL segment
5. **State management** - Use Zustand store for global platform state
6. **Responsive design** - Always consider mobile-first approach
7. **Type safety** - Use TypeScript types from `lib/types.ts`
8. **Import paths** - Use `@/` alias for all imports
9. **Styling** - Prefer Tailwind utilities, use `cn()` for conditional classes
10. **Authentication** - All protected routes are within `(shell)` route group

---

## 🎨 Brand Assets

- **Logo**: Located in `public/logos/`
- **Favicons**: Located in `public/assets/favicons/`
- **Primary Logo**: `Gravyty_logo_All White.svg`

---

This knowledge base should be used as a reference when working on the Gravyty Labs Portal application. Always refer to this document when making architectural decisions or implementing new features.










