'use client';

import { useEffect, useState } from 'react';
import { crmMockProvider } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import Link from 'next/link';

export default function CRMMockDashboardPage() {
  const [stats, setStats] = useState({
    constituents: 0,
    gifts: 0,
    portfolios: 0,
    tasks: 0,
  });
  const [recentConstituents, setRecentConstituents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load stats
      const constituents = await crmMockProvider.listConstituents({});
      const gifts = await crmMockProvider.listGifts({});
      const portfolios = await crmMockProvider.listPortfolios({});
      const tasks = await crmMockProvider.listOutreachQueue({});

      setStats({
        constituents: constituents.length,
        gifts: gifts.length,
        portfolios: portfolios.length,
        tasks: tasks.length,
      });

      // Get recent constituents (last 5)
      const recent = constituents.slice(0, 5);
      setRecentConstituents(recent);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CRM Mock
        </h1>
        <p className="text-gray-600">
          Mock Advancement CRM for testing, demos, and AI training.
        </p>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Constituents</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.constituents.toLocaleString()}
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-users" className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Gifts</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.gifts.toLocaleString()}
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-gift" className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Portfolios</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.portfolios.toLocaleString()}
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-briefcase" className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.tasks.toLocaleString()}
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-tasks" className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Constituents */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Constituents
          </h2>
          <Link
            href="/crm-mock/constituents"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : recentConstituents.length > 0 ? (
          <ul className="space-y-2">
            {recentConstituents.map((constituent) => (
              <li
                key={constituent.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <Link
                  href={`/crm-mock/constituents/${constituent.id}`}
                  className="flex-1 hover:text-blue-600"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">{constituent.name}</span>
                    {constituent.email && (
                      <span className="text-sm text-gray-500 ml-2">({constituent.email})</span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Propensity: {constituent.propensity}</span>
                  <span className="text-xs text-gray-500 capitalize">{constituent.type}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No constituents found.</p>
        )}
      </div>

      {/* Note Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a mock CRM for demos and testing. Use the Data Generator to reset or regenerate seed data.
        </p>
      </div>
    </div>
  );
}
