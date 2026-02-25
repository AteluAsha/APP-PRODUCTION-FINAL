# Large File Audit – Project-Wide

**Date:** Feb 2026  
**Goal:** Identify remaining heavy files to get total app size under 200 MB.

---

## 1. Top 20 Largest Files (excluding node_modules & .git)

| Size (MB) | File path                                                                     |
| --------- | ----------------------------------------------------------------------------- |
| 23.34     | ./ios/Pods/hermes-engine-artifacts/hermes-ios-0.76.9-debug.tar.gz             |
| 19.06     | ./app/backups/assets/images/heartlocation.png                                 |
| 18.68     | ./dist/assets/a4524a6ea5bbbec81314fdf192400fab                                |
| 16.39     | ./ios/Pods/hermes-engine-artifacts/hermes-ios-0.76.9-release.tar.gz           |
| 13.45     | ./ios/Pods/hermes-engine/destroot/.../xros-arm64_x86_64-simulator/.../hermes  |
| 13.05     | ./ios/Pods/hermes-engine/destroot/.../macosx/hermes.framework/.../hermes      |
| 13.01     | ./ios/Pods/hermes-engine/destroot/.../ios-arm64_x86_64-simulator/.../hermes   |
| 13.00     | ./ios/Pods/hermes-engine/destroot/.../ios-arm64_x86_64-maccatalyst/.../hermes |
| 12.06     | ./app/backups/assets/images/throatlocation.png                                |
| 12.06     | ./app/backups/assets/images/crownlocation.png                                 |
| 11.78     | ./dist/assets/d5498b5c1626c135009793df45504136                                |
| 11.31     | ./dist/assets/a83a5b0fc560864184cc5e56da0be4d4                                |
| 11.10     | ./ios/Pods/hermes-engine/destroot/bin/hermes                                  |
| 10.06     | ./dist/assets/36f2ffa6e42ff22cb637730b16533cda                                |
| 10.06     | ./app/backups/assets/images/solarlocation.png                                 |
| 9.06      | ./app/backups/assets/images/7header.png                                       |
| 8.79      | ./dist/assets/b473b387efbfcd1197a4dcbe7407b3f7                                |
| 8.06      | ./app/backups/assets/images/sacrallocation.png                                |
| 8.06      | ./app/backups/assets/audio/root-erin-1.mp3                                    |
| 8.05      | ./dist/assets/c6588d3d22ed92221b874f9df3f28d6e                                |

---

## 2. ./assets/audio

| Total / File               | Size       |
| -------------------------- | ---------- |
| **Total (./assets/audio)** | **8.8 MB** |
| root-erin-1.mp3            | 7.53 MB    |
| day1singingbowl.mp3        | 0.71 MB    |
| day1tuningfork.mp3         | 0.38 MB    |
| root-ethan-1.mp3           | 0.20 MB    |

**Note:** You mentioned audio will run through Firebase; once that’s live, these local placeholders could be removed or replaced with short stubs, saving most of the 8.8 MB.

---

## 3. Video Files (.mp4, .mov, etc.)

**Result:** **None found** in the project (excluding node_modules).  
No .mp4, .mov, .avi, or .mkv in `android/`, `ios/`, or elsewhere.

---

## 4. Large Files in android/ and ios/

### android/

- **Folder total:** ~896 KB.
- **Largest:** mipmap launcher webps (~0.21 MB max). No large binaries or videos.

### ios/

- **Folder total:** ~163 MB (mostly **Pods**, including Hermes engine).
- **Largest items:**
  - hermes-engine-artifacts: debug + release .tar.gz (~23 MB + ~16 MB).
  - hermes-engine/destroot: multiple hermes binaries (6–13 MB each) for different architectures/simulators.
- **No video files** in ios/.

---

## 5. Folder Totals (for context)

| Folder               | Size        | Notes                                              |
| -------------------- | ----------- | -------------------------------------------------- |
| **assets** (current) | **37 MB**   | Images + audio after compression.                  |
| **assets/audio**     | **8.8 MB**  | See section 2.                                     |
| **app/backups**      | **195 MB**  | Pre-compression backup; excluded from EAS builds.  |
| **dist**             | **184 MB**  | Build output/cache; typically not in app bundle.   |
| **node_modules**     | **711 MB**  | Not shipped as-is; EAS uses clean install.         |
| **ios**              | **163 MB**  | Largely Pods (Hermes, etc.); part of native build. |
| **android**          | **~0.9 MB** | Small; launcher assets only.                       |

---

## 6. Summary for Getting Under 200 MB

- **Already optimized:** Current **./assets** is ~37 MB (images compressed to ~26 MB + ~9 MB audio).
- **Heavy but expected:** **ios/Pods** (Hermes, etc.) – required for the iOS build; size is per-architecture in the final IPA.
- **Not in app bundle:** **app/backups** (in .easignore), **dist** (build artifact), **node_modules** (reinstalled on build).
- **Actionable:**
  - **assets/audio (~8.8 MB):** When audio is served from Firebase, remove or shrink local audio to cut most of this.
  - **dist:** Safe to delete locally (`rm -rf dist`) to free 184 MB on disk; it will be recreated on build and doesn’t affect the 200 MB app target.

No video files or unexpected large binaries were found in `android/` or `ios/`.
