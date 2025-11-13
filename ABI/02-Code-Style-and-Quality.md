# 02 — Code Style & Quality
- Formatting enforced (.editorconfig, prettier/black).
- ESLint ruleset: no console in prod, no unused vars, security plugin enabled.
- Python: ruff + mypy (strict for services).
- JS/TS: tsconfig strict, no implicit any.
- Min Coverage: 80% (services), 70% (web). Thresholds in CI.
