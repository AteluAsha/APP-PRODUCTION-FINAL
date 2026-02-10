# Pre-compression asset backup

**Do not delete this folder.**

This is a full copy of `./assets` from before image compression. It is the safety net for restoring originals if needed after running `scripts/compress-assets.js`.

- **Not included in builds** – Backups live here (android/_backups/). EAS ignores this folder so it is never uploaded or bundled.
- **Keep in the repo** – This folder is intentionally committed so the backup is versioned and safe.
- **Never delete** – Preserve this folder; do not remove it for cleanup or size savings.
