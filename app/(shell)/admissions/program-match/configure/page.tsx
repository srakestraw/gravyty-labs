'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgramMatchConfigurePage() {
  const [leadCaptureConfig, setLeadCaptureConfig] = useState({
    mode: 'required_pre_quiz' as const,
    fields: {
      email: { required: true, enabled: true },
      first_name: { required: false, enabled: true },
      last_name: { required: false, enabled: true },
      phone: { required: false, enabled: true },
      intended_start_term: { required: false, enabled: false },
      modality_preference: { required: false, enabled: false },
    },
    consent: {
      email_consent: { required: false, enabled: true, label: 'I agree to receive email communications' },
      sms_consent: { required: false, enabled: true, label: 'I agree to receive SMS communications' },
    },
    resume_ttl_hours: 168,
    abandon_window_minutes: 30,
    lead_capture_counts_as_rfi: true,
    send_resume_link_immediately: false,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save configuration via API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Configuration saved!');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configure Program Match
            </h1>
            <p className="text-gray-600">
              Set up lead capture, program profiles, and voice & tone settings
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        <Tabs defaultValue="lead-capture" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lead-capture">Lead Capture</TabsTrigger>
            <TabsTrigger value="programs">Program Library</TabsTrigger>
            <TabsTrigger value="voice-tone">Voice & Tone</TabsTrigger>
          </TabsList>

          <TabsContent value="lead-capture" className="space-y-6">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gate Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Gate Mode</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    Required pre-quiz (contact info must be collected before quiz starts)
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Fields</Label>
                  {Object.entries(leadCaptureConfig.fields).map(([key, field]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={field.enabled}
                          onCheckedChange={(checked) => {
                            setLeadCaptureConfig((prev) => ({
                              ...prev,
                              fields: {
                                ...prev.fields,
                                [key]: { ...field, enabled: checked === true },
                              },
                            }));
                          }}
                        />
                        <Label className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </Label>
                      </div>
                      {field.enabled && (
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) => {
                            setLeadCaptureConfig((prev) => ({
                              ...prev,
                              fields: {
                                ...prev.fields,
                                [key]: { ...field, required: checked === true },
                              },
                            }));
                          }}
                        />
                      )}
                      {field.enabled && (
                        <span className="text-xs text-gray-500">
                          {field.required ? 'Required' : 'Optional'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Consent</Label>
                  {Object.entries(leadCaptureConfig.consent).map(([key, consent]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={consent.enabled}
                          onCheckedChange={(checked) => {
                            setLeadCaptureConfig((prev) => ({
                              ...prev,
                              consent: {
                                ...prev.consent,
                                [key]: { ...consent, enabled: checked === true },
                              },
                            }));
                          }}
                        />
                        <Label className="font-medium">
                          {key.replace(/_/g, ' ').replace('consent', 'Consent')}
                        </Label>
                      </div>
                      {consent.enabled && (
                        <>
                          <Input
                            value={consent.label}
                            onChange={(e) => {
                              setLeadCaptureConfig((prev) => ({
                                ...prev,
                                consent: {
                                  ...prev.consent,
                                  [key]: { ...consent, label: e.target.value },
                                },
                              }));
                            }}
                            placeholder="Consent label text"
                            className="ml-7"
                          />
                          <div className="flex items-center gap-2 ml-7">
                            <Checkbox
                              checked={consent.required}
                              onCheckedChange={(checked) => {
                                setLeadCaptureConfig((prev) => ({
                                  ...prev,
                                  consent: {
                                    ...prev.consent,
                                    [key]: { ...consent, required: checked === true },
                                  },
                                }));
                              }}
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="resume_ttl">Resume Link TTL (hours)</Label>
                    <Input
                      id="resume_ttl"
                      type="number"
                      value={leadCaptureConfig.resume_ttl_hours}
                      onChange={(e) => {
                        setLeadCaptureConfig((prev) => ({
                          ...prev,
                          resume_ttl_hours: parseInt(e.target.value) || 168,
                        }));
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="abandon_window">Abandon Window (minutes)</Label>
                    <Input
                      id="abandon_window"
                      type="number"
                      value={leadCaptureConfig.abandon_window_minutes}
                      onChange={(e) => {
                        setLeadCaptureConfig((prev) => ({
                          ...prev,
                          abandon_window_minutes: parseInt(e.target.value) || 30,
                        }));
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={leadCaptureConfig.lead_capture_counts_as_rfi}
                      onCheckedChange={(checked) => {
                        setLeadCaptureConfig((prev) => ({
                          ...prev,
                          lead_capture_counts_as_rfi: checked === true,
                        }));
                      }}
                    />
                    <Label>Lead capture counts as RFI (default: true)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={leadCaptureConfig.send_resume_link_immediately}
                      onCheckedChange={(checked) => {
                        setLeadCaptureConfig((prev) => ({
                          ...prev,
                          send_resume_link_immediately: checked === true,
                        }));
                      }}
                    />
                    <Label>Send resume link immediately on gate submit (off by default)</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Program Library</h2>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>
              <p className="text-gray-600">
                Manage program metadata, ICP trait weights, and skill weights. Programs can be configured in the Quiz Builder.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="voice-tone" className="space-y-6">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice & Tone</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voiceToneProfile">Voice & Tone Profile</Label>
                  <Input
                    id="voiceToneProfile"
                    defaultValue="voice_tone_default"
                    className="mt-1"
                    placeholder="Select or create voice profile"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Select the voice profile to use for all candidate-facing copy
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-4 w-4 mr-2" />
                    Voice & Tone profiles can be managed in{' '}
                    <a href="/ai-assistants/voice-and-tone" className="underline">
                      AI Assistants → Voice & Tone
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
