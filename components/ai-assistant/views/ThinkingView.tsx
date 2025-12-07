'use client';

import { FadeInSection, StaggerList } from '@/components/ui/animations';
import { thinkingSteps } from '@/data/ai-assistant';
import { motion } from 'framer-motion';

interface ThinkingViewProps {
  prompt: string;
}

export function ThinkingView({ prompt }: ThinkingViewProps) {
  return (
    <FadeInSection className="max-w-4xl mx-auto">
      <div className="space-y-6 py-8">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium">
            {prompt}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thinking steps…</h2>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-purple-500"
            />
          </div>
          <StaggerList className="space-y-2" staggerDelay={0.35}>
            {thinkingSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <span>{step}</span>
              </div>
            ))}
          </StaggerList>
        </div>
      </div>
    </FadeInSection>
  );
}

