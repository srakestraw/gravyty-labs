import type { AgentOpsItem } from "@/lib/agent-ops/types";
import type { Contact } from "@/lib/contacts/contact-types";
import type { Segment } from "@/lib/segments/types";
import type { SegmentDefinition } from "@/components/shared/ai-platform/segments/types";
import type { GuardrailPolicy } from "@/lib/guardrails/types";
import type { DoNotEngageEntry } from "@/lib/do-not-engage/mockDoNotEngage";

export type DataContext = {
  workspace?: string;
  app?: string;
  mode?: 'operator' | 'leadership' | 'global' | 'workspace'; // working mode for filtering
  userId?: string; // current user ID for user-specific filtering
  persona?: string; // optional, keep if useful for scenario data
};

// Type alias for queue items (using AgentOpsItem as the underlying type)
export type QueueItem = AgentOpsItem;

export interface DataProvider {
  // Agent Ops / Queue Items
  listQueueItems(ctx: DataContext): Promise<QueueItem[]>;

  // People / Contacts
  listContacts(ctx: DataContext): Promise<Contact[]>;
  getContact(ctx: DataContext, id: string): Promise<Contact | null>;

  // Segments (lib/segments type)
  listSegments(ctx: DataContext): Promise<Segment[]>;
  getSegment(ctx: DataContext, id: string): Promise<Segment | null>;

  // Segment Definitions (AI platform type)
  listSegmentDefinitions(ctx: DataContext): Promise<SegmentDefinition[]>;
  getSegmentDefinition(ctx: DataContext, id: string): Promise<SegmentDefinition | null>;

  // Guardrails
  listGuardrailPolicies(ctx: DataContext): Promise<GuardrailPolicy[]>;

  // Do Not Engage
  listDoNotEngage(ctx: DataContext): Promise<DoNotEngageEntry[]>;
}

