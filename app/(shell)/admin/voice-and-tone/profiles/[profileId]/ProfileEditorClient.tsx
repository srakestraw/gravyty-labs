'use client';

import { VoiceAndToneProvider, useVoiceAndTone } from '@/components/shared/voice-and-tone/VoiceAndToneProvider';
import { ProfileEditor } from '@/components/shared/voice-and-tone/ProfileEditor';
import { useRouter } from 'next/navigation';

function ProfileEditorWrapper({ profileId }: { profileId: string }) {
  const { config, loading, updateProfile, updateProfiles, updateAssignmentRules, deleteProfile, save } = useVoiceAndTone();
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!config || !config.voiceProfiles) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-red-600">
          Failed to load profile. Please refresh the page.
        </div>
      </div>
    );
  }

  const profile = config.voiceProfiles.find(p => p.id === profileId);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-red-600">
          Profile not found.
        </div>
        <div className="text-center">
          <button
            onClick={() => router.push('/admin/voice-and-tone/profiles')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            ← Back to profiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfileEditor
      profile={profile}
      allProfiles={config.voiceProfiles}
      assignmentRules={config.assignmentRules || []}
      toneRules={config.toneRules}
      onUpdateProfile={updateProfile}
      onUpdateProfiles={updateProfiles}
      onUpdateAssignmentRules={updateAssignmentRules}
      onDeleteProfile={deleteProfile}
      onSave={save}
      basePath="/admin/voice-and-tone"
    />
  );
}

export function ProfileEditorClient({ profileId }: { profileId: string }) {
  return (
    <VoiceAndToneProvider>
      <ProfileEditorWrapper profileId={profileId} />
    </VoiceAndToneProvider>
  );
}



