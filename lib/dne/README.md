# Do-Not-Engage (DNE) Framework

This framework enforces do-not-engage rules at three levels:
1. **Global** - Per person, across all agents
2. **Per-agent** - Specific agent should not contact this person
3. **Per-channel** - Email, SMS, or phone blocking

## Usage

### Checking if engagement is allowed

```typescript
import { canEngage } from '@/lib/dne/canEngage';

const result = await canEngage({
  personId: 'person-123',
  agentId: 'agent-456', // optional
  channel: 'email', // or 'sms' or 'phone'
});

if (!result.allowed) {
  // Blocked: result.reason will be 'global' or 'agent'
  return;
}

// Proceed with sending communication
```

### Enforcing DNE in outbound communications

Before sending any outbound communication (email, SMS, phone), call `enforceDne`:

```typescript
import { enforceDne, logDneBlock } from '@/lib/dne/enforce';

// Example: Before sending an email
async function sendEmail(personId: string, agentId: string, emailContent: string) {
  const result = await enforceDne({
    personId,
    agentId,
    channel: 'email',
  });

  if (!result.allowed) {
    // Log the block event
    await logDneBlock(agentId, personId, result.reason, 'email');
    
    // Short-circuit the send
    return { success: false, reason: 'dne_blocked' };
  }

  // Proceed with sending email
  // ... your email sending logic here ...
}
```

### Integration points

Add DNE checks in:
- Email sending functions
- SMS sending functions
- Robocall/phone integration
- Any outbound communication path

**Note**: Internal actions (tasks, flags) should NOT be blocked by DNE.

## API Routes

### Global DNE

- `GET /api/dne/global?personId=xxx` - Get global DNE settings
- `POST /api/dne/global` - Create/update global DNE settings
- `DELETE /api/dne/global?personId=xxx` - Remove global DNE settings

### Agent-specific DNE

- `GET /api/dne/agent?agentId=xxx` - Get all agent DNE entries
- `POST /api/dne/agent` - Add person to agent DNE list
- `DELETE /api/dne/agent?personId=xxx&agentId=xxx` - Remove person from agent DNE list

## Components

- `DoNotEngagePanel` - Person profile DNE settings panel
- `AgentDneSection` - Agent-specific DNE management section
- `QuickDneActions` - Quick actions dropdown for adding to DNE lists




