'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { useToast } from '../ToastContext';
import { useMicroAnimation } from '../motion';
import {
  userProfile,
  quickWinsStudent,
  quickWinsAlumni,
  tomorrowHooksStudent,
  tomorrowHooksAlumni,
} from '../mockData';
import type { QuickWin, TomorrowHook } from '../mockData';
import { cn } from '@/lib/utils';

const CONFETTI_COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
];

interface HabitEngineProps {
  mode: 'student' | 'alumni';
  streakCount: number;
  momentum: number;
  level: { name: string; current: number; nextThreshold: number };
  completedWinIds: Set<string>;
  onCompleteWin: (id: string, points: number) => void;
}

export function HabitEngine({
  mode,
  streakCount,
  momentum,
  level,
  completedWinIds,
  onCompleteWin,
}: HabitEngineProps) {
  const [showAllWins, setShowAllWins] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: string; points: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [triggerPulse] = useMicroAnimation(500);
  const toast = useToast();

  const isStudent = mode === 'student';
  const quickWins = isStudent ? quickWinsStudent : quickWinsAlumni;
  const tomorrowHooks = isStudent ? tomorrowHooksStudent : tomorrowHooksAlumni;

  const visibleWins = quickWins.filter((w) => !completedWinIds.has(w.id));
  const displayWins = showAllWins ? visibleWins : visibleWins.slice(0, 3);
  const momentumNeeded = Math.max(0, level.nextThreshold - momentum);
  const winsToNextLevel = Math.ceil(momentumNeeded / 15);
  const progressPercent = Math.min(100, (momentum / level.nextThreshold) * 100);

  const tomorrowHook = tomorrowHooks[0];

  const handleComplete = (win: QuickWin) => {
    if (completedWinIds.has(win.id)) return;
    const points = 15;
    onCompleteWin(win.id, points);
    setFloatingPoints({ id: win.id, points });
    setShowConfetti(true);
    triggerPulse();
    toast.showToast(win.successMessage);
    setTimeout(() => {
      setFloatingPoints(null);
      setShowConfetti(false);
    }, 800);
  };

  const streakLabel = isStudent ? `${streakCount}-day streak` : `${streakCount}-day impact streak`;
  const levelLabel = isStudent ? 'Connector' : 'Advocate';

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-label="Habit Engine"
    >
      {/* 1) Greeting + Identity Row */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Hey {userProfile.name} 👋
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-gray-700">
            Level {level.current} — {levelLabel}
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <span aria-hidden>🔥</span>
            {streakLabel}
          </span>
          <span className="text-gray-500">
            {winsToNextLevel} wins to Level {level.current + 1}
          </span>
        </div>
        <div className="mt-3">
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={momentum}
              aria-valuemin={0}
              aria-valuemax={level.nextThreshold}
            />
          </div>
        </div>
      </div>

      {/* 2) Quick Wins */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-semibold text-gray-900">
              <span aria-hidden>🔥</span>
              Quick Wins
            </h2>
            <p className="text-sm text-gray-500">Finish 3 in under 5 minutes</p>
          </div>
          {quickWins.length > 3 && !showAllWins && (
            <button
              type="button"
              onClick={() => setShowAllWins(true)}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View all
            </button>
          )}
        </div>

        <div className="relative space-y-3">
          {showConfetti && (
            <div className="confetti-burst" aria-hidden>
              {CONFETTI_COLORS.map((color, i) => (
                <div
                  key={i}
                  className="confetti-particle"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: '50%',
                    backgroundColor: color,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}

          {floatingPoints && (
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 px-3 py-1 text-sm font-bold text-white animate-float-up">
              +{floatingPoints.points} Momentum
            </div>
          )}

          {displayWins.map((win) => (
            <div
              key={win.id}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {win.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">{win.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{win.whyItMatters}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Takes {win.takesMin <= 5 ? '2-5' : win.takesMin} min
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  {!completedWinIds.has(win.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(win)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {win.ctaLabel}
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4" />
                      Done
                    </span>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* 4) Future Hook Card */}
      {tomorrowHook && (
        <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
            Tomorrow
          </p>
          <p className="mt-1 font-medium text-gray-900">{tomorrowHook.label}</p>
          <p className="mt-0.5 text-sm text-gray-600">{tomorrowHook.description}</p>
        </div>
      )}
    </section>
  );
}
