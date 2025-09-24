#!/usr/bin/env bash
set -euo pipefail

OUT="review-report.md"
ts() { date -u +"%Y-%m-%d %H:%M:%SZ (UTC)"; }

section() { echo -e "\n## $1\n"; }
code()    { echo -e "\n\`\`\`bash\n$*\n\`\`\`\n"; "$@" 2>/dev/null || true; }
block()   { echo -e "\n\`\`\`txt"; cat; echo -e "\n\`\`\`\n"; }

{
  echo "# PermitPass – Full Repo Review"
  echo "_Generated: $(ts)_"

  section "Environment"
  code node -v | block
  code npm -v | block
  code git rev-parse --short HEAD | block
  code git status -sb | block

  section "Top-level structure"
  code ls -la | block
  code "cat package.json || true" | block
  code "cat package-lock.json | head -n 50 || echo '(no root package-lock.json)'" | block

  section "Workspaces detected"
  code "jq -r '.workspaces // empty' package.json" | block || echo "(jq not available or no workspaces key)"

  section "Install (root)"
  # prefer ci, fall back to i for local use
  (npm ci || npm i) | block

  section "Workspace: server"
  code ls -la server | block
  code "cat server/package.json || true" | block
  code "cat server/tsconfig.json || echo '(no tsconfig.json)'" | block
  code "cat server/.eslintrc.* 2>/dev/null || echo '(no explicit ESLint rc in server)'" | block

  section "server: Lint"
  code npm run -w server lint --if-present | block

  section "server: Typecheck"
  code npm run -w server typecheck --if-present | block

  section "server: Tests"
  code npm run -w server test --if-present | block

  section "Workspace: client"
  code ls -la client | block
  code "cat client/package.json || true" | block
  code "cat client/tsconfig.json || echo '(no tsconfig.json)'" | block

  section "client: Lint"
  code npm run -w client lint --if-present | block

  section "client: Typecheck"
  code npm run -w client typecheck --if-present | block

} > "$OUT"

echo "Wrote $OUT"
