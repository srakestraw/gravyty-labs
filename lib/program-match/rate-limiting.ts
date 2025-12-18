/**
 * Rate Limiting for Program Match
 * 
 * Protects endpoints from abuse and ensures fair usage:
 * - Lead creation rate limits
 * - Progress save rate limits
 * - Scoring rate limits
 * - Bot protection
 */

export interface RateLimitConfig {
  leadCreation: {
    maxRequests: number;
    windowMs: number;
  };
  progressSave: {
    maxRequests: number;
    windowMs: number;
  };
  scoring: {
    maxRequests: number;
    windowMs: number;
  };
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  leadCreation: {
    maxRequests: 5, // 5 leads per window
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  progressSave: {
    maxRequests: 60, // 60 saves per window
    windowMs: 60 * 1000, // 1 minute
  },
  scoring: {
    maxRequests: 10, // 10 scoring requests per window
    windowMs: 60 * 1000, // 1 minute
  },
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  key: string,
  config: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // Create new window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Generate rate limit key from request context
 */
export function generateRateLimitKey(
  type: 'lead' | 'progress' | 'scoring',
  identifier: string // IP address, lead_id, or session_id
): string {
  return `program_match:${type}:${identifier}`;
}

/**
 * Check lead creation rate limit
 */
export function checkLeadCreationRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = generateRateLimitKey('lead', identifier);
  return checkRateLimit(key, config.leadCreation);
}

/**
 * Check progress save rate limit
 */
export function checkProgressSaveRateLimit(
  leadId: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = generateRateLimitKey('progress', leadId);
  return checkRateLimit(key, config.progressSave);
}

/**
 * Check scoring rate limit
 */
export function checkScoringRateLimit(
  leadId: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = generateRateLimitKey('scoring', leadId);
  return checkRateLimit(key, config.scoring);
}

/**
 * Bot protection: Check for suspicious patterns
 */
export function detectBotPattern(
  identifier: string,
  requests: Array<{ timestamp: number; endpoint: string }>
): boolean {
  // Simple bot detection heuristics
  // In production, use more sophisticated detection

  if (requests.length < 3) return false;

  // Check for too many requests in short time
  const recentRequests = requests.filter(
    (r) => Date.now() - r.timestamp < 1000 // Last second
  );
  if (recentRequests.length > 10) return true;

  // Check for identical request patterns
  const endpoints = requests.map((r) => r.endpoint);
  const uniqueEndpoints = new Set(endpoints);
  if (endpoints.length > 5 && uniqueEndpoints.size === 1) return true;

  return false;
}

/**
 * Clear rate limit for a key (for testing/admin)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status (for monitoring)
 */
export function getRateLimitStatus(key: string): RateLimitEntry | null {
  return rateLimitStore.get(key) || null;
}

