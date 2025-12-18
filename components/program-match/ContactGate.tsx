'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { LeadCaptureConfig } from '@/lib/program-match/types';
import { trackGateViewed, trackGateSubmitted, trackGateError } from '@/lib/program-match/events';

interface ContactGateProps {
  config: LeadCaptureConfig;
  quizId?: string;
  versionId?: string;
  onSubmit: (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    intended_start_term?: string;
    modality_preference?: string;
    email_consent?: boolean;
    sms_consent?: boolean;
  }) => Promise<{ lead_id: string; resume_token: string; resume_url?: string }>;
  onError?: (error: string) => void;
}

export function ContactGate({ config, quizId, versionId, onSubmit, onError }: ContactGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [intendedStartTerm, setIntendedStartTerm] = useState('');
  const [modalityPreference, setModalityPreference] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track gate viewed
  useEffect(() => {
    trackGateViewed({ quiz_id: quizId, version_id: versionId });
  }, [quizId, versionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (config.fields.email.required && !email) {
      setError('Email is required');
      return;
    }

    if (config.consent.email_consent?.required && !emailConsent) {
      setError('Email consent is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        email,
        first_name: config.fields.first_name?.enabled ? firstName : undefined,
        last_name: config.fields.last_name?.enabled ? lastName : undefined,
        phone: config.fields.phone?.enabled ? phone : undefined,
        intended_start_term: config.fields.intended_start_term?.enabled ? intendedStartTerm : undefined,
        modality_preference: config.fields.modality_preference?.enabled ? modalityPreference : undefined,
        email_consent: config.consent.email_consent?.enabled ? emailConsent : undefined,
        sms_consent: config.consent.sms_consent?.enabled ? smsConsent : undefined,
      });
      
      // Track successful submission
      trackGateSubmitted({
        lead_id: result.lead_id,
        quiz_id: quizId,
        version_id: versionId,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
      setError(errorMessage);
      trackGateError({
        error: errorMessage,
        quiz_id: quizId,
        version_id: versionId,
      });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: Load copy from Voice & Tone profile
  const gateTitle = 'Find Your Program Match';
  const gateSubtitle = 'Get personalized program recommendations in just a few minutes. We\'ll save your progress so you can return anytime.';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {gateTitle}
      </h2>
      <p className="text-gray-600 mb-6">
        {gateSubtitle}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="mt-1"
            placeholder="your.email@example.com"
          />
        </div>

        {config.fields.first_name?.enabled && (
          <div>
            <Label htmlFor="first_name">
              First Name
              {config.fields.first_name.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required={config.fields.first_name.required}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
        )}

        {config.fields.last_name?.enabled && (
          <div>
            <Label htmlFor="last_name">
              Last Name
              {config.fields.last_name.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required={config.fields.last_name.required}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
        )}

        {config.fields.phone?.enabled && (
          <div>
            <Label htmlFor="phone">
              Phone
              {config.fields.phone.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={config.fields.phone.required}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
        )}

        {config.fields.intended_start_term?.enabled && (
          <div>
            <Label htmlFor="intended_start_term">
              Intended Start Term
              {config.fields.intended_start_term.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="intended_start_term"
              type="text"
              value={intendedStartTerm}
              onChange={(e) => setIntendedStartTerm(e.target.value)}
              required={config.fields.intended_start_term.required}
              disabled={isSubmitting}
              className="mt-1"
              placeholder="Fall 2024"
            />
          </div>
        )}

        {config.fields.modality_preference?.enabled && (
          <div>
            <Label htmlFor="modality_preference">
              Modality Preference
              {config.fields.modality_preference.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="modality_preference"
              type="text"
              value={modalityPreference}
              onChange={(e) => setModalityPreference(e.target.value)}
              required={config.fields.modality_preference.required}
              disabled={isSubmitting}
              className="mt-1"
              placeholder="Online, Hybrid, or On-Campus"
            />
          </div>
        )}

        {config.consent.email_consent?.enabled && (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="email_consent"
              checked={emailConsent}
              onCheckedChange={(checked) => setEmailConsent(checked === true)}
              disabled={isSubmitting}
              required={config.consent.email_consent.required}
            />
            <Label htmlFor="email_consent" className="text-sm font-normal cursor-pointer">
              {config.consent.email_consent.label}
              {config.consent.email_consent.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        )}

        {config.consent.sms_consent?.enabled && (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="sms_consent"
              checked={smsConsent}
              onCheckedChange={(checked) => setSmsConsent(checked === true)}
              disabled={isSubmitting}
              required={config.consent.sms_consent.required}
            />
            <Label htmlFor="sms_consent" className="text-sm font-normal cursor-pointer">
              {config.consent.sms_consent.label}
              {config.consent.sms_consent.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Starting...' : 'Start Matching'}
        </Button>
      </form>
    </div>
  );
}

