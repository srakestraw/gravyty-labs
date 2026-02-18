'use client';

import { useState, useRef, useEffect } from 'react';
import { SlideUpSection } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { TableBatchActions } from '@/components/advancement/pipeline/TableBatchActions';
import { ToastContainer } from '@/components/shared/queue/ToastContainer';
import { useToast } from '@/components/shared/queue/useToast';
import type { PriorityProspectRow, PriorityBucket } from '@/lib/ai-assistant/providers/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BATCH_ACTION_TOAST: Record<string, string> = {
  assign_agent: 'Assigned to Agent',
  create_segment: 'Created Segment',
  create_task: 'Created Task',
};

interface AdvancementPipelinePriorityListViewProps {
  prospects: PriorityProspectRow[];
  bucket: PriorityBucket;
  onProspectClick: (prospectId: string) => void;
  onBack?: () => void;
}

export function AdvancementPipelinePriorityListView({
  prospects,
  bucket,
  onProspectClick,
  onBack,
}: AdvancementPipelinePriorityListViewProps) {
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
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high':
        return 'fa-solid fa-exclamation-circle';
      case 'medium':
        return 'fa-solid fa-exclamation-triangle';
      case 'low':
        return 'fa-solid fa-info-circle';
      default:
        return 'fa-solid fa-circle';
    }
  };

  const handleAgentClick = (e: React.MouseEvent, agent: string) => {
    e.stopPropagation();
    // Toast or no-op for now
  };

  const handleBatchAction = (key: string, ids: string[]) => {
    console.log({ actionKey: key, selectedIds: ids });
    const label = BATCH_ACTION_TOAST[key] ?? key;
    toast.success(`${label} (${ids.length} prospects)`);
  };

  const toggleRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const label =
    bucket === 'high'
      ? 'High Priority Prospects'
      : bucket === 'medium'
        ? 'Medium Priority Prospects'
        : 'Low Priority Prospects';

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      <SlideUpSection className="max-w-7xl mx-auto px-4">
        <div className="space-y-6 py-8">
          {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-4 w-4" />
            Back to summary
          </Button>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={getPriorityIcon(bucket)}
              className={cn('h-5 w-5', getPriorityColor(bucket).split(' ')[1])}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {label}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {prospects.length}{' '}
            {prospects.length === 1 ? 'prospect' : 'prospects'}
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
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stall Reason
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Agents
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Suggested Agents
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {prospects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No {bucket} priority prospects found.
                    </td>
                  </tr>
                ) : (
                  prospects.map((prospect, index) => (
                    <motion.tr
                      key={prospect.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => onProspectClick(prospect.id)}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <td
                        className="w-10 px-3 py-4"
                        onClick={(e) => toggleRow(e, prospect.id)}
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {prospect.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {prospect.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prospect.subtitle || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full border',
                            getPriorityColor(prospect.priority)
                          )}
                        >
                          {prospect.priority}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {prospect.lastActivity}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {prospect.stallReasons.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          ) : (
                            prospect.stallReasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground border border-border"
                              >
                                {reason}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {prospect.officer}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {prospect.activeAgents.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          ) : (
                            prospect.activeAgents.map((agent, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20"
                              >
                                {agent}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {prospect.suggestedAgents.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          ) : (
                            prospect.suggestedAgents.map((agent, idx) => (
                              <Button
                                key={idx}
                                onClick={(e) => handleAgentClick(e, agent)}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                <FontAwesomeIcon
                                  icon="fa-solid fa-plus"
                                  className="h-3 w-3 mr-1"
                                />
                                {agent}
                              </Button>
                            ))
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SlideUpSection>
    </>
  );
}
