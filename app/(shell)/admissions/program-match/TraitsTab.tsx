'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchTrait } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface TraitsTabProps {
  traits?: ProgramMatchTrait[];
}

type SortOption = 'name-asc' | 'name-desc' | 'updated-desc';

const CATEGORY_OPTIONS = [
  'Academic',
  'Personal',
  'Professional',
  'Interests',
  'Values',
  'Skills',
  'Other',
];

export function TraitsTab({ traits: initialTraits }: TraitsTabProps) {
  const router = useRouter();
  const [traits, setTraits] = useState(initialTraits || []);

  // Sync props to state when props change (after router.refresh())
  useEffect(() => {
    setTraits(initialTraits || []);
  }, [initialTraits]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrait, setEditingTrait] = useState<ProgramMatchTrait | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Get unique categories from traits
  const availableCategories = useMemo(() => {
    if (!traits || traits.length === 0) return [];
    const cats = new Set(traits.map(t => t.category));
    return Array.from(cats).sort();
  }, [traits]);

  // Filter and sort traits
  const filteredAndSortedTraits = useMemo(() => {
    if (!traits || traits.length === 0) return [];
    let filtered = traits.filter(trait => {
      const matchesSearch = trait.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trait.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || trait.category === categoryFilter;
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
  }, [traits, searchQuery, categoryFilter, sortOption]);

  const activeTraitsCount = (traits || []).filter(t => t.isActive).length;

  const handleOpenAddModal = () => {
    setFormName('');
    setFormCategory('');
    setFormDescription('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (trait: ProgramMatchTrait) => {
    setEditingTrait(trait);
    setFormName(trait.name);
    setFormCategory(trait.category);
    setFormDescription(trait.description);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingTrait(null);
    setFormName('');
    setFormCategory('');
    setFormDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (editingTrait) {
        await dataClient.updateProgramMatchTrait(ctx, editingTrait.id, {
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim(),
        });
      } else {
        await dataClient.createProgramMatchTrait(ctx, {
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim(),
        });
      }

      // Refresh data
      router.refresh();
      handleCloseModals();
    } catch (error) {
      console.error('Failed to save trait:', error);
      alert('Failed to save trait. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (trait: ProgramMatchTrait) => {
    if (trait.isActive) {
      // Show confirmation for deactivate
      setShowDeactivateConfirm(trait.id);
    } else {
      // Reactivate immediately
      setIsSubmitting(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        await dataClient.updateProgramMatchTrait(ctx, trait.id, { isActive: true });
        router.refresh();
      } catch (error) {
        console.error('Failed to reactivate trait:', error);
        alert('Failed to reactivate trait. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!showDeactivateConfirm) return;

    const trait = (traits || []).find(t => t.id === showDeactivateConfirm);
    if (!trait) return;

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchTrait(ctx, trait.id, { isActive: false });
      router.refresh();
      setShowDeactivateConfirm(null);
    } catch (error) {
      console.error('Failed to deactivate trait:', error);
      alert('Failed to deactivate trait. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Traits ({activeTraitsCount})</h3>
        </div>
        <Button onClick={handleOpenAddModal} size="sm">
          <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-1" />
          Add Trait
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search traits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="name-asc">A-Z</option>
          <option value="name-desc">Z-A</option>
          <option value="updated-desc">Recently Updated</option>
        </select>
      </div>

      {/* Traits List */}
      {filteredAndSortedTraits.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            {(!traits || traits.length === 0) ? 'No traits yet' : 'No traits match your filters'}
          </p>
          {(!traits || traits.length === 0) && (
            <Button onClick={handleOpenAddModal} variant="outline">
              Add Trait
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedTraits.map((trait) => (
            <div
              key={trait.id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{trait.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {trait.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      trait.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {trait.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{trait.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal(trait)}
                  disabled={isSubmitting}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(trait)}
                  disabled={isSubmitting}
                >
                  {trait.isActive ? 'Deactivate' : 'Reactivate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Trait</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Leadership"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe this trait..."
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
                  Add Trait
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Trait</h3>
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Trait?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Existing program profiles may reference this trait. Deactivating will hide it from new selections but won't remove it from existing profiles.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateConfirm(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeactivate}
                disabled={isSubmitting}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

