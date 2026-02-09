'use client';

import { useEffect, useState, useCallback } from 'react';
import { narrativeClient } from '@/lib/narrative';
import type { NarrativeMessagingContext } from './NarrativeMessagingClient';
import type { NarrativeAssetRecord, ProofBlockRecord } from '@/lib/narrative';
import type { DomainScope } from '@/lib/narrative';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateNarrativeForm } from './CreateNarrativeForm';

const domainScopeFromWorkspace = (w: string): DomainScope =>
  w === 'student_lifecycle_ai' ? 'student_lifecycle' : 'advancement_giving';

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
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load narratives'))
      .finally(() => setLoading(false));
  }, [narrativeContext.workspace, narrativeContext.sub_workspace]);

  useEffect(() => {
    let cancelled = false;
    load();
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 animate-spin" />
        Loading narratives…
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

  const handleAction = async (action: string, asset: NarrativeAssetRecord) => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this narrative?')) return;
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => { setEditingAsset(null); setShowCreateForm(true); }}>
          <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
          Create narrative
        </Button>
      </div>

      {(showCreateForm || editingAsset) && (
        <CreateNarrativeForm
          narrativeContext={narrativeContext}
          domainScope={domainScope}
          initial={editingAsset ?? undefined}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditingAsset(null);
            load();
          }}
          onCancel={() => { setShowCreateForm(false); setEditingAsset(null); }}
        />
      )}

      {assets.length === 0 && !showCreateForm && !editingAsset ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No narrative assets yet. Create one to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {assets.map((asset) => {
            const linkedProof = proofByNarrativeId[asset.id] ?? [];
            return (
              <li
                key={asset.id}
                className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {asset.outcome} / {asset.moment}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {asset.message_intent} · {asset.voice} · {asset.approval_state}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                      {asset.approval_state}
                    </span>
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
                          <DropdownMenuSubTrigger>Link proof</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(allProofBlocks.filter((p) => !linkedProof.some((lp) => lp.id === p.id))).length === 0 ? (
                              <DropdownMenuItem disabled>All proof blocks linked or none available</DropdownMenuItem>
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
                            <DropdownMenuSubTrigger>Unlink proof</DropdownMenuSubTrigger>
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
                </div>
                {linkedProof.length > 0 && (
                  <div className="border-t pt-2">
                    <div className="text-xs font-medium text-muted-foreground">Linked proof</div>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {linkedProof.map((p) => (
                        <li
                          key={p.id}
                          className="rounded bg-muted/60 px-2 py-1 text-xs"
                          title={p.content.slice(0, 100)}
                        >
                          {p.claim_class} · {p.proof_type} ({p.claim_support_level})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
