'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function EngagementHubPage() {
  return (
    <main className="space-y-6 p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Engagement Hub</h1>
        <p className="mt-2 text-gray-600">
          Events, mentoring, networking, and messaging for students and alumni.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/engagement-hub/student"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Student Hub</span>
              <p className="text-sm text-gray-500">Events and engagement for current students</p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="ml-auto h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/engagement-hub/alumni"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <FontAwesomeIcon icon="fa-solid fa-users" className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Alumni Hub</span>
              <p className="text-sm text-gray-500">Networking and engagement for alumni</p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="ml-auto h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </main>
  );
}
