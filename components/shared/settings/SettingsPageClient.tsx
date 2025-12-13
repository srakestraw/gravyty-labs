'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

const integrations = [
  {
    id: 'sis',
    name: 'Student Information System (SIS)',
    description: 'Access student records, enrollment data, and academic information',
    status: 'connected',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    id: 'crm',
    name: 'Customer Relationship Management (CRM)',
    description: 'Connect with your CRM for prospect and alumni data',
    status: 'not-connected',
    icon: 'fa-solid fa-address-book',
  },
  {
    id: 'advancement',
    name: 'Advancement System',
    description: 'Link with fundraising and donor management systems',
    status: 'not-connected',
    icon: 'fa-solid fa-hand-holding-dollar',
  },
];

export function SettingsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings & Integrations</h2>
        <p className="text-gray-600 mt-1">
          Manage integrations and data model configurations
        </p>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FontAwesomeIcon
                      icon={integration.icon}
                      className="h-6 w-6 text-purple-600"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{integration.name}</h4>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <div>
                  {integration.status === 'connected' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-3 w-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Model */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Model</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-4">
            AI Assistants will use the following data models to provide context-aware responses:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Students:</strong> Academic records, enrollment status, risk indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Applicants:</strong> Application data, admission status, communication history</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Donors:</strong> Giving history, engagement data, relationship information</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Alumni:</strong> Graduation records, career information, engagement metrics</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Data model configuration is read-only in v1. Full configuration options will be available
          in a future update.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Settings Configuration</h4>
            <p className="text-sm text-blue-700">
              Integration and data model settings are read-only in v1. These features will be
              fully configurable in a future release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

