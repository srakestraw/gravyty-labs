'use client';

import React, { useState } from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { AdvancementFirstDraftPayload } from '@/lib/agent-ops/advancementTypes';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import type { QueueDetailRendererProps } from './registry';

/**
 * Advancement First Draft Detail Renderer
 * 
 * Custom detail view for Advancement Pipeline First Draft queue items.
 * Shows donor profile, engagement timeline, reason for outreach, AI-drafted emails, and action buttons.
 */
export function AdvancementFirstDraftDetail({
  item,
  onAction,
  onNavigateToPerson,
}: QueueDetailRendererProps) {
  const payload = item.payload as AdvancementFirstDraftPayload | undefined;
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(
    payload?.drafts?.[0]?.id || null
  );

  if (!payload) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Missing payload data for First Draft item.</p>
      </div>
    );
  }

  const selectedDraft = payload.drafts.find((d) => d.id === selectedDraftId) || payload.drafts[0];
  const donor = payload.donor;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'gift':
        return 'fa-solid fa-gift';
      case 'email':
        return 'fa-solid fa-envelope';
      case 'call':
        return 'fa-solid fa-phone';
      case 'event':
        return 'fa-solid fa-calendar';
      case 'note':
        return 'fa-solid fa-note-sticky';
      default:
        return 'fa-solid fa-circle';
    }
  };

  const handleAction = (action: QueueAction) => {
    if (onAction) {
      onAction(item.id, action);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <header className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">First Draft</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{item.severity}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h2>
              <p className="text-sm text-gray-600">{item.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {item.status}
              </span>
            </div>
          </div>
        </header>

        {/* Donor/Prospect Profile */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Donor/Prospect Profile</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{donor.name}</div>
                {donor.email && (
                  <div className="text-sm text-gray-600 mt-1">{donor.email}</div>
                )}
                {donor.phone && (
                  <div className="text-sm text-gray-600">{donor.phone}</div>
                )}
                {donor.location && (
                  <div className="text-sm text-gray-600">{donor.location}</div>
                )}
              </div>
              {onNavigateToPerson && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToPerson(donor.id)}
                  className="text-xs"
                >
                  View Profile
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              {donor.lastGiftAmount !== undefined && (
                <div>
                  <div className="text-xs text-gray-500">Last Gift</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(donor.lastGiftAmount)}
                  </div>
                  {donor.lastGiftDate && (
                    <div className="text-xs text-gray-500">{formatDate(donor.lastGiftDate)}</div>
                  )}
                </div>
              )}
              {donor.lifetimeGiving !== undefined && (
                <div>
                  <div className="text-xs text-gray-500">Lifetime Giving</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(donor.lifetimeGiving)}
                  </div>
                </div>
              )}
              {donor.numberOfGifts !== undefined && (
                <div>
                  <div className="text-xs text-gray-500">Number of Gifts</div>
                  <div className="text-sm font-medium text-gray-900">{donor.numberOfGifts}</div>
                </div>
              )}
              {donor.assignedOfficer && (
                <div>
                  <div className="text-xs text-gray-500">Assigned Officer</div>
                  <div className="text-sm font-medium text-gray-900">{donor.assignedOfficer}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Engagement Timeline */}
        {payload.timeline && payload.timeline.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Engagement Timeline</h3>
            <div className="space-y-3">
              {payload.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon
                      icon={getTimelineIcon(event.type)}
                      className="h-4 w-4 text-gray-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">{event.type}</span>
                    </div>
                    <div className="text-sm text-gray-900">{event.summary}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reason for Outreach */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Reason for Outreach</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-900">{payload.reasonForOutreach}</p>
          </div>
        </section>

        {/* AI Drafted Email Composer */}
        {payload.drafts && payload.drafts.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">AI Drafted Email</h3>
            
            {/* Draft Selector */}
            {payload.drafts.length > 1 && (
              <div className="flex gap-2">
                {payload.drafts.map((draft) => (
                  <Button
                    key={draft.id}
                    variant={selectedDraftId === draft.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDraftId(draft.id)}
                    className="text-xs"
                  >
                    {draft.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Selected Draft */}
            {selectedDraft && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Subject</div>
                  <div className="text-sm font-medium text-gray-900">{selectedDraft.subject}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Body</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDraft.body}</div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Action Row */}
        <section className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="text-xs"
              onClick={() => handleAction('send-email' as QueueAction)}
            >
              <FontAwesomeIcon icon="fa-solid fa-paper-plane" className="h-3 w-3 mr-1.5" />
              Send Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleAction('send-gratavid' as QueueAction)}
            >
              <FontAwesomeIcon icon="fa-solid fa-video" className="h-3 w-3 mr-1.5" />
              Send Gratavid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleAction('call' as QueueAction)}
            >
              <FontAwesomeIcon icon="fa-solid fa-phone" className="h-3 w-3 mr-1.5" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleAction('sms' as QueueAction)}
            >
              <FontAwesomeIcon icon="fa-solid fa-message" className="h-3 w-3 mr-1.5" />
              SMS
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleAction('snooze')}
            >
              <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3 mr-1.5" />
              Snooze
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleAction('skip' as QueueAction)}
            >
              <FontAwesomeIcon icon="fa-solid fa-forward" className="h-3 w-3 mr-1.5" />
              Skip
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

