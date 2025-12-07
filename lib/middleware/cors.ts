import { NextResponse } from 'next/server';

/**
 * CORS headers for API responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Sets CORS headers on a Next.js response
 * @param response - The Next.js response to modify
 * @returns The response with CORS headers added
 */
export function setCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Creates a CORS preflight response for OPTIONS requests
 * @returns NextResponse with CORS headers and 200 status
 */
export function createCorsPreflightResponse(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}






