'use client';

import * as React from 'react';
import { CommunicationConfig, VoiceProfile, ToneRule, ToneRuleScope } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { SlideUpSection } from '@/components/ui/animations';

interface PreviewSectionProps {
  config: CommunicationConfig;
}

// Mock data for preview
const MOCK_APPS = [
  { id: 'app-1', name: 'Admissions AI Assistant' },
  { id: 'app-2', name: 'Student Success Coach' },
  { id: 'app-3', name: 'Athletics Bot' },
];

const MOCK_GROUPS = [
  { id: 'group-1', name: 'Admissions counselors' },
  { id: 'group-2', name: 'Advancement team' },
  { id: 'group-3', name: 'Athletics staff' },
];

const MOCK_USERS = [
  { id: 'user-1', name: 'Jordan Lee' },
  { id: 'user-2', name: 'Alex Martin' },
  { id: 'user-3', name: 'Taylor Singh' },
];

export function PreviewSection({ config }: PreviewSectionProps) {
  const [userMessage, setUserMessage] = React.useState('');
  const [selectedProfileId, setSelectedProfileId] = React.useState<string>('');
  const [previewScope, setPreviewScope] = React.useState<ToneRuleScope | ''>('');
  const [previewTargetId, setPreviewTargetId] = React.useState<string>('');
  const [previewResponse, setPreviewResponse] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  const profiles = config.voiceProfiles || [];
  const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
  const selectedProfile = selectedProfileId ? profiles.find(p => p.id === selectedProfileId) : defaultProfile;

  // Calculate which profile would be used based on rules
  const effectiveProfile = React.useMemo(() => {
    if (!previewScope || !previewTargetId) {
      return { profile: defaultProfile, matchedRule: null };
    }

    // Sort rules by order (top to bottom)
    const sortedRules = [...(config.toneRules || [])].sort((a, b) => a.order - b.order);

    // Find matching rule (User → Group → App precedence)
    const matchingRule = sortedRules.find(rule => {
      if (rule.scope !== previewScope) return false;
      if (rule.targetId !== previewTargetId) return false;
      return true;
    });

    if (matchingRule) {
      const profile = profiles.find(p => p.id === matchingRule.profileId);
      return { profile: profile || defaultProfile, matchedRule: matchingRule };
    }

    return { profile: defaultProfile, matchedRule: null };
  }, [previewScope, previewTargetId, config.toneRules, profiles, defaultProfile]);

  async function generatePreview() {
    if (!userMessage.trim()) {
      alert('Please enter a sample user message');
      return;
    }

    setIsGenerating(true);
    setShowPreview(false);
    setPreviewResponse(null);

    try {
      // TODO: Replace with actual OpenAI API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const profile = selectedProfile || defaultProfile;
      const { profile: effective, matchedRule } = effectiveProfile;

      // Mock response based on config
      const mockResponse = `Based on your Voice & Tone settings:
- Voice Profile: ${effective?.name || 'Default'}${effective?.isDefault ? ' (Default)' : ''}
${matchedRule ? `- Matched Rule: ${matchedRule.scope} – ${matchedRule.targetLabel}` : '- No specific rule matched (using default profile)'}
- Formality: ${effective?.characteristics.formality > 66 ? 'High' : effective?.characteristics.formality > 33 ? 'Medium' : 'Low'}
- Warmth: ${effective?.characteristics.warmth > 66 ? 'High' : effective?.characteristics.warmth > 33 ? 'Medium' : 'Low'}
- Personality: ${config.personality.archetype} archetype with ${config.personality.empathy} empathy

Sample response:
Based on your message: "${userMessage}", here's how an assistant would respond following the ${effective?.name || 'default'} voice profile guidelines.`;

      setPreviewResponse(mockResponse);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function getTargetOptions(scope: ToneRuleScope | '') {
    if (!scope) return [];
    switch (scope) {
      case 'app':
        return MOCK_APPS;
      case 'group':
        return MOCK_GROUPS;
      case 'user':
        return MOCK_USERS;
      default:
        return [];
    }
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Preview
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            See how your Voice & Tone settings shape assistant responses.
          </p>
        </div>
      </div>

      {/* Voice Profile Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Voice Profile
        </label>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
        >
          <option value="">Use effective profile (based on rules)</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}{profile.isDefault ? ' (Default)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Scope and Target Selectors (optional) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-gray-700">
            Scope (optional)
          </label>
          <select
            value={previewScope}
            onChange={(e) => {
              setPreviewScope(e.target.value as ToneRuleScope | '');
              setPreviewTargetId('');
            }}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
          >
            <option value="">None</option>
            <option value="app">App</option>
            <option value="group">Group</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-gray-700">
            Target (optional)
          </label>
          <select
            value={previewTargetId}
            onChange={(e) => setPreviewTargetId(e.target.value)}
            disabled={!previewScope}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select {previewScope}...</option>
            {getTargetOptions(previewScope).map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Effective Profile Display */}
      {(previewScope && previewTargetId) && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-[11px] font-medium text-blue-900 mb-1">Effective Profile:</p>
          <p className="text-[11px] text-blue-700">
            {effectiveProfile.profile?.name || 'Default'}{effectiveProfile.profile?.isDefault ? ' (Default)' : ''}
            {effectiveProfile.matchedRule && (
              <span className="text-blue-600">
                {' '}– matched rule: {effectiveProfile.matchedRule.scope} – {effectiveProfile.matchedRule.targetLabel}
              </span>
            )}
            {!effectiveProfile.matchedRule && (
              <span className="text-blue-600"> – no specific rule matched</span>
            )}
          </p>
        </div>
      )}

      {/* User Message Input */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Sample User Message
        </label>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter a sample message that a student or constituent might send..."
          className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={generatePreview}
        disabled={isGenerating || !userMessage.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-2 animate-spin" />
            Generating preview...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon="fa-solid fa-wand-magic-sparkles" className="h-4 w-4 mr-2" />
            Generate sample response
          </>
        )}
      </Button>

      {/* Preview Response */}
      {showPreview && previewResponse && (
        <SlideUpSection>
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Preview Response</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewResponse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {previewResponse}
            </div>
            <p className="text-[10px] text-gray-500">
              This is a mock preview. In production, this would call your AI model with the configured settings.
            </p>
          </div>
        </SlideUpSection>
      )}
    </section>
  );
}
