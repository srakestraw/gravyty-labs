'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to the dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-6xl font-bold text-gray-900">
            Gravyty Labs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Your integrated platform for admissions management, student information systems, and AI-powered automation.
          </p>
          <p className="text-sm text-gray-500">
            Secure access with Google authentication
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

  // This should not render for authenticated users due to the redirect above
  // But keeping as fallback
  return null;
}
