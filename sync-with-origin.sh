#!/bin/bash
# Sync local APP-Production-Final with origin: pull remote changes (merge), then push.
# Run from repo root. You may be prompted for GitHub auth.

set -e
BRANCH="APP-Production-Final"
echo "Fetching from origin..."
git fetch origin

if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "Merging origin/$BRANCH into local (keeping local changes on conflict)..."
  git merge "origin/$BRANCH" --no-edit -X ours
else
  echo "Remote branch origin/$BRANCH not found (empty repo or first push). Skipping merge."
fi

echo "Pushing to origin $BRANCH..."
git push -u origin "$BRANCH"
echo "Done. Local and origin are synced."
