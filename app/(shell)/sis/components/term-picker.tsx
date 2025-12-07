'use client';

import { useEffect, useState } from 'react';
import { useSISStore } from '../store';
import { fetchAcademicPeriods } from '../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface AcademicPeriod {
  id: string;
  code: string;
  title: string;
  status: string;
}

export function TermPicker() {
  const { selectedTermId, selectedTermCode, setSelectedTerm } = useSISStore();
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPeriods() {
      try {
        setLoading(true);
        const data = await fetchAcademicPeriods();
        setPeriods(data);
        // Auto-select first active period if none selected
        if (!selectedTermId && data.length > 0) {
          const activePeriod = data.find((p: AcademicPeriod) => p.status === 'active') || data[0];
          setSelectedTerm(activePeriod.id, activePeriod.code);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load terms');
      } finally {
        setLoading(false);
      }
    }
    loadPeriods();
  }, [selectedTermId, setSelectedTerm]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin" />
        <span>Loading terms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        <FontAwesomeIcon icon="fa-solid fa-exclamation-circle" className="mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <FontAwesomeIcon icon="fa-solid fa-calendar" className="h-4 w-4" />
        Term:
      </label>
      <select
        value={selectedTermId || ''}
        onChange={(e) => {
          const period = periods.find((p) => p.id === e.target.value);
          if (period) {
            setSelectedTerm(period.id, period.code);
          }
        }}
        className={cn(
          'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'min-w-[200px]'
        )}
      >
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.title} ({period.code})
          </option>
        ))}
      </select>
    </div>
  );
}






