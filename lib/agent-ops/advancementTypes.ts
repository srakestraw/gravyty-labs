/**
 * Types specific to Advancement Pipeline queue items
 */

export type AdvancementOutreachChannel = 'email' | 'sms' | 'call' | 'gratavid';

export interface AdvancementFirstDraftPayload {
  donor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    lastGiftAmount?: number;
    lastGiftDate?: string;
    lifetimeGiving?: number;
    numberOfGifts?: number;
    lastActionLabel?: string;
    lastActionDate?: string;
    assignedOfficer?: string;
    crmId?: string;
  };
  reasonForOutreach: string;
  timeline: Array<{
    id: string;
    date: string;
    type: 'gift' | 'email' | 'call' | 'event' | 'note';
    summary: string;
  }>;
  drafts: Array<{
    id: string;
    label: string;
    subject: string;
    body: string;
  }>;
  recommendedChannel?: AdvancementOutreachChannel;
}

