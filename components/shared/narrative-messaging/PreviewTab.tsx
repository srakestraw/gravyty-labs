'use client';

import { useState, useEffect } from 'react';
import { narrativeClient } from '@/lib/narrative/client';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativeAssetRecord, ComposeResult, DomainScope } from '@/lib/narrative/client';
import { getOutcomes, getMoments } from '@/lib/narrative/taxonomy';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'in_app', label: 'In-app' },
];

const domainScopeFromWorkspace = (w: string): DomainScope =>
  w === 'student_lifecycle_ai' ? 'student_lifecycle' : 'advancement_giving';

interface PreviewScenario {
  id: string;
  persona: string;
  context: string;
  channel: string;
  assembled_message: string;
  why_chosen: string[];
}

export function PreviewTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const domainScope = domainScopeFromWorkspace(narrativeContext.workspace);
  const outcomes = getOutcomes(domainScope);
  const moments = getMoments(domainScope);
  const [outcome, setOutcome] = useState(outcomes[0]?.value ?? 'general');
  const [moment, setMoment] = useState(moments[0]?.value ?? 'default');
  const [channel, setChannel] = useState('email');
  const [voice, setVoice] = useState('advisor');
  const [candidates, setCandidates] = useState<NarrativeAssetRecord[]>([]);
  const [selected, setSelected] = useState<NarrativeAssetRecord | null>(null);
  const [composed, setComposed] = useState<ComposeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleScenarios, setSampleScenarios] = useState<PreviewScenario[] | null>(null);

  useEffect(() => {
    narrativeClient.getPreviewScenarios().then(setSampleScenarios);
  }, []);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setComposed(null);
    setSelected(null);
    try {
      const result = await narrativeClient.recommend(narrativeContext, {
        channel,
        voice,
        entity_context_input: { outcome, moment },
        limit: 8,
      });
      setCandidates(result.narrative_assets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get recommendations');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (asset: NarrativeAssetRecord) => {
    setSelected(asset);
    setLoading(true);
    setError(null);
    try {
      const result = await narrativeClient.compose(narrativeContext, {
        narrative_asset_id: asset.id,
        voice: asset.voice,
        channel,
      });
      setComposed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compose');
      setComposed(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDelivered = async () => {
    if (!composed) return;
    try {
      await narrativeClient.recordEvent(narrativeContext, {
        play_id: 'preview_test',
        event_type: 'narrative_delivered',
        narrative_asset_id: composed.narrative_asset_id,
        channel,
        outcome,
        moment,
        timestamp: new Date().toISOString(),
      });
      alert('Recorded as delivered (for testing).');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to record event');
    }
  };

  return (
    <div className="space-y-6">
      {sampleScenarios && sampleScenarios.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <h3 className="mb-3 font-semibold">Sample previews (UNC seed)</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Pre-built examples: persona + context, assembled message, and why this narrative was chosen.
          </p>
          <div className="space-y-4">
            {sampleScenarios.map((s) => (
              <div key={s.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex flex-wrap gap-2 text-sm">
                  <span className="font-medium">{s.persona}</span>
                  <span className="rounded bg-muted px-2 py-0.5">{s.channel}</span>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">{s.context}</p>
                <div className="mb-2 rounded border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{s.assembled_message}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Why this was chosen:</span> {s.why_chosen.join('; ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-muted/40 p-4">
        <h3 className="mb-3 font-semibold">Preview context</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Outcome</Label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              {outcomes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Moment</Label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
            >
              {moments.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Channel</Label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Voice</Label>
            <input
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="advisor"
            />
          </div>
        </div>
        <Button className="mt-3" onClick={handleGetRecommendations} disabled={loading}>
          {loading ? (
            <>
              <FontAwesomeIcon icon="fa-solid fa-spinner" className="mr-2 animate-spin" />
              Loading…
            </>
          ) : (
            <>
              <FontAwesomeIcon icon="fa-solid fa-wand-magic-sparkles" className="mr-2" />
              Get recommendations
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {candidates.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Recommended narratives</h3>
          <div className="space-y-2">
            {candidates.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <span className="text-sm">
                  {a.outcome} / {a.moment} – {a.message_intent}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(a)}
                  disabled={loading}
                >
                  Preview
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {composed && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Composed preview</h3>
          <p className="mb-2 text-sm text-muted-foreground">
            Voice: {composed.voice} · Narrative: {selected?.outcome} / {selected?.moment}
          </p>
          <div className="mb-4 whitespace-pre-wrap rounded border bg-muted/30 p-3 text-sm">
            {composed.body}
          </div>
          {composed.proof_used.length > 0 && (
            <p className="mb-2 text-xs text-muted-foreground">
              Proof used: {composed.proof_used.length} block(s)
            </p>
          )}
          <Button size="sm" variant="secondary" onClick={handleRecordDelivered}>
            <FontAwesomeIcon icon="fa-solid fa-floppy-disk" className="mr-2" />
            Record as delivered (test)
          </Button>
        </div>
      )}
    </div>
  );
}
