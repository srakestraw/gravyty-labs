'use client';

/**
 * Generic thinking animation shown while waiting for AI to return.
 * No mock steps - just an animated loading state.
 */

import { FadeInSection } from '@/components/ui/animations';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { motion } from 'framer-motion';

interface AdvancementPipelineThinkingAnimationProps {
  prompt: string;
}

export function AdvancementPipelineThinkingAnimation({
  prompt,
}: AdvancementPipelineThinkingAnimationProps) {
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
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-brain"
                  className="h-5 w-5 text-primary"
                />
              </motion.div>
              <h2 className="text-lg font-semibold text-foreground">
                Thinking…
              </h2>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
            <span className="text-sm text-muted-foreground ml-2">
              Analyzing your question…
            </span>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
