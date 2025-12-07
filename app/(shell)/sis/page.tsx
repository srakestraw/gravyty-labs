'use client';

import { TermPicker } from './components/term-picker';
import { SubjectFilter } from './components/subject-filter';
import { SectionList } from './components/section-list';
import { StudentSearch } from './components/student-search';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function SISPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="h-8 w-8 text-[#336AEA]" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Affinity University SIS
            </h1>
            <p className="text-gray-600 mt-1">
              Course & Section Explorer
            </p>
          </div>
        </div>
      </div>

      {/* Student Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Search Students
          </label>
          <StudentSearch />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <TermPicker />
          <SubjectFilter />
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SectionList />
      </div>
    </div>
  );
}
