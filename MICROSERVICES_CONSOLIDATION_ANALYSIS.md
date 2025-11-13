# Microservices Consolidation Analysis for GRC-API

## EXECUTIVE SUMMARY
Three microservices (Document, Partner, Notification) analyzed for consolidation into grc-api.
All have existing implementations in grc-api already, ranging from complete duplication (documents)
to partial overlap (partners, notifications).

## 1. DOCUMENT SERVICE
**Location**: apps/services/document-service/ (Port 3002)
**Status**: ALREADY MOSTLY CONSOLIDATED

### Routes (10 endpoints):
- POST /api/documents/upload - File upload with AV scanning
- GET /api/documents - List documents with pagination
- GET /api/documents/:id - Document details
- POST /api/documents/:id/reprocess - Reprocess
- DELETE /api/documents/:id - Delete
- GET /api/documents/stats/processing - Stats
- GET /api/documents/secure/:token - Signed URL access
- POST /api/documents/:id/generate-access-url - Create URL
- GET /api/documents/security/dashboard - Security stats
- POST /api/documents/search - Full-text search

### Middleware:
- authenticateToken (JWT)
- requireTenantAccess (Tenant isolation)
- requirePermission (RBAC: documents:update, documents:delete, documents:read)

### Unique Dependencies:
- multer ^2.0.2
- pdf-parse ^2.4.5
- mammoth ^1.11.0
- sharp ^0.34.5

### Database Models:
- documents (main storage table)
- document_chunks (for RAG)
- security_audit_log (security tracking)

### Services:
- documentProcessor (text extraction, chunking)
- avScanner (antivirus scanning)
- secureStorage (encrypted storage, signed URLs)

### GRC-API Status:
**IDENTICAL ROUTE EXISTS** at grc-api/routes/documents.js
- Same endpoints, auth, services, database schema
- VERIFIED: All 3 services present in grc-api

### Recommendation:
**CONSOLIDATION**: COMPLETE (already done)
**Risk**: LOW
**Action**: Deprecate standalone service, verify all routes in grc-api

---

## 2. PARTNER SERVICE
**Location**: apps/services/partner-service/ (Port 3003)
**Status**: PARTIAL OVERLAP

### Routes (13 endpoints):

Partners (6):
- GET /api/partners
- GET /api/partners/:id
- POST /api/partners
- POST /api/partners/invite
- PUT /api/partners/:id
- DELETE /api/partners/:id

Collaborations (5):
- GET /api/collaborations
- GET /api/collaborations/:id
- POST /api/collaborations
- PUT /api/collaborations/:id
- DELETE /api/collaborations/:id

Resources (2):
- GET /api/partners/:partnerId/resources
- POST /api/partners/:partnerId/share-resource

### Middleware:
- validatePartnerAccess (partner relationship validation)
- requirePartnerAccess (permission levels: write, admin)

### Unique Dependencies:
- axios ^1.13.2

### Database Models:
- partners (partner entities)
- partner_collaborations (collaboration records)

### Services:
- partnerService (partner CRUD, filtering, invitations)
- collaborationService (collaboration management)

### GRC-API Status:
**PARTIAL ROUTE EXISTS** at grc-api/routes/partners.js
Includes: Partner CRUD with advanced validation
Missing: Collaboration management, resource sharing, cross-tenant access

### Recommendation:
**CONSOLIDATION**: REQUIRES INTEGRATION (1-2 weeks)
**Risk**: MEDIUM
**Actions**:
1. Copy collaborationService to grc-api/services/
2. Create grc-api/routes/collaborations.js
3. Merge resources route into partners
4. Update middleware

---

## 3. NOTIFICATION SERVICE
**Location**: apps/services/notification-service/ (Port 3004)
**Status**: DIFFERENT ARCHITECTURE

### Routes (4 endpoints):
- POST /api/notifications/send - Send notification
- POST /api/notifications/email - Send email
- GET /api/notifications - List notifications
- GET /api/notifications/templates - List templates

### Middleware:
- No authentication (service-to-service via X-Service-Token header)
- Uses x-tenant-id header

### Unique Dependencies:
- nodemailer ^7.0.10 (SMTP)
- twilio ^4.20.1 (SMS)
- handlebars ^4.7.8 (templates)
- ejs ^3.1.9
- mjml ^4.14.1
- juice ^10.0.0
- bull ^4.12.2 (job queue)
- redis ^4.6.10
- winston ^3.11.0 (logging)
- express-validator ^7.0.1

### Database Models:
- notifications (recipient_email, type, status, sent_at)

### Services:
- emailService (SMTP sending, template rendering)
- templateService (template management)
- smartNotificationEngine (routing, job queue)

### GRC-API Status:
**ROUTE EXISTS BUT DIFFERENT ARCHITECTURE** at grc-api/routes/notifications.js
GRC-API has: Joi validation, multi-channel support, scheduling, metadata
Service has: SMTP implementation, job queue, actual email sending
Mismatch: GRC-API doesn't send actual emails; Service doesn't have scheduling

### Recommendation:
**CONSOLIDATION**: NEEDS CAREFUL INTEGRATION (2-3 weeks)
**Risk**: HIGH (architectural differences)
**Actions**:
1. Decide: Keep database-driven or add job queue? (recommend job queue)
2. Copy emailService to grc-api/services/
3. Install bull, redis, nodemailer
4. Create grc-api/config/smtp.js
5. Update routes/notifications.js with email integration
6. Add job queue processing

---

## CONSOLIDATED ROUTES (POST-CONSOLIDATION)

```
/api/documents (10) - PHASE 1 DONE
/api/partners (6) - PHASE 2
/api/collaborations (5) - PHASE 2
/api/partners/:partnerId/resources (2) - PHASE 2
/api/notifications (4) - PHASE 3

TOTAL: 27 endpoints
```

---

## CONSOLIDATION TIMELINE

| Phase | Service | Effort | Risk | Timeline |
|-------|---------|--------|------|----------|
| 1 | Document | Verify | LOW | Immediate |
| 2 | Partner | Integrate collab features | MEDIUM | 1-2 weeks |
| 3 | Notification | Email + job queue | HIGH | 2-3 weeks |

**Total**: 3-4 weeks

---

## CRITICAL CONFIGURATION

Database (all services share):
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- DB_POOL_MIN, DB_POOL_MAX

SMTP (notification service):
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

JWT:
- JWT_SECRET

Service tokens:
- SERVICE_TOKEN (X-Service-Token header)

Redis (optional Phase 3):
- REDIS_HOST, REDIS_PORT

---

## KEY FILES TO CONSOLIDATE

From document-service:
- services/documentProcessor.js
- services/avScanner.js
- services/secureStorage.js

From partner-service:
- services/partnerService.js
- services/collaborationService.js
- routes/partners.js
- routes/collaborations.js
- routes/resources.js
- middleware/partnerAccess.js

From notification-service:
- services/emailService.js
- services/templateService.js
- services/smartNotificationEngine.js
- config/smtp.js
- routes/notifications.js

---

## DEPLOYMENT STRATEGY

Recommended: Service Gateway Approach
1. Deploy grc-api with consolidated routes
2. Route all requests through API Gateway
3. Gradually deprecate old service routes
4. Monitor traffic before full shutdown
5. Keep containers for 2-4 week rollback window

---

## RISK MITIGATION

1. **Database**: All services use same DB - ensure transaction isolation
2. **Authentication**: Consolidate middleware for consistent auth
3. **Rate Limiting**: May need adjustment post-consolidation
4. **Performance**: Monitor grc-api load increase
5. **Rollback**: Keep microservice containers ready for 2-4 weeks

