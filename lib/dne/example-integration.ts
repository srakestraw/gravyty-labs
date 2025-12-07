/**
 * Example integration showing how to enforce DNE in outbound communications.
 * 
 * This file demonstrates the pattern for integrating DNE checks into
 * email, SMS, and phone sending functions.
 * 
 * TODO: Replace these example functions with your actual communication sending logic.
 */

import { enforceDne, logDneBlock } from './enforce';

/**
 * Example: Email sending with DNE enforcement
 */
export async function sendEmailWithDne(
  personId: string,
  agentId: string,
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; reason?: string }> {
  // 1. Check DNE before sending
  const result = await enforceDne({
    personId,
    agentId,
    channel: 'email',
  });

  if (!result.allowed) {
    // 2. Log the block event
    await logDneBlock(agentId, personId, result.reason, 'email');
    
    // 3. Short-circuit the send
    return { success: false, reason: 'dne_blocked' };
  }

  // 4. Proceed with sending email
  // TODO: Replace with your actual email sending logic
  try {
    // await sendEmail(to, subject, body);
    console.log(`[Email] Sending to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, reason: 'send_failed' };
  }
}

/**
 * Example: SMS sending with DNE enforcement
 */
export async function sendSmsWithDne(
  personId: string,
  agentId: string,
  to: string,
  message: string
): Promise<{ success: boolean; reason?: string }> {
  const result = await enforceDne({
    personId,
    agentId,
    channel: 'sms',
  });

  if (!result.allowed) {
    await logDneBlock(agentId, personId, result.reason, 'sms');
    return { success: false, reason: 'dne_blocked' };
  }

  // TODO: Replace with your actual SMS sending logic
  try {
    // await sendSms(to, message);
    console.log(`[SMS] Sending to ${to}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, reason: 'send_failed' };
  }
}

/**
 * Example: Phone/robocall with DNE enforcement
 */
export async function makeCallWithDne(
  personId: string,
  agentId: string,
  to: string,
  script: string
): Promise<{ success: boolean; reason?: string }> {
  const result = await enforceDne({
    personId,
    agentId,
    channel: 'phone',
  });

  if (!result.allowed) {
    await logDneBlock(agentId, personId, result.reason, 'phone');
    return { success: false, reason: 'dne_blocked' };
  }

  // TODO: Replace with your actual phone/robocall logic
  try {
    // await makeRobocall(to, script);
    console.log(`[Phone] Calling ${to} with script: ${script}`);
    return { success: true };
  } catch (error) {
    console.error('Error making call:', error);
    return { success: false, reason: 'send_failed' };
  }
}

/**
 * Example: Internal action (NOT blocked by DNE)
 * 
 * Tasks, flags, and other internal actions should proceed
 * regardless of DNE settings.
 */
export async function createTask(
  personId: string,
  agentId: string,
  taskDescription: string
): Promise<{ success: boolean }> {
  // No DNE check needed for internal actions
  // TODO: Replace with your actual task creation logic
  try {
    // await createTaskForPerson(personId, taskDescription);
    console.log(`[Task] Creating task for person ${personId}: ${taskDescription}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false };
  }
}


