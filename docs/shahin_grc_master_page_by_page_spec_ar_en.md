# Shahin GRC Master — Page‑by‑Page Product Spec (AR/EN)

> ثنائي اللغة | Multi‑tenant | RBAC | Real‑time | RAG‑ready | AI‑assisted workflows

الوثيقة دي بتقسّم المنصّة صفحة صفحة. لكل صفحة: **الهدف**، **مكوّنات الواجهة**، **مصادر البيانات والجداول**، **أهم الأعمدة**، **واجهات API**، **التدفّقات الذكية/الأتمتة**، **منطق التقييم/الدرجات (لو موجود)**، **الأذونات**، **مؤشرات النجاح والتدقيق**.

> **مهم**: كل الجداول تحتوي tenant_id وتدعم RLS. أسماء الحقول بالإنجليزية للتوحيد داخل الكود، والعناوين بالعربي + إنجليزي للمستخدم النهائي.

---

## 1) لوحة القيادة | Dashboard
**Goal | الهدف:** لمحة حيّة عن الامتثال والمخاطر والتقدّم.

**UI Blocks | مكوّنات الواجهة**
- KPI Cards (Compliance %, Open Gaps, Risk Hotspots)
- Heatmap (Controls × Status / Risks × Score)
- Trend Lines (last 30/90 days)
- Drill‑down by Framework/Org/Owner
- Filters: timeframe, framework, org unit, owner

**Data Sources**: `frameworks`, `framework_control_map`, `control_implementations`, `risks`, `risk_assessments`, `tasks`.

**Key Tables & Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| frameworks | id | uuid | PK |
|  | code | text | ex: NCA, SAMA |
|  | name | text |  |
| control_implementations | control_id | uuid | FK→controls |
|  | status | enum | pending/in_progress/effective/na |
|  | owner_id | uuid | FK→users |
| risks | id | uuid | PK |
|  | title | text |  |
| risk_assessments | likelihood | int | 1..5 |
|  | impact | int | 1..5 |
| tasks | status | text | open/in_progress/done |

**APIs**
- `GET /api/dashboard/kpis?tenant_id=...&range=30d`
- `GET /api/dashboard/heatmap?type=controls|risks&framework_id=...`

**Smart Flows**
- Recompute compliance % daily + on write to `control_implementations`.
- Auto‑create task when status drops below effective.

**KPIs/Audit**: TTFD<1s، تحميل<100ms/endpoint، أثر تدقيقي لكل drill.

---

## 2) التقييمات | Assessments
**Goal:** إنشاء/إدارة تقييمات وربطها بأدلّة، مع توليد ذكي للأسئلة.

**UI Blocks**
- Assessment Grid (status, owner, progress)
- Question Builder (bank, variants, conditions)
- Evidence Panel (documents, acceptance criteria)
- Progress ring + SLA timers

**Data Sources**: `assessments`, `assessment_questions`, `assessment_responses`, `evidence_links`, `documents`.

**Key Tables & Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| assessments | id | uuid | PK |
|  | framework_id | uuid | FK→frameworks |
|  | title | text |  |
|  | status | text | draft/active/closed |
| assessment_questions | control_id | uuid | link control |
|  | text | text | question body |
| assessment_responses | status | text | draft/answered/accepted/rejected |
|  | answer_text | text |  |
| evidence_links | document_id | uuid | FK→documents |

**APIs**
- `POST /api/assessments` (with framework_id)
- `POST /api/assessments/{id}/questions/generate` (RAG + rules)
- `POST /api/assessments/{id}/responses/{qid}` -> save/accept

**Smart Generation & Scoring**
- **Generator**: يشتق الأسئلة من (framework_section + control criticality + org profile).
- **Scoring**: response → (Yes/No/Partial + weight) ⇒ control score;
  assessment score = Σ(weight×score)/Σ(weight).
- **SLA**: overdue questions → auto‑remind owner.

**Permissions**: Owner/Editors، Reviewer (accept/reject)، Auditor (read‑only).

**KPIs/Audit**: Progress %, avg time/response، تدقيق على تغييرات الإجابة والقبول.

---

## 3) الأطر التنظيمية | Frameworks
**Goal:** إدارة الأطر والإصدارات وربطها بالضوابط.

