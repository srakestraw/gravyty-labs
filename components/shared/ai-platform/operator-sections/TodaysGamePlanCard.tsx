'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import type { AdmissionsOperatorGamePlanData } from '@/lib/data/provider';
import { isRecentlyCompleted, getHighlightTimeRemaining } from './utils/gamePlanHelpers';

interface TodaysGamePlanCardProps {
  data: AdmissionsOperatorGamePlanData | null;
  basePath?: string;
}

export function TodaysGamePlanCard({ data, basePath = '/student-lifecycle/admissions' }: TodaysGamePlanCardProps) {
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<Set<string>>(new Set());

  // Track recently completed items and manage highlight fade-out
  useEffect(() => {
    if (!data?.items) return;

    const newRecentlyCompleted = new Set<string>();
    const timers: NodeJS.Timeout[] = [];

    data.items.forEach((item) => {
      if (item.status === 'completed' && isRecentlyCompleted(item.completedAt)) {
        newRecentlyCompleted.add(item.id);
        
        // Schedule fade-out after remaining highlight time
        const remaining = getHighlightTimeRemaining(item.completedAt);
        if (remaining > 0) {
          const timer = setTimeout(() => {
            setRecentlyCompletedIds((prev) => {
              const updated = new Set(prev);
              updated.delete(item.id);
              return updated;
            });
          }, remaining);
          timers.push(timer);
        }
      }
    });

    setRecentlyCompletedIds(newRecentlyCompleted);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [data?.items]);

  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Today's Game Plan</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">No tasks available yet today.</p>
        </div>
        {/* Coach: narrative encouragement even when no tasks */}
        {data?.coachMessage && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Your Coach Says</p>
            <p className="text-sm text-gray-600 leading-relaxed italic">{data.coachMessage}</p>
          </div>
        )}
      </div>
    );
  }

  const isAllComplete = data.completed === data.total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Today's Game Plan</h2>
        <span className="text-xs text-gray-500">
          {data.completed} / {data.total} completed
        </span>
      </div>
      
      {/* PHASE 3: Momentum summary inline */}
      {data.todaysProgressSummary?.narrative && (
        <div className="bg-purple-50/50 border-l-2 border-purple-400 pl-3 py-1.5 rounded">
          <p className="text-sm text-gray-700 font-medium">{data.todaysProgressSummary.narrative}</p>
        </div>
      )}

      <div className="space-y-2">
        {data.items.map((task) => {
          const isCompleted = task.status === 'completed';
          const isRecentlyCompleted = recentlyCompletedIds.has(task.id);
          
          return (
            <div
              key={task.id}
              className={cn(
                'bg-white border-2 rounded-lg p-4 shadow-md transition-all duration-300',
                isCompleted
                  ? 'border-green-300 bg-green-50/30'
                  : isRecentlyCompleted
                    ? 'border-green-400 bg-green-50/50 shadow-lg'
                    : 'border-gray-400'
              )}
            >
              <div className="flex gap-3">
                {isCompleted ? (
                  <div className="mt-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon="fa-solid fa-check" className="h-2.5 w-2.5 text-white" />
                  </div>
                ) : (
                  <div className="mt-1 h-4 w-4 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
                    ○
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'text-sm font-medium',
                      isCompleted ? 'text-gray-700 line-through' : 'text-gray-900'
                    )}>
                      {task.title}
                    </div>
                    {isCompleted && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  {/* PHASE 1: Outcome summary for completed tasks */}
                  {isCompleted && task.lastOutcomeSummary && (
                    <p className="text-xs text-gray-600 font-medium">{task.lastOutcomeSummary}</p>
                  )}
                  
                  {!isCompleted && task.description && (
                    <p className="text-xs text-gray-600">{task.description}</p>
                  )}
                  
                  {!isCompleted && task.impactHint && (
                    <p className="text-xs text-gray-500">Impact: {task.impactHint}</p>
                  )}
                  
                  {!isCompleted && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.ctas.map((cta, index) => {
                        if (cta.href) {
                          return (
                            <Button key={index} asChild size="sm" variant={index === 0 ? 'outline' : 'ghost'}>
                              <Link href={cta.href}>{cta.label}</Link>
                            </Button>
                          );
                        }
                        return (
                          <Button key={index} size="sm" variant={index === 0 ? 'outline' : 'ghost'}>
                            {cta.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PHASE 4: Completion summary when all tasks done */}
      {isAllComplete && data.completionSummary && (
        <div className="bg-green-50/50 border-l-2 border-green-400 pl-3 py-2 rounded">
          <p className="text-sm text-gray-700 font-medium">{data.completionSummary}</p>
        </div>
      )}

      {/* Coach: narrative encouragement at bottom of Game Plan */}
      {data.coachMessage && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Your Coach Says</p>
          <p className="text-sm text-gray-700 leading-relaxed">{data.coachMessage}</p>
        </div>
      )}
    </div>
  );
}

