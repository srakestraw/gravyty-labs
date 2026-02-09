'use client';

import { useEffect, useState } from 'react';
import { narrativeClient } from '@/lib/narrative';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { ProofBlockRecord } from '@/lib/narrative';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PROOF_TYPES = ['impact', 'stat', 'testimonial', 'policy', 'deadline', 'benefit'];
const CLAIM_SUPPORT = ['verified', 'internally_reported', 'anecdotal'];
const CLAIM_CLASSES = ['financial', 'academic', 'operational', 'testimonial', 'policy', 'impact', 'other'];
const VOICES = ['institutional', 'advisor', 'bursar', 'financial_aid_counselor', 'gift_officer', 'student_ambassador'];

export function ProofBlocksTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const [blocks, setBlocks] = useState<ProofBlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    proof_type: 'impact',
    claim_support_level: 'verified',
    claim_class: 'impact',
    freshness_window: '90d',
    content: '',
    allowed_voice: ['advisor'] as string[],
  });

  const load = () => {
    setLoading(true);
    narrativeClient.listProofBlocks(narrativeContext).then(setBlocks).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [narrativeContext.workspace, narrativeContext.sub_workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    try {
      await narrativeClient.createProofBlock(narrativeContext, {
        ...form,
        freshness_window: form.freshness_window,
      });
      setShowForm(false);
      setForm({ ...form, content: '' });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVoice = (v: string) => {
    setForm((p) => ({
      ...p,
      allowed_voice: p.allowed_voice.includes(v) ? p.allowed_voice.filter((x) => x !== v) : [...p.allowed_voice, v],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 animate-spin" />
        Loading proof blocks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
          Create proof block
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">New proof block</h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Proof type</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.proof_type} onChange={(e) => setForm((p) => ({ ...p, proof_type: e.target.value }))}>
                {PROOF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Claim support level</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.claim_support_level} onChange={(e) => setForm((p) => ({ ...p, claim_support_level: e.target.value }))}>
                {CLAIM_SUPPORT.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Claim class</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.claim_class} onChange={(e) => setForm((p) => ({ ...p, claim_class: e.target.value }))}>
                {CLAIM_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Freshness window</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.freshness_window} onChange={(e) => setForm((p) => ({ ...p, freshness_window: e.target.value }))}>
                <option value="90d">90 days</option>
                <option value="365d">365 days</option>
                <option value="evergreen">Evergreen</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Allowed voices</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {VOICES.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.allowed_voice.includes(v)} onChange={() => toggleVoice(v)} className="rounded border-input" />
                  {v.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Content</Label>
            <textarea className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !form.content.trim()}>
              {submitting ? <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin" /> : 'Create proof block'}
            </Button>
          </div>
        </form>
      )}

      {blocks.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No proof blocks yet. Create one to attach to narratives.
        </div>
      ) : (
        <ul className="space-y-3">
          {blocks.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card px-4 py-3">
              <div className="font-medium text-sm">{p.claim_class} · {p.proof_type} ({p.claim_support_level})</div>
              <div className="text-sm text-muted-foreground mt-1">{p.content.slice(0, 120)}{p.content.length > 120 ? '…' : ''}</div>
              <div className="text-xs text-muted-foreground mt-1">Voices: {p.allowed_voice.join(', ')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
