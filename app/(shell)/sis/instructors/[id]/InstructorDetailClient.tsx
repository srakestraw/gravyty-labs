'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSections, fetchPerson } from '../../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  crn: string;
  number: string;
  title: string | null;
  course: {
    id: string;
    subject: {
      code: string;
    };
    number: string;
    title: string;
  };
  academicPeriod: {
    id: string;
    code: string;
    title: string;
  };
  status: string;
  capacity: number;
  enrolled: number;
  schedule: {
    daysOfWeek: string[];
    startTime: string | null;
    endTime: string | null;
    room: {
      building: string;
      number: string;
    } | null;
  } | null;
  credits: {
    minimum: number;
    maximum: number;
  };
  instructors?: Array<{
    person: {
      id: string;
    };
    role: string;
  }>;
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

interface InstructorDetailClientProps {
  instructorId: string;
}

export function InstructorDetailClient({ instructorId }: InstructorDetailClientProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [instructor, setInstructor] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTerm, setCurrentTerm] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstructorData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch instructor person data
        const personData = await fetchPerson(instructorId);
        if (!personData) {
          setError('Instructor not found');
          return;
        }
        setInstructor(personData);

        // Get current active term
        const periodsResponse = await fetch('/api/banner/academic-periods?status=active');
        const periods = await periodsResponse.json();
        const activeTerm = periods[0]?.code || null;
        setCurrentTerm(activeTerm);

        if (!activeTerm) {
          setError('No active term found');
          return;
        }

        // Fetch all sections for the term
        const sectionsData = await fetchSections({
          termCode: activeTerm,
        });

        // Filter sections where this instructor is assigned
        const instructorSections = sectionsData.filter((section: Section) => {
          return section.instructors?.some(
            (instructor) => instructor.person.id === instructorId
          );
        });

        setSections(instructorSections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load instructor data');
      } finally {
        setLoading(false);
      }
    }

    if (instructorId) {
      loadInstructorData();
    }
  }, [instructorId]);

  function getDisplayName(person: Person | null): string {
    if (!person || !person.names || person.names.length === 0) {
      return 'Unknown';
    }
    const preferredName = person.names.find(n => n.preferred) || person.names[0];
    const parts = [preferredName.given];
    if (preferredName.middle) parts.push(preferredName.middle);
    parts.push(preferredName.family);
    return parts.join(' ');
  }

  function getEmail(person: Person | null): string {
    if (!person || !person.emails || person.emails.length === 0) {
      return '';
    }
    const preferredEmail = person.emails.find(e => e.preferred) || person.emails[0];
    return preferredEmail.address;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin h-5 w-5" />
          <span>Loading instructor data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon="fa-solid fa-exclamation-circle" className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium text-gray-900 mb-2">Error</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/sis">
          <Button variant="outline">Back to SIS</Button>
        </Link>
      </div>
    );
  }

  const formatDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      monday: 'M',
      tuesday: 'T',
      wednesday: 'W',
      thursday: 'Th',
      friday: 'F',
      saturday: 'Sa',
      sunday: 'Su',
    };
    return days.map((d) => dayMap[d.toLowerCase()] || d).join('');
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/sis">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Schedule</h1>
            {instructor && (
              <div className="text-gray-600 mt-1">
                <p className="font-medium">{getDisplayName(instructor)}</p>
                {getEmail(instructor) && (
                  <p className="text-sm">{getEmail(instructor)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      {currentTerm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-calendar" className="h-5 w-5 text-[#336AEA]" />
            Sections for {currentTerm} ({sections.length})
          </h2>

          {sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FontAwesomeIcon icon="fa-solid fa-chalkboard-teacher" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sections found for this instructor in the current term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      CRN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Enrollment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((section) => {
                    const courseCode = `${section.course.subject.code} ${section.course.number}`;
                    const enrollmentPercent = section.capacity > 0
                      ? (section.enrolled / section.capacity) * 100
                      : 0;

                    return (
                      <tr
                        key={section.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/sis/sections/${section.id}`}
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          <Link
                            href={`/sis/sections/${section.id}`}
                            className="text-[#336AEA] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {section.crn}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {courseCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {section.title || section.course.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {section.schedule ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                {formatDays(section.schedule.daysOfWeek)}
                              </div>
                              {section.schedule.startTime && section.schedule.endTime && (
                                <div className="text-xs text-gray-500">
                                  {formatTime(section.schedule.startTime)} - {formatTime(section.schedule.endTime)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">TBA</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {section.schedule?.room ? (
                            <span>
                              {section.schedule.room.building} {section.schedule.room.number}
                            </span>
                          ) : (
                            <span className="text-gray-400">TBA</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            <div className="text-gray-900">
                              {section.enrolled} / {section.capacity}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={cn(
                                  'h-1.5 rounded-full transition-all',
                                  enrollmentPercent >= 100
                                    ? 'bg-red-500'
                                    : enrollmentPercent >= 80
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                )}
                                style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              section.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : section.status === 'closed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {section.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


