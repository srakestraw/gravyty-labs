'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAssignmentsForPerson,
  getActivityForPerson,
  getQueueItemsForPerson,
  PersonRecord,
  roleLabel,
} from '@/lib/agent-ops/people-mock';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { PersonSummaryCard } from '@/components/ai-assistants/agent-ops/people/PersonSummaryCard';
import { PersonTabs } from '@/components/ai-assistants/agent-ops/people/PersonTabs';
import { PersonOverviewTab } from '@/components/ai-assistants/agent-ops/people/PersonOverviewTab';
import { PersonActivityTab } from '@/components/ai-assistants/agent-ops/people/PersonActivityTab';
import { PersonQueueTab } from '@/components/ai-assistants/agent-ops/people/PersonQueueTab';
import { PersonGuardrailsTab } from '@/components/ai-assistants/agent-ops/people/PersonGuardrailsTab';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PersonDetailClientProps {
  person: PersonRecord;
}

export function PersonDetailClient({ person }: PersonDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'queue' | 'guardrails'>('overview');

  const assignments = getAssignmentsForPerson(person.id);
  const queueItems = getQueueItemsForPerson(person.id) as AgentOpsItem[];
  const activity = getActivityForPerson(person.id);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">People</p>
          <h1 className="text-lg font-semibold text-gray-900">{person.name}</h1>
          <p className="text-sm text-gray-600">
            {person.roles.map(roleLabel).join(' • ')} · ID {person.primaryId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/ai-assistants/agent-ops/people')}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-4 w-4 mr-2" />
            Back to People
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <PersonSummaryCard person={person} assignments={assignments} queueItems={queueItems} />
        <section className="space-y-3">
          <PersonTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'overview' && (
            <PersonOverviewTab person={person} queueItems={queueItems} assignments={assignments} />
          )}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
                <Link
                  href={`/ai-assistants/logs?scope=person&personId=${person.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View this person in Logs
                  <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
                </Link>
              </div>
              <PersonActivityTab activity={activity} />
            </div>
          )}
          {activeTab === 'queue' && <PersonQueueTab items={queueItems} />}
          {activeTab === 'guardrails' && <PersonGuardrailsTab person={person} />}
        </section>
      </div>
    </div>
  );
}




