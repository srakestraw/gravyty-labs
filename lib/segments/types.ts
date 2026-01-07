import type { ContactTypeId } from "../contacts/contact-types";

export type SegmentId = string;

export interface Segment {
  id: SegmentId;
  name: string;
  description?: string;
  contactTypeFilters?: ContactTypeId[];
  populationFilterLabel?: string;
  isDynamic: boolean;
  usageContexts: ("assistants" | "agents" | "campaigns")[];
  lastEvaluatedAt?: string;
}









