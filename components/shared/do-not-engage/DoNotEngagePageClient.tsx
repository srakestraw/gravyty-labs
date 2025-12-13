'use client';

import * as React from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_DO_NOT_ENGAGE, type DoNotEngageEntry, type DoNotEngageRoleScope } from '@/lib/do-not-engage/mockDoNotEngage';
import { cn } from '@/lib/utils';

type RoleKey = 'all' | 'admissions' | 'registrar' | 'student_success' | 'career_services' | 'alumni_engagement' | 'advancement';
type ScopeFilter = 'all' | 'global' | 'agent' | 'role';

const ROLE_LABELS: Record<RoleKey, string> = {
  all: 'All',
  admissions: 'Admissions',
  registrar: 'Registrar',
  student_success: 'Student Success',
  career_services: 'Career Services',
  alumni_engagement: 'Alumni Engagement',
  advancement: 'Advancement',
};

export function DoNotEngagePageClient() {
  // Use local state with mock data as initial seed
  const [entries, setEntries] = React.useState<DoNotEngageEntry[]>(MOCK_DO_NOT_ENGAGE);
  const [selectedRole, setSelectedRole] = React.useState<RoleKey>('all');
  const [selectedScope, setSelectedScope] = React.useState<ScopeFilter>('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  // Form state
  const [formPersonId, setFormPersonId] = React.useState('');
  const [formPersonLabel, setFormPersonLabel] = React.useState('');
  const [formReason, setFormReason] = React.useState<DoNotEngageEntry['reason']>('user_opt_out');
  const [formReasonDetail, setFormReasonDetail] = React.useState('');
  const [formScope, setFormScope] = React.useState<'global' | 'agent' | 'role'>('global');
  const [formRoleScope, setFormRoleScope] = React.useState<DoNotEngageRoleScope>('admissions');
  const [formAgentId, setFormAgentId] = React.useState('');
  const [formAgentName, setFormAgentName] = React.useState('');
  const [formChannels, setFormChannels] = React.useState<('email' | 'sms' | 'phone')[]>(['email', 'sms', 'phone']);
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formPersonId.trim()) {
      alert('Person ID is required');
      return;
    }

    if (formScope === 'agent' && !formAgentId.trim()) {
      alert('Agent ID is required for agent-specific entries');
      return;
    }

    if (formScope === 'role' && !formRoleScope) {
      alert('Role is required for role-scoped entries');
      return;
    }

    setSubmitting(true);

    // Create new entry
    const newEntry: DoNotEngageEntry = {
      id: `dne_${Date.now()}`,
      contactId: formPersonId.trim(),
      contactName: formPersonLabel.trim() || `Person ${formPersonId.trim()}`,
      contactRole: 'Unknown', // Could be enhanced with contact lookup
      contactSource: 'Manual',
      scopeType: formScope,
      roleScope: formScope === 'role' ? formRoleScope : undefined,
      agentId: formScope === 'agent' ? formAgentId.trim() : undefined,
      agentName: formScope === 'agent' ? formAgentName.trim() || undefined : undefined,
      channels: formChannels,
      reason: formReason || 'admin_block',
      reasonDetail: formReasonDetail.trim() || undefined,
      addedBy: 'Admin (demo)',
      addedAt: new Date().toISOString(),
    };

    // Add to local state
    setEntries([...entries, newEntry]);

    // Reset form
    setFormPersonId('');
    setFormPersonLabel('');
    setFormReason('user_opt_out');
    setFormReasonDetail('');
    setFormScope('global');
    setFormRoleScope('admissions');
    setFormAgentId('');
    setFormAgentName('');
    setFormChannels(['email', 'sms', 'phone']);
    setShowAddForm(false);
    setSubmitting(false);
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this entry?')) return;

    setDeleting(id);
    // Remove from local state
    setEntries(entries.filter(e => e.id !== id));
    setDeleting(null);
  }

  // Filter entries based on selected filters
  const filteredEntries = React.useMemo(() => {
    let filtered = entries;

    // Filter by scope
    if (selectedScope === 'global') {
      filtered = filtered.filter(e => e.scopeType === 'global');
    } else if (selectedScope === 'agent') {
      filtered = filtered.filter(e => e.scopeType === 'agent');
    } else if (selectedScope === 'role') {
      filtered = filtered.filter(e => e.scopeType === 'role');
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(e => {
        if (e.scopeType === 'role' && e.roleScope === selectedRole) {
          return true;
        }
        // Global entries apply to all roles, so include them
        if (e.scopeType === 'global') {
          return true;
        }
        return false;
      });
    }

    return filtered;
  }, [entries, selectedRole, selectedScope]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-gray-900">Do Not Engage</h1>
        <p className="text-sm text-gray-600">
          Manage people who should not be contacted by AI assistants or agents.
        </p>
      </header>

      {/* Filters */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-medium text-gray-900">Filters</h2>
            <p className="text-xs text-gray-500">
              Filter by role or scope to see who will be excluded from outreach.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Scope filter */}
            <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
              {(['all', 'global', 'role', 'agent'] as ScopeFilter[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setSelectedScope(scope)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                    selectedScope === scope
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {scope === 'all' ? 'All' : scope === 'global' ? 'Global' : scope === 'role' ? 'Role' : 'Agent'}
                </button>
              ))}
            </div>
            {/* Role filter */}
            <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
              {(Object.keys(ROLE_LABELS) as RoleKey[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                    selectedRole === role
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredEntries.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No entries found. Add a person to the do-not-engage list below.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Person</th>
                  <th className="px-3 py-2 text-left">Scope</th>
                  <th className="px-3 py-2 text-left">Role/Agent</th>
                  <th className="px-3 py-2 text-left">Channels</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Source system</th>
                  <th className="px-3 py-2 text-left">Added by</th>
                  <th className="px-3 py-2 text-left">Added at</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{entry.contactName}</div>
                      <div className="text-[10px] text-gray-500">{entry.contactRole}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        entry.scopeType === 'global'
                          ? 'bg-red-50 text-red-700'
                          : entry.scopeType === 'role'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      )}>
                        {entry.scopeType === 'global' && 'Global (all agents)'}
                        {entry.scopeType === 'role' && `Role: ${entry.roleScope?.replace('_', ' ') || 'Unknown'}`}
                        {entry.scopeType === 'agent' && `Agent only${entry.agentName ? ` — ${entry.agentName}` : ''}`}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">
                      {entry.roleScope ? ROLE_LABELS[entry.roleScope as RoleKey] || entry.roleScope : entry.agentName || entry.agentId || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {entry.channels.map((channel) => (
                          <span key={channel} className="text-[10px] text-gray-500 capitalize">
                            {channel}
                          </span>
                        ))}
                        {entry.channels.length === 0 && (
                          <span className="text-[10px] text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">
                      <div>
                        <span className="capitalize">{entry.reason.replace('_', ' ')}</span>
                        {entry.reasonDetail && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            — {entry.reasonDetail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">{entry.contactSource}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">{entry.addedBy}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="text-[11px] text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deleting === entry.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add form */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Add to Do Not Engage</h2>
            <p className="text-xs text-gray-500">
              Add a person who has opted out or who should be excluded from outreach.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Entry'}
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Person ID <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formPersonId}
                onChange={(e) => setFormPersonId(e.target.value)}
                placeholder="person-uuid or email"
                required
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Person Label (optional)
              </label>
              <Input
                type="text"
                value={formPersonLabel}
                onChange={(e) => setFormPersonLabel(e.target.value)}
                placeholder="Display name"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Scope <span className="text-red-600">*</span>
              </label>
              <select
                value={formScope}
                onChange={(e) => setFormScope(e.target.value as 'global' | 'agent' | 'role')}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900"
                required
              >
                <option value="global">Global (all agents)</option>
                <option value="role">Role-specific</option>
                <option value="agent">Agent-specific</option>
              </select>
            </div>
            {formScope === 'role' && (
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  value={formRoleScope}
                  onChange={(e) => setFormRoleScope(e.target.value as DoNotEngageRoleScope)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900"
                  required
                >
                  <option value="admissions">Admissions</option>
                  <option value="registrar">Registrar</option>
                  <option value="student_success">Student Success</option>
                  <option value="career_services">Career Services</option>
                  <option value="alumni_engagement">Alumni Engagement</option>
                  <option value="advancement">Advancement</option>
                </select>
              </div>
            )}
            {formScope === 'agent' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Agent ID <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formAgentId}
                    onChange={(e) => setFormAgentId(e.target.value)}
                    placeholder="agent-transcript-helper"
                    required={formScope === 'agent'}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Agent Name (optional)
                  </label>
                  <Input
                    type="text"
                    value={formAgentName}
                    onChange={(e) => setFormAgentName(e.target.value)}
                    placeholder="Transcript Helper Agent"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}
            {(formScope === 'global' || formScope === 'role') && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Blocked Channels
                </label>
                <div className="flex gap-4">
                  {(['email', 'sms', 'phone'] as const).map((channel) => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormChannels([...formChannels, channel]);
                          } else {
                            setFormChannels(formChannels.filter(c => c !== channel));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <span className="text-[11px] text-gray-700 capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Reason
              </label>
              <select
                value={formReason}
                onChange={(e) => setFormReason(e.target.value as DoNotEngageEntry['reason'])}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900"
              >
                <option value="user_opt_out">User opt-out</option>
                <option value="admin_block">Admin block</option>
                <option value="compliance">Compliance</option>
                <option value="high_risk">High risk</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Reason Detail (optional)
              </label>
              <Input
                type="text"
                value={formReasonDetail}
                onChange={(e) => setFormReasonDetail(e.target.value)}
                placeholder="Additional details about why this person is on the DNE list"
                className="h-8 text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? 'Adding...' : 'Add Entry'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

