'use client';

import { useEffect, useState } from 'react';
import { useSISStore } from '../store';
import { fetchSubjects } from '../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

export function SubjectFilter() {
  const { selectedSubject, setSelectedSubject } = useSISStore();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await fetchSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin" />
        <span>Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <FontAwesomeIcon icon="fa-solid fa-book" className="h-4 w-4" />
        Subject:
      </label>
      <select
        value={selectedSubject || ''}
        onChange={(e) => setSelectedSubject(e.target.value || null)}
        className={cn(
          'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'min-w-[150px]'
        )}
      >
        <option value="">All Subjects</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
      {selectedSubject && (
        <button
          onClick={() => setSelectedSubject(null)}
          className="text-sm text-gray-500 hover:text-gray-700"
          title="Clear filter"
        >
          <FontAwesomeIcon icon="fa-solid fa-times-circle" />
        </button>
      )}
    </div>
  );
}






