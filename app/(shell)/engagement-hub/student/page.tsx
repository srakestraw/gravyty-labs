/**
 * Student Hub - Engagement Hub
 *
 * Habit Engine: Quick Wins → Reward → Progress → Social → Hook
 *
 * Daily habit loop (Duolingo/TikTok energy). Above the fold: greeting + identity,
 * quick wins with micro-rewards, future hook. Below: discovery feed, people to meet,
 * hot discussions, journey, check-in.
 *
 * Mock data in mockData.ts. No backend wiring.
 * This page hides the global app header and sidebar; uses custom sticky header.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAppChrome } from '../../contexts/app-chrome-context';
import { ToastProvider } from './ToastContext';
import {
  feedItemsStudent,
  feedItemsAlumni,
  peopleToMeetStudent,
  peopleToMeetAlumni,
  hotDiscussionsStudent,
  hotDiscussionsAlumni,
  journeyMilestones,
} from './mockData';
import {
  StudentHubHeader,
  HabitEngine,
  DiscoveryFeed,
  PeopleToMeetDeck,
  HotDiscussions,
  JourneyTimeline,
  SemesterCheckInCard,
} from './components';

type HubMode = 'student' | 'alumni';

const INITIAL_STREAK = 5;
const INITIAL_MOMENTUM = 42;
const MOMENTUM_PER_WIN = 15;
const LEVEL_THRESHOLD = 60;

export default function StudentHubPage() {
  const { setChromeVisibility } = useAppChrome();
  const [mode, setMode] = useState<HubMode>('student');
  const [streakCount, setStreakCount] = useState(INITIAL_STREAK);
  const [momentum, setMomentum] = useState(INITIAL_MOMENTUM);
  const [completedWinIds, setCompletedWinIds] = useState<Set<string>>(new Set());
  const [savedFeedItemIds, setSavedFeedItemIds] = useState<Set<string>>(new Set());
  const [actedFeedItemIds, setActedFeedItemIds] = useState<Set<string>>(new Set());
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);

  useEffect(() => {
    setChromeVisibility({ header: false, sidebar: false });
    return () => {
      setChromeVisibility({ header: true, sidebar: true });
    };
  }, [setChromeVisibility]);

  const isStudent = mode === 'student';
  const levelNum = Math.floor(momentum / LEVEL_THRESHOLD) + 1;
  const level = {
    name: isStudent ? 'Connector' : 'Advocate',
    current: levelNum,
    nextThreshold: levelNum * LEVEL_THRESHOLD,
  };

  const handleCompleteWin = (id: string, points: number) => {
    setCompletedWinIds((prev) => new Set(prev).add(id));
    setMomentum((prev) => prev + points);
  };

  const handleSaveFeedItem = (id: string) => {
    setSavedFeedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleActFeedItem = (_id: string, _category: string, _tags: string[]) => {
    setActedFeedItemIds((prev) => new Set(prev).add(_id));
  };

  const handleCheckIn = (optionId: string) => {
    setSelectedCheckIn(optionId);
  };

  const feedItems = isStudent ? feedItemsStudent : feedItemsAlumni;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <StudentHubHeader mode={mode} onModeChange={setMode} />

        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
          <div className="space-y-8">
            {/* A) Habit Engine (above the fold) */}
            <div className="min-h-[40vh]">
              <HabitEngine
                mode={mode}
                streakCount={streakCount}
                momentum={momentum}
                level={level}
                completedWinIds={completedWinIds}
                onCompleteWin={handleCompleteWin}
              />
            </div>

            {/* B) Discovery Feed */}
            <DiscoveryFeed
              items={feedItems}
              savedIds={savedFeedItemIds}
              actedIds={actedFeedItemIds}
              onSave={handleSaveFeedItem}
              onAct={handleActFeedItem}
            />

            {/* C) People to Meet */}
            <PeopleToMeetDeck
              people={isStudent ? peopleToMeetStudent : peopleToMeetAlumni}
            />

            {/* D) Hot Right Now */}
            <HotDiscussions
              discussions={isStudent ? hotDiscussionsStudent : hotDiscussionsAlumni}
            />

            {/* E) Journey */}
            <JourneyTimeline milestones={journeyMilestones} />

            {/* F) Check-in */}
            <SemesterCheckInCard onCheckIn={handleCheckIn} />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
