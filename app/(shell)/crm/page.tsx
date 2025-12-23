import { crmClient } from '@/lib/crm-unified';

export default async function CRMPage() {
  // Fetch CRM data for Advancement workspace only
  const constituents = await crmClient.listConstituents({
    workspace: 'advancement',
    app: 'pipeline',
  });

  const opportunities = await crmClient.listOpportunities({
    workspace: 'advancement',
    app: 'pipeline',
  });

  const organizations = await crmClient.listOrganizations({
    workspace: 'advancement',
    app: 'pipeline',
  });

  const interactions = await crmClient.listInteractions({
    workspace: 'advancement',
    app: 'pipeline',
  });

  // Count tasks (interactions of type 'task')
  const tasks = interactions.filter(i => i.type === 'task');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CRM Unified
        </h1>
        <p className="text-gray-600">
          Mock Advancement CRM service for testing, demos, and AI training. Manage constituents, organizations, fundraising asks, and interactions.
        </p>
      </div>

      {/* Advancement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Constituents</h3>
          <p className="text-2xl font-bold text-gray-900">{constituents.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Gifts</h3>
          <p className="text-2xl font-bold text-gray-900">{opportunities.filter(o => o.status === 'won').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Organizations</h3>
          <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks (Outreach)</h3>
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
        </div>
      </div>

      {/* Recent Constituents */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Constituents
        </h2>
        {constituents.length > 0 ? (
          <ul className="space-y-2">
            {constituents.slice(0, 10).map((constituent) => (
              <li key={constituent.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{constituent.name}</span>
                  {constituent.email && (
                    <span className="text-sm text-gray-500 ml-2">({constituent.email})</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{constituent.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No constituents found. Seed data to get started.</p>
        )}
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a mock Advancement CRM service for testing and demos. Use the CRM Unified API to manage constituents, organizations, fundraising asks, and interactions programmatically.
        </p>
      </div>
    </div>
  );
}

