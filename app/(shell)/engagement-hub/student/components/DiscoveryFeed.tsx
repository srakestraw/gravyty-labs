'use client';

import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useMicroAnimation } from '../motion';
import type { FeedItem } from '../mockData';
import { userProfile } from '../mockData';
import { cn } from '@/lib/utils';

interface DiscoveryFeedProps {
  items: FeedItem[];
  savedIds: Set<string>;
  actedIds: Set<string>;
  onSave: (id: string) => void;
  onAct: (id: string, category: string, tags: string[]) => void;
}

export function DiscoveryFeed({
  items,
  savedIds,
  actedIds,
  onSave,
  onAct,
}: DiscoveryFeedProps) {
  const [triggerPulse, isPulsing] = useMicroAnimation(400);

  const rankedItems = useMemo(() => {
    const acted = [...actedIds];
    return [...items].sort((a, b) => {
      const aActed = acted.includes(a.id);
      const bActed = acted.includes(b.id);
      if (aActed && !bActed) return -1;
      if (!aActed && bActed) return 1;
      const aMatch = a.tags.some((t) => userProfile.interests.includes(t.toLowerCase()));
      const bMatch = b.tags.some((t) => userProfile.interests.includes(t.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [items, actedIds]);

  const toggleSave = (item: FeedItem) => {
    onSave(item.id);
    triggerPulse();
  };

  const handleAct = (item: FeedItem) => {
    onAct(item.id, item.category, item.tags);
  };

  return (
    <section aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="mb-4 text-lg font-semibold text-gray-900">
        Discovery Feed
      </h2>
      <div className="space-y-4">
        {rankedItems.map((item) => {
          const isSaved = savedIds.has(item.id);
          const hasActed = actedIds.has(item.id);

          return (
            <article
              key={item.id}
              className={cn(
                'group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
                isSaved && 'ring-2 ring-purple-200'
              )}
            >
              <div
                className={cn(
                  'flex h-28 items-center justify-center bg-gradient-to-br',
                  item.gradient
                )}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-12 w-12 text-white/90"
                  aria-hidden
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSave(item)}
                    className={cn(
                      'rounded-full p-1.5 transition-transform',
                      isSaved ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600',
                      isPulsing && isSaved && 'scale-110'
                    )}
                    aria-label={isSaved ? 'Unsave' : 'Save'}
                  >
                    <FontAwesomeIcon
                      icon={isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900">{item.headline}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.avatarInitials.length > 0 && (
                      <div className="flex -space-x-2">
                        {item.avatarInitials.slice(0, 3).map((init, i) => (
                          <span
                            key={i}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs font-medium text-gray-700"
                          >
                            {init}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">{item.socialProof}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAct(item)}
                    disabled={hasActed}
                  >
                    {hasActed ? 'Done' : item.cta}
                  </Button>
                </div>
                {hasActed && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    Got it — we&apos;ll show you more like this
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
