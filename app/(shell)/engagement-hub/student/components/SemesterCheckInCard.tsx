'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { checkInOptions } from '../mockData';
import { useToast } from '../ToastContext';
import { cn } from '@/lib/utils';

interface SemesterCheckInCardProps {
  onCheckIn?: (optionId: string) => void;
}

const CHECK_IN_ACKS: Record<string, string> = {
  good: "Glad you're doing well! Keep it up.",
  stressed: "We hear you. Here are some resources.",
  help: "We're here for you. Reaching out now.",
};

export function SemesterCheckInCard({ onCheckIn }: SemesterCheckInCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const toast = useToast();

  const handleSelect = (id: string) => {
    setSelected(id);
    onCheckIn?.(id);
    toast.showToast(CHECK_IN_ACKS[id] ?? "Thanks for checking in.");
  };

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-purple-50/30 p-6 shadow-sm"
      aria-labelledby="checkin-heading"
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
          <FontAwesomeIcon icon="fa-solid fa-face-smile" className="h-6 w-6 text-purple-600" aria-hidden />
        </div>
        <div className="flex-1">
          <h2 id="checkin-heading" className="font-semibold text-gray-900">
            How&apos;s your week going?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            A quick check-in helps us tailor your experience.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          {checkInOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                selected === opt.id
                  ? 'border-purple-300 bg-purple-100 text-purple-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <span aria-hidden>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
