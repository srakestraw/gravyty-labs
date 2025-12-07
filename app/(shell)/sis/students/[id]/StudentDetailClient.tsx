'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchStudent,
  fetchSectionRegistrations,
  fetchStudentAcademicPrograms,
  fetchStudentTranscriptGrades,
} from '../../lib/api';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DoNotEngagePanel } from '@/components/shared/do-not-engage-panel';

interface Student {
  id: string;
  person: {
    id: string;
  };
}

interface StudentDetailClientProps {
  studentId: string;
}

export default function StudentDetailClient({ studentId }: StudentDetailClientProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudent(studentId)
        .then(setStudent)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Student Not Found</h2>
        <Link href="/sis/students">
          <Button>Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Student Details</h2>
        <p className="text-gray-600">Student ID: {studentId}</p>
      </div>

      {/* TODO: confirm placement - added after student details section */}
      {student?.person?.id && (
        <DoNotEngagePanel personId={student.person.id} />
      )}

      <Link href="/sis/students">
        <Button className="mt-4">Back to Students</Button>
      </Link>
    </div>
  );
}
