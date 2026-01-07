'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { MovePlan } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MovePlansPage() {
  const router = useRouter();
  const [movePlans, setMovePlans] = useState<MovePlan[]>([]);
  const [filteredMovePlans, setFilteredMovePlans] = useState<MovePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadMovePlans() {
      const data = await crmMockProvider.listMovePlans({});
      setMovePlans(data);
      setFilteredMovePlans(data);
      setLoading(false);
    }
    loadMovePlans();
  }, []);

  useEffect(() => {
    let filtered = movePlans;

    if (searchTerm) {
      filtered = filtered.filter((plan) => plan.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredMovePlans(filtered);
  }, [movePlans, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statuses = ['all', 'draft', 'active', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading move plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Move Plans</h1>
        <Button onClick={() => router.push('/crm-mock/move-plans/new')}>
          <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
          New Move Plan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search move plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Statuses</option>
          {statuses.filter(s => s !== 'all').map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Plans</div>
          <div className="text-2xl font-bold">{filteredMovePlans.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredMovePlans.filter((plan) => plan.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredMovePlans.filter((plan) => plan.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Draft</div>
          <div className="text-2xl font-bold text-gray-600">
            {filteredMovePlans.filter((plan) => plan.status === 'draft').length}
          </div>
        </div>
      </div>

      {/* Move Plans Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Constituent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovePlans.map((plan) => (
              <tr
                key={plan.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/crm-mock/move-plans/${plan.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                  {plan.description && (
                    <div className="text-sm text-gray-500">{plan.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/crm-mock/constituents/${plan.constituentId}`);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Constituent
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{plan.startDate ? formatDate(plan.startDate) : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{plan.targetDate ? formatDate(plan.targetDate) : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {plan.completedDate ? formatDate(plan.completedDate) : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMovePlans.length === 0 && (
          <div className="text-center py-12 text-gray-500">No move plans found</div>
        )}
      </div>
    </div>
  );
}



