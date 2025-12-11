'use client';

import { VoiceAndToneProvider, useVoiceAndTone } from '@/components/shared/voice-and-tone/VoiceAndToneProvider';
import { ProfilesIndexPage } from '@/components/shared/voice-and-tone/ProfilesIndexPage';

function ProfilesIndexPageWrapper() {
  const { config, loading, updateProfiles, updateAssignmentRules, save } = useVoiceAndTone();

  async function handleUpdateProfiles(profiles: typeof config.voiceProfiles) {
    updateProfiles(profiles);
    try {
      await save();
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }

  async function handleUpdateAssignmentRules(rules: typeof config.assignmentRules) {
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
      basePath="/ai-assistants/voice-and-tone"
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
