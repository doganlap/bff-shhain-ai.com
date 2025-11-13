# 00 — Advanced Binding Instructions (ABI) — التعليمات الملزِمة

> **هذه القواعد غير قابلة للتفاوض (Non‑Negotiable).** أي Merge/Release يجب أن يحققها بالكامل.

## 1) الحوكمة والأدوار (Governance & Roles)
| Role (EN) | الدور (AR) | المسؤوليات الملزِمة |
|---|---|---|
| Gatekeeper (Acceptance) | حارس القبول | يراجع الـPR مقابل قائمة التحقق، يتحقق من الالتزام بالعقود والجداول، آخر من يوافق |
| Lead Engineer | المهندس المسؤول | جودة الكود، بنية المجلدات، تغطية الاختبارات |
| Security Officer/DPO | ضابط الأمن/حماية البيانات | فحوص SAST/DAST، الأسرار، التوافق (PDPL/GDPR إن وُجد) |
| DevOps | ديف أوبس | CI/CD، المراقبة، القابلية للتراجع (Rollback) |
| Product Owner | مالك المنتج | تعريف المتطلبات والـFeature Flags وقرار الإطلاق |

## 2) سياسة الفروع والإصدارات
- **Trunk‑Based**: فروع قصيرة `feat/*`, `fix/*`, `chore/*` مع PR صغير + دمج سريع.
- **Conventional Commits** (إلزامي): `feat(scope): ...`, `fix(scope): ...`، تفعيل إصدار SemVer عبر الـtags.
- **إطلاقات معنونة**: `vX.Y.Z` + Release Notes آلية (من الـcommits).

## 3) جودة الكود والاختبارات
- **Thresholds ملزمة**: تغطية وحدات ≥ 80% للخدمات الحرجة، ≥ 70% للواجهة.
- **Contract Tests** بين المستهلك والموفّر لأي API في `contracts/`.
- **No Broken Windows**: Lint/Format إجباري، لا تعليق TODO بلا تذكرة.

## 4) العقود (Contracts) واجهة أولًا
- كل Endpoint موثق في **OpenAPI** داخل `contracts/api`. يُولّد منه SDK (packages/sdk إن لزم).
- أحداث الرسائل/الصفوف (events) في `contracts/events` بصيغة JSON Schema.
- أي تغيير **Backwards‑Compatible**، وإلا إصدار /v2 مع خطة ترحيل.

## 5) البيانات والهجرات
- لا تغييرات DB يدوية. استخدم مهاجرات مسماة + مسار تراجع (down). ضعها تحت `infra/db` أو مجلد الخدمة.
- تعدد المستأجرين **Row‑Level Security** افتراضيًا مع اختبارات لإثبات العزل.

## 6) الأمن والامتثال
- الأسرار عبر **Key Vault**/Variables محمية. ممنوع وجود أسرار داخل المستودع.
- **SAST** (ESLint/Bandit/Semgrep) و **Dependency Scan** و **Container Scan** (Trivy) إجباري قبل الدمج.
- سياسة الترخيص (License Policy): منع الرخص غير المتوافقة.

## 7) الملاحظة والتشغيل
- سجلات JSON مُهيكلة (حقول: `correlation_id`, `tenant_id`, `user_id`).
- **/healthz** و **/readyz** لكل خدمة. **OpenTelemetry** للتتبّع.
- Runbooks مُحدّثة: Incident / Rollback / Onboarding.

## 8) تجربة المستخدم (UI/UX)
- **Design System / UI‑Kit** مركزي + Storybook. توكنات Theme جاهزة و**RTL** افتراضي.
- نماذج موحّدة والتحقق السلوكي (Zod/Yup). معايير وصول (a11y).

## 9) بوابات القبول (Quality Gates) — جدول مُلزم
| Gate | الوصف | أداة/دليل | الحالة المطلوبة |
|---|---|---|---|
| Lint/Format | خلوّ من أخطاء lint | eslint/black/prettier | ✅ Required |
| Tests | تغطية وحدات | coverage report | ✅ 80% (Backends) |
| Contract | توافق عقود OpenAPI/Schema | contract-tests | ✅ Pass |
| Security | SAST + deps + container | semgrep/trivy | ✅ No Critical |
| Migrations | up/down مهاجرات | migration logs | ✅ Present |
| Observability | healthz/readyz + OTEL | curl+dashboard | ✅ OK |
| Docs | ADR/README/CHANGELOG | checklist | ✅ Updated |

## 10) طلب تغيير (CR) — المسار المختصر
1. افتح تذكرة. 2. اكتب ADR (إن معماري). 3. فرّع `feat/...`. 4. طبّق/اختبر. 5. PR مع **قائمة التحقق**.
6. Gatekeeper + Security يوافقان. 7. دمج + إطلاق مع Rollback Plan.

> أي استثناء يتطلب موافقة مكتوبة من Gatekeeper + Security + PO.
