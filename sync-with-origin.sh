#!/bin/bash
# Sync: make local APP-Production-Final the source of truth on origin (force push).
# Use this to clear "Can't push refs to remote" and any sync conflicts.
# Run from repo root. You may be prompted for GitHub auth.

set -e
BRANCH="APP-Production-Final"
echo "Force pushing local $BRANCH to origin (local is source of truth)..."
git push origin "$BRANCH" --force
echo "Done. Remote now matches this computer."
