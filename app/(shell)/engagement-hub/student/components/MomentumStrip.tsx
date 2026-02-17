'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { MomentumData } from '../mockData';

interface MomentumStripProps {
  data: MomentumData;
  /** Simulated momentum (e.g. from mission completions) */
  bonus?: number;
}

export function MomentumStrip({ data, bonus = 0 }: MomentumStripProps) {
  const current = data.current + bonus;
  const progress = Math.min(100, (current / data.next) * 100);

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      aria-label="Momentum and streak"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <FontAwesomeIcon
              icon="fa-solid fa-fire-flame-curved"
              className="h-5 w-5 text-amber-600"
              aria-hidden
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{data.streakLabel}</p>
            <p className="text-xs text-gray-500">
              Level {data.level} — {data.levelName}
            </p>
          </div>
        </div>
        <div className="min-w-[140px] flex-1 sm:max-w-[200px]">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-gray-500">{data.label}</span>
            <span className="font-medium text-gray-700">
              {current}/{data.next}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={current}
              aria-valuemin={0}
              aria-valuemax={data.next}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
