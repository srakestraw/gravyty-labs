'use client';

import * as React from 'react';
import { VoiceProfile } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface PreviewTabProps {
  profile: VoiceProfile;
}

export function PreviewTab({ profile }: PreviewTabProps) {
  const [channel, setChannel] = React.useState<'chat' | 'email' | 'sms'>('chat');
  const [samplePrompt, setSamplePrompt] = React.useState('');
  const [previewResponse, setPreviewResponse] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  async function generatePreview() {
    if (!samplePrompt.trim()) {
      alert('Please enter a sample prompt');
      return;
    }

    setIsGenerating(true);
    setPreviewResponse(null);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResponse = `Based on the "${profile.name}" profile:

Voice Characteristics:
- Formality: ${profile.characteristics.formality > 66 ? 'High' : profile.characteristics.formality > 33 ? 'Medium' : 'Low'}
- Warmth: ${profile.characteristics.warmth > 66 ? 'High' : profile.characteristics.warmth > 33 ? 'Medium' : 'Low'}
- Directness: ${profile.characteristics.directness > 66 ? 'High' : profile.characteristics.directness > 33 ? 'Medium' : 'Low'}
- Energy: ${profile.characteristics.energy > 66 ? 'High' : profile.characteristics.energy > 33 ? 'Medium' : 'Low'}

Style Preferences:
- Emojis: ${profile.stylePreferences.allowEmojis ? 'Allowed' : 'Not allowed'}
- Contractions: ${profile.stylePreferences.allowContractions ? 'Allowed' : 'Not allowed'}
- First Person: ${profile.stylePreferences.useFirstPerson ? 'Used' : 'Not used'}
- Light Humor: ${profile.stylePreferences.allowLightHumor ? 'Allowed' : 'Not allowed'}

Sample Response:
Based on your message: "${samplePrompt}", here's how an assistant would respond following the ${profile.name} voice profile guidelines.`;

      setPreviewResponse(mockResponse);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Preview</h2>
        <p className="text-xs text-gray-600">
          See how this profile behaves in different channels.
        </p>
      </div>

      {/* Channel Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Channel
        </label>
        <div className="flex gap-2">
          {(['chat', 'email', 'sms'] as const).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannel(ch)}
              className={cn(
                'px-4 py-2 rounded border text-sm font-medium transition-colors',
                channel === ch
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              {ch.charAt(0).toUpperCase() + ch.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Preview */}
      {profile.brand && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-[11px] font-medium text-gray-700">Brand Preview</p>
          <div className="flex items-center gap-4">
            {profile.brand.logoUrl && (
              <div className="text-xs text-gray-600">
                Logo: <span className="text-blue-600">{profile.brand.logoUrl}</span>
              </div>
            )}
            {profile.brand.primaryColor && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Primary:</span>
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: profile.brand.primaryColor }}
                />
                <span className="text-xs text-gray-600">{profile.brand.primaryColor}</span>
              </div>
            )}
          </div>
          {profile.brand.typographyStyle && (
            <div className="text-xs text-gray-600">
              Typography: {profile.brand.typographyStyle}
            </div>
          )}
        </div>
      )}

      {/* Key Characteristics Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
        <p className="text-[11px] font-medium text-gray-700">Key Voice Characteristics</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Formality: {profile.characteristics.formality}</div>
          <div>Warmth: {profile.characteristics.warmth}</div>
          <div>Directness: {profile.characteristics.directness}</div>
          <div>Energy: {profile.characteristics.energy}</div>
        </div>
      </div>

      {/* Sample Prompt Input */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Sample Prompt
        </label>
        <textarea
          value={samplePrompt}
          onChange={(e) => setSamplePrompt(e.target.value)}
          placeholder="Enter a sample message that a student or constituent might send..."
          rows={4}
          className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={generatePreview}
        disabled={isGenerating || !samplePrompt.trim()}
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
      {previewResponse && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Preview Response</h3>
            <button
              type="button"
              onClick={() => setPreviewResponse(null)}
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
      )}
    </section>
  );
}







