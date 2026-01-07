'use client';

import { useEffect, useState } from 'react';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Portfolio } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type SortField = 'updated' | 'name' | 'members';
type SortDirection = 'asc' | 'desc';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('me');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');

  // Mock current user officer ID (hardcoded for now)
  const currentOfficerId = 'officer_1';

  // Mock officers list
  const officers = [
    { id: 'officer_1', name: 'Sarah Johnson' },
    { id: 'officer_2', name: 'Michael Chen' },
    { id: 'officer_3', name: 'Emily Rodriguez' },
    { id: 'officer_4', name: 'David Kim' },
    { id: 'officer_5', name: 'Lisa Thompson' },
  ];

  useEffect(() => {
    // Load portfolios
    loadPortfolios();
  }, [ownerFilter, sortField, sortDirection]);

  const loadPortfolios = async () => {
    const ownerId = ownerFilter === 'me' ? currentOfficerId : ownerFilter === 'all' ? undefined : ownerFilter;
    const allPortfolios = await crmMockProvider.listPortfolios({}, { ownerOfficerId: ownerId });

    // Get member counts
    const portfoliosWithCounts = await Promise.all(
      allPortfolios.map(async (portfolio) => {
        const members = await crmMockProvider.listPortfolioMembers({}, portfolio.id);
        return {
          ...portfolio,
          memberCount: members.length,
        };
      })
    );

    // Apply search filter
    let filtered = portfoliosWithCounts;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = portfoliosWithCounts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'members':
          aValue = a.memberCount;
          bValue = b.memberCount;
          break;
        case 'updated':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setPortfolios(filtered);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      loadPortfolios();
    }
  }, [search]);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;

    await crmMockProvider.createPortfolio(
      {},
      {
        name: newPortfolioName.trim(),
        description: newPortfolioDescription.trim() || undefined,
        ownerOfficerId: currentOfficerId,
      }
    );

    setNewPortfolioName('');
    setNewPortfolioDescription('');
    setShowCreateModal(false);
    await loadPortfolios();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolios</h1>
            <p className="text-gray-600">
              Group constituents to plan outreach and track coverage.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4" />
            New portfolio
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search portfolios by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="me">Me</option>
              <option value="all">All Officers</option>
              {officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name}
                </option>
              ))}
            </select>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="updated-desc">Updated (newest)</option>
              <option value="updated-asc">Updated (oldest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="members-desc">Members (most)</option>
              <option value="members-asc">Members (fewest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Portfolios List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          Loading...
        </div>
      ) : portfolios.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FontAwesomeIcon icon="fa-solid fa-briefcase" className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
          <p className="text-gray-500 mb-4">
            {search.trim()
              ? 'No portfolios match your search.'
              : 'Get started by creating your first portfolio.'}
          </p>
          {!search.trim() && (
            <Button onClick={() => setShowCreateModal(true)}>
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4" />
              New portfolio
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => {
            const memberCount = (portfolio as any).memberCount || 0;
            return (
              <div
                key={portfolio.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      href={`/crm-mock/portfolios/${portfolio.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {portfolio.name}
                    </Link>
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {portfolio.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Owner</span>
                    <span className="text-gray-900">{portfolio.officerName || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Members</span>
                    <span className="text-gray-900 font-medium">{memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">{formatDate(portfolio.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/crm-mock/portfolios/${portfolio.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View portfolio →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Portfolio</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Major Donors Q1"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePortfolio();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  placeholder="Brief description of this portfolio..."
                  value={newPortfolioDescription}
                  onChange={(e) => setNewPortfolioDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPortfolioName('');
                  setNewPortfolioDescription('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePortfolio} disabled={!newPortfolioName.trim()}>
                Create Portfolio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
