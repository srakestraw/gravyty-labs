'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { narrativeClient } from '@/lib/narrative/client';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativeAssetRecord, ProofBlockRecord, DomainScope } from '@/lib/narrative/client';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateMessageForm } from './CreateMessageForm';
import { getWhenUsedLabel, WHEN_USED_CHIPS, CHANNEL_OPTIONS, type WhenUsedId } from './messageUXMapping';

const domainScopeFromWorkspace = (w: string): DomainScope =>
  w === 'student_lifecycle_ai' ? 'student_lifecycle' : 'advancement_giving';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STARTER_EXAMPLES: { title: string; whenUsed: string; description: string; whenUsedId: WhenUsedId }[] = [
  { title: 'Re-engagement', whenUsed: 'Re-engagement', description: 'Reach out to someone who has not given recently.', whenUsedId: 're_engagement' },
  { title: 'Thank you', whenUsed: 'Stewardship', description: 'Thank a donor after a gift is received.', whenUsedId: 'stewardship' },
  { title: 'Follow-up', whenUsed: 'Follow-up', description: 'Follow up after an event or conversation.', whenUsedId: 'follow_up' },
  { title: 'Meeting ask', whenUsed: 'Opportunity', description: 'Invite a prospect to a conversation or meeting.', whenUsedId: 'opportunity' },
];

