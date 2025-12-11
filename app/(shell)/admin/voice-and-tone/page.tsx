"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunicationPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/ai-assistants/voice-and-tone/profiles');
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="p-6 text-center text-gray-600">Redirecting...</div>
    </div>
  );
}
