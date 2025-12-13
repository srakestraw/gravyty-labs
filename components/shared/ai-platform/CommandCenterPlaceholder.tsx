import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { WorkingMode } from '@/lib/command-center/resolver';

interface CommandCenterPlaceholderProps {
  workspaceLabel: string;
  mode: WorkingMode;
}

/**
 * Placeholder component for Command Center instances that haven't been implemented yet.
 * Shows a message indicating the view is coming soon and suggests switching modes.
 */
export function CommandCenterPlaceholder({ workspaceLabel, mode }: CommandCenterPlaceholderProps) {
  const modeLabel = mode === 'operator' ? 'Operator' : 'Leader';
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FontAwesomeIcon icon="fa-solid fa-compass" className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {workspaceLabel} Command Center ({modeLabel})
          </h2>
          <p className="text-sm text-gray-600">
            Placeholder - this view will be implemented next. Switch Working Mode to access available views.
          </p>
        </div>
      </div>
    </div>
  );
}