export function NarrativesTab({
  narrativeContext,
}: {
  narrativeContext: NarrativeMessagingContext;
}) {
  const [assets, setAssets] = useState<NarrativeAssetRecord[]>([]);
  const [proofByNarrativeId, setProofByNarrativeId] = useState<Record<string, ProofBlockRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<NarrativeAssetRecord | null>(null);
  const [allProofBlocks, setAllProofBlocks] = useState<ProofBlockRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterWhenUsed, setFilterWhenUsed] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [starterWhenUsedId, setStarterWhenUsedId] = useState<WhenUsedId | undefined>(undefined);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      narrativeClient.listProofBlocks(narrativeContext),
      narrativeClient.listNarrativeAssets(narrativeContext),
    ])
      .then(([blocks, list]) => {
        setAllProofBlocks(blocks);
        setAssets(list);
        return list;
      })
      .then((list) => {
        if (list.length === 0) return;
        return Promise.all(
          list.map((a) =>
            narrativeClient.listProofForNarrative(narrativeContext, a.id).then((proof) => ({ id: a.id, proof }))
          )
        );
      })
      .then((pairs) => {
        if (!pairs) return;
        const map: Record<string, ProofBlockRecord[]> = {};
        pairs.forEach(({ id, proof }) => (map[id] = proof));
        setProofByNarrativeId(map);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [narrativeContext.workspace, narrativeContext.sub_workspace]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredAssets = useMemo(() => {
    let list = assets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.outcome.toLowerCase().includes(q) ||
          a.message_intent.toLowerCase().includes(q) ||
          a.moment.toLowerCase().includes(q) ||
          a.voice.toLowerCase().includes(q)
      );
    }
    if (filterWhenUsed) {
      const chip = WHEN_USED_CHIPS.find((c) => c.label === filterWhenUsed);
      if (chip) {
        list = list.filter((a) => a.moment === chip.moment && a.message_intent === chip.message_intent);
      }
    }
    if (filterChannel) {
      list = list.filter((a) => a.channel_fit.includes(filterChannel));
    }
    if (filterStatus) {
      list = list.filter((a) => a.approval_state === filterStatus);
    }
    return list;
  }, [assets, search, filterWhenUsed, filterChannel, filterStatus]);

  const handleAction = async (action: string, asset: NarrativeAssetRecord) => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this message?')) return;
        await narrativeClient.deleteNarrativeAsset(narrativeContext, asset.id);
      } else if (action === 'submit') {
        await narrativeClient.submitForReview(narrativeContext, asset.id);
      } else if (action === 'approve') {
        await narrativeClient.approve(narrativeContext, asset.id);
      } else if (action === 'reject') {
        await narrativeClient.reject(narrativeContext, asset.id);
      }
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const domainScope = domainScopeFromWorkspace(narrativeContext.workspace);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 animate-spin" />
        Loading messages…
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={() => { setEditingAsset(null); setShowCreateForm(true); }}>
          <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
          Create message
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48"
          />
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            value={filterWhenUsed}
            onChange={(e) => setFilterWhenUsed(e.target.value)}
          >
            <option value="">When used</option>
            {WHEN_USED_CHIPS.map((c) => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
          >
            <option value="">Channel</option>
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(showCreateForm || editingAsset) && (
        <CreateMessageForm
          narrativeContext={narrativeContext}
          domainScope={domainScope}
          initial={editingAsset ?? undefined}
          allProofBlocks={allProofBlocks}
          proofByNarrativeId={editingAsset ? (proofByNarrativeId[editingAsset.id] ?? []) : []}
          initialWhenUsedId={starterWhenUsedId}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditingAsset(null);
            setStarterWhenUsedId(undefined);
            load();
          }}
          onCancel={() => { setShowCreateForm(false); setEditingAsset(null); setStarterWhenUsedId(undefined); }}
        />
      )}

      {assets.length === 0 && !showCreateForm && !editingAsset ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">
            No messages yet. Create your first message and AI will recommend when to use it.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STARTER_EXAMPLES.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => { setStarterWhenUsedId(s.whenUsedId); setShowCreateForm(true); }}
                className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{s.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">({s.whenUsed})</span>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredAssets.map((asset) => {
            const linkedProof = proofByNarrativeId[asset.id] ?? [];
            const whenUsedLabel = getWhenUsedLabel(asset.moment, asset.message_intent);
            return (
              <li
                key={asset.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{asset.outcome}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-0.5">{whenUsedLabel}</span>
                    {asset.channel_fit.slice(0, 3).map((ch) => (
                      <span key={ch} className="rounded-md bg-muted px-2 py-0.5">
                        {CHANNEL_OPTIONS.find((c) => c.value === ch)?.label ?? ch}
                      </span>
                    ))}
                    {asset.channel_fit.length > 3 && (
                      <span className="text-xs">+{asset.channel_fit.length - 3}</span>
                    )}
                    <span>{asset.voice.replace(/_/g, ' ')}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        asset.approval_state === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : asset.approval_state === 'in_review'
                            ? 'bg-amber-100 text-amber-800'
                            : asset.approval_state === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {asset.approval_state.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowCreateForm(false); setEditingAsset(asset); }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowCreateForm(false); setEditingAsset(asset); }}
                  >
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {asset.approval_state === 'draft' && (
                        <>
                          <DropdownMenuItem onClick={() => { setShowCreateForm(false); setEditingAsset(asset); }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('submit', asset)}>
                            Submit for review
                          </DropdownMenuItem>
                        </>
                      )}
                      {asset.approval_state === 'in_review' && (
                        <>
                          <DropdownMenuItem onClick={() => handleAction('approve', asset)}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('reject', asset)}>
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Link supporting detail</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {(allProofBlocks.filter((p) => !linkedProof.some((lp) => lp.id === p.id))).length === 0 ? (
                            <DropdownMenuItem disabled>All linked or none available</DropdownMenuItem>
                          ) : (
                            allProofBlocks
                              .filter((p) => !linkedProof.some((lp) => lp.id === p.id))
                              .map((p) => (
                                <DropdownMenuItem
                                  key={p.id}
                                  onClick={async () => {
                                    try {
                                      await narrativeClient.linkProofToNarrative(narrativeContext, asset.id, p.id);
                                      load();
                                    } catch (e) {
                                      alert(e instanceof Error ? e.message : 'Link failed');
                                    }
                                  }}
                                >
                                  {p.claim_class} · {p.proof_type}
                                </DropdownMenuItem>
                              ))
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      {linkedProof.length > 0 && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Unlink supporting detail</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {linkedProof.map((p) => (
                              <DropdownMenuItem
                                key={p.id}
                                onClick={async () => {
                                  try {
                                    await narrativeClient.unlinkProofFromNarrative(narrativeContext, asset.id, p.id);
                                    load();
                                  } catch (e) {
                                    alert(e instanceof Error ? e.message : 'Unlink failed');
                                  }
                                }}
                              >
                                {p.claim_class} · {p.proof_type}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleAction('delete', asset)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {assets.length > 0 && filteredAssets.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No messages match the filters.</p>
      )}
    </div>
  );
}
