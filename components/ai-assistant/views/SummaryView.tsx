'use client';

import { SlideUpSection } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { SummaryData } from '@/data/ai-assistant';
import { motion } from 'framer-motion';

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
      color: 'border-red-200 bg-red-50',
      textColor: 'text-red-700',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    {
      priority: 'medium' as const,
      label: 'Medium Priority',
      count: summary.mediumCount,
      description: 'Applicants with some missing items but less urgent.',
      color: 'border-yellow-200 bg-yellow-50',
      textColor: 'text-yellow-700',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      priority: 'low' as const,
      label: 'Low Priority',
      count: summary.lowCount,
      description: 'Applicants with minor issues or just starting to stall.',
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-700',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  const suggestedSteps = [
    'Review high-priority cases first',
    "Build today's outreach list",
    "See what's causing applicants to stall",
  ];

  return (
    <SlideUpSection className="max-w-6xl mx-auto">
      <div className="space-y-6 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-700">
            This week, <span className="font-semibold">{summary.stalledCount} applicants</span> have
            stalled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityCards.map((card, index) => (
            <motion.div
              key={card.priority}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`border rounded-lg p-6 ${card.color}`}
            >
              <div className="space-y-4">
                <div>
                  <h3 className={`text-sm font-semibold ${card.textColor} mb-1`}>
                    {card.label}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">{card.count}</p>
                  <p className="text-sm text-gray-600 mt-2">{card.description}</p>
                </div>
                <Button
                  onClick={() => onViewPriority(card.priority)}
                  className={`w-full ${card.buttonColor} text-white`}
                  size="sm"
                >
                  View {card.label} Applicants
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Next Steps</h3>
          <ul className="space-y-2">
            {suggestedSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <button
                  onClick={() => {
                    if (index === 0) {
                      onViewPriority('high');
                    } else {
                      // Handle other steps if needed
                    }
                  }}
                  className="text-left hover:text-purple-600 transition-colors"
                >
                  {step}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideUpSection>
  );
}




