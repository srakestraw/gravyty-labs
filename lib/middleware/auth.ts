import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates Bearer token authentication for API requests
 * @param request - The incoming Next.js request
 * @returns true if authenticated, false otherwise
 */
export function requireAuth(request: NextRequest): boolean {
  const validTokens = getValidTokens();
  
  // If tokens is null, auth is bypassed (dev mode without API_TOKENS)
  if (validTokens === null) {
    return true;
  }
  
  // If no valid tokens configured in production, require auth
  if (validTokens.length === 0) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return validTokens.includes(token);
}

/**
 * Creates an unauthorized response
 */
export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Gets valid API tokens from environment variable
 * @returns Array of valid tokens, or null if auth should be bypassed in dev
 */
function getValidTokens(): string[] | null {
  const tokensEnv = process.env.API_TOKENS;
  
  if (!tokensEnv) {
    // In development, allow requests without tokens if API_TOKENS is not set
    // In production, this should always be set
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return null; // Bypass auth in development when API_TOKENS is not set
  }

  return tokensEnv
    .split(',')
    .map(token => token.trim())
    .filter(token => token.length > 0);
}

/**
 * Middleware helper to check auth and return response if unauthorized
 * @param request - The incoming Next.js request
 * @returns NextResponse if unauthorized, null if authorized
 */
export function checkAuth(request: NextRequest): NextResponse | null {
  if (!requireAuth(request)) {
    return createUnauthorizedResponse();
  }
  return null;
}

