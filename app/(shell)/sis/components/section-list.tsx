'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSISStore } from '../store';
import { fetchSections, fetchCourses } from '../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  crn: string;
  number: string;
  title: string | null;
  course: {
    id: string;
  };
  academicPeriod: {
    id: string;
    code: string;
  };
  status: string;
  capacity: number;
  enrolled: number;
  available: number;
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
}

interface Course {
  id: string;
  subject: {
    code: string;
  };
  number: string;
  title: string;
}

export function SectionList() {
  const { selectedTermCode, selectedSubject } = useSISStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSections() {
      if (!selectedTermCode) {
        setSections([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch sections for the selected term
        const sectionsData = await fetchSections({
          termCode: selectedTermCode,
          status: selectedSubject ? undefined : 'open',
        });

        // Filter by subject if selected
        let filteredSections = sectionsData;
        if (selectedSubject) {
          // Fetch courses to get subject codes
          const coursesData = await fetchCourses({ status: 'active' });
          const courseMap: Record<string, Course> = {};
          coursesData.forEach((course: Course) => {
            courseMap[course.id] = course;
          });
          setCourses(courseMap);

          filteredSections = sectionsData.filter((section: Section) => {
            const course = courseMap[section.course.id];
            return course?.subject?.code === selectedSubject;
          });
        } else {
          // Still fetch courses for display
          const coursesData = await fetchCourses({ status: 'active' });
          const courseMap: Record<string, Course> = {};
          coursesData.forEach((course: Course) => {
            courseMap[course.id] = course;
          });
          setCourses(courseMap);
        }

        setSections(filteredSections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sections');
      } finally {
        setLoading(false);
      }
    }

    loadSections();
  }, [selectedTermCode, selectedSubject]);

  if (!selectedTermCode) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FontAwesomeIcon icon="fa-solid fa-calendar-check" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Please select a term to view sections</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin h-5 w-5" />
          <span>Loading sections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <FontAwesomeIcon icon="fa-solid fa-exclamation-circle" className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FontAwesomeIcon icon="fa-solid fa-inbox" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No sections found for the selected term{selectedSubject ? ` and subject (${selectedSubject})` : ''}</p>
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
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Sections ({sections.length})
        </h3>
      </div>

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
                Credits
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
              const course = courses[section.course.id];
              const courseCode = course
                ? `${course.subject.code} ${course.number}`
                : 'N/A';
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
                    {section.title || course?.title || 'N/A'}
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {section.credits.minimum === section.credits.maximum
                      ? section.credits.minimum
                      : `${section.credits.minimum}-${section.credits.maximum}`}
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
    </div>
  );
}






