/**
 * Detail Renderer Registration
 * 
 * This file imports and registers all detail renderers.
 * Importing this file ensures all renderers are registered with the registry.
 */

import { registerQueueDetailRenderer } from './registry';
import { DefaultQueueDetail } from './DefaultQueueDetail';
import { AdvancementFirstDraftDetail } from './AdvancementFirstDraftDetail';

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

// Export for direct use (with proper props)
export { DefaultQueueDetail, AdvancementFirstDraftDetail };

