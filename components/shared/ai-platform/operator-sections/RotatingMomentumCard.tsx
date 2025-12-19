'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { AdmissionsOperatorMomentumData } from '@/lib/data/provider';

interface RotatingMomentumCardProps {
  data: AdmissionsOperatorMomentumData | null;
}

const ROTATION_INTERVAL = 7000; // 7 seconds
const PAUSE_DURATION = 20000; // 20 seconds of inactivity before resume
const HOVER_RESUME_DELAY = 2500; // 2.5 seconds after mouse leave

export function RotatingMomentumCard({ data }: RotatingMomentumCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExplicitlyPaused, setIsExplicitlyPaused] = useState(false);
  const [lastInteractionAt, setLastInteractionAt] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hoverResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const games = data?.games || [];
  const hasGames = games.length > 0;

  // Determine if rotation should be paused
  const isPaused = isExplicitlyPaused || isHovered || (lastInteractionAt !== null && Date.now() - lastInteractionAt < PAUSE_DURATION);

  // Handle interaction (pause rotation)
  const handleInteraction = useCallback(() => {
    setLastInteractionAt(Date.now());
    setIsExplicitlyPaused(false); // Clear explicit pause on interaction
  }, []);

  // Navigate to specific game
  const goToGame = useCallback((index: number) => {
    if (index >= 0 && index < games.length) {
      setActiveIndex(index);
      handleInteraction();
    }
  }, [games.length, handleInteraction]);

  // Navigate to next game
  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % games.length);
    handleInteraction();
  }, [games.length, handleInteraction]);

  // Navigate to previous game
  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + games.length) % games.length);
    handleInteraction();
  }, [games.length, handleInteraction]);

  // Toggle explicit pause
  const togglePause = useCallback(() => {
    setIsExplicitlyPaused((prev) => !prev);
    if (!isExplicitlyPaused) {
      handleInteraction();
    }
  }, [isExplicitlyPaused, handleInteraction]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, togglePause]);

  // Auto-rotation logic
  useEffect(() => {
    if (!hasGames || games.length <= 1) return;

    const shouldRotate = !isPaused && document.visibilityState === 'visible';

    if (shouldRotate) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % games.length);
      }, ROTATION_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, hasGames, games.length]);

  // Handle hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (hoverResumeTimeoutRef.current) {
      clearTimeout(hoverResumeTimeoutRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverResumeTimeoutRef.current) {
      clearTimeout(hoverResumeTimeoutRef.current);
    }
    // Resume after delay unless explicitly paused
    if (!isExplicitlyPaused) {
      hoverResumeTimeoutRef.current = setTimeout(() => {
        setLastInteractionAt(null);
      }, HOVER_RESUME_DELAY);
    }
  }, [isExplicitlyPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (hoverResumeTimeoutRef.current) {
        clearTimeout(hoverResumeTimeoutRef.current);
      }
    };
  }, []);

  if (!data) return null;

  const currentGame = hasGames ? games[activeIndex] : null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-500">Your Momentum</h2>
      <div
        ref={cardRef}
        className="bg-white border border-gray-200 rounded-lg p-3"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleInteraction}
        tabIndex={0}
      >
        <div className="space-y-3">
          {/* Streak and Score - consistent across games */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Active streak</div>
              <div className="text-2xl font-semibold text-gray-900">
                {data.streakDays} days
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {currentGame?.subtitle || 'Building momentum'}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium text-gray-600 mb-1">Daily impact score</div>
              <div className="h-12 w-12 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-medium text-purple-600">
                {data.score}/100
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Based on progress today
              </div>
            </div>
          </div>

          {/* Game-specific content */}
          {hasGames && currentGame ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{currentGame.title}</span>
                <span className="font-medium text-gray-900">
                  {currentGame.weekCurrent}/{currentGame.weekTarget}
                </span>
              </div>
              {currentGame.todayCount !== undefined && (
                <div className="text-xs text-gray-500">
                  Today: {currentGame.todayCount}
                </div>
              )}
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentGame.weekCurrent / currentGame.weekTarget) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            // Fallback to weekly challenge if no games
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">This week's progress</span>
                <span className="font-medium text-gray-900">
                  {data.weeklyChallenge.completed}/{data.weeklyChallenge.total}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {data.weeklyChallenge.label || 'items completed'}
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-600"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.weeklyChallenge.completed / data.weeklyChallenge.total) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Hint line */}
          {currentGame?.hint && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">{currentGame.hint}</p>
            </div>
          )}

          {/* Navigation controls */}
          {hasGames && games.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {/* Dots indicator */}
              <div className="flex items-center gap-1.5">
                {games.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToGame(index)}
                    onFocus={handleInteraction}
                    className={`
                      h-1.5 rounded-full transition-all duration-300
                      ${index === activeIndex 
                        ? 'w-6 bg-purple-600' 
                        : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }
                    `}
                    aria-label={`Go to ${games[index].title}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                  />
                ))}
              </div>

              {/* Navigation buttons and pause toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrev}
                  onFocus={handleInteraction}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Previous game"
                >
                  <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={togglePause}
                  onFocus={handleInteraction}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={isExplicitlyPaused ? 'Resume rotation' : 'Pause rotation'}
                >
                  <FontAwesomeIcon 
                    icon={isExplicitlyPaused ? "fa-solid fa-play" : "fa-solid fa-pause"} 
                    className="h-3 w-3" 
                  />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  onFocus={handleInteraction}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Next game"
                >
                  <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

