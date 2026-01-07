'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Gift } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';

export default function GiftsPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearFilter, setFiscalYearFilter] = useState<string>('all');

  useEffect(() => {
    async function loadGifts() {
      const data = await crmMockProvider.listGifts({});
      setGifts(data);
      setFilteredGifts(data);
      setLoading(false);
    }
    loadGifts();
  }, []);

  useEffect(() => {
    let filtered = gifts;

    if (searchTerm) {
      filtered = filtered.filter(
        (gift) =>
          gift.constituentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gift.fundName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (fiscalYearFilter !== 'all') {
      filtered = filtered.filter((gift) => gift.fiscalYear === fiscalYearFilter);
    }

    setFilteredGifts(filtered);
  }, [gifts, searchTerm, fiscalYearFilter]);

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

  const fiscalYears = Array.from(new Set(gifts.map((g) => g.fiscalYear))).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gifts...</div>
      </div>
    );
  }

  const totalAmount = filteredGifts.reduce((sum, gift) => sum + gift.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gifts</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by constituent or fund..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <select
          value={fiscalYearFilter}
          onChange={(e) => setFiscalYearFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Fiscal Years</option>
          {fiscalYears.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Gifts</div>
          <div className="text-2xl font-bold">{filteredGifts.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Average Gift</div>
          <div className="text-2xl font-bold">
            {filteredGifts.length > 0 ? formatCurrency(totalAmount / filteredGifts.length) : '$0'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Current FY</div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              filteredGifts.filter((g) => g.fiscalYear === fiscalYears[0]).reduce((sum, g) => sum + g.amount, 0)
            )}
          </div>
        </div>
      </div>

      {/* Gifts Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Constituent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiscal Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGifts.map((gift) => (
              <tr
                key={gift.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/crm-mock/gifts/${gift.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(gift.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{gift.constituentId || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(gift.amount)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{gift.fundName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{gift.campaignName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{gift.fiscalYear}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{gift.paymentMethod || '-'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredGifts.length === 0 && <div className="text-center py-12 text-gray-500">No gifts found</div>}
      </div>
    </div>
  );
}



