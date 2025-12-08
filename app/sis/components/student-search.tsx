'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchStudents, fetchPerson } from '../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  studentNumber: string;
  person: {
    id: string;
  };
  status: string;
  type: string;
}

interface Person {
  id: string;
  names: Array<{
    given: string;
    middle?: string | null;
    family: string;
    preferred: boolean;
  }>;
  emails: Array<{
    address: string;
    preferred: boolean;
  }>;
}

interface StudentWithPerson extends Student {
  personData?: Person;
}

export function StudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentWithPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  async function performSearch(searchQuery: string) {
    try {
      setLoading(true);
      const students = await searchStudents(searchQuery);
      
      // Fetch person data for each student
      const studentsWithPersons = await Promise.all(
        students.map(async (student: Student) => {
          try {
            const personData = await fetchPerson(student.person.id);
            return { ...student, personData };
          } catch (err) {
            console.error(`Failed to fetch person for student ${student.id}:`, err);
            return { ...student, personData: undefined };
          }
        })
      );

      setResults(studentsWithPersons);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function getDisplayName(personData?: Person): string {
    if (!personData || !personData.names || personData.names.length === 0) {
      return 'Unknown';
    }
    const preferredName = personData.names.find(n => n.preferred) || personData.names[0];
    const parts = [preferredName.given];
    if (preferredName.middle) parts.push(preferredName.middle);
    parts.push(preferredName.family);
    return parts.join(' ');
  }

  function getEmail(personData?: Person): string {
    if (!personData || !personData.emails || personData.emails.length === 0) {
      return '';
    }
    const preferredEmail = personData.emails.find(e => e.preferred) || personData.emails[0];
    return preferredEmail.address;
  }

  function handleStudentClick(studentId: string) {
    router.push(`/sis/students/${studentId}`);
    setShowResults(false);
    setQuery('');
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <FontAwesomeIcon
          icon="fa-solid fa-search"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        <Input
          type="text"
          placeholder="Search students by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          className="pl-10 pr-4"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FontAwesomeIcon
              icon="fa-solid fa-spinner"
              className="h-4 w-4 text-gray-400 animate-spin"
            />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((student) => {
              const displayName = getDisplayName(student.personData);
              const email = getEmail(student.personData);
              
              return (
                <button
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {displayName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {email && <span>{email}</span>}
                        {email && student.studentNumber && <span className="mx-1">•</span>}
                        {student.studentNumber && (
                          <span className="font-mono">{student.studentNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {student.status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No students found matching &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

