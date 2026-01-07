'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Opportunity } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadOpportunities() {
      const data = await crmMockProvider.listOpportunities({});
      setOpportunities(data);
      setFilteredOpportunities(data);
      setLoading(false);
    }
    loadOpportunities();
  }, []);

  useEffect(() => {
    let filtered = opportunities;

    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.constituentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter((opp) => opp.stage === stageFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((opp) => opp.status === statusFilter);
    }

    setFilteredOpportunities(filtered);
  }, [opportunities, searchTerm, stageFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      case 'open':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stages = ['all', 'identification', 'qualification', 'cultivation', 'solicitation', 'stewardship'];
  const statuses = ['all', 'open', 'won', 'lost'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opportunities Pipeline</h1>
        <Button onClick={() => router.push('/crm-mock/opportunities/new')}>
          <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by constituent or opportunity name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Stages</option>
          {stages.filter(s => s !== 'all').map((stage) => (
            <option key={stage} value={stage}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </option>
          ))}
        </select>
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
          <div className="text-sm text-gray-600">Total Pipeline</div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              filteredOpportunities
                .filter((opp) => opp.status === 'open')
                .reduce((sum, opp) => sum + (opp.expectedAmount || opp.amount || 0), 0)
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Open Opportunities</div>
          <div className="text-2xl font-bold">
            {filteredOpportunities.filter((opp) => opp.status === 'open').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Won</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredOpportunities.filter((opp) => opp.status === 'won').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Lost</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredOpportunities.filter((opp) => opp.status === 'lost').length}
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Constituent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opportunity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Probability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Close
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpportunities.map((opp) => (
              <tr
                key={opp.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/crm-mock/opportunities/${opp.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{opp.constituentId || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{opp.name || 'Untitled'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{opp.stage}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(opp.expectedAmount || opp.amount || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{opp.probability || 0}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(opp.status)}`}>
                    {opp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12 text-gray-500">No opportunities found</div>
        )}
      </div>
    </div>
  );
}



