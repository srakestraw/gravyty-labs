'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { mockPermissions } from '@/app/(shell)/ai-assistants/lib/data';

export function PermissionsPageClient() {
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);
  const [permissions] = useState(mockPermissions);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Permissions Management</h2>
        <p className="text-gray-600 mt-1">
          Configure role-based access control for AI Assistants
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Can Create Assistants
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Can Edit Guardrails
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Can Deploy Assistants
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((perm, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{perm.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {perm.canCreate ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FontAwesomeIcon icon="fa-solid fa-times" className="h-3 w-3 mr-1" />
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {perm.canEditGuardrails ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FontAwesomeIcon icon="fa-solid fa-times" className="h-3 w-3 mr-1" />
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {perm.canDeploy ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FontAwesomeIcon icon="fa-solid fa-times" className="h-3 w-3 mr-1" />
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Permission Editing</h4>
              <p className="text-sm text-yellow-700">
                In v1, permissions are read-only. Full permission management will be available
                in a future update.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Role Descriptions</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-900">Assistant Admin:</span>
            <span className="text-gray-600 ml-2">
              Full access to create, edit, and deploy assistants. Can modify guardrails.
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Compliance Officer:</span>
            <span className="text-gray-600 ml-2">
              Read-only access to monitor assistants and guardrails for compliance.
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Viewer:</span>
            <span className="text-gray-600 ml-2">
              Read-only access to view assistants and their configurations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

