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
    // For now, just show a toast-like message
    alert(`Agent "${agent}" added`);
  };

  return (
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
              icon={getPriorityIcon(priority)} 
              className={cn('h-5 w-5', getPriorityColor(priority).split(' ')[1])}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Applicants
            </h2>
          </div>
          <p className="text-muted-foreground">{cases.length} {cases.length === 1 ? 'applicant' : 'applicants'}</p>
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
                    Missing
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Advisor
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
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No {priority} priority applicants found.
                    </td>
                  </tr>
                ) : (
                  cases.map((caseItem, index) => (
                    <motion.tr
                      key={caseItem.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => onCaseClick(caseItem.id)}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {caseItem.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {caseItem.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{caseItem.program}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full border',
                            getPriorityColor(caseItem.priority)
                          )}
                        >
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {caseItem.lastActivity}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {caseItem.missing.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            caseItem.missing.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground border border-border"
                              >
                                {item}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {caseItem.advisor}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {caseItem.activeAgents.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            caseItem.activeAgents.map((agent, idx) => (
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
                          {caseItem.suggestedAgents.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            caseItem.suggestedAgents.map((agent, idx) => (
                              <Button
                                key={idx}
                                onClick={(e) => handleAgentClick(e, agent)}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
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
  );
}

