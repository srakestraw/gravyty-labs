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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Gravyty Labs Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Your integrated platform for admissions management, student information systems, and AI-powered automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Go to Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // This should not render for authenticated users due to the redirect above
  return null;
}
