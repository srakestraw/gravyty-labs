'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface DoNotEngageGlobal {
  id: string;
  personId: string;
  emailBlocked: boolean;
  smsBlocked: boolean;
  phoneBlocked: boolean;
  source: string;
  reason: string | null;
}

interface DoNotEngagePanelProps {
  personId: string;
}

export function DoNotEngagePanel({ personId }: DoNotEngagePanelProps) {
  const [globalDne, setGlobalDne] = useState<DoNotEngageGlobal | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadGlobalDne();
  }, [personId]);

  async function loadGlobalDne() {
    try {
      const response = await fetch(`/api/dne/global?personId=${personId}`);
      if (response.ok) {
        const data = await response.json();
        setGlobalDne(data);
      }
    } catch (error) {
      console.error('Error loading global DNE:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleChannel(channel: 'email' | 'sms' | 'phone') {
    setUpdating(channel);
    try {
      const channelField = channel === 'email' ? 'emailBlocked' : channel === 'sms' ? 'smsBlocked' : 'phoneBlocked';
      const currentValue = globalDne?.[channelField] ?? false;
      const newValue = !currentValue;

      const response = await fetch('/api/dne/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          [channelField]: newValue,
          source: 'admin',
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setGlobalDne(updated);
      }
    } catch (error) {
      console.error(`Error toggling ${channel} DNE:`, error);
    } finally {
      setUpdating(null);
    }
  }

  const isGloballySuppressed = globalDne && (globalDne.emailBlocked || globalDne.smsBlocked || globalDne.phoneBlocked);

  if (loading) {
    return (
      <section className="rounded-lg border border-gray-100 bg-white p-3">
        <p className="text-[11px] text-gray-600">Loading...</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900">
          Do-not-engage settings
        </h3>
        {isGloballySuppressed && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
            Global do-not-engage
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-600">
        Control whether agents can contact this person.
      </p>

      <div className="space-y-1 text-[11px]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={globalDne?.emailBlocked ?? false}
            onChange={() => toggleChannel('email')}
            disabled={updating === 'email'}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span>Email</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={globalDne?.smsBlocked ?? false}
            onChange={() => toggleChannel('sms')}
            disabled={updating === 'sms'}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span>SMS</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={globalDne?.phoneBlocked ?? false}
            onChange={() => toggleChannel('phone')}
            disabled={updating === 'phone'}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span>Phone / calls</span>
        </label>
      </div>
    </section>
  );
}

