# Auth Service

**Purpose**: Firebase Authentication service for user authentication and authorization.

**Audience**: Engineers

**Scope**: Authentication, authorization, user management

**Non-goals**: Domain-specific auth logic (see domain docs)

**Key Terms**:
- **Firebase Auth**: Google Firebase Authentication service
- **OAuth**: Google OAuth integration
- **Domain Restrictions**: Limited to `gravyty.com` and `rakestraw.com`

**Links**:
- [Context](context.md)
- [Contracts](contracts.md)
- [Architecture](architecture.md)
- [APIs and Events](apis-and-events.md)
- [Runbooks](runbooks.md)

**Ownership**: Engineering Team  
**Update Triggers**: Auth changes, security updates

**Last Updated**: 2025-12-20

---

## Quick Start

```typescript
import { useAuth } from '@/lib/firebase/auth-context';

const { user, loading } = useAuth();
```

---

## See Also

- [Context](context.md) - When to use, alternatives
- [Contracts](contracts.md) - SLOs, limits, guarantees
- [Architecture](architecture.md) - Technical details
- [APIs and Events](apis-and-events.md) - Full API reference




