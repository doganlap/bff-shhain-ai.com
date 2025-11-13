# 03 — API Contracts & Testing
- Source of truth: `contracts/api/*.openapi.yaml`.
- Generate SDKs before merge (packages/sdk).
- Contract tests run in CI against provider stubs.
- Breaking changes require new version path `/v2`.
