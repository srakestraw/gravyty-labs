/**
 * Feature flags for safe execution. Env vars; default false.
 * TODO: Replace with real feature-flag service.
 */

export function isLiveSendEnabled(): boolean {
  return process.env.AGENTS_ENABLE_LIVE_SEND === "true";
}

export function isRealWebhookEnabled(): boolean {
  return process.env.AGENTS_ENABLE_REAL_WEBHOOK === "true";
}

export function isRealSfmcEnabled(): boolean {
  return process.env.AGENTS_ENABLE_REAL_SFMC === "true";
}
