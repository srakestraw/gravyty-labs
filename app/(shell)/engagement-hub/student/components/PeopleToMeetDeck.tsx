'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useSwipeable } from '../motion';
import { useToast } from '../ToastContext';
import type { PersonToMeet } from '../mockData';
import { cn } from '@/lib/utils';

interface PeopleToMeetDeckProps {
  people: PersonToMeet[];
}

export function PeopleToMeetDeck({ people }: PeopleToMeetDeckProps) {
  const [index, setIndex] = useState(0);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  const current = people[index];
  const isLast = index >= people.length - 1;

  const handleConnect = () => {
    if (!current) return;
    setConnectedIds((prev) => new Set(prev).add(current.id));
    toast.showToast("Nice — we'll nudge them to reply.");
    if (!isLast) setIndex((i) => i + 1);
  };

  const handleSkip = () => {
    if (!isLast) setIndex((i) => i + 1);
  };

  const swipeHandlers = useSwipeable({
    onSwipeRight: handleConnect,
    onSwipeLeft: handleSkip,
  });

  if (!current) {
    return (
      <section aria-labelledby="people-heading">
        <h2 id="people-heading" className="mb-4 text-lg font-semibold text-gray-900">
          People to Meet
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
          You've seen everyone for now. Check back later!
        </div>
      </section>
    );
  }

  const isConnected = connectedIds.has(current.id);

  return (
    <section aria-labelledby="people-heading">
      <h2 id="people-heading" className="mb-4 text-lg font-semibold text-gray-900">
        People to Meet
      </h2>
      <div
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        {...swipeHandlers}
        style={{ ...swipeHandlers.style, touchAction: 'pan-y' }}
      >
        <div className="p-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-2xl font-bold text-white">
              {current.initials}
            </div>
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900">{current.name}</h3>
          <p className="text-center text-sm text-gray-500">{current.role}</p>
          <p className="mt-2 text-center text-sm text-gray-600">{current.hook}</p>
          <p className="mt-1 text-center text-xs text-purple-600">{current.whyMatched}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-sm font-medium text-purple-600">
            {current.matchPercent}% match
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
              disabled={isLast && people.length === 1}
            >
              Not now
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleConnect}
              disabled={isConnected}
            >
              {isConnected ? (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-check" className="mr-1 h-4 w-4" />
                  Connected
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
