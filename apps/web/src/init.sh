#!/usr/bin/env bash
set -euo pipefail
NAME="${1:-NewProject}"
echo "Initializing project: $NAME"
# Replace placeholder in README/WORKFLOWS/ABI if needed
git init >/dev/null 2>&1 || true
cat > CODEOWNERS <<'EOF'
# Require approvals
* @gatekeeper @security-officer @lead-engineer
EOF
echo "✔ Git initialized & CODEOWNERS created. Rename remotes as needed."
