'use client';

/**
 * Create Message (guided form). Maps to NarrativeAsset + ProofBlock links.
 * When used chips -> moment + message_intent: see messageUXMapping.ts.
 * Use mode -> play_category (if creating implicit Delivery Play): suggest_to_staff=staff_assist, auto_send=lifecycle_automation, manual_only=portfolio_recommendation.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { narrativeClient } from '@/lib/narrative/client';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativeAssetInput, NarrativeAssetRecord, ProofBlockRecord, DomainScope } from '@/lib/narrative/client';
import {
  WHEN_USED_CHIPS,
  USE_MODES,
  WHY_NOW_SIGNALS,
  CHANNEL_OPTIONS,
  getWhenUsedFromMomentAndIntent,
  type WhenUsedId,
  type UseModeValue,
} from './messageUXMapping';

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

export function CreateMessageForm({
  narrativeContext,
  domainScope,
  initial,
  allProofBlocks,
  proofByNarrativeId,
  onSuccess,
  onCancel,
  initialWhenUsedId,
}: {
  narrativeContext: NarrativeMessagingContext;
  domainScope: DomainScope;
  initial?: NarrativeAssetRecord;
  allProofBlocks: ProofBlockRecord[];
  proofByNarrativeId: ProofBlockRecord[];
  onSuccess: () => void;
  onCancel: () => void;
  /** Optional: pre-fill When used from starter example (e.g. re_engagement, thank you). */
  initialWhenUsedId?: WhenUsedId;
}) {
  const isEdit = !!initial;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.outcome ?? '');
  const [body, setBody] = useState(initial?.contentRef ?? '');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  const [whenUsedId, setWhenUsedId] = useState<WhenUsedId>(
    initial ? getWhenUsedFromMomentAndIntent(initial.moment, initial.message_intent) : (initialWhenUsedId ?? 'general')
  );
  const [whyNow, setWhyNow] = useState<string[]>([]);

  const [linkedProofIds, setLinkedProofIds] = useState<string[]>(
    proofByNarrativeId.map((p) => p.id)
  );
  const [newSupportingDetail, setNewSupportingDetail] = useState('');

  const [useMode, setUseMode] = useState<UseModeValue>('suggest_to_staff');
  const [channelFit, setChannelFit] = useState<string[]>(initial?.channel_fit ?? ['email']);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [complianceRiskLevel, setComplianceRiskLevel] = useState(initial?.compliance_risk_level ?? 'low');
  const [piiTier, setPiiTier] = useState(initial?.pii_tier ?? 'standard');
  const [voice, setVoice] = useState(initial?.voice ?? 'gift_officer');

  const [previewMode, setPreviewMode] = useState<'email' | 'sms' | 'portal_content' | 'call_script'>('email');

  const chip = WHEN_USED_CHIPS.find((c) => c.id === whenUsedId);
  const moment = chip?.moment ?? 'default';
  const message_intent = chip?.message_intent ?? 'nudge';

  const toggleChannel = (ch: string) => {
    setChannelFit((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const toggleWhyNow = (id: string) => {
    setWhyNow((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleLinkedProof = (id: string) => {
    setLinkedProofIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSupportingDetail = async () => {
    if (!newSupportingDetail.trim()) return;
    setSubmitting(true);
    try {
      const proof = await narrativeClient.createProofBlock(narrativeContext, {
        proof_type: 'impact',
        claim_support_level: 'internally_reported',
        claim_class: 'impact',
        freshness_window: 'evergreen',
        allowed_voice: [voice],
        content: newSupportingDetail.trim(),
      });
      setLinkedProofIds((prev) => [...prev, proof.id]);
      setNewSupportingDetail('');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add supporting detail');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    const ctaPart = ctaLabel ? ('CTA: ' + ctaLabel + (ctaUrl ? ' ' + ctaUrl : '')) : '';
    const contentRef = [body, ctaPart].filter(Boolean).join('\n') || undefined;

    const form: NarrativeAssetInput = {
      domain_scope: domainScope,
      sub_domain_scope: narrativeContext.sub_workspace,
      outcome: title.trim(),
      moment,
      message_intent,
      channel_fit: channelFit.length ? channelFit : ['email'],
      voice,
      compliance_risk_level: complianceRiskLevel as NarrativeAssetInput['compliance_risk_level'],
      pii_tier: piiTier as NarrativeAssetInput['pii_tier'],
      contentRef,
    };

    try {
      if (isEdit) {
        await narrativeClient.updateNarrativeAsset(narrativeContext, initial!.id, form);
      } else {
        const created = await narrativeClient.createNarrativeAsset(narrativeContext, form);
        for (const proofId of linkedProofIds) {
          try {
            await narrativeClient.linkProofToNarrative(narrativeContext, created.id, proofId);
          } catch {
            // link may fail if voice not in allowed_voice
          }
        }
      }
      if (isEdit && initial) {
        const toLink = linkedProofIds.filter((id) => !proofByNarrativeId.some((p) => p.id === id));
        const toUnlink = proofByNarrativeId.filter((p) => !linkedProofIds.includes(p.id)).map((p) => p.id);
        for (const id of toLink) {
          try {
            await narrativeClient.linkProofToNarrative(narrativeContext, initial.id, id);
          } catch {}
        }
        for (const id of toUnlink) {
          try {
            await narrativeClient.unlinkProofFromNarrative(narrativeContext, initial.id, id);
          } catch {}
        }
      }
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : isEdit ? 'Failed to update message' : 'Failed to create message'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewBody = body || 'Your message body will appear here. Use placeholders like {{FirstName}}, {{ClassYear}} for personalization.';
  const previewCta = ctaLabel.trim() || 'Primary action';

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        {/* 1) Message */}
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Message</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Thank you after gift"
                required
              />
            </div>
            <div>
              <Label htmlFor="body">Content</Label>
              <textarea
                id="body"
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[120px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message. You can add links, and use placeholders like {{FirstName}}."
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="ctaLabel">Primary CTA (label)</Label>
                <Input
                  id="ctaLabel"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="e.g. Schedule a call"
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl">Primary CTA (URL)</Label>
                <Input
                  id="ctaUrl"
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2) When to use (Context) */}
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">When to use</h3>
          <div className="space-y-3">
            <Label>When used</Label>
            <div className="flex flex-wrap gap-2">
              {WHEN_USED_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setWhenUsedId(c.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    whenUsedId === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div>
              <Label className="mt-2 block">Why now (optional)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {WHY_NOW_SIGNALS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={whyNow.includes(s.id)}
                      onChange={() => toggleWhyNow(s.id)}
                      className="rounded border-input"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3) Strengthen it (Supporting details) */}
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Strengthen it</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSupportingDetail}
                onChange={(e) => setNewSupportingDetail(e.target.value)}
                placeholder="Add a stat, example, quote, or short story…"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSupportingDetail}
                disabled={!newSupportingDetail.trim() || submitting}
              >
                Add
              </Button>
            </div>
            <div>
              <Label className="text-muted-foreground">Attach existing supporting details</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {allProofBlocks.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm',
                      linkedProofIds.includes(p.id) ? 'border-primary bg-primary/10' : 'border-input'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={linkedProofIds.includes(p.id)}
                      onChange={() => toggleLinkedProof(p.id)}
                      className="rounded border-input"
                    />
                    {p.claim_class} · {p.proof_type}
                  </label>
                ))}
                {allProofBlocks.length === 0 && (
                  <span className="text-sm text-muted-foreground">None yet. Add one above or create in Supporting Details tab.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4) How AI should use it (Constraints) */}
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">How AI should use it</h3>
          <div className="space-y-4">
            <div>
              <Label>Use mode</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {USE_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setUseMode(m.value)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm',
                      useMode === m.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Allowed channels</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={channelFit.includes(c.value)}
                      onChange={() => toggleChannel(c.value)}
                      className="rounded border-input"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="requiresApproval">Requires approval before use</Label>
            </div>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon="fa-solid fa-chevron-down" className="h-3 w-3" />
                  Advanced
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Voice</Label>
                    <select
                      className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
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
                      value={complianceRiskLevel}
                      onChange={(e) => setComplianceRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
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
                      value={piiTier}
                      onChange={(e) => setPiiTier(e.target.value as 'none' | 'standard' | 'sensitive')}
                    >
                      {PII_TIERS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin" />
                {isEdit ? 'Saving…' : 'Creating…'}
              </>
            ) : (
              isEdit ? 'Save changes' : 'Create message'
            )}
          </Button>
        </div>
      </form>

      {/* Right rail: Live Preview + AI Notes */}
      <aside className="w-full shrink-0 lg:w-80">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-2 font-medium">Live Preview</h4>
            <div className="mb-2 flex flex-wrap gap-1">
              {(['email', 'sms', 'portal_content', 'call_script'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreviewMode(m)}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    previewMode === m ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  {m === 'portal_content' ? 'Portal' : m === 'call_script' ? 'Call script' : m.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="rounded border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {previewMode === 'email' && (
                <>
                  <div className="font-medium">{title || 'Message title'}</div>
                  <div className="mt-2 text-muted-foreground">
                    {previewBody.replace(/\{\{(\w+)\}\}/g, '[$1]')}
                  </div>
                  <div className="mt-2">
                    <span className="rounded bg-primary/20 px-2 py-1 text-xs">{previewCta}</span>
                  </div>
                </>
              )}
              {previewMode === 'sms' && (
                <span className="text-muted-foreground">
                  {previewBody.slice(0, 160).replace(/\{\{(\w+)\}\}/g, '[$1]')}
                  {previewBody.length > 160 ? '…' : ''}
                </span>
              )}
              {previewMode === 'portal_content' && (
                <>
                  <div className="font-medium">{title || 'Message title'}</div>
                  <div className="mt-1 text-muted-foreground">
                    {previewBody.slice(0, 200).replace(/\{\{(\w+)\}\}/g, '[$1]')}
                    {previewBody.length > 200 ? '…' : ''}
                  </div>
                  <span className="mt-2 inline-block text-xs text-primary">{previewCta}</span>
                </>
              )}
              {previewMode === 'call_script' && (
                <>
                  <div className="text-muted-foreground">OPENING / BODY:</div>
                  <div className="mt-1">{previewBody.slice(0, 150).replace(/\{\{(\w+)\}\}/g, '[$1]')}…</div>
                  <div className="mt-2 text-muted-foreground">CTA: {previewCta}</div>
                </>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-2 font-medium">AI Notes</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">When:</span> AI will use this when: {chip?.label ?? 'General'}.
                {whyNow.length > 0 && ' Signals: ' + whyNow.map((id) => WHY_NOW_SIGNALS.find((s) => s.id === id)?.label).join(', ') + '.'}
              </li>
              <li>
                <span className="font-medium text-foreground">Channels:</span> {channelFit.map((c) => CHANNEL_OPTIONS.find((x) => x.value === c)?.label ?? c).join(', ') || 'None'}
              </li>
              <li>
                <span className="font-medium text-foreground">Approval:</span> {requiresApproval ? 'Required before use' : 'Not required'}
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