**UI Blocks**
- Framework Catalog + Version Badge
- Section Tree (Domain/Control mapping)
- Coverage Matrix

**Data Sources**: `frameworks`, `framework_sections`, `controls`, `framework_control_map`, `legal_versions`.

**Key Tables**
| Table | Column | Type | Notes |
|---|---|---|---|
| frameworks | code | text | unique within tenant/version |
|  | version | text | e.g., v2.0 |
| framework_sections | code | text |  |
| framework_control_map | framework_id | uuid | FK |
|  | control_id | uuid | FK |
| legal_versions | version_tag | text | source tag |

**APIs**: `GET /api/frameworks`, `POST /api/frameworks/{id}/import`, `GET /api/frameworks/{id}/coverage`.

**Automation**: on new legal version → compute deltas + notify impacted controls.

---

## 4) متابعة الامتثال | Compliance
**Goal:** تتبّع الحالة وخطط الإغلاق.

**UI Blocks**
- Gap List (sortable, assignable)
- Remediation Plan Board (Kanban)
- SLA widgets

**Data Sources**: `control_implementations`, `tasks`, `approvals`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| control_implementations | status | enum | target=effective |
|  | due_date | date | SLA |
| tasks | related_type/id | text/uuid | "control"/id |
|  | assignee_id | uuid | user |
| approvals | status | text | pending/approved/rejected |

**APIs**: `GET /api/compliance/gaps`, `POST /api/tasks`.

**Flows**: overdue gap → escalate to owner’s manager; status change → re-score compliance.

---

## 5) الضوابط | Controls
**Goal:** تعريف الضوابط، التنفيذ، الاختبارات، الأدلة.

**UI Blocks**
- Control Card (metadata, mappings)
- Test Runs table, Evidence list
- CCM signals (if integrated)

**Data Sources**: `controls`, `control_implementations`, `control_tests`, `control_evidence`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| controls | code | text | unique |
|  | title | text |  |
| control_implementations | owner_id | uuid | FK→users |
|  | status | enum |  |
| control_tests | executed_at | timestamptz | last test |
| control_evidence | document_id | uuid | FK |

**APIs**: `GET /api/controls/{id}`, `POST /api/controls/{id}/tests`, `POST /api/controls/{id}/evidence`.

**Automation**: fail test → open remediation task + notify.

---

## 6) المؤسسات | Organizations
**Goal:** إدارة المستأجر/الفروع والسمات.

**UI Blocks**
- Org Profile, Branding, Locale
- Org Units & Hierarchy

**Data Sources**: `organizations`, `org_units`, `tenant_settings`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| organizations | name | text |  |
|  | code | text | unique per tenant |
| org_units | org_id | uuid | FK |
| tenant_settings | branding_theme | text |  |
|  | locale/timezone | text | 'ar-SA'/'Asia/Riyadh' |

**APIs**: `PUT /api/organizations/{id}`, `PUT /api/tenant/settings`.

---

## 7) الجهات التنظيمية | Regulators
**Goal:** مرجع الجهات ومطبوعاتها.

**UI Blocks**
- Regulator Card (links, feed)
- Publications timeline

**Data Sources**: `regulators`, `regulator_publications`, `regulatory_sources`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| regulators | name | text |  |
|  | website | text |  |
| regulator_publications | pub_date | date |  |
|  | title/url | text |  |

**APIs**: `GET /api/regulators/{id}`, `GET /api/regulators/{id}/publications`.

---

## 8) إدارة المخاطر | Risk Management
**Goal:** مصفوفات مخاطر وخطط علاج.

**UI Blocks**
- Risk Register table
- Heatmap (likelihood×impact)
- Treatment plan board

**Data Sources**: `risks`, `risk_assessments`, `risk_treatments`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| risks | code/title | text |  |
| risk_assessments | likelihood/impact | int | 1..5 |
|  | score | int | generated |
| risk_treatments | action | text |  |
|  | owner_id | uuid |  |

**APIs**: `POST /api/risks`, `POST /api/risks/{id}/assess`, `POST /api/risks/{id}/treatments`.

**Automation**: score≥15 ⇒ auto‑escalate + meeting invite.

---

