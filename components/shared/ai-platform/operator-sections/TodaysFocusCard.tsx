'use client';

import type { AdmissionsOperatorTodaysFocusData } from '@/lib/data/provider';

interface TodaysFocusCardProps {
  data: AdmissionsOperatorTodaysFocusData | null;
}

export function TodaysFocusCard({ data }: TodaysFocusCardProps) {
  if (!data) return null;

  return (
    <div className="border-l-2 border-purple-500 bg-purple-50/40 pl-3 pr-2 py-2.5">
      <p className="text-base font-medium text-gray-900 leading-relaxed">
        <span className="text-xs font-normal text-gray-500 uppercase tracking-wide block mb-0.5">Today's focus</span>
        {data.text}
      </p>
    </div>
  );
}

