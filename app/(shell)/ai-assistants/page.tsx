'use client';

export const dynamic = 'force-static';

import { Suspense } from 'react';
import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';

export default function AssistantsHomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommandCenterPageClient />
    </Suspense>
  );
}
