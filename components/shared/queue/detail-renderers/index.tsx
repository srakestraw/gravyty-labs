/**
 * Detail Renderer Registration
 *
 * This file imports and registers all detail renderers.
 * Importing this file ensures all renderers are registered with the registry.
 */

import React from 'react';
import { registerQueueDetailRenderer } from './registry';
import { DefaultQueueDetail } from './DefaultQueueDetail';
import { AdvancementFirstDraftDetail } from './AdvancementFirstDraftDetail';
import { AgentDraftMessageDetail } from './AgentDraftMessageDetail';
import { AgentApprovalRequiredDetail } from './AgentApprovalRequiredDetail';
import { AgentBlockedActionDetail } from './AgentBlockedActionDetail';
import { AgentFlowExceptionDetail } from './AgentFlowExceptionDetail';

// Register default renderer
registerQueueDetailRenderer('default', (props) => (
  <DefaultQueueDetail
    item={props.item}
    onAction={props.onAction}
    onNavigateToPerson={props.onNavigateToPerson}
    onNavigateToAgent={props.onNavigateToAgent}
  />
));

// Register Advancement First Draft renderer
registerQueueDetailRenderer('advancement-first-draft', (props) => (
  <AdvancementFirstDraftDetail
    item={props.item}
    onAction={props.onAction}
    onNavigateToPerson={props.onNavigateToPerson}
  />
));

// Register agent-generated queue item renderers
registerQueueDetailRenderer('agent-draft-message', (props) => (
  <AgentDraftMessageDetail item={props.item} onAction={props.onAction} onNavigateToPerson={props.onNavigateToPerson} />
));
registerQueueDetailRenderer('agent-approval-required', (props) => (
  <AgentApprovalRequiredDetail item={props.item} onAction={props.onAction} onNavigateToPerson={props.onNavigateToPerson} />
));
registerQueueDetailRenderer('agent-blocked-action', (props) => (
  <AgentBlockedActionDetail item={props.item} onAction={props.onAction} onNavigateToPerson={props.onNavigateToPerson} />
));
registerQueueDetailRenderer('agent-flow-exception', (props) => (
  <AgentFlowExceptionDetail item={props.item} onAction={props.onAction} onNavigateToPerson={props.onNavigateToPerson} />
));

// Export for direct use (with proper props)
export {
  DefaultQueueDetail,
  AdvancementFirstDraftDetail,
  AgentDraftMessageDetail,
  AgentApprovalRequiredDetail,
  AgentBlockedActionDetail,
  AgentFlowExceptionDetail,
};

