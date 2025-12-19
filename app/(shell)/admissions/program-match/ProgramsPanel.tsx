'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchProgram } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface ProgramsPanelProps {
  programs: ProgramMatchProgram[];
  selectedProgramId: string | null;
  onSelectProgram: (programId: string | null) => void;
}

export function ProgramsPanel({ programs: initialPrograms, selectedProgramId, onSelectProgram }: ProgramsPanelProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState(initialPrograms || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramMatchProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'active' | 'inactive'>('draft');

  // Sync props to state when props change
  useEffect(() => {
    setPrograms(initialPrograms || []);
  }, [initialPrograms]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    if (!programs || programs.length === 0) return [];
    return programs.filter(program =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

  const handleOpenAddModal = () => {
    setFormName('');
    setFormStatus('draft');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (program: ProgramMatchProgram) => {
    setEditingProgram(program);
    setFormName(program.name);
    setFormStatus(program.status);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingProgram(null);
    setFormName('');
    setFormStatus('draft');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (editingProgram) {
        await dataClient.updateProgramMatchProgram(ctx, editingProgram.id, {
          name: formName.trim(),
          status: formStatus,
        });
      } else {
        await dataClient.createProgramMatchProgram(ctx, {
          name: formName.trim(),
        });
      }

      router.refresh();
      handleCloseModals();
    } catch (error) {
      console.error('Failed to save program:', error);
      alert('Failed to save program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (program: ProgramMatchProgram) => {
    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const newStatus = program.status === 'active' ? 'inactive' : 'active';
      await dataClient.updateProgramMatchProgram(ctx, program.id, { status: newStatus });
      router.refresh();
    } catch (error) {
      console.error('Failed to update program status:', error);
      alert('Failed to update program status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Programs</h3>
        <Button onClick={handleOpenAddModal} size="sm">
          <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-1" />
          Add Program
        </Button>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search programs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Programs List */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            {(!programs || programs.length === 0) ? 'No programs yet' : 'No programs match your search'}
          </p>
          {(!programs || programs.length === 0) && (
            <Button onClick={handleOpenAddModal} variant="outline">
              Add Program
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedProgramId === program.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onSelectProgram(program.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{program.name}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        program.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : program.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(program)}
                    disabled={isSubmitting}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(program)}
                    disabled={isSubmitting}
                  >
                    {program.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Program</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                  autoFocus
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
                  Add Program
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Program</h3>
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
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'draft' | 'active' | 'inactive')}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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



