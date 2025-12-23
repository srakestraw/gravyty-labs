# Gravyty Labs Portal - Quick Reference for ChatGPT

## 🎯 What is This?

Multi-app platform (Next.js 14) with 3 apps: **Admissions**, **SIS**, **AI Teammates**. Unified shell with shared auth, navigation, and app switching.

## 🔑 Critical Rules

1. **ALWAYS use `FontAwesomeIcon` component** - Never raw `<i>` tags
   ```typescript
   import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
   <FontAwesomeIcon icon="fa-solid fa-house" />
   ```

2. **Domain restrictions**: Only `gravyty.com`, `rakestraw.com`, `gravytylabs.com` emails allowed

3. **Client components**: Use `'use client'` for hooks, browser APIs, or interactive components

4. **Import paths**: Always use `@/` alias (`@/components/ui/button`)

## 📁 Key Files

- **Auth**: `lib/firebase/auth-context.tsx` → `useAuth()` hook
- **State**: `lib/store.ts` → `usePlatformStore()` hook
- **Types**: `lib/types.ts` → `App`, `User` interfaces
- **Shell Layout**: `app/(shell)/layout.tsx`
- **Header**: `app/(shell)/components/app-header.tsx`
- **Sidebar**: `app/(shell)/components/app-sidebar.tsx`
- **App Switcher**: `app/(shell)/components/app-switcher.tsx`

## 🎨 Design System

- **Primary**: `#0052CC` (Blue)
- **Sidebar**: `#0A1A2F` (Dark Navy)
- **Font**: Inter (Google Fonts)
- **Icons**: Font Awesome Pro (via CDN kit)

## 🗄️ State (Zustand)

```typescript
const { sidebarOpen, activeApp, toggleSidebar, setActiveApp } = usePlatformStore();
```

## 🔐 Auth Pattern

```typescript
const { user, loading, signInWithGoogle, signOut } = useAuth();
```

## 📱 Responsive

- Mobile-first design
- Sidebar: 64px (closed) / 256px (open)
- Breakpoints: `sm:`, `md:`, `lg:`

## 🚀 Routes

- Public: `/`, `/login`, `/signup`
- Protected: `/dashboard`, `/admissions`, `/sis`, `/ai-teammates`, `/admin`
- All protected routes in `(shell)` route group

## ⚠️ Common Mistakes to Avoid

- ❌ Using raw `<i>` tags for icons
- ❌ Forgetting `'use client'` on interactive components
- ❌ Using relative imports instead of `@/` alias
- ❌ Not handling loading/auth states
- ❌ Ignoring responsive design

## 📚 Full Documentation

See `docs/CHATGPT_KNOWLEDGE_BASE.md` for comprehensive details.












