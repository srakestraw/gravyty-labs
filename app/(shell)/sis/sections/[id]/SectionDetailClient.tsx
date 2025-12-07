'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSections, fetchSectionRegistrations, fetchPerson } from '../../lib/api';
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

interface SectionRegistration {
  id: string;
  student: {
    id: string;
    studentNumber: string;
    person: {
      id: string;
    };
  };
  statusCode: string;
  registeredOn: string;
  credits: number;
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

interface RegistrationWithPerson extends SectionRegistration {
  personData?: Person;
}

interface SectionDetailClientProps {
  sectionId: string;
}

export function SectionDetailClient({ sectionId }: SectionDetailClientProps) {
  const [section, setSection] = useState<Section | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSectionData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch section details
        const sectionsData = await fetchSections({});
        const foundSection = sectionsData.find((s: Section) => s.id === sectionId);

        if (!foundSection) {
          setError('Section not found');
          return;
        }

        // Fetch course details if needed
        const sectionWithCourse: Section = foundSection;
        setSection(sectionWithCourse);

        // Fetch registrations for this section
        const regs = await fetchSectionRegistrations({
          sectionId,
        });

        // Fetch person data for each registration
        const regsWithPersons = await Promise.all(
          regs.map(async (reg: SectionRegistration) => {
            try {
              const personData = await fetchPerson(reg.student.person.id);
              return { ...reg, personData };
            } catch (err) {
              console.error(`Failed to fetch person for student ${reg.student.id}:`, err);
              return { ...reg, personData: undefined };
            }
          })
        );

        setRegistrations(regsWithPersons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load section data');
      } finally {
        setLoading(false);
      }
    }

    if (sectionId) {
      loadSectionData();
    }
  }, [sectionId]);

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

  function formatDays(days: string[]) {
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
  }

  function formatTime(time: string | null) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin h-5 w-5" />
          <span>Loading section data...</span>
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

  if (!section) {
    return null;
  }

  const courseCode = `${section.course.subject.code} ${section.course.number}`;
  const enrollmentPercent = section.capacity > 0
    ? (section.enrolled / section.capacity) * 100
    : 0;

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
            <h1 className="text-3xl font-bold text-gray-900">
              {courseCode}: {section.title || section.course.title}
            </h1>
            <p className="text-gray-600 mt-1">
              CRN: {section.crn} • {section.academicPeriod.title}
            </p>
          </div>
        </div>
      </div>

      {/* Section Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-5 w-5 text-[#336AEA]" />
          Section Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Course</label>
            <p className="text-gray-900">{courseCode} - {section.course.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Section Number</label>
            <p className="text-gray-900">{section.number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Term</label>
            <p className="text-gray-900">{section.academicPeriod.title} ({section.academicPeriod.code})</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Credits</label>
            <p className="text-gray-900">
              {section.credits.minimum === section.credits.maximum
                ? section.credits.minimum
                : `${section.credits.minimum}-${section.credits.maximum}`}
            </p>
          </div>
          {section.schedule && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Schedule</label>
                <p className="text-gray-900">
                  {formatDays(section.schedule.daysOfWeek)}
                  {section.schedule.startTime && section.schedule.endTime && (
                    <span className="ml-2">
                      {formatTime(section.schedule.startTime)} - {formatTime(section.schedule.endTime)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Room</label>
                <p className="text-gray-900">
                  {section.schedule.room
                    ? `${section.schedule.room.building} ${section.schedule.room.number}`
                    : 'TBA'}
                </p>
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Enrollment</label>
            <div className="space-y-1">
              <p className="text-gray-900">
                {section.enrolled} / {section.capacity} ({section.available} available)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
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
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p>
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
            </p>
          </div>
        </div>
      </div>

      {/* Roster */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-users" className="h-5 w-5 text-[#336AEA]" />
            Roster ({registrations.length} students)
          </h2>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FontAwesomeIcon icon="fa-solid fa-inbox" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No students enrolled in this section</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg) => {
                  const displayName = getDisplayName(reg.personData);
                  const email = getEmail(reg.personData);

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/sis/students/${reg.student.id}`}
                          className="text-[#336AEA] hover:underline font-medium"
                        >
                          {displayName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {reg.student.studentNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            reg.statusCode === 'REG'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {reg.statusCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(reg.registeredOn).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {reg.credits}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



