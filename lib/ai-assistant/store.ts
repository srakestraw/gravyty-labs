/**
 * AI Assistant State Management
 * 
 * Zustand store for managing AI Assistant chat state and messages.
 */

import { create } from 'zustand';
import type { AssistantMessage, Domain } from './types';

interface AssistantStore {
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;
  domain: Domain | null;

  // Actions
  setDomain: (domain: Domain) => void;
  addMessage: (message: Omit<AssistantMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  reset: () => void;
}

export const useAssistantStore = create<AssistantStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  domain: null,

  setDomain: (domain) => set({ domain }),
  
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),

  reset: () =>
    set({
      messages: [],
      isLoading: false,
      error: null,
      domain: null,
    }),
}));



