'use client';

import { useEffect, useState, useMemo } from 'react';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Constituent, ConstituentFilters, SortOptions } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function ConstituentsPage() {
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ConstituentFilters>({});
  const [sort, setSort] = useState<SortOptions>({ field: 'name', direction: 'asc' });

  const [gifts, setGifts] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Load constituents
      const allConstituents = await crmMockProvider.listConstituents(
        {},
        {
          filters,
          sort,
        }
      );

      // Apply search
      let filtered = allConstituents;
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = allConstituents.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower)
        );
      }

      setConstituents(filtered);
      
      // Load gift and interaction data for display
      const giftsData = await crmMockProvider.listGifts({});
      const interactionsData = await crmMockProvider.listInteractions({});
      setGifts(giftsData);
      setInteractions(interactionsData);
      
      setLoading(false);
    }
    loadData();
  }, [filters, sort, search]);
  const currentFy = new Date().getMonth() >= 6
    ? `FY${new Date().getFullYear() + 1}`
    : `FY${new Date().getFullYear()}`;
  const priorFy = new Date().getMonth() >= 6
    ? `FY${new Date().getFullYear()}`
    : `FY${new Date().getFullYear() - 1}`;

  const getConstituentData = (constituentId: string) => {
    const constituentGifts = gifts.filter((g) => g.constituentId === constituentId);
    const lastGift = constituentGifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const currentFyTotal = constituentGifts
      .filter((g) => g.fiscalYear === currentFy)
      .reduce((sum, g) => sum + g.amount, 0);
    const priorFyTotal = constituentGifts
      .filter((g) => g.fiscalYear === priorFy)
      .reduce((sum, g) => sum + g.amount, 0);
    const lastInteraction = interactions
      .filter((i) => i.constituentId === constituentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const lastSentiment = interactions
      .filter((i) => i.constituentId === constituentId && i.sentiment)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      lastGift,
      currentFyTotal,
      priorFyTotal,
      lastInteraction,
      lastSentiment,
    };
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
          Constituents
        </h1>
        <p className="text-gray-600">
          Manage your constituent relationships.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.propensityMin || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  propensityMin: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Min Propensity</option>
              <option value="0">0</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="75">75</option>
            </select>

            <select
              value={filters.sentiment || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sentiment: (e.target.value as 'positive' | 'neutral' | 'negative') || undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() =>
                      setSort({
                        field: 'name',
                        direction: sort.field === 'name' && sort.direction === 'asc' ? 'desc' : 'asc',
                      })
                    }
                    className="hover:text-gray-700"
                  >
                    Name
                    {sort.field === 'name' && (
                      <FontAwesomeIcon
                        icon={sort.direction === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
                        className="ml-1 h-3 w-3"
                      />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() =>
                      setSort({
                        field: 'propensity',
                        direction: sort.field === 'propensity' && sort.direction === 'asc' ? 'desc' : 'asc',
                      })
                    }
                    className="hover:text-gray-700"
                  >
                    Propensity
                    {sort.field === 'propensity' && (
                      <FontAwesomeIcon
                        icon={sort.direction === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
                        className="ml-1 h-3 w-3"
                      />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Gift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FY Giving
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
              ) : constituents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No constituents found.
                  </td>
                </tr>
              ) : (
                constituents.map((constituent) => {
                  const data = getConstituentData(constituent.id);
                  return (
                    <tr key={constituent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/crm-mock/constituents/${constituent.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {constituent.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {constituent.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {constituent.propensity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.lastGift ? (
                          <div>
                            <div>{formatCurrency(data.lastGift.amount)}</div>
                            <div className="text-xs text-gray-400">{formatDate(data.lastGift.date)}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatCurrency(data.currentFyTotal)}</div>
                          <div className="text-xs text-gray-400">Prior: {formatCurrency(data.priorFyTotal)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.lastInteraction ? (
                          <div>
                            <div className="capitalize">{data.lastInteraction.type}</div>
                            <div className="text-xs text-gray-400">{formatDate(data.lastInteraction.createdAt)}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {data.lastSentiment ? (
                          <span className={`text-sm capitalize ${getSentimentColor(data.lastSentiment.sentiment)}`}>
                            {data.lastSentiment.sentiment}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
