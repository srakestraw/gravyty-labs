'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useSwipeable } from '../motion';
import { useMicroAnimation } from '../motion';
import type { Mission } from '../mockData';
import { cn } from '@/lib/utils';

const URGENCY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-600',
};

const SYSTEM_COLORS: Record<string, string> = {
  SIS: 'bg-blue-100 text-blue-800',
  LMS: 'bg-purple-100 text-purple-800',
  Housing: 'bg-amber-100 text-amber-800',
  Bursar: 'bg-emerald-100 text-emerald-800',
  Engagement: 'bg-indigo-100 text-indigo-800',
};

interface MissionsCarouselProps {
  title: string;
  subtitle: string;
  missions: Mission[];
  onMissionComplete?: (missionId: string, points: number) => void;
}

export function MissionsCarousel({
  title,
  subtitle,
  missions,
  onMissionComplete,
}: MissionsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: string; points: number } | null>(null);
  const [triggerPulse, isPulsing] = useMicroAnimation(500);

  const displayMissions = showAll ? missions : missions.slice(0, 4);
  const currentMission = displayMissions[index];

  const swipeHandlers = useSwipeable(
    {
      onSwipeLeft: () => setIndex((i) => Math.min(i + 1, displayMissions.length - 1)),
      onSwipeRight: () => setIndex((i) => Math.max(i - 1, 0)),
    },
    { threshold: 40 }
  );

  const handleComplete = (mission: Mission) => {
    if (completedIds.has(mission.id)) return;
    const points = 15;
    setCompletedIds((prev) => new Set(prev).add(mission.id));
    setFloatingPoints({ id: mission.id, points });
    triggerPulse();
    onMissionComplete?.(mission.id, points);
    setTimeout(() => setFloatingPoints(null), 600);
  };

  return (
    <section aria-labelledby="missions-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 id="missions-heading" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {missions.length > 4 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            View all
          </button>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        {...(displayMissions.length > 1 ? swipeHandlers : {})}
        style={{ touchAction: 'pan-y' }}
      >
        {displayMissions.map((mission, i) => {
          const isActive = i === index;
          const isCompleted = completedIds.has(mission.id);

          return (
            <div
              key={mission.id}
              className={cn(
                'relative p-5 transition-all duration-300',
                isActive ? 'block' : 'hidden',
                isPulsing && isCompleted && 'animate-pulse'
              )}
            >
              {floatingPoints?.id === mission.id && (
                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 px-3 py-1 text-sm font-bold text-white animate-float-up">
                  +{floatingPoints.points} Momentum
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {mission.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-xs font-medium',
                        SYSTEM_COLORS[mission.system] ?? 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {mission.system}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        URGENCY_STYLES[mission.urgency]
                      )}
                    >
                      {mission.dueLabel}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{mission.whyItMatters}</p>
                  <p className="mt-1 text-xs text-gray-500">Takes ~{mission.takesMin} min</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!isCompleted ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleComplete(mission)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {mission.ctaLabel}
                    </Button>
                    {mission.detailsLink && (
                      <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {mission.detailsLink}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4" />
                    Done
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {displayMissions.length > 1 && (
          <div className="flex justify-center gap-1.5 border-t border-gray-100 px-4 py-2">
            {displayMissions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-6 bg-purple-600' : 'w-1.5 bg-gray-300'
                )}
                aria-label={`Go to mission ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
