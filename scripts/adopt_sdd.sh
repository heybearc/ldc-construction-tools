#!/usr/bin/env bash
# Adopt or refresh SDD scaffolding in an existing repo.
# Usage (from target repo root):
#   curl -fsSL https://raw.githubusercontent.com/heybearc/sdd-foundation/main/scripts/adopt_sdd.sh | bash
# or
#   ./scripts/adopt_sdd.sh
set -euo pipefail

# ---- Config (override via env) ----------------------------------------------
TEMPLATE_REPO="${TEMPLATE_REPO:-heybearc/sdd-template}"
FOUNDATION_REPO="${FOUNDATION_REPO:-heybearc/sdd-foundation}"
FOUNDATION_TAG="${FOUNDATION_TAG:-v1}"     # moving major tag (no more patch bumps)
TMP_DIR="${TMP_DIR:-_sdd_template_tmp}"

CREATE_STUB_CONTRACT="${CREATE_STUB_CONTRACT:-1}"   # set 0 to skip stub creation
QUIET="${QUIET:-0}"

# ---- Helpers ----------------------------------------------------------------
say() { [[ "$QUIET" = "1" ]] || echo -e "$*"; }

need() { command -v "$1" >/dev/null || { echo "
 Missing: $1"; exit 1; }; }

inplace_sed() {
  # Cross-platform in-place sed: macOS (BSD) then GNU
  local expr="$1" file="$2"
  if sed -Ei '' "$expr" "$file" 2>/dev/null; then return 0; fi
  sed -Ei "$expr" "$file"
}

# ---- Sanity checks -----------------------------------------------------------
need gh
need jq
say "
 Adopting SDD from \e[1m$TEMPLATE_REPO\e[0m (foundation: \e[1m$FOUNDATION_REPO@$FOUNDATION_TAG\e[0m)"

# Must run from the repo root (has .git)
git rev-parse --show-toplevel >/dev/null 2>&1 || { echo "Run from a Git repo root."; exit 1; }

# ---- Fetch template (shallow) -----------------------------------------------
rm -rf "$TMP_DIR"
gh repo clone "$TEMPLATE_REPO" "$TMP_DIR" -- --depth=1 >/dev/null
trap 'rm -rf "$TMP_DIR"' EXIT

# ---- Copy scaffolding into this repo ----------------------------------------
# Keep it conservative: don
t clobber README/docs; don
t copy the template
s tests.
rsync -a \
  --exclude '.git' \
  --exclude 'README.md' \
  --exclude 'docs' \
  --exclude 'tests' \
  "$TMP_DIR"/ ./
say "
 Copied SDD scaffolding"

# ---- Ensure reusable workflow uses moving tag @v1 ----------------------------
WF=".github/workflows/project-ci.yml"
mkdir -p .github/workflows
if [[ -f "$WF" ]]; then
  # Rewrite any @vX.Y.Z or @vX to @v1 for foundation workflows
  inplace_sed "s#(${FOUNDATION_REPO}/\.github/workflows/[^@]+)@v[0-9.]+#\1@${FOUNDATION_TAG}#g" "$WF" || true
  say "
 Pinned reusable workflows in $WF to @$FOUNDATION_TAG"
else
  cat > "$WF" <<YAML
name: project-ci
on:
  pull_request:
  push:
    branches: [ main ]
jobs:
  spec-check:               { uses: ${FOUNDATION_REPO}/.github/workflows/spec-check.yml@${FOUNDATION_TAG} }
  contracts:                { uses: ${FOUNDATION_REPO}/.github/workflows/contracts.yml@${FOUNDATION_TAG} }
  tests:                    { uses: ${FOUNDATION_REPO}/.github/workflows/tests.yml@${FOUNDATION_TAG} }
  security:                 { uses: ${FOUNDATION_REPO}/.github/workflows/security.yml@${FOUNDATION_TAG} }
  cost:                     { uses: ${FOUNDATION_REPO}/.github/workflows/cost-report.yml@${FOUNDATION_TAG} }
  qos:
    uses: ${FOUNDATION_REPO}/.github/workflows/qos.yml@${FOUNDATION_TAG}
    with: { qos_url: "", p95_budget_ms: 200, bundle_budget_kb: 200 }
  opa:                      { uses: ${FOUNDATION_REPO}/.github/workflows/opa.yml@${FOUNDATION_TAG} }
  contracts-conformance:
    uses: ${FOUNDATION_REPO}/.github/workflows/contracts-conformance.yml@${FOUNDATION_TAG}
    with: { openapi_path: contracts/openapi.yaml, base_url: "" }
YAML
  say "
 Created $WF"
fi

# ---- Ensure bin helpers are executable --------------------------------------
chmod +x bin/new-feature bin/generate-plan bin/generate-contract 2>/dev/null || true

# ---- Seed a minimal contract (to keep CI from failing day 1) ----------------
mkdir -p contracts
if [[ "$CREATE_STUB_CONTRACT" = "1" ]]; then
  if ! ls contracts/*.{yaml,yml,json} >/dev/null 2>&1; then
    cat > contracts/openapi.yaml <<'YAML'
openapi: 3.0.3
info: { title: Bootstrap API, version: 0.0.1 }
paths: {}
components: {}
YAML
    say "
 Created contracts/openapi.yaml stub"
  fi
fi

# ---- Optional: pre-commit install (if config present and tool available) ----
if [[ -f .pre-commit-config.yaml ]] && command -v pre-commit >/dev/null; then
  pre-commit install || true
  say "
 Installed pre-commit hooks"
fi

# ---- Summary ----------------------------------------------------------------
say "
 SDD adoption summary:"
say "   
 workflows: $WF (consumes ${FOUNDATION_REPO}@${FOUNDATION_TAG})"
say "   
 contracts: $(ls contracts 2>/dev/null | wc -l | tr -d ' ') file(s)"
say "   
 specs dir: $(test -d specs && echo present || echo missing)"
say "   
 bin/: $(test -d bin && ls bin | wc -l | tr -d ' ') helper(s)"
say "   
 policy/: $(test -d policy && echo present || echo missing)"
say "
 Done. Next:"
say "   git checkout -b sdd-adopt || true"
say "   git add -A && git commit -m 'chore(sdd): adopt/refresh SDD scaffolding' && git push -u origin sdd-adopt"