## 9) التقارير | Reports
**Goal:** تقارير تنفيذيّة بالعربي/الإنجليزي.

**UI Blocks**
- Template gallery
- Run history + download links

**Data Sources**: `report_templates`, `report_runs`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| report_templates | code/name | text |  |
|  | definition | jsonb | placeholders |
| report_runs | generated_at | timestamptz |  |
|  | storage_url | text | file link |

**APIs**: `POST /api/reports/run?template=...`

---

## 10) إدارة المستندات | Documents
**Goal:** دورة حياة الدليل.

**UI Blocks**
- Vault (search/filters)
- Versions & checksums
- Link to responses/controls

**Data Sources**: `documents`, `file_versions`, `evidence_links`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| documents | title | text |  |
|  | doc_type | text | policy/procedure/... |
| file_versions | version_no | int | current flag |
|  | storage_url | text | S3/SharePoint |
| evidence_links | response_id | uuid | FK |

**APIs**: `POST /api/documents`, `POST /api/documents/{id}/upload`.

**Automation**: AV scan + checksum; retention policy alerts.

---

## 11) إدارة سير العمل | Workflows
**Goal:** BPMN‑like تدفقات، موافقات.

**UI Blocks**
- Workflow designer (steps, guards)
- Instance tracker

**Data Sources**: `workflows`, `workflow_steps`, `workflow_instances`, `approvals`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| workflows | code/name | text | unique code |
| workflow_steps | ordinal | int | order |
| workflow_instances | state | text | running/paused/done |
| approvals | approver_id | uuid | FK |
|  | status | text | pending/approved/rejected |

**APIs**: `POST /api/workflows`, `POST /api/workflows/{id}/instances`.

**Automation**: step guard rules; auto‑reassign on SLA breach.

---

## 12) إدارة الشركاء | Partners
**Goal:** تقييم الموردين ومخاطرهم.

**UI Blocks**
- Vendor list + risk badge
- Assessments & open risks

**Data Sources**: `vendors`, `vendor_assessments`, `vendor_risks`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| vendors | name | text | unique per tenant |
| vendor_assessments | score | numeric | 0..100 |
| vendor_risks | status | text | open/closed |

**APIs**: `POST /api/vendors`, `POST /api/vendors/{id}/assess`.

**Automation**: low score → start due‑diligence workflow.

---

## 13) مركز الإشعارات | Notifications
**Goal:** إشعارات متعددة القنوات.

**UI Blocks**
- Inbox
- Preferences & subscriptions

**Data Sources**: `notifications`, `notification_channels`, `system_events`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| notifications | title | text |  |
|  | severity | text | info/warn/critical |
|  | read | boolean |  |
| notification_channels | code | text | email/teams/sms |

**APIs**: `POST /api/notifications/send`.

**Automation**: rules engine (event→channel, severity thresholds).

---

## 14) الذكاء التنظيمي | Regulatory Intelligence
**Goal:** فهرسة/مقارنة الإصدارات.

**UI Blocks**
- Update feed
- Version diff viewer

**Data Sources**: `regulatory_sources`, `crawled_docs`, `legal_versions`, `change_deltas`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| legal_versions | version_tag | text |  |
|  | published_at | date |  |
| change_deltas | change_type | text | added/removed/modified |
|  | section_ref | text |  |

**APIs**: `POST /api/regintel/crawl`, `GET /api/regintel/diff?framework_id=&from=&to=`

**Automation**: impact map → controls + assessments to refresh.

---

## 15) الجدولة الذكية | AI Scheduler
**Goal:** جدولة الوظائف حسب الأولوية/الخطر.

**UI Blocks**
- Job list (enabled, last run)
- Schedules (cron)

**Data Sources**: `schedules`, `job_definitions`, `job_runs`, `triggers`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| schedules | cron_expr | text | crontab |
| job_definitions | handler | text | queue:service.action |
|  | params | jsonb |  |
| job_runs | status | text | success/fail |
| triggers | on_event | text | event key |

**APIs**: `POST /api/scheduler/jobs`, `POST /api/scheduler/triggers`.

**Automation**: event→job routing; pause on repeated failures.

---

## 16) الذكاء الاصطناعي | RAG Service
**Goal:** استرجاع معزّز من المستندات بالعربي/الإنجليزي.

