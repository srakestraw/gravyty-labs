'use client';

import { MOCK_CONTACTS } from '@/lib/contacts/mock-contacts';
import { getContactTypeById } from '@/lib/contacts';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contacts
        </h1>
        <p className="text-gray-600">
          Contacts are the people your institution interacts with. A contact can be an applicant, student, alumni, donor, parent, volunteer, or more than one at once.
        </p>
      </div>

      {/* Contacts List */}
      {MOCK_CONTACTS.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <FontAwesomeIcon icon="fa-solid fa-users" className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-700 mb-1">No contacts yet</h3>
          <p className="text-xs text-gray-500">
            Contacts will appear here once they are added to the system.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_CONTACTS.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {contact.primaryEmail || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {contact.contactTypeIds.map((typeId) => {
                          const contactType = getContactTypeById(typeId);
                          if (!contactType) return null;
                          return (
                            <span
                              key={typeId}
                              className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {contactType.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {contact.lastActivityAt
                          ? formatDate(contact.lastActivityAt)
                          : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}






