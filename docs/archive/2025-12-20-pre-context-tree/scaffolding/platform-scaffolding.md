# 🏗️ Gravyty Labs - Platform Scaffolding Build

## Overview
Build the core platform infrastructure for Gravyty Labs - a multi-app platform with authentication, navigation, and app switching. Apps will be added in the next phase.

**Production URL**: gravytylabs.com  
**Firebase Project**: gravyty-labs

---

## 📁 Project Structure

Create this exact folder structure:

```
gravyty-labs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── (shell)/
│   │   ├── layout.tsx
│   │   ├── components/
│   │   │   ├── app-header.tsx
│   │   │   ├── app-sidebar.tsx
│   │   │   └── app-switcher.tsx
│   │   ├── admissions/
│   │   │   └── page.tsx
│   │   ├── sis/
│   │   │   └── page.tsx
│   │   └── ai-teammates/
│   │       └── page.tsx
│   └── api/
│       ├── health/
│       │   └── route.ts
│       └── auth/
│           └── sync/
│               └── route.ts
├── components/
│   ├── ui/
│   │   └── (shadcn components will go here)
│   └── shared/
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth-context.tsx
│   │   └── use-auth.ts
│   ├── store.ts
│   ├── utils.ts
│   └── types.ts
├── public/
│   └── logos/
│       └── (logo files will go here)
├── middleware.ts
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 🔥 Firebase Configuration

### File: `lib/firebase/config.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "gravyty-labs.firebaseapp.com",
  projectId: "gravyty-labs",
  storageBucket: "gravyty-labs.firebasestorage.app",
  messagingSenderId: "328649395667",
  appId: "1:328649395667:web:bd2246ff4b88752c8eb326"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export default app;
```

---

## 🔐 Authentication Setup

### File: `lib/firebase/auth-context.tsx`

```typescript
'use client';

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Sync with backend when user state changes
      if (user) {
        const token = await user.getIdToken();
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### File: `lib/firebase/use-auth.ts`

```typescript
'use client';

export { useAuth } from './auth-context';
```

---

## 🗄️ State Management

### File: `lib/store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface App {
  id: string;
  name: string;
  shortName: string;
  color: string;
  path: string;
}

interface PlatformStore {
  sidebarOpen: boolean;
  activeApp: App;
  toggleSidebar: () => void;
  setActiveApp: (app: App) => void;
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeApp: {
        id: 'admissions',
        name: 'Admissions Management',
        shortName: 'Admissions',
        color: '#00B8D9',
        path: '/admissions',
      },
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setActiveApp: (app) => set({ activeApp: app }),
    }),
    {
      name: 'gravyty-platform-storage',
    }
  )
);
```

### File: `lib/types.ts`

```typescript
export interface App {
  id: string;
  name: string;
  shortName: string;
  color: string;
  path: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

### File: `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 🎨 Styling Configuration

### File: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217 91% 40%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --sidebar: 215 50% 8%;
    --sidebar-foreground: 215 16% 75%;
    --sidebar-accent: 217 20% 15%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/30 rounded-md;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/50;
}
```

### File: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0052CC",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "#0A1A2F",
          foreground: "#B8C7D6",
          accent: "#1C2B3F",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

---

## 📄 Root Layout

### File: `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gravyty Labs",
  description: "Integrated platform for admissions, student management, and AI automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🏠 Landing & Auth Pages

### File: `app/page.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-gray-900">
          Gravyty Labs
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Your integrated platform for admissions management, student information systems, and AI-powered automation.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### File: `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/admissions');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/admissions');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Gravyty Labs</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

### File: `app/signup/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      router.push('/admissions');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/admissions');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Gravyty Labs</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Sign up with Google
        </Button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

---

## 🧩 Platform Shell Components

### File: `app/(shell)/components/app-header.tsx`

```typescript
'use client';

import { Menu, Grid3x3, Search, Bell, HelpCircle, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppSwitcher } from './app-switcher';
import { usePlatformStore } from '@/lib/store';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { activeApp, toggleSidebar } = usePlatformStore();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <AppSwitcher />

          <div className="flex items-center gap-2 px-2">
            <div 
              className="h-6 w-6 rounded flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: activeApp.color }}
            >
              {activeApp.shortName.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-sm hidden sm:inline">
              {activeApp.shortName}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-4 rounded-md border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                  <AvatarFallback>
                    {user?.displayName ? getInitials(user.displayName) : 'GL'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

### File: `app/(shell)/components/app-switcher.tsx`

```typescript
'use client';

