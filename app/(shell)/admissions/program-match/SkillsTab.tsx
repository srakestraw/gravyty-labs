'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchSkill } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface SkillsTabProps {
  skills?: ProgramMatchSkill[];
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

export function SkillsTab({ skills: initialSkills }: SkillsTabProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills || []);

  // Sync props to state when props change (after router.refresh())
  useEffect(() => {
    setSkills(initialSkills || []);
  }, [initialSkills]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ProgramMatchSkill | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Get unique categories from skills
  const availableCategories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const cats = new Set(skills.map(s => s.category));
    return Array.from(cats).sort();
  }, [skills]);

  // Filter and sort skills
  const filteredAndSortedSkills = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    let filtered = skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
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
  }, [skills, searchQuery, categoryFilter, sortOption]);

  const activeSkillsCount = (skills || []).filter(s => s.isActive).length;

  const handleOpenAddModal = () => {
    setFormName('');
    setFormCategory('');
    setFormDescription('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (skill: ProgramMatchSkill) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormCategory(skill.category);
    setFormDescription(skill.description);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingSkill(null);
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

      if (editingSkill) {
        await dataClient.updateProgramMatchSkill(ctx, editingSkill.id, {
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim(),
        });
      } else {
        await dataClient.createProgramMatchSkill(ctx, {
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim(),
        });
      }

      // Refresh data
      router.refresh();
      handleCloseModals();
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('Failed to save skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (skill: ProgramMatchSkill) => {
    if (skill.isActive) {
      // Show confirmation for deactivate
      setShowDeactivateConfirm(skill.id);
    } else {
      // Reactivate immediately
      setIsSubmitting(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        await dataClient.updateProgramMatchSkill(ctx, skill.id, { isActive: true });
        router.refresh();
      } catch (error) {
        console.error('Failed to reactivate skill:', error);
        alert('Failed to reactivate skill. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!showDeactivateConfirm) return;

    const skill = (skills || []).find(s => s.id === showDeactivateConfirm);
    if (!skill) return;

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchSkill(ctx, skill.id, { isActive: false });
      router.refresh();
      setShowDeactivateConfirm(null);
    } catch (error) {
      console.error('Failed to deactivate skill:', error);
      alert('Failed to deactivate skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Skills ({activeSkillsCount})</h3>
        </div>
        <Button onClick={handleOpenAddModal} size="sm">
          <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-1" />
          Add Skill
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search skills..."
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

      {/* Skills List */}
      {filteredAndSortedSkills.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            {(!skills || skills.length === 0) ? 'No skills yet' : 'No skills match your filters'}
          </p>
          {(!skills || skills.length === 0) && (
            <>
              <p className="text-xs text-gray-500 mb-4">
                Skills are lightweight, self-reported readiness signals. Keep them short and non-test-like.
              </p>
              <Button onClick={handleOpenAddModal} variant="outline">
                Add Skill
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {skill.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      skill.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {skill.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal(skill)}
                  disabled={isSubmitting}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(skill)}
                  disabled={isSubmitting}
                >
                  {skill.isActive ? 'Deactivate' : 'Reactivate'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Skill</h3>
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
                  placeholder="Describe this skill..."
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
                  Add Skill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Skill</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Skill?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Existing program profiles may reference this skill. Deactivating will hide it from new selections but won't remove it from existing profiles.
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




