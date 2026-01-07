'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Appeal } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';

export default function AppealsPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAppeals() {
      const data = await crmMockProvider.listAppeals({});
      setAppeals(data);
      setFilteredAppeals(data);
      setLoading(false);
    }
    loadAppeals();
  }, []);

  useEffect(() => {
    let filtered = appeals;
    if (searchTerm) {
      filtered = filtered.filter((appeal) => appeal.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredAppeals(filtered);
  }, [appeals, searchTerm]);

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
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'planned':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading appeals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appeals</h1>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search appeals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiscal Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount Raised
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppeals.map((appeal) => (
              <tr
                key={appeal.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/crm-mock/admin/appeals/${appeal.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{appeal.name}</div>
                  {appeal.description && <div className="text-sm text-gray-500">{appeal.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appeal.campaignName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appeal.fundName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appeal.fiscalYear}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{appeal.goal ? formatCurrency(appeal.goal) : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{appeal.amountRaised ? formatCurrency(appeal.amountRaised) : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appeal.status)}`}>
                    {appeal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAppeals.length === 0 && <div className="text-center py-12 text-gray-500">No appeals found</div>}
      </div>
    </div>
  );
}



