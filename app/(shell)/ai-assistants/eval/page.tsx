'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /eval route to /evals
export default function EvalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai-assistants/evals');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-600">Redirecting to Evals...</p>
    </div>
  );
}
