'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import type { WorkspaceConfig } from '@/lib/student-lifecycle/workspaces';

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceConfig | null;
  availableWorkspaces: WorkspaceConfig[];
}

export function WorkspaceSwitcher({ currentWorkspace, availableWorkspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Only show dropdown if we have a current workspace and multiple workspaces available
  if (!currentWorkspace || availableWorkspaces.length <= 1) {
    // Show static pill if only one workspace or no workspace
    if (currentWorkspace) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200 hidden sm:inline">
          {currentWorkspace.label}
        </span>
      );
    }
    return null;
  }

  const handleWorkspaceSelect = (workspaceId: string) => {
    if (!pathname) return;

    // Extract the current route path after the workspace
    // e.g., /student-lifecycle/admissions/ai -> /ai
    // e.g., /student-lifecycle/admissions/assistant -> /assistant
    const match = pathname.match(/^\/student-lifecycle\/[^/]+(\/.+)?$/);
    const subPath = match?.[1] || '/ai'; // Default to /ai (Command Center) if no sub-path

    // Navigate to the new workspace with the same sub-path
    const newPath = `/student-lifecycle/${workspaceId}${subPath}`;
    setOpen(false);
    router.push(newPath);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200',
            'hidden sm:inline-flex items-center gap-1.5 hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1'
          )}
        >
          <span>{currentWorkspace.label}</span>
          <FontAwesomeIcon icon="fa-solid fa-chevron-down" className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {availableWorkspaces.map((workspace) => {
          const isActive = workspace.id === currentWorkspace.id;
          return (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceSelect(workspace.id)}
              className={cn(
                'cursor-pointer',
                isActive && 'bg-purple-50 text-purple-900 font-medium'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span>{workspace.label}</span>
                {isActive && (
                  <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3 text-purple-600" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

