import type { DataProvider, DataContext } from "@/lib/data/provider";

import { getMockAgentOpsItems, getMockAgentOpsItemsForWorkspace } from "@/lib/agent-ops/mock";
import { MOCK_CONTACTS } from "@/lib/contacts/mock-contacts";
import { MOCK_SEGMENTS } from "@/lib/segments/mock-segments";
import { MOCK_SEGMENTS as MOCK_SEGMENT_DEFINITIONS, getSegmentsByWorkspace } from "@/components/shared/ai-platform/segments/mock-data";
import { getMockGuardrailPolicies } from "@/lib/guardrails/mockPolicies";
import { MOCK_DO_NOT_ENGAGE } from "@/lib/do-not-engage/mockDoNotEngage";
import type { QueueItem } from "@/lib/data/provider";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockProvider: DataProvider = {
  async listQueueItems(ctx: DataContext) {
    await delay(150);
    let items: QueueItem[];

    // Filter by workspace if provided
    if (ctx.workspace) {
      items = getMockAgentOpsItemsForWorkspace(ctx.workspace);
    } else {
      items = getMockAgentOpsItems();
    }

    // Filter by app if provided (queue items have role which maps to app context)
    if (ctx.app) {
      // Map app IDs to roles for filtering
      const appRoleMap: Record<string, string> = {
        'student-lifecycle': 'Admissions', // default for student-lifecycle
        'advancement': 'Advancement',
      };
      const targetRole = appRoleMap[ctx.app];
      if (targetRole) {
        items = items.filter((item) => item.role === targetRole || item.role === 'All');
      }
    }

    // Filter by user if provided (items have assignedTo field)
    if (ctx.userId) {
      items = items.filter((item) => !item.assignedTo || item.assignedTo === ctx.userId);
    }

    // Filter by mode if provided (leadership mode might show different items)
    // For now, mode filtering is handled by the UI layer, but we can add logic here if needed
    // if (ctx.mode === 'leadership') {
    //   items = items.filter((item) => item.severity === 'Critical' || item.severity === 'High');
    // }

    return items;
  },

  async listContacts(_ctx: DataContext) {
    await delay(150);
    return MOCK_CONTACTS;
  },

  async getContact(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
  },

  async listSegments(_ctx: DataContext) {
    await delay(150);
    return MOCK_SEGMENTS;
  },

  async getSegment(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENTS.find((s) => s.id === id) ?? null;
  },

  async listSegmentDefinitions(ctx: DataContext) {
    await delay(150);
    // Filter segments by workspace/app context if provided
    if (ctx.workspace || ctx.app) {
      return getSegmentsByWorkspace(ctx.workspace, ctx.app);
    }
    return MOCK_SEGMENT_DEFINITIONS;
  },

  async getSegmentDefinition(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENT_DEFINITIONS.find((s) => s.id === id) ?? null;
  },

  async listGuardrailPolicies(_ctx: DataContext) {
    await delay(100);
    return getMockGuardrailPolicies();
  },

  async listDoNotEngage(_ctx: DataContext) {
    await delay(100);
    return MOCK_DO_NOT_ENGAGE;
  },
};

