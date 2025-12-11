'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { VoiceProfile, VoiceProfileId, AssignmentRule } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProfilesIndexPageProps {
  profiles: VoiceProfile[];
  assignmentRules: AssignmentRule[];
  onUpdateProfiles: (profiles: VoiceProfile[]) => void | Promise<void>;
  onUpdateAssignmentRules: (rules: AssignmentRule[]) => void | Promise<void>;
  basePath?: string;
}

// Mock function to count usage - TODO: Replace with real API
function getUsageCount(profileId: VoiceProfileId, assignmentRules: AssignmentRule[]): string {
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
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Brand, Voice & Tone Profiles
              </h1>
              <p className="text-sm text-gray-600">
                Create and manage communication profiles that define brand, voice, and tone rules for your AI assistants.
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
        </header>

        {/* Profiles Table */}
        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
          {profiles.length === 0 ? (
            <div className="p-12 text-center">
              <FontAwesomeIcon icon="fa-solid fa-comments" className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">No profiles yet</p>
              <p className="text-xs text-gray-500 mb-4">
                Create your first profile to get started.
              </p>
              <Button
                onClick={() => {
                  setShowCreateModal(true);
                }}
                size="sm"
              >
                <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
                Create profile
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Default</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Used by</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Last updated</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{profile.name}</div>
                          {profile.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{profile.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {profile.isDefault ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                            Default
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        {getUsageCount(profile.id, assignmentRules)}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        {/* TODO: Add updatedAt field to profiles */}
                        —
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`${basePath}/profiles/${profile.id}`)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(profile)}
                            className="text-[11px] text-gray-600 hover:text-gray-700"
                          >
                            Duplicate
                          </button>
                          {!profile.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(profile.id)}
                              className="text-[11px] text-gray-600 hover:text-gray-700"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(profile.id)}
                            disabled={deletingProfileId === profile.id}
                            className="text-[11px] text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingProfileId === profile.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
