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
