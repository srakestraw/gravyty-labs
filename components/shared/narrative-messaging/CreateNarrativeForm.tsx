'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { narrativeClient } from '@/lib/narrative/client';
import { getOutcomes, getMoments, type DomainScope } from '@/lib/narrative/taxonomy';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativeAssetInput, NarrativeAssetRecord } from '@/lib/narrative/client';

const MESSAGE_INTENTS = [
  { value: 'nudge', label: 'Nudge' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'explain', label: 'Explain' },
  { value: 'resolve', label: 'Resolve' },
  { value: 'ask', label: 'Ask' },
  { value: 'thank', label: 'Thank' },
  { value: 'update', label: 'Update' },
  { value: 'confirm', label: 'Confirm' },
];

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'in_app', label: 'In-app' },
  { value: 'chat', label: 'Chat' },
  { value: 'call_script', label: 'Call script' },
  { value: 'portal_content', label: 'Portal content' },
];

const VOICES = [
  { value: 'institutional', label: 'Institutional' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'bursar', label: 'Bursar' },
  { value: 'financial_aid_counselor', label: 'Financial Aid Counselor' },
  { value: 'gift_officer', label: 'Gift Officer' },
  { value: 'student_ambassador', label: 'Student Ambassador' },
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PII_TIERS = [
  { value: 'none', label: 'None' },
  { value: 'standard', label: 'Standard' },
  { value: 'sensitive', label: 'Sensitive' },
];

export function CreateNarrativeForm({
  narrativeContext,
  domainScope,
  initial,
  onSuccess,
  onCancel,
}: {
  narrativeContext: NarrativeMessagingContext;
  domainScope: DomainScope;
  initial?: NarrativeAssetRecord;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const outcomes = getOutcomes(domainScope);
  const moments = getMoments(domainScope);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NarrativeAssetInput>(initial
    ? {
        domain_scope: initial.domain_scope as NarrativeAssetInput['domain_scope'],
        sub_domain_scope: initial.sub_domain_scope,
        outcome: initial.outcome,
        moment: initial.moment,
        message_intent: initial.message_intent,
        channel_fit: initial.channel_fit,
        voice: initial.voice,
        compliance_risk_level: initial.compliance_risk_level,
        pii_tier: initial.pii_tier,
        relationship_type: initial.relationship_type,
        contentRef: initial.contentRef,
      }
    : {
        domain_scope: domainScope,
        sub_domain_scope: narrativeContext.sub_workspace,
        outcome: outcomes[0]?.value ?? 'general',
        moment: moments[0]?.value ?? 'default',
        message_intent: 'nudge',
        channel_fit: ['email'],
        voice: 'advisor',
        compliance_risk_level: 'low',
        pii_tier: 'standard',
      });

  const toggleChannel = (ch: string) => {
    setForm((prev) => ({
      ...prev,
      channel_fit: prev.channel_fit.includes(ch)
        ? prev.channel_fit.filter((c) => c !== ch)
        : [...prev.channel_fit, ch],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await narrativeClient.updateNarrativeAsset(narrativeContext, initial!.id, form);
      } else {
        await narrativeClient.createNarrativeAsset(narrativeContext, form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? 'Failed to update narrative' : 'Failed to create narrative');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{isEdit ? 'Edit narrative' : 'Create narrative'}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Outcome</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.outcome}
            onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value }))}
          >
            {outcomes.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Moment</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.moment}
            onChange={(e) => setForm((p) => ({ ...p, moment: e.target.value }))}
          >
            {moments.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Message intent</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.message_intent}
            onChange={(e) => setForm((p) => ({ ...p, message_intent: e.target.value }))}
          >
            {MESSAGE_INTENTS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Voice</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.voice}
            onChange={(e) => setForm((p) => ({ ...p, voice: e.target.value }))}
          >
            {VOICES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Compliance risk</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.compliance_risk_level}
            onChange={(e) => setForm((p) => ({ ...p, compliance_risk_level: e.target.value as NarrativeAssetInput['compliance_risk_level'] }))}
          >
            {RISK_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>PII tier</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.pii_tier}
            onChange={(e) => setForm((p) => ({ ...p, pii_tier: e.target.value as NarrativeAssetInput['pii_tier'] }))}
          >
            {PII_TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Channel fit</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHANNELS.map((ch) => (
            <label key={ch.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.channel_fit.includes(ch.value)}
                onChange={() => toggleChannel(ch.value)}
                className="rounded border-input"
              />
              {ch.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="contentRef">Content reference (optional)</Label>
        <Input
          id="contentRef"
          className="mt-1"
          value={form.contentRef ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, contentRef: e.target.value || undefined }))}
          placeholder="e.g. content ID or URL"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin" />
              {isEdit ? 'Saving…' : 'Creating…'}
            </>
          ) : (
            isEdit ? 'Save changes' : 'Create narrative'
          )}
        </Button>
      </div>
    </form>
  );
}
