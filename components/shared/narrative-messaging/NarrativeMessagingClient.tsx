'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NarrativesTab } from './NarrativesTab';
import { ProofBlocksTab } from './ProofBlocksTab';
import { DeliveryPlaysTab } from './DeliveryPlaysTab';
import { PerformanceTab } from './PerformanceTab';
import { PreviewTab } from './PreviewTab';

export interface NarrativeMessagingScope {
  workspaceLabel: string;
  subWorkspaceLabel: string;
  defaultVoice: string;
}

export interface NarrativeMessagingContext {
  workspace: 'student_lifecycle_ai' | 'advancement_giving_intelligence';
  sub_workspace: string;
}

/** When true, hide Usage Rules tab and collapse advanced compliance into accordion (e.g. Content Creator role). */
export interface NarrativeMessagingClientProps {
  scope: NarrativeMessagingScope;
  narrativeContext: NarrativeMessagingContext;
  /** Optional: 'content_creator' hides Usage Rules tab and shows advanced settings in accordion. */
  userRole?: 'content_creator' | 'full';
}

export function NarrativeMessagingClient({
  scope,
  narrativeContext,
  userRole = 'full',
}: NarrativeMessagingClientProps) {
  const hideUsageRules = userRole === 'content_creator';

  return (
    <div className="space-y-6">
      {/* Page title and subtext */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Narrative Messaging</h1>
        <p className="mt-1 text-muted-foreground">
          Write messages once - AI uses them in the right moments.
        </p>
      </div>

      {/* Context: single collapsed bar (workspace, sub-workspace, default voice) */}
      <div className="rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Context:</span>{' '}
        {scope.workspaceLabel} · {scope.subWorkspaceLabel} · Voice: {scope.defaultVoice}
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="supporting-details">Supporting Details</TabsTrigger>
          {!hideUsageRules && (
            <TabsTrigger value="usage-rules">Usage Rules</TabsTrigger>
          )}
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="mt-4">
          <NarrativesTab narrativeContext={narrativeContext} />
        </TabsContent>
        <TabsContent value="supporting-details" className="mt-4">
          <ProofBlocksTab narrativeContext={narrativeContext} />
        </TabsContent>
        {!hideUsageRules && (
          <TabsContent value="usage-rules" className="mt-4">
            <DeliveryPlaysTab narrativeContext={narrativeContext} />
          </TabsContent>
        )}
        <TabsContent value="preview" className="mt-4">
          <PreviewTab narrativeContext={narrativeContext} />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PerformanceTab narrativeContext={narrativeContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
