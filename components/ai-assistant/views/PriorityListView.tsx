'use client';

import { SlideUpSection } from '@/components/ui/animations';
import { PriorityCase } from '@/data/ai-assistant';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PriorityListViewProps {
  cases: PriorityCase[];
  priority: 'high' | 'medium' | 'low';
  onCaseClick: (caseId: string) => void;
  onBack?: () => void;
}

export function PriorityListView({
  cases,
  priority,
  onCaseClick,
  onBack,
}: PriorityListViewProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAgentClick = (e: React.MouseEvent, agent: string) => {
    e.stopPropagation();
    // For now, just show a toast-like message
    alert(`Agent "${agent}" added`);
  };

  return (
    <SlideUpSection className="max-w-7xl mx-auto">
      <div className="space-y-6 py-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-4 w-4" />
            Back to summary
          </button>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Applicants
          </h2>
          <p className="text-gray-600">{cases.length} applicants</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Agents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Agents
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem, index) => (
                  <motion.tr
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => onCaseClick(caseItem.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {caseItem.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {caseItem.name}
                            </div>
                            <div className="text-sm text-gray-500">{caseItem.program}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getPriorityColor(caseItem.priority)
                          )}
                        >
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.lastActivity}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {caseItem.missing.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.advisor}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {caseItem.activeAgents.map((agent, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700"
                            >
                              {agent}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {caseItem.suggestedAgents.map((agent, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => handleAgentClick(e, agent)}
                              className="px-2 py-1 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              + {agent}
                            </button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SlideUpSection>
  );
}

