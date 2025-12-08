'use client';

import { FadeInSection, StaggerList } from '@/components/ui/animations';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { thinkingSteps } from '@/data/ai-assistant';
import { motion } from 'framer-motion';

interface ThinkingViewProps {
  prompt: string;
}

export function ThinkingView({ prompt }: ThinkingViewProps) {
  return (
    <FadeInSection className="max-w-4xl mx-auto px-4">
      <div className="space-y-6 py-8">
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full border border-input bg-background text-sm font-medium text-foreground">
            {prompt}
          </span>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon="fa-solid fa-brain" 
                className="h-5 w-5 text-primary"
              />
              <h2 className="text-lg font-semibold text-foreground">Thinking steps…</h2>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          </div>
          <StaggerList className="space-y-3" staggerDelay={0.35}>
            {thinkingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.3 }}
                className="flex items-start gap-3 text-foreground"
              >
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{step}</span>
              </motion.div>
            ))}
          </StaggerList>
        </div>
      </div>
    </FadeInSection>
  );
}

