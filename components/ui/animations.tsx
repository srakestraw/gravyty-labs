'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeInSection({
  children,
  className,
  delay = 0,
  duration = 0.4,
}: FadeInSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface SlideUpSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function SlideUpSection({
  children,
  className,
  delay = 0,
  duration = 0.4,
  y = 8,
}: SlideUpSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  itemDelay?: number;
}

export function StaggerList({
  children,
  className,
  staggerDelay = 0.1,
  itemDelay = 0,
}: StaggerListProps) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={cn(className)}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: itemDelay + index * staggerDelay,
            duration: 0.3,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}




