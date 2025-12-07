'use client';

import * as React from 'react';
import { CommunicationConfig } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { SlideUpSection } from '@/components/ui/animations';

interface PreviewSectionProps {
  config: CommunicationConfig;
}

export function PreviewSection({ config }: PreviewSectionProps) {
  const [userMessage, setUserMessage] = React.useState('');
  const [selectedToneRule, setSelectedToneRule] = React.useState<string>('');
  const [previewResponse, setPreviewResponse] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

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
      // For now, simulate a delay and return a mock response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const selectedRule = selectedToneRule 
        ? config.toneRules.find(r => r.id === selectedToneRule)
        : null;

      // Mock response based on config
      const mockResponse = `Based on your Voice & Tone settings:
- Brand Voice: ${config.brand.sliders.formality > 50 ? 'Formal' : 'Casual'} tone, ${config.brand.sliders.warmth > 50 ? 'warm' : 'neutral'} approach
- Personality: ${config.personality.archetype} archetype with ${config.personality.empathy} empathy
${selectedRule ? `- Tone Rule: "${selectedRule.label}" (${selectedRule.rules.openingStrategy} opening)` : ''}

Sample response:
${selectedRule?.rules.openingStrategy === 'empathetic' ? "I understand this situation can be challenging. " : ''}
${selectedRule?.rules.openingStrategy === 'direct' ? "Here's what you need to know: " : ''}
${selectedRule?.rules.openingStrategy === 'supportive' ? "I'm here to help you through this. " : ''}
${selectedRule?.rules.openingStrategy === 'encouraging' ? "You've got this! " : ''}
Based on your message: "${userMessage}", here's how an assistant would respond following your Voice & Tone guidelines.`;

      setPreviewResponse(mockResponse);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  // Get active tone rules for dropdown
  const activeToneRules = config.toneRules.filter(r => r.enabled !== false);

  // Calculate summary of affecting settings
  const getSummary = () => {
    const parts: string[] = [];
    
    const formalityLevel = config.brand.sliders.formality > 66 ? 'high' : 
                          config.brand.sliders.formality > 33 ? 'medium' : 'low';
    parts.push(`Formality: ${formalityLevel}`);
    
    const warmthLevel = config.brand.sliders.warmth > 66 ? 'high' : 
                       config.brand.sliders.warmth > 33 ? 'medium' : 'low';
    parts.push(`Warmth: ${warmthLevel}`);
    
    if (selectedToneRule) {
      const rule = config.toneRules.find(r => r.id === selectedToneRule);
      if (rule) {
        parts.push(`Tone: "${rule.label}"`);
      }
    }
    
    return parts.join(', ');
  };

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

      {/* Summary */}
      {previewResponse && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-[11px] font-medium text-gray-700 mb-1">Active Settings:</p>
          <p className="text-[11px] text-gray-600">{getSummary()}</p>
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

      {/* Tone Rule Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Apply Tone Rule (optional)
        </label>
        <select
          value={selectedToneRule}
          onChange={(e) => setSelectedToneRule(e.target.value)}
          className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
        >
          <option value="">None (use default personality)</option>
          {activeToneRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.label}
            </option>
          ))}
        </select>
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

