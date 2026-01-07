'use client';

import { useEffect, useState } from 'react';
import { crmMockProvider } from '@/lib/crm-mock';
import type { LapsedDonor } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LapsedDonorsPage() {
  const [lapsedDonors, setLapsedDonors] = useState<LapsedDonor[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Calculate current and prior fiscal year dates
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // Fiscal year starts July 1
      let currentFyStart: Date;
      let currentFyEnd: Date;
      
      if (currentMonth >= 7) {
        // Current FY is July 1 of current year to June 30 of next year
        currentFyStart = new Date(currentYear, 6, 1); // July 1
        currentFyEnd = new Date(currentYear + 1, 5, 30, 23, 59, 59); // June 30
      } else {
        // Current FY is July 1 of prior year to June 30 of current year
        currentFyStart = new Date(currentYear - 1, 6, 1); // July 1
        currentFyEnd = new Date(currentYear, 5, 30, 23, 59, 59); // June 30
      }

      const donors = await crmMockProvider.getLapsedDonors(
        {},
        {
          currentFyStart: currentFyStart.toISOString(),
          currentFyEnd: currentFyEnd.toISOString(),
        }
      );

      setLapsedDonors(donors);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === lapsedDonors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(lapsedDonors.map((d) => d.constituentId)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCreateTasks = async () => {
    if (selectedIds.size === 0) return;

    setCreatingTasks(true);
    
    // Simulate task creation (in real implementation, this would call an API)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For now, just show success message
    setTasksCreated(true);
    setCreatingTasks(false);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setTasksCreated(false);
      setSelectedIds(new Set());
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lapsed Donors
        </h1>
        <p className="text-gray-600">
          Identify and re-engage donors who gave in the prior fiscal year but have not given this fiscal year.
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select donors to create tasks'}
          </span>
          {selectedIds.size > 0 && (
            <Button
              onClick={handleCreateTasks}
              disabled={creatingTasks || tasksCreated}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creatingTasks ? (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-2 animate-spin" />
                  Creating tasks...
                </>
              ) : tasksCreated ? (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-check" className="h-4 w-4 mr-2" />
                  Tasks created!
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Create tasks for selected
                </>
              )}
            </Button>
          )}
        </div>
        {tasksCreated && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-check-circle" />
            Tasks created successfully
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === lapsedDonors.length && lapsedDonors.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prior FY Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Gift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propensity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Touch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : lapsedDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No lapsed donors found.
                  </td>
                </tr>
              ) : (
                lapsedDonors.map((donor) => (
                  <tr
                    key={donor.constituentId}
                    className={`hover:bg-gray-50 ${selectedIds.has(donor.constituentId) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(donor.constituentId)}
                        onChange={() => handleSelectOne(donor.constituentId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/crm-mock/constituents/${donor.constituentId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {donor.name}
                      </Link>
                      {donor.email && (
                        <div className="text-xs text-gray-500 mt-1">{donor.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(donor.priorFyTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{formatCurrency(donor.lastGiftAmount)}</div>
                        <div className="text-xs text-gray-400">{formatDate(donor.lastGiftDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donor.propensity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.lastTouchDate ? (
                        <div>
                          <div className="capitalize">{donor.lastTouchType}</div>
                          <div className="text-xs text-gray-400">{formatDate(donor.lastTouchDate)}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donor.sentiment ? (
                        <span className={`text-sm capitalize ${getSentimentColor(donor.sentiment)}`}>
                          {donor.sentiment}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Lapsed donors are constituents who gave in the prior fiscal year but have not given any gifts in the current fiscal year. Use the selection above to create outreach tasks for re-engagement.
        </p>
      </div>
    </div>
  );
}
