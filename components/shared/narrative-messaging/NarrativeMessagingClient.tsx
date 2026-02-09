'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NarrativesTab } from './NarrativesTab';
import { ProofBlocksTab } from './ProofBlocksTab';
import { DeliveryPlaysTab } from './DeliveryPlaysTab';
import { PerformanceTab } from './PerformanceTab';

export interface NarrativeMessagingScope {
  workspaceLabel: string;
  subWorkspaceLabel: string;
  defaultVoice: string;
}

export interface NarrativeMessagingContext {
  workspace: 'student_lifecycle_ai' | 'advancement_giving_intelligence';
  sub_workspace: string;
}

export function NarrativeMessagingClient({
  scope,
  narrativeContext,
}: {
  scope: NarrativeMessagingScope;
  narrativeContext: NarrativeMessagingContext;
}) {
  return (
    <div className="space-y-6">
      {/* Scope cue - same feature, different context */}
      <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <strong>Workspace:</strong> {scope.workspaceLabel}
          </span>
          <span>
            <strong>Sub-workspace:</strong> {scope.subWorkspaceLabel}
          </span>
          <span>
            <strong>Default Voice:</strong> {scope.defaultVoice}
          </span>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-muted-foreground">
        Storytelling content library for personalization. Create reusable narratives and proof that
        AI assembles into compliant, role-appropriate messages for each person and moment.
      </p>
      <p className="text-sm font-medium text-muted-foreground">
        Better outcomes with less manual effort - consistent messaging that learns what works.
      </p>

      <Tabs defaultValue="narratives" className="w-full">
        <TabsList>
          <TabsTrigger value="narratives">Narratives</TabsTrigger>
          <TabsTrigger value="proof-blocks">Proof Blocks</TabsTrigger>
          <TabsTrigger value="delivery-plays">Delivery Plays</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="narratives" className="mt-4">
          <NarrativesTab narrativeContext={narrativeContext} />
        </TabsContent>
        <TabsContent value="proof-blocks" className="mt-4">
          <ProofBlocksTab narrativeContext={narrativeContext} />
        </TabsContent>
        <TabsContent value="delivery-plays" className="mt-4">
          <DeliveryPlaysTab narrativeContext={narrativeContext} />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PerformanceTab narrativeContext={narrativeContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
