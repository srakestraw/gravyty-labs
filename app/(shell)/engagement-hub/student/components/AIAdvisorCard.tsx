'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

interface Bullet {
  icon: string;
  text: string;
}

interface AIAdvisorCardProps {
  bullets: readonly Bullet[];
}

export function AIAdvisorCard({ bullets }: AIAdvisorCardProps) {
  return (
    <section
      className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 p-5 shadow-sm transition-shadow hover:shadow-md"
      aria-labelledby="ai-advisor-heading"
    >
      <h2 id="ai-advisor-heading" className="mb-3 text-lg font-semibold text-gray-900">
        Your AI Advisor
      </h2>
      <ul className="mb-4 space-y-2">
        {bullets.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <FontAwesomeIcon
              icon={item.icon}
              className="h-4 w-4 shrink-0 text-purple-600"
              aria-hidden
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
        View missions
      </Button>
    </section>
  );
}
