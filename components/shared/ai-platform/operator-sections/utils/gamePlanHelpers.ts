/**
 * Helper functions for Today's Game Plan gamification features
 */

/**
 * Check if a task was completed recently (within the last 3 minutes)
 * Used to determine if a task should show the "recently completed" highlight
 */
export function isRecentlyCompleted(completedAt?: string, windowMinutes: number = 3): boolean {
  if (!completedAt) return false;
  
  try {
    const completedTime = new Date(completedAt).getTime();
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    return (now - completedTime) < windowMs;
  } catch {
    return false;
  }
}

/**
 * Get the time remaining in the highlight window for a recently completed task
 * Returns milliseconds remaining, or 0 if outside the window
 */
export function getHighlightTimeRemaining(completedAt?: string, windowMinutes: number = 3): number {
  if (!completedAt) return 0;
  
  try {
    const completedTime = new Date(completedAt).getTime();
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const elapsed = now - completedTime;
    const remaining = windowMs - elapsed;
    
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}






