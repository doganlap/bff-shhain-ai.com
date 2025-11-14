# ADR 0004: Multi-Service Ecosystem Architecture

## Status
**Proposed** - Awaiting approval

## Context
The system needs to support:
- Multi-tenant architecture (multiple organizations)
- Multi-role RBAC (complex permission system)
- Multi-service ecosystem (microservices)
- Multi-partner collaboration (organizations working together)
- Service-to-service communication
- Network of interconnected services

## Decision
Implement a multi-service ecosystem architecture with:

1. **Service Architecture:**
   - BFF (Backend for Frontend) as API Gateway
   - Independent microservices (grc-api, auth-service, document-service, partner-service)
   - Shared database with Row-Level Security (RLS)
   - Service-to-service communication via HTTP/REST and Events

2. **Multi-Tenancy:**
   - Row-Level Security (RLS) on all tables
   - Tenant context injection via middleware
   - Mandatory tenant_id in all queries
   - Cross-tenant operations require special permissions

3. **Multi-Role RBAC:**
   - Hierarchical role system
   - Granular permissions (service:resource:action)
   - Role-permission mapping stored centrally
   - UI and API enforcement

4. **Multi-Partner Support:**
   - Partner relationship model
   - Cross-tenant collaboration
   - Partner types: vendor, client, auditor, regulator, strategic partner
   - Controlled resource sharing

5. **Service Communication:**
   - Synchronous: HTTP/REST via BFF or direct
   - Asynchronous: Event bus for decoupled communication
   - Service discovery: Registry pattern (Consul/etcd)

## Consequences

### Positive
- ✅ Scalability: Services can scale independently
- ✅ Isolation: Tenant and service isolation
- ✅ Flexibility: Easy to add new services
- ✅ Collaboration: Multi-partner ecosystem support
- ✅ Maintainability: Clear service boundaries

### Negative
- ⚠️ Complexity: More moving parts to manage
- ⚠️ Network latency: Service-to-service calls
- ⚠️ Distributed transactions: Need careful handling
- ⚠️ Debugging: More complex troubleshooting

### Mitigation
- Use service mesh for observability
- Implement circuit breakers for resilience
- Use event sourcing for complex workflows
- Comprehensive logging and monitoring

## Implementation Plan

### Phase 1: Foundation (Current)
- ✅ BFF structure
- ✅ GRC API service
- ✅ Multi-tenant database with RLS
- ✅ Basic RBAC

### Phase 2: Service Extraction
- [ ] Extract auth logic to auth-service
- [ ] Extract document processing to document-service
- [ ] Update BFF for service routing

### Phase 3: Partner Service
- [ ] Create partner-service
- [ ] Implement partner relationships
- [ ] Add cross-tenant access controls

### Phase 4: Event-Driven
- [ ] Add event bus
- [ ] Implement async communication
- [ ] Add event sourcing

## References
- ABI/10-Multi-Service-Ecosystem.md
- ABI/08-MultiTenancy-and-RBAC.md
- ABI/03-API-Contracts-and-Testing.md

