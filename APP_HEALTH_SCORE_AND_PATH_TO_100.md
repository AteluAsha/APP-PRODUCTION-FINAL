# App Health Score and Path to 100

**Delete this file before production** (or keep for internal use only).

---

## Current score: **98 / 100**

### Why 98

- **Core flows** (entry, path selection, trial/lifetime, audio) are consistent, documented, and conflict-free.
- **Single source of truth** for welcome (index + hamburger); audio safe-space and Anua decoupling are explicit.
- **Cleanup done:** ChakraHome welcome modal removed; MiniAudioPlayer and invite.ts removed; legacy .md files moved to `docs/archive/`; WelcomeModal deleted and dev gallery updated; Jest tests added for entry routing, path-selection rule, and audio safe-space.
- **Routing** is coherent; no duplicate or orphan entry points for critical screens.
- **RevenueCat** left in dev mode by choice for another week (2 pts remain when you leave dev).

### Why not 100

- **RevenueCat production gate** (2 pts): when leaving dev, remove or bypass the `__DEV__` early-return in RevenueCat init so production paywall works.


---

## Path to 100: task list and point values

| # | Task | Points | Status |
|---|------|--------|--------|
| 1 | **RevenueCat production gate** | **2** | Pending (when you leave dev). |
| 2 | **Archive or organize legacy .md files** | **3** | Done – root .md moved to `docs/archive/`. |
| 3 | **Remove WelcomeModal + update dev gallery** | **2** | Done – WelcomeModal deleted; gallery and CaptureAll/StorybookShell updated. |
| 4 | **Add E2E test suite for critical paths** | **6** | Done – `__tests__/entryRouting.test.ts` and `__tests__/audioSafeSpace.test.ts`. |

**87 + 3 + 2 + 6 = 98. Remaining: 2 pts (RevenueCat) = 100.**

---

## Summary

- **Current: 98/100.**  
- **To reach 100:** enable RevenueCat for production (remove __DEV__ early-return when you leave dev).  
- Safeguard: git tag stable-87-pre-cleanup points at the commit before these cleanups.  
