// Lazy initialization to avoid build-time errors
let prisma: any = null;
async function getPrisma() {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null;
  }
  if (!prisma) {
    try {
      // Dynamic import to prevent build-time execution
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (e) {
      // Silently fail during build
      return null;
    }
  }
  return prisma;
}

export type DneChannel = "email" | "sms" | "phone";

export interface CanEngageInput {
  personId: string;
  agentId?: string;
  channel: DneChannel;
}

export type CanEngageResult =
  | { allowed: true }
  | { allowed: false; reason: "global" | "agent" };

/**
 * Checks if an agent can engage with a person via a specific channel.
 * 
 * Returns { allowed: false } if:
 * - Global DNE is set for the person and channel, OR
 * - Agent-specific DNE is set for the person and agent
 * 
 * @param input - The engagement check parameters
 * @returns Result indicating if engagement is allowed and why it might be blocked
 */
export async function canEngage({ personId, agentId, channel }: CanEngageInput): Promise<CanEngageResult> {
  const db = await getPrisma();
  if (!db) {
    // During build or if DB unavailable, default to allowing (fail open)
    return { allowed: true };
  }

  // 1) Check global DNE for that person
  const globalDne = await db.doNotEngageGlobal.findUnique({
    where: { personId },
  });

  if (globalDne) {
    const channelField = channel === "email" ? "emailBlocked" : channel === "sms" ? "smsBlocked" : "phoneBlocked";
    if (globalDne[channelField]) {
      return { allowed: false, reason: "global" };
    }
  }

  // 2) If allowed globally and agentId is provided:
  //    - check DoNotEngageAgent for that person+agent
  if (agentId) {
    const agentDne = await db.doNotEngageAgent.findUnique({
      where: {
        personId_agentId: {
          personId,
          agentId,
        },
      },
    });

    if (agentDne) {
      return { allowed: false, reason: "agent" };
    }
  }

  // 3) Default: allowed
  return { allowed: true };
}

