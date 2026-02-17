'use client';

import { SlideUpSection } from '@/components/ui/animations';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { PriorityProspectRow } from '@/lib/ai-assistant/providers/types';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface AdvancementPipelinePriorityListTodayViewProps {
  prospects: PriorityProspectRow[];
  resultTitle?: string;
  resultDescription?: string;
  suggestedNextSteps?: string[];
}

const DEFAULT_TITLE = 'Your priority list for today';
const DEFAULT_DESCRIPTION = 'Balanced for urgency and opportunity. Start with high-priority items.';
const DEFAULT_STEPS = [
  'Tackle high-priority prospects first',
  'Block time for outreach calls',
  'Create tasks for follow-ups',
];

export function AdvancementPipelinePriorityListTodayView({
  prospects,
  resultTitle = DEFAULT_TITLE,
  resultDescription = DEFAULT_DESCRIPTION,
  suggestedNextSteps = DEFAULT_STEPS,
}: AdvancementPipelinePriorityListTodayViewProps) {
  const router = useRouter();

  return (
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
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
                    Officer
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
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">{prospect.name}</div>
                        <div className="text-sm text-muted-foreground">{prospect.subtitle ?? '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          prospect.priority === 'high'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : prospect.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {prospect.priority}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {prospect.lastActivity}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {prospect.officer}
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
  );
}
