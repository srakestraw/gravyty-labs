'use client';

import { VoiceAndToneProvider, useVoiceAndTone } from '@/components/shared/voice-and-tone/VoiceAndToneProvider';
import { ProfilesIndexPage } from '@/components/shared/voice-and-tone/ProfilesIndexPage';
import { VoiceProfile, AssignmentRule } from '@/lib/communication/types';

function ProfilesIndexPageWrapper() {
  const { config, loading, updateProfiles, updateAssignmentRules, save } = useVoiceAndTone();

  async function handleUpdateProfiles(profiles: VoiceProfile[]) {
    updateProfiles(profiles);
    try {
      await save();
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }

  async function handleUpdateAssignmentRules(rules: AssignmentRule[]) {
    updateAssignmentRules(rules);
    try {
      await save();
    } catch (error) {
      console.error('Error saving assignment rules:', error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  if (!config || !config.voiceProfiles) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-red-600">
          Failed to load profiles. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <ProfilesIndexPage
      profiles={config.voiceProfiles}
      assignmentRules={config.assignmentRules || []}
      onUpdateProfiles={handleUpdateProfiles}
      onUpdateAssignmentRules={handleUpdateAssignmentRules}
      basePath="/admin/voice-and-tone"
    />
  );
}

export default function ProfilesPage() {
  return (
    <VoiceAndToneProvider>
      <ProfilesIndexPageWrapper />
    </VoiceAndToneProvider>
  );
}
