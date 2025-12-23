# Data Provider - Architecture

**Purpose**: Technical architecture and implementation details.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Current State

### Provider Abstraction

```
DataClient → Provider Interface → Provider Implementation
                                    ├── Mock Provider
                                    ├── HTTP Provider (future)
                                    └── MCP Provider (future)
```

### Location
- **API**: `lib/data/index.ts` (exports `dataClient`)
- **Provider Interface**: `lib/data/provider.ts`
- **Mock Provider**: `lib/data/providers/mockProvider.ts`

### Provider Selection
- Environment variable: `NEXT_PUBLIC_DATA_PROVIDER`
- Default: `"mock"`
- Future: `"http"`, `"mcp"`

---

## Component Boundaries

### DataClient
- **Location**: `lib/data/index.ts`
- **Responsibilities**: Public API, provider creation
- **Dependencies**: Provider implementations

### Provider Interface
- **Location**: `lib/data/provider.ts`
- **Responsibilities**: Type definitions, contract
- **Dependencies**: None

### Mock Provider
- **Location**: `lib/data/providers/mockProvider.ts`
- **Responsibilities**: Mock data implementation
- **Dependencies**: Mock data sources

---

## Future Considerations

- HTTP Provider implementation
- MCP Provider implementation
- Caching layer
- Real-time updates

---

## Update Triggers

This doc must be updated when:
- Architecture changes
- New providers are added
- Component boundaries change


