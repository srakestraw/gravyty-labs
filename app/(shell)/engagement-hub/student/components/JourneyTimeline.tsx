'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface Milestone {
  label: string;
  icon: string;
}

interface JourneyTimelineProps {
  milestones: readonly Milestone[];
}

export function JourneyTimeline({ milestones }: JourneyTimelineProps) {
  return (
    <section aria-labelledby="journey-heading">
      <h2 id="journey-heading" className="mb-3 text-base font-semibold text-gray-900">
        Your Journey
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {milestones.map((m, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
          >
            <FontAwesomeIcon icon={m.icon} className="h-3.5 w-3.5 text-purple-500" aria-hidden />
            {m.label}
          </span>
        ))}
      </div>
    </section>
  );
}