**UI Blocks**
- Ask box + citations
- Source preview + send‑to‑workflow

**Data Sources**: `documents`, `doc_chunks (vector)`, `qa_sessions`, `qa_citations`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| doc_chunks | embedding | vector(1536) | pgvector |
|  | text | text | chunk |
| qa_sessions | question | text |  |
| qa_citations | score | numeric | similarity |

**APIs**: `POST /api/rag/ask`, `GET /api/rag/sources?session_id=`

**Scoring**: cosine similarity, MMR; feedback loops to improve rerank.

---

## 17) إدارة المستخدمين | Users
**Goal:** RBAC وإدارة الأعضاء.

**UI Blocks**
- Users grid + status
- Roles & permissions matrix

**Data Sources**: `users`, `roles`, `permissions`, `role_assignments`, `login_attempts`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| users | email | citext | unique |
|  | org_unit_id | uuid | FK |
| roles | code/name | text |  |
| role_assignments | user_id/role_id | uuid | composite unique |
| login_attempts | timestamp | timestamptz |  |

**APIs**: `POST /api/users/invite`, `POST /api/users/{id}/roles`.

**Automation**: enforce MFA; lockout policy; SCIM sync.

---

## 18) سجلات التدقيق | Audit Logs
**Goal:** أثر تدقيقي شامل.

**UI Blocks**
- Query builder (actor/entity/time)
- Export CSV/PDF

**Data Sources**: `audit_logs`, `users`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| audit_logs | timestamp | timestamptz | indexed |
|  | actor_id | uuid | FK→users |
|  | action | text | create/update/approve/reject/delete |
|  | entity | text | e.g. control |

**APIs**: `GET /api/audit?entity=...&actor=...&from=...&to=...`

**Automation**: immutability via append‑only partition + WORM backup.

---

## 19) قاعدة البيانات | Database
**Goal:** صحّة وأداء القاعدة.

**UI Blocks**
- DB Health (size, connections)
- Query latency percentiles

**Data Sources**: `db_health_metrics` + pg stats.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| db_health_metrics | metric | text | jobs_backlog, qps, ... |
|  | value | numeric |  |
|  | ts | timestamptz |  |

**APIs**: `GET /api/db/health`.

**Automation**: alert on thresholds; create read replicas when needed.

---

## 20) الإعدادات | Settings
**Goal:** إعدادات المستأجر والتكاملات.

**UI Blocks**
- Branding & Locale
- Integrations (Email/Teams/SSO/Payments)

**Data Sources**: `tenant_settings`, `integration_settings`.

**Key Columns**
| Table | Column | Type | Notes |
|---|---|---|---|
| tenant_settings | branding_theme | text |  |
|  | locale/timezone | text | defaults ar‑SA/Asia/Riyadh |
| integration_settings | type | text | azuread/email/teams/... |
|  | enabled | boolean |  |

**APIs**: `PUT /api/tenant/settings`, `POST /api/integrations/test`.

**Automation**: config lint + secret validation; rotate keys reminders.

---

# ملاحق موجزة

### A) درجات الامتثال (Compliance Scoring)
- Control weight (critical/high/medium/low) = {1.0, 0.75, 0.5, 0.25}
- Implementation status → score: {effective=1, in_progress=0.6, pending=0.2, na=excluded}
- Framework score = Σ(weight×score)/Σ(weight)

### B) تقييم المخاطر (Risk Scoring)
- score = likelihood×impact (1..25)
- Heat bands: {1–5 low, 6–10 med‑, 11–15 med+, 16–20 high, 21–25 critical}
- Auto‑SLA: high/critical → owner SLA 7/3 days.

### C) إنشاء أسئلة ذكي (Smart Assessment Generation)
- Inputs: framework, org profile, control criticality, historical gaps.
- Rules: domain templates + variants; RAG to inject context snippets.
- Output: question_set with tags, owner suggestions, due dates, evidence hints.

### D) الأذونات (Permissions)
- Admin/Finance/Marketing/HR/Compliance/Auditor roles، لكل صفحة CRUD حسب الدور.

### E) التتبع والتدقيق (Auditability)
- كل action يُسجّل في `audit_logs` مع actor, entity, diff snapshot.

— انتهى —

