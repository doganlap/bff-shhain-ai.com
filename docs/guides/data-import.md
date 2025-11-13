# Import to Trackers (Jira & Azure DevOps)

## Files
- `routing_rules.yaml` — قواعد التوجيه الذكي (يمكن تعديلها).
- `grc_execution_tasks_smart.csv` — المهام بعد تطبيق القواعد.
- `jira_bulk_payload.json` — جاهز للـ API (سيتحوّل email → accountId أثناء التنفيذ).
- `azdo_bulk_import.csv` — CSV للـ Azure DevOps.
- `import_to_trackers.py` — سكربت موحّد للاستيراد.
- `tracker_import.env` — قالب متغيرات بيئة (ضع التوكنات).
- `tenants_template.csv`, `teams_template.csv` — قوالب المستأجرين/الفرق.

## استخدام السكربت
1) املأ `tracker_import.env` بالقيم.
2) تشغيل Dry-run:
   ```bash
   python import_to_trackers.py --jira --azdo --dry-run
   ```
3) تنفيذ فعلي:
   ```bash
   python import_to_trackers.py --jira --azdo
   ```

> ملاحظة Jira: يتم تحويل البريد إلى `accountId` تلقائيًا عبر `/rest/api/3/user/search`. إذا كان الوصول محدودًا، سيُنشأ التذكرة بدون مُسنّد (Unassigned).
