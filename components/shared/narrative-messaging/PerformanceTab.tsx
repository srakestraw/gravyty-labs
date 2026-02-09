'use client';

import { useEffect, useState } from 'react';
import { narrativeClient } from '@/lib/narrative';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativePerformanceStats, LearningSignal } from '@/lib/narrative';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export function PerformanceTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const [stats, setStats] = useState<NarrativePerformanceStats[]>([]);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      narrativeClient.getPerformanceStats(narrativeContext),
      narrativeClient.getLearningSignals(narrativeContext),
    ])
      .then(([s, sig]) => {
        setStats(s);
        setSignals(sig);
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
