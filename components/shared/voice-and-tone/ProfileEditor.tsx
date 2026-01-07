'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { VoiceProfile, VoiceProfileId, AssignmentRule, ToneRule } from '@/lib/communication/types';
import { convertToneRuleToAssignmentRule } from '@/lib/communication/resolveVoiceProfile';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BrandTab } from './tabs/BrandTab';
import { VoiceTab } from './tabs/VoiceTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { PreviewTab } from './tabs/PreviewTab';

const PROFILE_TABS = [
  { id: 'general', label: 'General' },
  { id: 'brand', label: 'Brand' },
  { id: 'voice', label: 'Voice' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'preview', label: 'Preview' },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]['id'];

interface ProfileEditorProps {
  profile: VoiceProfile;
  allProfiles: VoiceProfile[];
  assignmentRules: AssignmentRule[];
  toneRules?: ToneRule[]; // Legacy support
  onUpdateProfile: (profile: VoiceProfile) => void;
  onUpdateProfiles: (profiles: VoiceProfile[]) => void;
  onUpdateAssignmentRules: (rules: AssignmentRule[]) => void;
  onDeleteProfile: (profileId: VoiceProfileId) => void;
  onSave: () => Promise<void>;
  basePath?: string;
}

export function ProfileEditor({
  profile,
  allProfiles,
  assignmentRules,
  toneRules,
  onUpdateProfile,
  onUpdateProfiles,
  onUpdateAssignmentRules,
  onDeleteProfile,
  onSave,
  basePath = '/admin/voice-and-tone',
}: ProfileEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<ProfileTabId>('general');
  const [localProfile, setLocalProfile] = React.useState<VoiceProfile>(profile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Migrate toneRules to assignmentRules if needed
  const migratedRules = React.useMemo(() => {
    if (toneRules && toneRules.length > 0 && assignmentRules.length === 0) {
      return toneRules.map(convertToneRuleToAssignmentRule);
    }
    return assignmentRules;
  }, [assignmentRules, toneRules]);

  // Filter assignment rules for this profile
  const profileAssignmentRules = React.useMemo(() => {
    return migratedRules.filter(r => r.profileId === profile.id);
  }, [migratedRules, profile.id]);

  // Update local profile when prop changes
  React.useEffect(() => {
    setLocalProfile(profile);
    setHasUnsavedChanges(false);
  }, [profile.id]);

  function updateLocalProfile(updater: (p: VoiceProfile) => VoiceProfile) {
    setLocalProfile(updater);
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      onUpdateProfile(localProfile);
      await onSave();
      setHasUnsavedChanges(false);
      // Show success message (could use toast here)
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault() {
    const updatedProfiles = allProfiles.map(p => ({
      ...p,
      isDefault: p.id === profile.id,
    }));
    onUpdateProfiles(updatedProfiles);
    updateLocalProfile(p => ({ ...p, isDefault: true }));
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving default profile:', error);
    }
  }

  function handleDuplicate() {
    const duplicated: VoiceProfile = {
      ...localProfile,
      id: `profile_${Date.now()}`,
      name: `${localProfile.name} (Copy)`,
      isDefault: false,
    };
    onUpdateProfiles([...allProfiles, duplicated]);
    router.push(`${basePath}/profiles/${duplicated.id}`);
  }

  function handleDelete() {
    if (profile.isDefault) {
      alert('Cannot delete the default profile. Please set another profile as default first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      return;
    }

    onDeleteProfile(profile.id);
    router.push(`${basePath}/profiles`);
  }


  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <button
          type="button"
          onClick={() => router.push(`${basePath}/profiles`)}
          className="hover:text-gray-900"
        >
          Voice & Tone
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{localProfile.name}</span>
      </nav>

      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{localProfile.name}</h1>
            {localProfile.description && (
              <p className="text-sm text-gray-600 mt-1">{localProfile.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {localProfile.isDefault ? (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Default
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetDefault}
                className="text-xs"
              >
                Set as default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="text-xs"
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              className="text-xs"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <GeneralTab
            profile={localProfile}
            onUpdate={updateLocalProfile}
          />
        )}
        {activeTab === 'brand' && (
          <BrandTab
            profile={localProfile}
            onUpdate={updateLocalProfile}
          />
        )}
        {activeTab === 'voice' && (
          <VoiceTab
            profile={localProfile}
            onUpdate={updateLocalProfile}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            profile={localProfile}
            rules={profileAssignmentRules}
            allRules={migratedRules}
            allProfiles={allProfiles}
            onUpdateRules={(rules) => {
              // Merge with other profile rules
              const otherRules = migratedRules.filter(r => r.profileId !== profile.id);
              onUpdateAssignmentRules([...otherRules, ...rules]);
            }}
          />
        )}
        {activeTab === 'preview' && (
          <PreviewTab
            profile={localProfile}
          />
        )}
      </div>
    </div>
  );
}

// General Tab Component
interface GeneralTabProps {
  profile: VoiceProfile;
  onUpdate: (updater: (p: VoiceProfile) => VoiceProfile) => void;
}

function GeneralTab({ profile, onUpdate }: GeneralTabProps) {
  const [name, setName] = React.useState(profile.name);
  const [description, setDescription] = React.useState(profile.description || '');
  const [isDefault, setIsDefault] = React.useState(profile.isDefault);

  React.useEffect(() => {
    setName(profile.name);
    setDescription(profile.description || '');
    setIsDefault(profile.isDefault);
  }, [profile.id]);

  function handleNameChange(value: string) {
    setName(value);
    onUpdate(p => ({ ...p, name: value }));
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    onUpdate(p => ({ ...p, description: value || undefined }));
  }

  function handleDefaultChange(checked: boolean) {
    setIsDefault(checked);
    onUpdate(p => ({ ...p, isDefault: checked }));
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">General Settings</h2>
        <p className="text-xs text-gray-600">
          Configure basic profile information and default status.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Institutional, Admissions"
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Brief description of this profile"
            rows={3}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => handleDefaultChange(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700 cursor-pointer">
            Set as default profile
          </label>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-500">
            Profile ID: <code className="text-gray-600">{profile.id}</code>
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Voice profiles define how your AI assistants communicate. Each profile can be mapped to specific apps, agents, groups, or users using Assignment Rules.
          </p>
        </div>
      </div>
    </section>
  );
}









