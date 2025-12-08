'use client';

import { SlideUpSection } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { SummaryData } from '@/data/ai-assistant';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SummaryViewProps {
  summary: SummaryData;
  onViewPriority: (priority: 'high' | 'medium' | 'low') => void;
}

export function SummaryView({ summary, onViewPriority }: SummaryViewProps) {
  const priorityCards = [
    {
      priority: 'high' as const,
      label: 'High Priority',
      count: summary.highCount,
      description: 'Applicants with critical missing items or approaching deadlines.',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      buttonVariant: 'destructive' as const,
    },
    {
      priority: 'medium' as const,
      label: 'Medium Priority',
      count: summary.mediumCount,
      description: 'Applicants with some missing items but less urgent.',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      buttonVariant: 'default' as const,
    },
    {
      priority: 'low' as const,
      label: 'Low Priority',
      count: summary.lowCount,
      description: 'Applicants with minor issues or just starting to stall.',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      buttonVariant: 'default' as const,
    },
  ];

  const suggestedSteps = [
    { text: 'Review high-priority cases first', action: () => onViewPriority('high') },
    { text: "Build today's outreach list", action: () => {} },
    { text: "See what's causing applicants to stall", action: () => {} },
  ];

  return (
    <SlideUpSection className="max-w-6xl mx-auto px-4">
      <div className="space-y-8 py-8">
        <div className="text-center space-y-2">
          <p className="text-lg text-foreground">
            This week, <span className="font-semibold text-primary">{summary.stalledCount} applicants</span> have
            stalled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {priorityCards.map((card, index) => (
            <motion.div
              key={card.priority}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={cn(
                'border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
                card.borderColor,
                card.bgColor
              )}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon 
                      icon="fa-solid fa-exclamation-circle" 
                      className={cn('h-4 w-4', card.iconColor)}
                    />
                    <h3 className={cn('text-sm font-semibold', card.textColor)}>
                      {card.label}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{card.count}</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <Button
                  onClick={() => onViewPriority(card.priority)}
                  variant={card.buttonVariant}
                  className="w-full"
                  size="sm"
                >
                  View {card.label} Applicants
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Suggested Next Steps</h3>
          </div>
          <ul className="space-y-3">
            {suggestedSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <button
                  onClick={step.action}
                  className="text-left text-foreground hover:text-primary transition-colors text-sm leading-relaxed"
                >
                  {step.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideUpSection>
  );
}




