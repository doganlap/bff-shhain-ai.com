# Master Template (AR/EN) — قالب بداية مشروع موحّد

> ضع هذا المجلد كبذرة أي مشروع جديد. يحتوي **Advanced Binding Instructions (ABI)** + جداول سياسات + قوالب CI/CD + قوائم تحقق + بنية مجلدات قياسية.

## Quickstart
1. انسخ المجلد وأعد تسميته لاسم المشروع.
2. شغّل `scripts/init.sh "MyProject"` لتحديث الأسماء وتهيئة Git وCODEOWNERS.
3. افتح `ABI/00-ABI-Master.md` — هذه هي القواعد الملزِمة (Non‑Negotiables) لكل فريق.
4. حدّث العقود في `contracts/` وأضف ADR لأي قرار معماري جديد في `docs/adr/`.
5. اربط CI على GitHub — ملفات الـ workflows جاهزة في `.github/workflows`.

## المحتويات
- **ABI/**: التعليمات الملزِمة + سياسات التغيير + الجداول.
- **contracts/**: OpenAPI + JSON Schemas للأحداث.
- **docs/**: ADR/Runbooks/Checklists.
- **infra/**: Docker Compose + قوالب Azure (مكانها).
- **apps/**: أمثلة خفيفة (BFF Express + FastAPI خدمة بسيطة).
- **.github/**: قوالب CI (lint/test/build) + فحوص أمنية.
- **scripts/**: سكربتات تهيئة وفحوص محلية.

> Default: **Arabic + English**، دعم تعدد المستأجرين، وواجهات `/healthz`/`/readyz`، وConventional Commits.
