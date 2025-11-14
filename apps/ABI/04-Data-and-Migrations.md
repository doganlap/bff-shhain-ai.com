# 04 — Data & Migrations
- Migrations are mandatory; no manual schema edits.
- Backwards‑compatible pattern: add new nullable columns, dual‑write if needed, then cutover.
- RLS for multi‑tenancy; enforce tests that prove isolation.
