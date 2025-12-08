'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface AgentDneEntry {
  id: string;
  personId: string;
  personName: string;
  agentId: string;
  createdAt: string;
}

interface AgentDneSectionProps {
  agentId: string;
}

export function AgentDneSection({ agentId }: AgentDneSectionProps) {
  const [agentDneList, setAgentDneList] = useState<AgentDneEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      loadAgentDneList();
    }
  }, [agentId]);

  async function loadAgentDneList() {
    try {
      const response = await fetch(`/api/dne/agent?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgentDneList(data);
      }
    } catch (error) {
      console.error('Error loading agent DNE list:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removePersonFromAgentDne(personId: string) {
    setRemoving(personId);
    try {
      const response = await fetch(`/api/dne/agent?personId=${personId}&agentId=${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAgentDneList((prev) => prev.filter((entry) => entry.personId !== personId));
      }
    } catch (error) {
      console.error('Error removing person from agent DNE:', error);
    } finally {
      setRemoving(null);
    }
  }

  function openAddPersonModal() {
    // TODO: Replace with existing Person search component if available
    alert('TODO: Open person search modal to add person to agent DNE list');
  }

  if (loading) {
    return (
      <section className="rounded-lg border border-gray-100 bg-white p-3">
        <p className="text-[11px] text-gray-600">Loading...</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-900">
        Engagement rules
      </h3>
      <p className="text-[11px] text-gray-600">
        Global do-not-engage settings are always respected. Use this list to
        exclude specific people from this agent.
      </p>

      <p className="text-[11px] font-medium text-gray-700">
        Agent-specific exclusions
      </p>

      <div className="space-y-2">
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
          onClick={openAddPersonModal}
        >
          + Add person to this agent&apos;s do-not-engage list
        </button>

        {agentDneList.length === 0 ? (
          <p className="text-[11px] text-gray-500 italic">No agent-specific exclusions</p>
        ) : (
          <ul className="space-y-1 text-[11px]">
            {agentDneList.map((entry) => (
              <li key={entry.personId} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1">
                <span className="text-gray-700">{entry.personName}</span>
                <button
                  type="button"
                  className="text-[11px] text-gray-500 hover:text-red-600 disabled:opacity-50"
                  onClick={() => removePersonFromAgentDne(entry.personId)}
                  disabled={removing === entry.personId}
                >
                  {removing === entry.personId ? 'Removing...' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}




