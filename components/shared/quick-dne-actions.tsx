'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface QuickDneActionsProps {
  personId: string;
  agentId?: string;
  onUpdate?: () => void;
}

/**
 * Quick actions dropdown for adding a person to DNE lists.
 * Can be used in agent person panels or any person context view.
 */
export function QuickDneActions({ personId, agentId, onUpdate }: QuickDneActionsProps) {
  const [adding, setAdding] = useState<string | null>(null);

  async function addToAgentDne() {
    if (!agentId) return;

    setAdding('agent');
    try {
      const response = await fetch('/api/dne/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, agentId }),
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to agent DNE list');
      }
    } catch (error) {
      console.error('Error adding to agent DNE:', error);
      alert('Failed to add to agent DNE list');
    } finally {
      setAdding(null);
    }
  }

  async function addToGlobalDne() {
    setAdding('global');
    try {
      // Add to global DNE with all channels blocked by default
      const response = await fetch('/api/dne/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          emailBlocked: true,
          smsBlocked: true,
          phoneBlocked: true,
          source: 'admin',
        }),
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to global DNE list');
      }
    } catch (error) {
      console.error('Error adding to global DNE:', error);
      alert('Failed to add to global DNE list');
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
          >
            Add to Do-Not-Engage
            <FontAwesomeIcon icon="fa-solid fa-chevron-down" className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {agentId && (
            <DropdownMenuItem
              onClick={addToAgentDne}
              disabled={adding === 'agent'}
              className="cursor-pointer"
            >
              {adding === 'agent' ? 'Adding...' : 'This agent only'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={addToGlobalDne}
            disabled={adding === 'global'}
            className="cursor-pointer"
          >
            {adding === 'global' ? 'Adding...' : 'All agents (global)'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}




