/**
 * NOTE: This page is deprecated and no longer shown in navigation.
 * Populations now serve as a data-layer concept only.
 * 
 * Populations are available as:
 * - Filters within Contacts pages
 * - Building blocks inside Segment Builder
 * - Scope options in Assistants/Agents
 * - Badges on Person profile pages
 * 
 * The route remains intact to avoid 404s for any existing bookmarks or direct links.
 */

'use client';

import { useState } from 'react';
import { getAllContactTypes, getContactTypesForWorkspace, type ContactDomain, type WorkspaceContext } from '@/lib/contacts';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

const DOMAIN_OPTIONS: { value: ContactDomain | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'higher_ed', label: 'Higher ed' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'shared', label: 'Shared' },
];

const WORKSPACE_OPTIONS: { value: WorkspaceContext | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'student_lifecycle_ai', label: 'Student Lifecycle AI' },
  { value: 'ai_assistants', label: 'AI Assistants' },
  { value: 'engagement_hub', label: 'Engagement Hub' },
  { value: 'advancement', label: 'Advancement' },
  { value: 'career_services', label: 'Career Services' },
];

function getDomainLabel(domain: ContactDomain): string {
  switch (domain) {
    case 'higher_ed':
      return 'Higher ed';
    case 'nonprofit':
      return 'Nonprofit';
    case 'shared':
      return 'Shared';
  }
}

function getWorkspaceLabel(workspace: WorkspaceContext): string {
  switch (workspace) {
    case 'student_lifecycle_ai':
      return 'Student Lifecycle AI';
    case 'ai_assistants':
      return 'AI Assistants';
    case 'engagement_hub':
      return 'Engagement Hub';
    case 'advancement':
      return 'Advancement';
    case 'career_services':
      return 'Career Services';
  }
}

export default function PopulationsPage() {
  const [domainFilter, setDomainFilter] = useState<ContactDomain | 'all'>('all');
  const [workspaceFilter, setWorkspaceFilter] = useState<WorkspaceContext | 'all'>('all');

  const allTypes = getAllContactTypes();
  
  let filteredTypes = allTypes;
  
  if (domainFilter !== 'all') {
    filteredTypes = filteredTypes.filter((type) => type.domain === domainFilter);
  }
  
  if (workspaceFilter !== 'all') {
    filteredTypes = filteredTypes.filter((type) => type.workspaces.includes(workspaceFilter));
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Populations
        </h1>
        <p className="text-gray-600">
          Populations represent contact roles like Applicant, Student, Alumni, Donor, and Parent. A single contact can belong to multiple populations.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Domain:</label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value as ContactDomain | 'all')}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DOMAIN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Workspace:</label>
          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value as WorkspaceContext | 'all')}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {WORKSPACE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Populations Grid */}
      {filteredTypes.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <FontAwesomeIcon icon="fa-solid fa-layer-group" className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-700 mb-1">No populations found</h3>
          <p className="text-xs text-gray-500">
            Try adjusting your filters to see more populations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((contactType) => (
            <div
              key={contactType.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {contactType.label}
                </h3>
                {contactType.isDerived && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    Derived
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {contactType.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    contactType.domain === 'higher_ed'
                      ? 'bg-blue-50 text-blue-700'
                      : contactType.domain === 'nonprofit'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {getDomainLabel(contactType.domain)}
                </span>
                {contactType.workspaces.slice(0, 2).map((workspace) => (
                  <span
                    key={workspace}
                    className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700"
                  >
                    {getWorkspaceLabel(workspace)}
                  </span>
                ))}
                {contactType.workspaces.length > 2 && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    +{contactType.workspaces.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

