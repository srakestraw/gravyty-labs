import { QueueSplit } from '../SplitTabs';
import { AgentOpsItem } from '@/lib/agent-ops/types';

/**
 * Default splits for Advancement Pipeline Queue.
 * These can be customized per product or workspace.
 */
export const advancementSplits: QueueSplit[] = [
  {
    id: 'due-today',
    label: 'Due today',
    icon: 'fa-solid fa-calendar-day',
    filterFn: (item: AgentOpsItem) => {
      // Filter items due today
      if (!item.slaDueAt) return false;
      const dueDate = new Date(item.slaDueAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dueDate >= today && dueDate < tomorrow;
    },
  },
  {
    id: 'meeting-prep',
    label: 'Meeting prep',
    icon: 'fa-solid fa-briefcase',
    filterFn: (item: AgentOpsItem) => {
      const tags = item.tags || [];
      const titleLower = item.title.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      return (
        tags.some((tag) =>
          ['meeting', 'brief', 'prep', 'upcoming-meeting'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('meeting') ||
        titleLower.includes('brief') ||
        summaryLower.includes('meeting')
      );
    },
  },
  {
    id: 'first-drafts',
    label: 'First drafts',
    icon: 'fa-solid fa-file-lines',
    filterFn: (item: AgentOpsItem) => {
      return item.detailView === 'first-draft' || item.type === 'Task';
    },
  },
  {
    id: 'stewardship',
    label: 'Stewardship',
    icon: 'fa-solid fa-hand-holding-heart',
    filterFn: (item: AgentOpsItem) => {
      const tags = item.tags || [];
      const titleLower = item.title.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      return (
        tags.some((tag) =>
          ['stewardship', 'thank-you', 'follow-up', 'gift'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stewardship') ||
        titleLower.includes('thank') ||
        summaryLower.includes('stewardship')
      );
    },
  },
  {
    id: 'stalled',
    label: 'Stalled',
    icon: 'fa-solid fa-pause',
    filterFn: (item: AgentOpsItem) => {
      const tags = item.tags || [];
      const titleLower = item.title.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      return (
        tags.some((tag) =>
          ['stalled', 'inactive', 'no-activity', 'overdue', 'stale'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stalled') ||
        titleLower.includes('overdue') ||
        summaryLower.includes('stalled') ||
        summaryLower.includes('no activity')
      );
    },
  },
  {
    id: 'fyi',
    label: 'FYI',
    icon: 'fa-solid fa-info',
    filterFn: (item: AgentOpsItem) => {
      const tags = item.tags || [];
      return tags.some((tag) => ['fyi', 'info', 'informational'].includes(tag.toLowerCase()));
    },
  },
];

/**
 * Get default splits for a workspace.
 * Products can override this to provide their own splits.
 */
export function getDefaultSplits(workspaceId?: string): QueueSplit[] {
  if (workspaceId === 'advancement') {
    return advancementSplits;
  }
  // Default: no splits (show all items)
  return [];
}


