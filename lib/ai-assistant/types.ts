/**
 * Shared AI Assistant Types
 * 
 * Core types for the AI Assistant module including messages, state, and domain capabilities.
 */

import type { Domain, UserContext } from './providers/types';

// Re-export Domain for convenience
export type { Domain } from './providers/types';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    sources?: Array<{ type: string; id: string; name?: string }>;
    confidence?: 'high' | 'medium' | 'low';
    toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  };
}

export interface AssistantState {
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;
  domain: Domain;
}

export interface DomainCapabilities {
  domain: Domain;
  availableActions: string[];
  description: string;
}

/**
 * Runtime prompt instructions for the AI Assistant
 */
export const ASSISTANT_SYSTEM_PROMPT = `You are an AI Assistant embedded in this product. You must use the provided Data Provider for all product data access. Do not invent facts. If you do not have sufficient data, call the Data Provider method that retrieves it. If the domain provider returns Not Implemented (Advancement - Pipeline), clearly tell the user that this capability is planned for a later phase and offer what you can do with available data.`;



