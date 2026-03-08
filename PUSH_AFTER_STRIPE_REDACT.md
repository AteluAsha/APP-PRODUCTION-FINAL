# Push After Stripe Key Redaction – Commands to Run

History has been rewritten so **no Stripe API keys remain in any commit** on `APP-Production-Final`. The docs were redacted and every past commit was rewritten to use `[KEY_REDACTED_FOR_SECURITY]` instead of the real keys.

## 1. (Optional) Remove the backup ref from filter-branch

Filter-branch leaves a backup at `refs/original/refs/heads/APP-Production-Final`. Remove it so the old history can be garbage-collected and you avoid accidentally pushing the backup:

```bash
cd /Users/erindinsmore/Desktop/7chakras7days_app
git update-ref -d refs/original/refs/heads/APP-Production-Final
```

## 2. Force push to make remote match your cleaned history

Your local branch now has **different commit hashes** than the remote (history was rewritten). You must force push:

```bash
./sync-with-origin.sh
```

Or directly:

```bash
git push origin APP-Production-Final --force
```

## 3. If GitHub still blocks the push

- Wait a few minutes and try again (push protection can cache).
- Confirm the push only contains the rewritten branch (no other refs with old history).
- If you use branch protection rules, you may need to allow force pushes for this branch once, or use a temporary rule that allows it.

## Summary

| Step | Command |
|------|--------|
| Remove backup ref | `git update-ref -d refs/original/refs/heads/APP-Production-Final` |
| Force push | `./sync-with-origin.sh` or `git push origin APP-Production-Final --force` |

After a successful push, the remote will match your local branch and the old commits (with keys) will no longer be on GitHub.
