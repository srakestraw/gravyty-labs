'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function AlumniHubPage() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <FontAwesomeIcon icon="fa-solid fa-users" className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Alumni Hub</h1>
        <p className="mt-2 text-gray-600">Coming soon</p>
      </div>
    </main>
  );
}
