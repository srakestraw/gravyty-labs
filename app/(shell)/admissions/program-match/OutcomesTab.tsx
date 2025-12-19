'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchOutcome, ProgramMatchDraftConfig } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface OutcomesTabProps {
  outcomes?: ProgramMatchOutcome[];
  draftConfig: ProgramMatchDraftConfig | null;
}

type OutcomeType = 'priority' | 'field' | 'role';
type SortOption = 'name-asc' | 'name-desc' | 'updated-desc';

const TYPE_LABELS: Record<OutcomeType, string> = {
  priority: 'Priorities',
  field: 'Fields of Study',
  role: 'Roles',
};

export function OutcomesTab({ outcomes: initialOutcomes, draftConfig }: OutcomesTabProps) {
  const router = useRouter();
  const [outcomes, setOutcomes] = useState(initialOutcomes || []);
  const [activeType, setActiveType] = useState<OutcomeType>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<ProgramMatchOutcome | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const outcomesEnabled = draftConfig?.outcomesEnabled ?? false;

  // Sync props to state
  useEffect(() => {
    setOutcomes(initialOutcomes || []);
  }, [initialOutcomes]);

  // Filter outcomes by active type
  const outcomesByType = useMemo(() => {
    if (!outcomes || outcomes.length === 0) return [];
    return outcomes.filter(o => o.type === activeType);
  }, [outcomes, activeType]);

  // Get unique categories from outcomes of current type
  const availableCategories = useMemo(() => {
    if (!outcomesByType || outcomesByType.length === 0) return [];
    const cats = new Set(outcomesByType.map(o => o.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [outcomesByType]);

  // Filter and sort outcomes
  const filteredAndSortedOutcomes = useMemo(() => {
    if (!outcomesByType || outcomesByType.length === 0) return [];
    let filtered = outcomesByType.filter(outcome => {
      const matchesSearch = outcome.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outcome.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || outcome.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [outcomesByType, searchQuery, categoryFilter, sortOption]);

  const handleToggleEnabled = async () => {
    setIsTogglingEnabled(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchDraftConfig(ctx, {
        outcomesEnabled: !outcomesEnabled,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle outcomes:', error);
      alert('Failed to toggle outcomes. Please try again.');
    } finally {
      setIsTogglingEnabled(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setFormCategory('');
    setFormDescription('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (outcome: ProgramMatchOutcome) => {
    setEditingOutcome(outcome);
    setFormName(outcome.name);
    setFormCategory(outcome.category || '');
    setFormDescription(outcome.description);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingOutcome(null);
    setFormName('');
    setFormCategory('');
    setFormDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (editingOutcome) {
        await dataClient.updateProgramMatchOutcome(ctx, editingOutcome.id, {
          name: formName.trim(),
          category: formCategory.trim() || null,
          description: formDescription.trim(),
        });
      } else {
        await dataClient.createProgramMatchOutcome(ctx, {
          type: activeType,
          name: formName.trim(),
          category: formCategory.trim() || null,
          description: formDescription.trim(),
        });
      }

      router.refresh();
      handleCloseModals();
    } catch (error) {
      console.error('Failed to save outcome:', error);
      alert('Failed to save outcome. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (outcome: ProgramMatchOutcome) => {
    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchOutcome(ctx, outcome.id, {
        isActive: !outcome.isActive,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to update outcome status:', error);
      alert('Failed to update outcome status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!outcomesEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Enable Outcomes in Program Match</h3>
            <p className="text-xs text-gray-600">
              Outcomes are optional signals that can be used as tie-breakers and explanation boosts in quiz results.
            </p>
          </div>
          <Button
            onClick={handleToggleEnabled}
            disabled={isTogglingEnabled}
            size="sm"
          >
            {isTogglingEnabled ? 'Enabling...' : 'Enable Outcomes'}
          </Button>
        </div>
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Outcomes are currently disabled. Enable them above to manage outcomes libraries and program mappings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Outcomes Enabled</h3>
          <p className="text-xs text-gray-600">
            Outcomes are active. You can manage outcomes libraries and program mappings below.
          </p>
        </div>
        <Button
          onClick={handleToggleEnabled}
          disabled={isTogglingEnabled}
          variant="outline"
          size="sm"
        >
          {isTogglingEnabled ? 'Disabling...' : 'Disable Outcomes'}
        </Button>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as OutcomeType)}>
        <TabsList>
          <TabsTrigger value="priority">Priorities</TabsTrigger>
          <TabsTrigger value="field">Fields of Study</TabsTrigger>
          <TabsTrigger value="role">Roles</TabsTrigger>
        </TabsList>

        {(['priority', 'field', 'role'] as OutcomeType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{TYPE_LABELS[type]}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {outcomesByType.filter(o => o.isActive).length} active
                  </p>
                </div>
                <Button onClick={handleOpenAddModal} size="sm">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-1" />
                  Add {TYPE_LABELS[type].slice(0, -1)}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                {availableCategories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                  <option value="updated-desc">Recently Updated</option>
                </select>
              </div>

              {/* Outcomes List */}
              {filteredAndSortedOutcomes.length === 0 ? (
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    {(!outcomesByType || outcomesByType.length === 0)
                      ? `No ${TYPE_LABELS[type].toLowerCase()} yet`
                      : 'No outcomes match your filters'}
                  </p>
                  {(!outcomesByType || outcomesByType.length === 0) && (
                    <Button onClick={handleOpenAddModal} variant="outline">
                      Add {TYPE_LABELS[type].slice(0, -1)}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedOutcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{outcome.name}</span>
                            {outcome.category && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                {outcome.category}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${
                                outcome.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {outcome.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{outcome.description}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(outcome)}
                            disabled={isSubmitting}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(outcome)}
                            disabled={isSubmitting}
                          >
                            {outcome.isActive ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add {TYPE_LABELS[activeType].slice(0, -1)}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Research Opportunities"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (optional)
                </label>
                <Input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g., Academic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe this outcome..."
                  required
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModals}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Add {TYPE_LABELS[activeType].slice(0, -1)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Outcome</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (optional)
                </label>
                <Input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModals}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


