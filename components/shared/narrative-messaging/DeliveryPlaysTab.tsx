'use client';

import { useEffect, useState } from 'react';
import { narrativeClient } from '@/lib/narrative';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { DeliveryPlayRecord } from '@/lib/narrative';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const PLAY_CATEGORIES = [
  { value: 'lifecycle_automation', label: 'Lifecycle automation' },
  { value: 'staff_assist', label: 'Staff assist' },
  { value: 'portfolio_recommendation', label: 'Portfolio recommendation' },
];
const TRIGGER_TYPES = [
  { value: 'event', label: 'Event' },
  { value: 'threshold', label: 'Threshold' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'model_signal', label: 'Model signal' },
];
const CADENCE = [
  { value: 'single', label: 'Single' },
  { value: 'sequence', label: 'Sequence' },
  { value: 'recurring', label: 'Recurring' },
];

export function DeliveryPlaysTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const [plays, setPlays] = useState<DeliveryPlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    play_category: 'lifecycle_automation',
    trigger_type: 'event',
    cadence_policy: 'single',
  });

  const load = () => {
    setLoading(true);
    narrativeClient.listDeliveryPlays(narrativeContext).then(setPlays).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [narrativeContext.workspace, narrativeContext.sub_workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await narrativeClient.createDeliveryPlay(narrativeContext, form);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 animate-spin" />
        Loading delivery plays…
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
          Create delivery play
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">New delivery play</h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Play category</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.play_category} onChange={(e) => setForm((p) => ({ ...p, play_category: e.target.value }))}>
                {PLAY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Trigger type</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.trigger_type} onChange={(e) => setForm((p) => ({ ...p, trigger_type: e.target.value }))}>
                {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Cadence</Label>
              <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.cadence_policy} onChange={(e) => setForm((p) => ({ ...p, cadence_policy: e.target.value }))}>
                {CADENCE.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>Create delivery play</Button>
          </div>
        </form>
      )}

      {plays.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No delivery plays yet. Create one to use narratives in the right moments.
        </div>
      ) : (
        <ul className="space-y-3">
          {plays.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card px-4 py-3">
              <div className="font-medium text-sm">{p.play_category.replace(/_/g, ' ')} · {p.trigger_type} · {p.cadence_policy}</div>
              {p.eligibility?.narrativeIds?.length ? (
                <div className="text-xs text-muted-foreground mt-1">Narratives: {p.eligibility.narrativeIds.length}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
