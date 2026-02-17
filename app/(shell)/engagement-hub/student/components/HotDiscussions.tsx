'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import type { HotDiscussion } from '../mockData';

interface HotDiscussionsProps {
  discussions: HotDiscussion[];
}

export function HotDiscussions({ discussions }: HotDiscussionsProps) {
  return (
    <section aria-labelledby="hot-heading">
      <h2 id="hot-heading" className="mb-4 flex items-center gap-1.5 text-lg font-semibold text-gray-900">
        <span aria-hidden>🔥</span>
        Hot Right Now
      </h2>

      {/* What's up composer (non-functional) */}
      <div className="mb-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-4">
        <p className="text-sm text-gray-500">What&apos;s up?</p>
        <div className="mt-2 h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400">
          Share something with the community...
        </div>
      </div>

      <div className="space-y-3">
        {discussions.map((d) => (
          <article
            key={d.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-1.5 font-semibold text-gray-900">
                  <FontAwesomeIcon icon="fa-solid fa-fire" className="h-4 w-4 text-amber-500" />
                  {d.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{d.replyCount} replies</p>
                <p className="mt-1 text-sm text-gray-600">{d.preview}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                {d.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
