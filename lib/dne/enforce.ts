import { canEngage, type DneChannel, type CanEngageResult } from './canEngage';

/**
 * Enforces DNE checks before sending outbound communications.
 * 
 * Call this function before sending email, SMS, or phone calls.
 * 
 * @param personId - The person to contact
 * @param agentId - The agent attempting to contact (optional)
 * @param channel - The communication channel
 * @returns Result indicating if the communication can proceed
 * 
 * @example
 * ```ts
 * const result = await enforceDne({ personId, agentId, channel: "email" });
 * if (!result.allowed) {
 *   // Log the block event
 *   console.log(`DNE blocked: ${result.reason}`);
 *   return; // Don't send
 * }
 * // Proceed with sending email
 * ```
 */
export async function enforceDne({
  personId,
  agentId,
  channel,
}: {
  personId: string;
  agentId?: string;
  channel: DneChannel;
}): Promise<CanEngageResult> {
  return await canEngage({ personId, agentId, channel });
}

/**
 * Helper to log DNE block events.
 * TODO: Integrate with agent timeline/activity logging system when available.
 * 
 * @param agentId - The agent that attempted to contact
 * @param personId - The person that was blocked
 * @param reason - Why it was blocked ("global" or "agent")
 * @param channel - The communication channel
 */
export async function logDneBlock(
  agentId: string | undefined,
  personId: string,
  reason: "global" | "agent",
  channel: DneChannel
): Promise<void> {
  // TODO: Integrate with agent timeline/activity logging system
  console.log(`[DNE Block] Agent: ${agentId || 'unknown'}, Person: ${personId}, Reason: ${reason}, Channel: ${channel}`);
  
  // Example integration point:
  // if (agentId) {
  //   await logAgentEvent({
  //     agentId,
  //     personId,
  //     type: "dne_block",
  //     reason,
  //     channel,
  //   });
  // }
}


