'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { VoiceProfile, VoiceProfileId, AssignmentRule } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProfilesIndexPageProps {
  profiles: VoiceProfile[];
  assignmentRules: AssignmentRule[];
  onUpdateProfiles: (profiles: VoiceProfile[]) => void | Promise<void>;
  onUpdateAssignmentRules: (rules: AssignmentRule[]) => void | Promise<void>;
  basePath?: string;
}

// Format date as "Dec 11, 2025"
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get usage summary for a profile
function getUsageSummary(profileId: VoiceProfileId, assignmentRules: AssignmentRule[]): string {
  const rules = assignmentRules.filter(r => r.profileId === profileId);
  if (rules.length === 0) return 'Not used';
  
  const apps = rules.filter(r => r.scope === 'app').length;
  const agents = rules.filter(r => r.scope === 'agent').length;
  const groups = rules.filter(r => r.scope === 'group').length;
  const users = rules.filter(r => r.scope === 'user').length;
  
  const parts: string[] = [];
  if (apps > 0) parts.push(`${apps} app${apps > 1 ? 's' : ''}`);
  if (agents > 0) parts.push(`${agents} agent${agents > 1 ? 's' : ''}`);
  if (groups > 0) parts.push(`${groups} group${groups > 1 ? 's' : ''}`);
  if (users > 0) parts.push(`${users} user${users > 1 ? 's' : ''}`);
  
  return parts.join(', ') || 'Not used';
}

export function ProfilesIndexPage({
  profiles,
  assignmentRules,
  onUpdateProfiles,
  onUpdateAssignmentRules,
  basePath = '/admin/voice-and-tone',
}: ProfilesIndexPageProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newProfileName, setNewProfileName] = React.useState('');
  const [newProfileDescription, setNewProfileDescription] = React.useState('');
  const [startFromProfileId, setStartFromProfileId] = React.useState<VoiceProfileId | null>(null);
  const [deletingProfileId, setDeletingProfileId] = React.useState<VoiceProfileId | null>(null);
  const [creatingProfile, setCreatingProfile] = React.useState(false);

  async function handleCreateProfile() {
    if (!newProfileName.trim() || creatingProfile) return;

    const startFrom = startFromProfileId
      ? profiles.find(p => p.id === startFromProfileId)
      : profiles.find(p => p.isDefault) || profiles[0];

    if (!startFrom) return;

    setCreatingProfile(true);

    try {
      const newProfile: VoiceProfile = {
        ...startFrom,
        id: `profile_${Date.now()}`,
        name: newProfileName.trim(),
        description: newProfileDescription.trim() || undefined,
        isDefault: false,
      };

      // Update profiles and wait for save to complete
      await onUpdateProfiles([...profiles, newProfile]);
      
      setShowCreateModal(false);
      setNewProfileName('');
      setNewProfileDescription('');
      setStartFromProfileId(null);
      
      // Navigate to the new profile editor after save completes
      router.push(`${basePath}/profiles/${newProfile.id}`);
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setCreatingProfile(false);
    }
  }

  async function handleDuplicate(profile: VoiceProfile) {
    const duplicated: VoiceProfile = {
      ...profile,
      id: `profile_${Date.now()}`,
      name: `${profile.name} (Copy)`,
      isDefault: false,
    };

    // Update profiles and wait for save to complete
    await onUpdateProfiles([...profiles, duplicated]);
    router.push(`${basePath}/profiles/${duplicated.id}`);
  }

  function handleDelete(profileId: VoiceProfileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    if (profile.isDefault) {
      alert('Cannot delete the default profile. Please set another profile as default first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingProfileId(profileId);
    
    // Remove profile
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    
    // Remove assignment rules for this profile
    const updatedRules = assignmentRules.filter(r => r.profileId !== profileId);
    
    onUpdateProfiles(updatedProfiles);
    onUpdateAssignmentRules(updatedRules);
    setDeletingProfileId(null);
  }

  function handleSetDefault(profileId: VoiceProfileId) {
    onUpdateProfiles(
      profiles.map(p => ({
        ...p,
        isDefault: p.id === profileId,
      }))
    );
  }

  return (
    <>
      <div className="space-y-6" style={{ isolation: 'isolate' }}>
        {/* Compact header section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Brand, Voice & Tone Profiles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create reusable communication profiles that define brand, voice, and tone for your AI assistants.
            </p>
          </div>
          <Button
            onClick={() => {
              const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
              setStartFromProfileId(defaultProfile?.id || null);
              setShowCreateModal(true);
            }}
            className="text-sm"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
            New profile
          </Button>
        </div>

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FontAwesomeIcon icon="fa-solid fa-comments" className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-700 mb-1">No voice & tone profiles yet</h3>
            <p className="text-xs text-gray-500 mb-4">
              Create a profile to define brand, voice, and tone rules for your AI assistants.
            </p>
            <Button
              onClick={() => {
                setShowCreateModal(true);
              }}
              size="sm"
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
              New profile
            </Button>
          </div>
        ) : (
          <div className="space-y-3 overflow-visible">
            {profiles.map((profile) => {
              const usageSummary = getUsageSummary(profile.id, assignmentRules);
              const lastUpdated = profile.updatedAt || profile.createdAt;
              const displayDescription = profile.description || (profile.isDefault ? 'Default institutional voice profile' : undefined);
              
              return (
                <div
                  key={profile.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors relative"
                  style={{ zIndex: 'auto' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Column 1: Profile info (2/3 width on desktop) */}
                    <div className="flex-1 min-w-0 sm:flex-[2]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => router.push(`${basePath}/profiles/${profile.id}`)}
                          className="text-left font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1 -ml-1"
                        >
                          {profile.name}
                        </button>
                        {profile.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            Default
                          </span>
                        )}
                      </div>
                      {displayDescription && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {displayDescription}
                        </p>
                      )}
                    </div>

                    {/* Column 2: Status block (1/3 width on desktop, stacks on mobile) */}
                    <div className="flex-shrink-0 sm:text-right sm:flex-[1] sm:min-w-[200px]">
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>
                          Used by: <span className="text-gray-900">{usageSummary}</span>
                        </div>
                        {lastUpdated && (
                          <div>
                            Updated: <span className="text-gray-900">{formatDate(lastUpdated)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Actions (aligned top-right) */}
                    <div className="flex-shrink-0 sm:self-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 relative z-0"
                            aria-label={`Actions for ${profile.name}`}
                          >
                            <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`${basePath}/profiles/${profile.id}`)}
                            className="cursor-pointer"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-pencil" className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(profile)}
                            className="cursor-pointer"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-copy" className="h-3 w-3 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!profile.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(profile.id)}
                              className="cursor-pointer"
                            >
                              <FontAwesomeIcon icon="fa-solid fa-star" className="h-3 w-3 mr-2" />
                              Set default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(profile.id)}
                            disabled={deletingProfileId === profile.id}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-trash" className="h-3 w-3 mr-2" />
                            {deletingProfileId === profile.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Create New Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Admissions, Advancement"
                  className="h-8 text-[11px]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  type="text"
                  value={newProfileDescription}
                  onChange={(e) => setNewProfileDescription(e.target.value)}
                  placeholder="Brief description of this profile"
                  className="h-8 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Start from
                </label>
                <select
                  value={startFromProfileId || ''}
                  onChange={(e) => setStartFromProfileId(e.target.value || null)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}{profile.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProfileName('');
                  setNewProfileDescription('');
                  setStartFromProfileId(null);
                }}
                className="text-[11px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim() || creatingProfile}
                className="text-[11px]"
              >
                {creatingProfile ? (
                  <>
                    <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
