'use client';

import { useEffect, useState } from 'react';
import { narrativeClient } from '@/lib/narrative/client';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativePerformanceStats, LearningSignal } from '@/lib/narrative/client';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PerformanceSummary {
  note: string;
  top_narratives_this_month: { narrative_asset_id: string; title: string; delivered: number }[];
  top_proof_blocks: { proof_block_id: string; title: string; use_count: number }[];
}

export function PerformanceTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const [stats, setStats] = useState<NarrativePerformanceStats[]>([]);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedEnabled, setSeedEnabled] = useState(false);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      narrativeClient.getPerformanceStats(narrativeContext),
      narrativeClient.getLearningSignals(narrativeContext),
      narrativeClient.isNarrativeSeedEnabled(),
      narrativeClient.getPerformanceSummary(),
    ])
      .then(([s, sig, enabled, summary]) => {
        setStats(s);
        setSignals(sig);
        setSeedEnabled(enabled);
        setPerformanceSummary(summary ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [narrativeContext.workspace, narrativeContext.sub_workspace]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 animate-spin" />
        Loading performance…
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
    <div className="space-y-6">
      {seedEnabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          <strong>Sample/demo data.</strong> {performanceSummary?.note ?? 'Metrics are placeholders for display only.'}
        </div>
      )}

      {performanceSummary && (performanceSummary.top_narratives_this_month.length > 0 || performanceSummary.top_proof_blocks.length > 0) && (
        <section className="rounded-lg border bg-muted/30 p-4">
          <h3 className="font-semibold mb-3">Top narratives this month (seed)</h3>
          {performanceSummary.top_narratives_this_month.length > 0 ? (
            <ul className="mb-4 space-y-1 text-sm">
              {performanceSummary.top_narratives_this_month.map((n) => (
                <li key={n.narrative_asset_id}>
                  <span className="font-medium">{n.title}</span>
                  <span className="ml-2 text-muted-foreground">— {n.delivered} delivered</span>
                </li>
              ))}
            </ul>
          ) : null}
          <h3 className="font-semibold mb-3">Top proof blocks (seed)</h3>
          {performanceSummary.top_proof_blocks.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {performanceSummary.top_proof_blocks.map((p) => (
                <li key={p.proof_block_id}>
                  <span className="font-medium">{p.title}</span>
                  <span className="ml-2 text-muted-foreground">— used {p.use_count} time(s)</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      <section>
        <h3 className="font-semibold mb-3">Performance by narrative</h3>
        {stats.length === 0 ? (
          <p className="text-muted-foreground text-sm">No delivery events yet. Record events to see conversion and assist rates.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3 font-medium">Narrative ID</th>
                  <th className="text-right p-3 font-medium">Delivered</th>
                  <th className="text-right p-3 font-medium">Converted</th>
                  <th className="text-right p-3 font-medium">Assist</th>
                  <th className="text-right p-3 font-medium">Conversion rate</th>
                  <th className="text-right p-3 font-medium">Assist rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.narrative_asset_id} className="border-t">
                    <td className="p-3 font-mono text-xs">{s.narrative_asset_id.slice(0, 8)}…</td>
                    <td className="p-3 text-right">{s.delivered}</td>
                    <td className="p-3 text-right">{s.converted}</td>
                    <td className="p-3 text-right">{s.assist}</td>
                    <td className="p-3 text-right">{(s.conversion_rate * 100).toFixed(1)}%</td>
                    <td className="p-3 text-right">{(s.assist_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-3">Learning signals</h3>
        {signals.length === 0 ? (
          <p className="text-muted-foreground text-sm">No narratives with enough data for signals yet.</p>
        ) : (
          <ul className="space-y-2">
            {signals.map((sig) => (
              <li
                key={sig.narrative_asset_id}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  sig.signal_type === 'low_conversion' ? 'border-amber-500/50 bg-amber-50' :
                  sig.signal_type === 'high_volume' ? 'border-blue-500/50 bg-blue-50' :
                  'bg-muted/30'
                }`}
              >
                <span className="font-mono text-xs">{sig.narrative_asset_id.slice(0, 8)}…</span>
                <span className="ml-2 font-medium">{sig.signal_type.replace(/_/g, ' ')}</span>
                {sig.reason && <span className="ml-2 text-muted-foreground">{sig.reason}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
