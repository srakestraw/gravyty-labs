'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type {
  ProgramMatchProgram,
  ProgramMatchTrait,
  ProgramMatchSkill,
  ProgramMatchOutcome,
  ProgramMatchICPBuckets,
  ProgramMatchProgramICP,
  ProgramMatchProgramOutcomes,
  ProgramMatchDraftConfig,
} from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface ICPBuilderProps {
  program: ProgramMatchProgram | null;
  traits: ProgramMatchTrait[];
  skills: ProgramMatchSkill[];
  outcomes: ProgramMatchOutcome[];
  icp: ProgramMatchProgramICP | null;
  programOutcomes: ProgramMatchProgramOutcomes | null;
  draftConfig: ProgramMatchDraftConfig | null;
}

type BucketKey = 'critical' | 'veryImportant' | 'important' | 'niceToHave';
type ItemType = 'trait' | 'skill';

const BUCKET_LABELS: Record<BucketKey, string> = {
  critical: 'Critical',
  veryImportant: 'Very Important',
  important: 'Important',
  niceToHave: 'Nice to Have',
};

export function ICPBuilder({ program, traits, skills, outcomes, icp: initialIcp, programOutcomes: initialProgramOutcomes, draftConfig }: ICPBuilderProps) {
  const router = useRouter();
  const [icp, setIcp] = useState<ProgramMatchProgramICP | null>(initialIcp);
  const [programOutcomes, setProgramOutcomes] = useState<ProgramMatchProgramOutcomes | null>(initialProgramOutcomes);
  const [showAddTraitDrawer, setShowAddTraitDrawer] = useState<BucketKey | null>(null);
  const [showAddSkillDrawer, setShowAddSkillDrawer] = useState<BucketKey | null>(null);
  const [showAddOutcomeDrawer, setShowAddOutcomeDrawer] = useState<{ type: 'priority' | 'field' | 'role'; alignment: 'strong' | 'moderate' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [traitSearchQuery, setTraitSearchQuery] = useState('');
  const [traitCategoryFilter, setTraitCategoryFilter] = useState<string>('all');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all');
  const [outcomeSearchQuery, setOutcomeSearchQuery] = useState('');
  const [outcomeCategoryFilter, setOutcomeCategoryFilter] = useState<string>('all');
  const [selectedTraitIds, setSelectedTraitIds] = useState<Set<string>>(new Set());
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [selectedOutcomeIds, setSelectedOutcomeIds] = useState<Set<string>>(new Set());

  // Sync props to state
  useEffect(() => {
    setIcp(initialIcp);
  }, [initialIcp]);

  useEffect(() => {
    setProgramOutcomes(initialProgramOutcomes);
  }, [initialProgramOutcomes]);

  // Close drawers when program changes
  useEffect(() => {
    if (showAddTraitDrawer || showAddSkillDrawer) {
      setShowAddTraitDrawer(null);
      setShowAddSkillDrawer(null);
      setTraitSearchQuery('');
      setTraitCategoryFilter('all');
      setSkillSearchQuery('');
      setSkillCategoryFilter('all');
      setSelectedTraitIds(new Set());
      setSelectedSkillIds(new Set());
    }
  }, [program?.id]);

  if (!program) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Select a program to configure its Ideal Candidate Profile</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get active traits and skills
  const activeTraits = (traits || []).filter(t => t.isActive);
  const activeSkills = (skills || []).filter(s => s.isActive);

  // Filter traits for drawer
  const filteredTraits = useMemo(() => {
    if (!showAddTraitDrawer) return [];
    return activeTraits.filter(trait => {
      const matchesSearch = trait.name.toLowerCase().includes(traitSearchQuery.toLowerCase()) ||
        trait.description.toLowerCase().includes(traitSearchQuery.toLowerCase());
      const matchesCategory = traitCategoryFilter === 'all' || trait.category === traitCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeTraits, traitSearchQuery, traitCategoryFilter, showAddTraitDrawer]);

  // Filter skills for drawer
  const filteredSkills = useMemo(() => {
    if (!showAddSkillDrawer) return [];
    return activeSkills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase());
      const matchesCategory = skillCategoryFilter === 'all' || skill.category === skillCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeSkills, skillSearchQuery, skillCategoryFilter, showAddSkillDrawer]);

  // Get unique categories
  const traitCategories = useMemo(() => {
    const cats = new Set(activeTraits.map(t => t.category));
    return Array.from(cats).sort();
  }, [activeTraits]);

  const skillCategories = useMemo(() => {
    const cats = new Set(activeSkills.map(s => s.category));
    return Array.from(cats).sort();
  }, [activeSkills]);

  const handleRemoveItem = async (bucket: BucketKey, type: ItemType, id: string) => {
    if (!icp) return;

    setIsSaving(true);
    try {
      const newBuckets: ProgramMatchICPBuckets = {
        ...icp.buckets,
        [bucket]: {
          ...icp.buckets[bucket],
          [`${type}Ids`]: icp.buckets[bucket][`${type}Ids`].filter(itemId => itemId !== id),
        },
      };

      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchProgramICP(ctx, program.id, newBuckets);
      router.refresh();
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddDrawer = (bucket: BucketKey, type: ItemType) => {
    if (type === 'trait') {
      setShowAddTraitDrawer(bucket);
      // Initialize with items already in this bucket (so they're pre-selected)
      setSelectedTraitIds(new Set(icp?.buckets[bucket].traitIds || []));
    } else {
      setShowAddSkillDrawer(bucket);
      // Initialize with items already in this bucket (so they're pre-selected)
      setSelectedSkillIds(new Set(icp?.buckets[bucket].skillIds || []));
    }
  };

  const handleCloseDrawers = () => {
    setShowAddTraitDrawer(null);
    setShowAddSkillDrawer(null);
    setShowAddOutcomeDrawer(null);
    setTraitSearchQuery('');
    setTraitCategoryFilter('all');
    setSkillSearchQuery('');
    setSkillCategoryFilter('all');
    setOutcomeSearchQuery('');
    setOutcomeCategoryFilter('all');
    setSelectedTraitIds(new Set());
    setSelectedSkillIds(new Set());
    setSelectedOutcomeIds(new Set());
  };

  const handleToggleTraitSelection = (traitId: string) => {
    const newSet = new Set(selectedTraitIds);
    if (newSet.has(traitId)) {
      newSet.delete(traitId);
    } else {
      newSet.add(traitId);
    }
    setSelectedTraitIds(newSet);
  };

  const handleToggleSkillSelection = (skillId: string) => {
    const newSet = new Set(selectedSkillIds);
    if (newSet.has(skillId)) {
      newSet.delete(skillId);
    } else {
      newSet.add(skillId);
    }
    setSelectedSkillIds(newSet);
  };

  const handleSaveDrawer = async () => {
    if (!program) return;

    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (showAddTraitDrawer || showAddSkillDrawer) {
        const bucket = showAddTraitDrawer || showAddSkillDrawer!;
        const type = showAddTraitDrawer ? 'trait' : 'skill';
        const selectedIds = showAddTraitDrawer ? selectedTraitIds : selectedSkillIds;

        // Use current ICP or initialize empty buckets
        const currentBuckets = icp?.buckets || {
          critical: { traitIds: [], skillIds: [] },
          veryImportant: { traitIds: [], skillIds: [] },
          important: { traitIds: [], skillIds: [] },
          niceToHave: { traitIds: [], skillIds: [] },
        };

        // Replace the bucket's IDs with the selected set (removes unselected items)
        const newBuckets: ProgramMatchICPBuckets = {
          ...currentBuckets,
          [bucket]: {
            ...currentBuckets[bucket],
            [`${type}Ids`]: Array.from(selectedIds),
          },
        };

        await dataClient.updateProgramMatchProgramICP(ctx, program.id, newBuckets);
      } else if (showAddOutcomeDrawer) {
        const { type, alignment } = showAddOutcomeDrawer;
        const current = programOutcomes || {
          programId: program.id,
          priorities: { strong: [], moderate: [] },
          fields: { strong: [], moderate: [] },
          roles: { strong: [], moderate: [] },
          updatedAt: new Date().toISOString(),
        };

        const updated: Omit<ProgramMatchProgramOutcomes, 'programId' | 'updatedAt'> = {
          priorities: { ...current.priorities },
          fields: { ...current.fields },
          roles: { ...current.roles },
        };

        if (type === 'priority') {
          updated.priorities[alignment] = Array.from(selectedOutcomeIds);
        } else if (type === 'field') {
          updated.fields[alignment] = Array.from(selectedOutcomeIds);
        } else {
          updated.roles[alignment] = Array.from(selectedOutcomeIds);
        }

        await dataClient.updateProgramMatchProgramOutcomes(ctx, program.id, updated);
      }

      router.refresh();
      handleCloseDrawers();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOutcome = async (type: 'priority' | 'field' | 'role', alignment: 'strong' | 'moderate', id: string) => {
    if (!program || !programOutcomes) return;

    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      const updated: Omit<ProgramMatchProgramOutcomes, 'programId' | 'updatedAt'> = {
        priorities: { ...programOutcomes.priorities },
        fields: { ...programOutcomes.fields },
        roles: { ...programOutcomes.roles },
      };

      if (type === 'priority') {
        updated.priorities[alignment] = updated.priorities[alignment].filter((outcomeId: string) => outcomeId !== id);
      } else if (type === 'field') {
        updated.fields[alignment] = updated.fields[alignment].filter((outcomeId: string) => outcomeId !== id);
      } else {
        updated.roles[alignment] = updated.roles[alignment].filter((outcomeId: string) => outcomeId !== id);
      }

      await dataClient.updateProgramMatchProgramOutcomes(ctx, program.id, updated);
      router.refresh();
    } catch (error) {
      console.error('Failed to remove outcome:', error);
      alert('Failed to remove outcome. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddOutcomeDrawer = (type: 'priority' | 'field' | 'role', alignment: 'strong' | 'moderate') => {
    setShowAddOutcomeDrawer({ type, alignment });
    let currentIds: string[] = [];
    if (programOutcomes) {
      if (type === 'priority') {
        currentIds = programOutcomes.priorities[alignment] || [];
      } else if (type === 'field') {
        currentIds = programOutcomes.fields[alignment] || [];
      } else {
        currentIds = programOutcomes.roles[alignment] || [];
      }
    }
    setSelectedOutcomeIds(new Set(currentIds));
  };

  const handleToggleOutcomeSelection = (outcomeId: string) => {
    const newSet = new Set(selectedOutcomeIds);
    if (newSet.has(outcomeId)) {
      newSet.delete(outcomeId);
    } else {
      newSet.add(outcomeId);
    }
    setSelectedOutcomeIds(newSet);
  };

  const getItemById = (type: ItemType, id: string) => {
    if (type === 'trait') {
      return activeTraits.find(t => t.id === id);
    } else {
      return activeSkills.find(s => s.id === id);
    }
  };

  const renderBucket = (bucket: BucketKey, type: ItemType) => {
    const items = icp?.buckets[bucket][`${type}Ids`] || [];
    const label = type === 'trait' ? 'Traits' : 'Skills';

    return (
      <div key={`${bucket}-${type}`} className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-700">{BUCKET_LABELS[bucket]}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenAddDrawer(bucket, type)}
            disabled={isSaving}
            className="text-xs h-6"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
            Add {label === 'Traits' ? 'Trait' : 'Skill'}
          </Button>
        </div>
        <div className="space-y-1 min-h-[60px]">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 italic">None</p>
          ) : (
            items.map((id) => {
              const item = getItemById(type, id);
              if (!item) return null;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate">{item.name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-800 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(bucket, type, id)}
                    disabled={isSaving}
                    className="ml-2 text-gray-400 hover:text-red-600 shrink-0"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Ideal Candidate Profile: {program.name}
        </h3>
        {icp && (
          <p className="text-xs text-gray-500">Last updated: {formatDate(icp.updatedAt)}</p>
        )}
      </div>

      {/* Traits Section */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Ideal Candidate Traits</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['critical', 'veryImportant', 'important', 'niceToHave'] as BucketKey[]).map(bucket =>
            renderBucket(bucket, 'trait')
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Ideal Candidate Skills</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['critical', 'veryImportant', 'important', 'niceToHave'] as BucketKey[]).map(bucket =>
            renderBucket(bucket, 'skill')
          )}
        </div>
      </div>

      {/* Outcomes Section (only if enabled) */}
      {draftConfig?.outcomesEnabled && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Program Outcomes Alignment</h4>
          {(['priority', 'field', 'role'] as const).map((type) => {
            const typeLabel = type === 'priority' ? 'Priorities' : type === 'field' ? 'Fields of Study' : 'Roles';
            let strongIds: string[] = [];
            let moderateIds: string[] = [];
            if (programOutcomes) {
              if (type === 'priority') {
                strongIds = programOutcomes.priorities.strong || [];
                moderateIds = programOutcomes.priorities.moderate || [];
              } else if (type === 'field') {
                strongIds = programOutcomes.fields.strong || [];
                moderateIds = programOutcomes.fields.moderate || [];
              } else {
                strongIds = programOutcomes.roles.strong || [];
                moderateIds = programOutcomes.roles.moderate || [];
              }
            }
            const activeOutcomes = (outcomes || []).filter(o => o.type === type && o.isActive);

            const renderOutcomeBucket = (alignment: 'strong' | 'moderate') => {
              const ids = alignment === 'strong' ? strongIds : moderateIds;
              const alignmentLabel = alignment === 'strong' ? 'Strong' : 'Moderate';

              return (
                <div key={`${type}-${alignment}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-gray-700">{alignmentLabel} Alignment</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddOutcomeDrawer(type, alignment)}
                      disabled={isSaving}
                      className="text-xs h-6"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1 min-h-[60px]">
                    {ids.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">None</p>
                    ) : (
                      ids.map((id: string) => {
                        const outcome = activeOutcomes.find(o => o.id === id);
                        if (!outcome) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="font-medium text-gray-900 truncate">{outcome.name}</span>
                              {outcome.category && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-800 shrink-0">
                                  {outcome.category}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveOutcome(type, alignment, id as string)}
                              disabled={isSaving}
                              className="ml-2 text-gray-400 hover:text-red-600 shrink-0"
                            >
                              <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            };

            return (
              <div key={type} className="mb-4">
                <h5 className="text-xs font-medium text-gray-600 mb-2">{typeLabel}</h5>
                <div className="grid grid-cols-2 gap-2">
                  {renderOutcomeBucket('strong')}
                  {renderOutcomeBucket('moderate')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Trait Drawer */}
      {showAddTraitDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-t-lg border-t border-gray-200 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Traits to {BUCKET_LABELS[showAddTraitDrawer]} ({selectedTraitIds.size} selected)
                </h3>
                <button
                  onClick={handleCloseDrawers}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
                </button>
              </div>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search traits..."
                  value={traitSearchQuery}
                  onChange={(e) => setTraitSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={traitCategoryFilter}
                  onChange={(e) => setTraitCategoryFilter(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {traitCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTraits.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No traits match your filters</p>
              ) : (
                <div className="space-y-2">
                  {filteredTraits.map((trait) => {
                    const isSelected = selectedTraitIds.has(trait.id);
                    const isAlreadyInBucket = icp?.buckets[showAddTraitDrawer].traitIds.includes(trait.id);
                    return (
                      <div
                        key={trait.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${isAlreadyInBucket ? 'opacity-50' : ''}`}
                        onClick={() => !isAlreadyInBucket && handleToggleTraitSelection(trait.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{trait.name}</span>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {trait.category}
                            </span>
                            {isAlreadyInBucket && (
                              <span className="text-xs text-gray-500">(already added)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">{trait.description}</p>
                        </div>
                        {isSelected && (
                          <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-blue-600 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseDrawers} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveDrawer} disabled={isSaving}>
                Done ({selectedTraitIds.size} selected)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Drawer */}
      {showAddSkillDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-t-lg border-t border-gray-200 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Skills to {BUCKET_LABELS[showAddSkillDrawer]} ({selectedSkillIds.size} selected)
                </h3>
                <button
                  onClick={handleCloseDrawers}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
                </button>
              </div>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={skillCategoryFilter}
                  onChange={(e) => setSkillCategoryFilter(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {skillCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredSkills.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No skills match your filters</p>
              ) : (
                <div className="space-y-2">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkillIds.has(skill.id);
                    const isAlreadyInBucket = icp?.buckets[showAddSkillDrawer].skillIds.includes(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${isAlreadyInBucket ? 'opacity-50' : ''}`}
                        onClick={() => !isAlreadyInBucket && handleToggleSkillSelection(skill.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {skill.category}
                            </span>
                            {isAlreadyInBucket && (
                              <span className="text-xs text-gray-500">(already added)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">{skill.description}</p>
                        </div>
                        {isSelected && (
                          <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-blue-600 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseDrawers} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveDrawer} disabled={isSaving}>
                Done ({selectedSkillIds.size} selected)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

