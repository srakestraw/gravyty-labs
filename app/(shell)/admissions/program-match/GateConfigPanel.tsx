'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchDraftConfig, ProgramMatchGateConfig, VoiceToneProfile } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface GateConfigPanelProps {
  draftConfig: ProgramMatchDraftConfig | null;
  voiceToneProfiles: VoiceToneProfile[];
}

export function GateConfigPanel({ draftConfig, voiceToneProfiles }: GateConfigPanelProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state from draft config or use defaults
  // Use a function initializer to ensure consistency between server and client
  const defaultGateConfig: ProgramMatchGateConfig = {
    enabled: true,
    requiredFields: {
      email: true,
      firstName: true,
      lastName: true,
      phone: false,
    },
    consent: {
      emailOptIn: false,
      smsOptIn: false,
    },
    copy: {
      headline: 'Before we start',
      helperText: 'Share a few details so we can send program information if you\'d like.',
    },
  };

  // Ensure we always have a gate config - use draftConfig?.gate if available, otherwise default
  // This ensures server and client render the same initial state
  const [gateConfig, setGateConfig] = useState<ProgramMatchGateConfig>(() => {
    return draftConfig?.gate || defaultGateConfig;
  });

  // Sync state when draftConfig changes (after refresh)
  useEffect(() => {
    if (draftConfig?.gate) {
      setGateConfig(draftConfig.gate);
    } else if (!draftConfig?.gate) {
      // If draftConfig doesn't have gate, use default
      setGateConfig(defaultGateConfig);
    }
  }, [draftConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchDraftConfig(ctx, {
        gate: gateConfig,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to save gate config:', error);
      alert('Failed to save gate configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedVoiceTone = draftConfig?.voiceToneProfileId
    ? voiceToneProfiles.find(p => p.id === draftConfig.voiceToneProfileId)
    : null;

  return (
    <div className="space-y-6">
      {/* Enable Gate Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <Label htmlFor="gate-enabled" className="text-sm font-medium text-gray-900">
            Enable Lead Capture Gate
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            Require candidates to provide information before starting the quiz
          </p>
        </div>
        <Checkbox
          id="gate-enabled"
          checked={gateConfig.enabled}
          onCheckedChange={(checked) =>
            setGateConfig({ ...gateConfig, enabled: checked === true })
          }
        />
      </div>

      {gateConfig.enabled && (
        <>
          {/* Fields to Capture */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Fields to Capture</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="field-email"
                  checked={gateConfig.requiredFields.email}
                  disabled={true}
                />
                <Label htmlFor="field-email" className="text-sm text-gray-700 flex-1">
                  Email <span className="text-gray-500">(required)</span>
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="field-firstname"
                  checked={gateConfig.requiredFields.firstName}
                  onCheckedChange={(checked) =>
                    setGateConfig({
                      ...gateConfig,
                      requiredFields: {
                        ...gateConfig.requiredFields,
                        firstName: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="field-firstname" className="text-sm text-gray-700 flex-1">
                  First name
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="field-lastname"
                  checked={gateConfig.requiredFields.lastName}
                  onCheckedChange={(checked) =>
                    setGateConfig({
                      ...gateConfig,
                      requiredFields: {
                        ...gateConfig.requiredFields,
                        lastName: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="field-lastname" className="text-sm text-gray-700 flex-1">
                  Last name
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="field-phone"
                  checked={gateConfig.requiredFields.phone}
                  onCheckedChange={(checked) => {
                    const newConfig = {
                      ...gateConfig,
                      requiredFields: {
                        ...gateConfig.requiredFields,
                        phone: checked === true,
                      },
                    };
                    // If phone is disabled, also disable SMS opt-in
                    if (!checked) {
                      newConfig.consent.smsOptIn = false;
                    }
                    setGateConfig(newConfig);
                  }}
                />
                <Label htmlFor="field-phone" className="text-sm text-gray-700 flex-1">
                  Phone
                </Label>
              </div>
            </div>
          </div>

          {/* Consent Options */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Consent Options</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="consent-email"
                  checked={gateConfig.consent.emailOptIn}
                  onCheckedChange={(checked) =>
                    setGateConfig({
                      ...gateConfig,
                      consent: {
                        ...gateConfig.consent,
                        emailOptIn: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="consent-email" className="text-sm text-gray-700 flex-1">
                  Email opt-in
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="consent-sms"
                  checked={gateConfig.consent.smsOptIn}
                  disabled={!gateConfig.requiredFields.phone}
                  onCheckedChange={(checked) =>
                    setGateConfig({
                      ...gateConfig,
                      consent: {
                        ...gateConfig.consent,
                        smsOptIn: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="consent-sms" className="text-sm text-gray-700 flex-1">
                  SMS opt-in
                  {!gateConfig.requiredFields.phone && (
                    <span className="text-gray-500 ml-1">(requires phone field)</span>
                  )}
                </Label>
              </div>
            </div>
          </div>

          {/* Copy Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate-Facing Copy</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gate-headline" className="text-sm font-medium text-gray-700 mb-1 block">
                  Headline
                </Label>
                <Input
                  id="gate-headline"
                  value={gateConfig.copy.headline}
                  onChange={(e) =>
                    setGateConfig({
                      ...gateConfig,
                      copy: {
                        ...gateConfig.copy,
                        headline: e.target.value,
                      },
                    })
                  }
                  placeholder="Before we start"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="gate-helper" className="text-sm font-medium text-gray-700 mb-1 block">
                  Helper Text
                </Label>
                <textarea
                  id="gate-helper"
                  value={gateConfig.copy.helperText}
                  onChange={(e) =>
                    setGateConfig({
                      ...gateConfig,
                      copy: {
                        ...gateConfig.copy,
                        helperText: e.target.value,
                      },
                    })
                  }
                  placeholder="Share a few details so we can send program information if you'd like."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {selectedVoiceTone && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-3 w-3" />
                  Styled by selected voice and tone: {selectedVoiceTone.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview</h3>
            <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">{gateConfig.copy.headline || 'Before we start'}</h4>
              <p className="text-sm text-gray-600">{gateConfig.copy.helperText || 'Share a few details...'}</p>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input type="email" placeholder="your@email.com" disabled className="bg-gray-50" />
                </div>
                {gateConfig.requiredFields.firstName && (
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1 block">
                      First name {gateConfig.requiredFields.firstName && <span className="text-red-500">*</span>}
                    </Label>
                    <Input placeholder="First name" disabled className="bg-gray-50" />
                  </div>
                )}
                {gateConfig.requiredFields.lastName && (
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1 block">
                      Last name {gateConfig.requiredFields.lastName && <span className="text-red-500">*</span>}
                    </Label>
                    <Input placeholder="Last name" disabled className="bg-gray-50" />
                  </div>
                )}
                {gateConfig.requiredFields.phone && (
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1 block">
                      Phone {gateConfig.requiredFields.phone && <span className="text-red-500">*</span>}
                    </Label>
                    <Input type="tel" placeholder="Phone number" disabled className="bg-gray-50" />
                  </div>
                )}
                {(gateConfig.consent.emailOptIn || gateConfig.consent.smsOptIn) && (
                  <div className="space-y-2 pt-2">
                    {gateConfig.consent.emailOptIn && (
                      <div className="flex items-center gap-2">
                        <Checkbox checked={false} disabled />
                        <Label className="text-xs text-gray-700">I agree to receive email updates</Label>
                      </div>
                    )}
                    {gateConfig.consent.smsOptIn && (
                      <div className="flex items-center gap-2">
                        <Checkbox checked={false} disabled />
                        <Label className="text-xs text-gray-700">I agree to receive SMS updates</Label>
                      </div>
                    )}
                  </div>
                )}
                <Button disabled className="w-full mt-4">
                  Continue to Quiz
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Gate Configuration'}
            </Button>
          </div>
        </>
      )}

      {!gateConfig.enabled && (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-4">Gate is disabled. Enable it above to configure lead capture settings.</p>
          <Button onClick={handleSave} disabled={isSaving} variant="outline">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