import { Grid3x3, Check, ClipboardCheck, GraduationCap, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';

const apps = [
  {
    id: 'admissions',
    name: 'Admissions Management',
    shortName: 'Admissions',
    icon: ClipboardCheck,
    color: '#00B8D9',
    path: '/admissions',
  },
  {
    id: 'sis',
    name: 'Student Information System',
    shortName: 'SIS',
    icon: GraduationCap,
    color: '#0052CC',
    path: '/sis',
  },
  {
    id: 'ai-teammates',
    name: 'AI Teammates',
    shortName: 'AI',
    icon: Bot,
    color: '#6554C0',
    path: '/ai-teammates',
  },
];

export function AppSwitcher() {
  const router = useRouter();
  const { activeApp, setActiveApp } = usePlatformStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Grid3x3 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-96"
      >
        <DropdownMenuLabel>Switch Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="grid grid-cols-3 gap-2 p-2">
          {apps.map((app) => {
            const Icon = app.icon;
            const isActive = activeApp.id === app.id;
            
            return (
              <DropdownMenuItem
                key={app.id}
                onClick={() => {
                  setActiveApp(app);
                  router.push(app.path);
                }}
                className="flex flex-col items-start p-3 h-auto cursor-pointer relative"
              >
                {isActive && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-lg mb-2"
                  style={{ backgroundColor: `${app.color}20` }}
                >
                  <Icon 
                    className="h-6 w-6" 
                    style={{ color: app.color }}
                  />
                </div>
                
                <div className="w-full">
                  <div className="font-medium text-sm">
                    {app.shortName}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {app.name}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-xs text-muted-foreground justify-center">
          More apps coming soon...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### File: `app/(shell)/components/app-sidebar.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';
import { usePlatformStore } from '@/lib/store';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { sidebarOpen, activeApp } = usePlatformStore();
  const pathname = usePathname();

  // Simple navigation - just home for now
  // Apps will add their own navigation in next phase
  const navigation = [
    { name: 'Dashboard', href: activeApp.path, icon: Home },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-40 bg-sidebar text-sidebar-foreground transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-sidebar-accent',
                isActive && 'bg-sidebar-accent text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### File: `app/(shell)/layout.tsx`

```typescript
'use client';

import { AppHeader } from './components/app-header';
import { AppSidebar } from './components/app-sidebar';
import { usePlatformStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = usePlatformStore();

  return (
    <div className="relative h-screen overflow-hidden">
      <AppHeader />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <AppSidebar />
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 📄 Placeholder App Pages

### File: `app/(shell)/admissions/page.tsx`

```typescript
export default function AdmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admissions Management</h1>
        <p className="text-muted-foreground mt-2">
          Application tracking and enrollment management
        </p>
      </div>
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          Admissions app content will be added in the next phase
        </p>
      </div>
    </div>
  );
}
```

### File: `app/(shell)/sis/page.tsx`

```typescript
export default function SISPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Information System</h1>
        <p className="text-muted-foreground mt-2">
          Student records and course management
        </p>
      </div>
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          SIS app content will be added in the next phase
        </p>
      </div>
    </div>
  );
}
```

### File: `app/(shell)/ai-teammates/page.tsx`

```typescript
export default function AITeammatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Teammates</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered automation and intelligent workflows
        </p>
      </div>
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          AI Teammates app content will be added in the next phase
        </p>
      </div>
    </div>
  );
}
```

---

## 🔌 API Routes & Middleware

### File: `app/api/auth/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Verify Firebase token
    // TODO: Call NestJS backend to sync user
    // TODO: Set httpOnly cookie
    
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      user: {
        id: body.uid,
        email: body.email,
        name: body.displayName || body.email.split('@')[0],
      }
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
```

### File: `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
```

### File: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Route protection will be implemented when backend is connected
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## ⚙️ Configuration Files

### File: `package.json`

```json
{
  "name": "gravyty-labs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "firebase": "^10.7.1",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "lucide-react": "^0.344.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.1.0"
  }
}
```

### File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### File: `.env.example`

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gravyty-labs.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gravyty-labs
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gravyty-labs.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=328649395667
NEXT_PUBLIC_FIREBASE_APP_ID=1:328649395667:web:bd2246ff4b88752c8eb326
```

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### File: `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### File: `.dockerignore`

```
node_modules
.next
.git
.env.local
*.log
```

### File: `.gitignore`

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## 🧩 Shared Components

### File: `components/shared/loading-spinner.tsx`

```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
```

### File: `components/shared/error-boundary.tsx`

```typescript
'use client';

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-red-700">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
    </div>
  );
}
```

---

## 📝 README

### File: `README.md`

```markdown
# Gravyty Labs

Multi-app platform for admissions management, student information systems, and AI-powered automation.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up shadcn/ui:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add avatar button dropdown-menu card input separator badge
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Platform Structure

- **Admissions** - Application tracking and enrollment
- **SIS** - Student information and course management
- **AI Teammates** - AI-powered automation

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Firebase Authentication
- Tailwind CSS
- shadcn/ui
- Zustand
```

---

## ✅ Build Success Criteria

After Cursor completes the build, verify:

1. ✅ Project runs without errors (`npm run dev`)
2. ✅ Landing page displays at `/`
3. ✅ Login page works at `/login`
4. ✅ Signup page works at `/signup`
5. ✅ Firebase authentication initializes correctly
6. ✅ Can sign in with email/password and Google
7. ✅ App switcher shows 3 apps in dropdown
8. ✅ Sidebar toggles smoothly (300ms transition)
9. ✅ Navigation highlights active app
10. ✅ All 3 placeholder app pages render
11. ✅ Responsive design (sidebar collapses on toggle)
12. ✅ TypeScript compiles with no errors

---

## 🚀 Post-Build Commands

```bash
# Install dependencies
npm install

# Initialize shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, Slate color, CSS variables: Yes

# Add required components
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge

# Create .env.local
cp .env.example .env.local

# Start dev server
npm run dev
```

---

## 🎯 What's Next

After this scaffolding is complete:
1. Build out individual app features (Admissions, SIS, AI Teammates)
2. Connect to NestJS backend
3. Set up database schemas
4. Implement real middleware authentication
5. Add app-specific navigation and routes

---

**START BUILDING NOW. Create all files exactly as specified. Make it production-ready.**
