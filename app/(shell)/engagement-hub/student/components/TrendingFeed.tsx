'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useMicroAnimation } from '../motion';
import type { TrendingFeedItem } from '../mockData';
import { cn } from '@/lib/utils';

interface TrendingFeedProps {
  items: TrendingFeedItem[];
}

export function TrendingFeed({ items }: TrendingFeedProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [triggerPulse, isPulsing] = useMicroAnimation(400);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    triggerPulse();
  };

  return (
    <section aria-labelledby="trending-heading">
      <h2 id="trending-heading" className="mb-4 text-lg font-semibold text-gray-900">
        Trending on Campus
      </h2>
      <div className="space-y-4">
        {items.map((item) => {
          const isSaved = savedIds.has(item.id);
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
                  'flex h-24 items-center justify-center bg-gradient-to-br',
                  item.gradient
                )}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-10 w-10 text-white/90"
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
                    onClick={() => toggleSave(item.id)}
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
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.socialProof}</span>
                  <Button size="sm" variant="outline">
                    {item.cta}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
