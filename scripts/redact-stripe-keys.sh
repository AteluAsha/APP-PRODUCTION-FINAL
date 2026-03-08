#!/bin/bash
# Used by git filter-branch --tree-filter to redact Stripe keys in every commit.
# Run from repo root (GIT_WORK_TREE is . when filter-branch runs).
# SECURITY: This script does not contain real Stripe keys. It redacts by pattern
# so any pk_live_* or sk_live_* in .md files is replaced with [KEY_REDACTED_FOR_SECURITY].
set -e
REDACT='[KEY_REDACTED_FOR_SECURITY]'
find . -name "*.md" -type f 2>/dev/null | while read -r f; do
  if grep -qE "pk_live_[A-Za-z0-9]+|sk_live_[A-Za-z0-9]+" "$f" 2>/dev/null; then
    sed -i.bak -E "s|pk_live_[A-Za-z0-9]+|$REDACT|g" "$f"
    sed -i.bak -E "s|sk_live_[A-Za-z0-9]+|$REDACT|g" "$f"
    rm -f "$f.bak"
  fi
done
true
