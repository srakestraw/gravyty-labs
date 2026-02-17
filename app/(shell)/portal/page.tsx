'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

/**
 * Placeholder portal page.
 * Back to Portal from Student Hub links here.
 */
export default function PortalPage() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Portal</h1>
        <p className="mt-2 text-gray-600">Portal placeholder — coming soon</p>
        <Link
          href="/engagement-hub"
          className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-4 w-4" />
          Go to Engagement Hub
        </Link>
      </div>
    </main>
  );
}
