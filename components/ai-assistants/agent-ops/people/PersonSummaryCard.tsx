'use client';

import { PersonRecord, PersonAgentAssignment, contactLabel, roleLabel, assignmentStatusLabel } from '@/lib/agent-ops/people-mock';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PersonSummaryCardProps {
  person: PersonRecord;
  assignments: PersonAgentAssignment[];
  queueItems: AgentOpsItem[];
}

export function PersonSummaryCard({ person, assignments, queueItems }: PersonSummaryCardProps) {
  const dne = person.doNotEngage;
  const openItems = queueItems.filter((item) => item.status !== 'Resolved');

  return (
    <aside className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-sm">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile</h2>
        <p className="mt-1 text-sm font-medium text-gray-900">{person.name}</p>
        <p className="text-xs text-gray-600">
          {person.roles.map(roleLabel).join(' • ')} · ID {person.primaryId}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
        {person.contacts.map((c) => (
          <div key={c.type + c.value} className="flex items-center gap-2 text-xs text-gray-700">
            <FontAwesomeIcon
              icon={
                c.type === 'email'
                  ? 'fa-solid fa-envelope'
                  : c.type === 'sms'
                  ? 'fa-solid fa-message'
                  : 'fa-solid fa-phone'
              }
              className="h-3 w-3 text-gray-400"
            />
            <span>
              {contactLabel(c.type)}: {c.value}
              {c.primary && <span className="text-gray-500 ml-1">(primary)</span>}
            </span>
          </div>
        ))}
        {person.preferredChannel && (
          <p className="text-[11px] text-gray-500 mt-1">
            Preferred channel: {contactLabel(person.preferredChannel)}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Source Systems</p>
        <div className="flex flex-wrap gap-1">
          {person.sourceSystems.map((system) => (
            <span
              key={system}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
            >
              {system.charAt(0).toUpperCase() + system.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
        {dne ? (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
            Do Not Engage · {dne.reason ? dne.reason : 'opt-out'}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Eligible for engagement
          </span>
        )}
        <p className="text-[11px] text-gray-500 mt-1">
          {openItems.length} open {openItems.length === 1 ? 'item' : 'items'} in queue.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned agents</p>
        {assignments.length === 0 ? (
          <p className="text-[11px] text-gray-500">No agents assigned.</p>
        ) : (
          <ul className="space-y-1 text-[11px] text-gray-700">
            {assignments.map((a) => (
              <li key={a.agentId} className="flex items-start gap-1">
                <span className="flex-1">
                  <span className="font-medium">{a.agentName}</span>
                  <span className="text-gray-500"> · {a.agentRole}</span>
                  <span className="text-gray-500"> · {assignmentStatusLabel(a.status)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}


