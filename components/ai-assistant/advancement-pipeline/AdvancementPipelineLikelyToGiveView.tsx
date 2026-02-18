'use client';

import { useState, useRef, useEffect } from 'react';
import { SlideUpSection } from '@/components/ui/animations';
import { Checkbox } from '@/components/ui/checkbox';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { TableBatchActions } from '@/components/advancement/pipeline/TableBatchActions';
import { ToastContainer } from '@/components/shared/queue/ToastContainer';
import { useToast } from '@/components/shared/queue/useToast';
import type { LikelyToGiveProspect } from '@/lib/ai-assistant/providers/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BATCH_ACTION_TOAST: Record<string, string> = {
  assign_agent: 'Assigned to Agent',
  create_segment: 'Created Segment',
  create_task: 'Created Task',
};

interface AdvancementPipelineLikelyToGiveViewProps {
  prospects: LikelyToGiveProspect[];
  resultTitle?: string;
  resultDescription?: string;
  suggestedNextSteps?: string[];
}

const DEFAULT_TITLE = 'Prospects likely to give in 30 days';
const DEFAULT_DESCRIPTION = 'Ranked by opportunity score based on giving history and engagement.';
const DEFAULT_STEPS = [
  'Reach out to top 3 prospects this week',
  'Personalize outreach based on giving history',
  'Schedule calls for high-score prospects',
];

export function AdvancementPipelineLikelyToGiveView({
  prospects,
  resultTitle = DEFAULT_TITLE,
  resultDescription = DEFAULT_DESCRIPTION,
  suggestedNextSteps = DEFAULT_STEPS,
}: AdvancementPipelineLikelyToGiveViewProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const headerCheckRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const visibleRowIds = prospects.map((p) => p.id);

  const isAllSelected =
    visibleRowIds.length > 0 && selectedIds.length === visibleRowIds.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < visibleRowIds.length;

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleBatchAction = (key: string, ids: string[]) => {
    console.log({ actionKey: key, selectedIds: ids });
    const label = BATCH_ACTION_TOAST[key] ?? key;
    toast.success(`${label} (${ids.length} prospects)`);
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      <SlideUpSection className="max-w-4xl mx-auto px-4">
        <div className="space-y-8 py-8">
          <div className="text-center space-y-2">
          <p className="text-lg text-foreground">
            {resultTitle}: <span className="font-semibold text-primary">{prospects.length} prospects</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {resultDescription}
          </p>
        </div>

        <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
          <TableBatchActions
            selectedIds={selectedIds}
            onAction={handleBatchAction}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="w-10 px-3 py-3">
                    {visibleRowIds.length > 0 && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          ref={headerCheckRef}
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={() => {
                            if (isAllSelected) setSelectedIds([]);
                            else setSelectedIds([...visibleRowIds]);
                          }}
                          className="h-4 w-4 rounded border border-primary cursor-pointer"
                          aria-label="Select all"
                        />
                      </div>
                    )}
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Gift
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {prospects.map((prospect, index) => (
                  <motion.tr
                    key={prospect.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => router.push(`/advancement/pipeline/assistant/prospect/${prospect.id}`)}
                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <td
                      className="w-10 px-3 py-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIds((prev) =>
                          prev.includes(prospect.id)
                            ? prev.filter((x) => x !== prospect.id)
                            : [...prev, prospect.id]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.includes(prospect.id)}
                        onCheckedChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(prospect.id)
                              ? prev.filter((x) => x !== prospect.id)
                              : [...prev, prospect.id]
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {prospect.name}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {prospect.score ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {prospect.lastGiftDate ?? '-'}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {prospect.givingTier ?? '-'}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-primary font-medium hover:underline">
                        View profile
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Suggested Next Steps</h3>
          </div>
          <ul className="space-y-3">
            {suggestedNextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideUpSection>
    </>
  );
}
