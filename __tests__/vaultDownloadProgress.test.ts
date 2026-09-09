/* eslint-env jest */
import {
    buildVaultTrackProgress,
    formatDownloadingHeadline,
    formatMegabytes,
    formatVaultCueLabel,
    formatVaultDownloadLine,
    mergeVaultTrackTotal,
    stableVaultDownloadPercent,
    vaultDownloadPercent,
} from "@/src/utils/vaultDownloadProgress"
import * as fs from "fs"
import * as path from "path"

describe("vault download progress copy", () => {
    it("formats Day 1 embodiment size as percent and megabytes", () => {
        const total = 122235907
        expect(formatMegabytes(total)).toBe("117 MB")
        expect(vaultDownloadPercent(0, total)).toBe(0)
        expect(vaultDownloadPercent(total / 2, total)).toBe(50)
        expect(formatVaultDownloadLine(0, total)).toBe("0% · 0 MB of 117 MB")
        expect(formatVaultDownloadLine(28 * 1024 * 1024, total)).toContain("%")
        expect(formatVaultDownloadLine(28 * 1024 * 1024, total)).toContain("of 117 MB")
        expect(formatDownloadingHeadline(28 * 1024 * 1024, total)).toBe(
            "Downloading… 24%",
        )
    })

    it("falls back when total is unknown", () => {
        expect(formatVaultDownloadLine(0, 0)).toBe("Starting download…")
        expect(formatVaultDownloadLine(5 * 1024 * 1024, 0)).toBe("5.0 MB downloaded")
        expect(vaultDownloadPercent(10, 0)).toBeNull()
        expect(formatDownloadingHeadline(0, 0)).toBe("Downloading…")
    })

    it("stable percent never jumps backward for the same track", () => {
        const id = "embodiment_root"
        const total = 122_235_907
        expect(stableVaultDownloadPercent(id, 10_000_000, 150_000_000)).toBe(7)
        expect(stableVaultDownloadPercent(id, 12_000_000, total)).toBe(10)
        expect(stableVaultDownloadPercent(id, 8_000_000, total)).toBe(10)
    })

    it("stable percent stays below 100 until the file is fully written", () => {
        const id = "embodiment_root_b"
        const total = 122_235_907
        const at97 = Math.floor(total * 0.97)
        expect(stableVaultDownloadPercent(id, at97, total)).toBe(97)
        expect(stableVaultDownloadPercent(id, total - 9000, total)).toBe(99)
        expect(stableVaultDownloadPercent(id, total, total)).toBe(100)
    })

    it("per-track progress never borrows another track's total", () => {
        const embodiment = "embodiment_root"
        const fork = "tuning_fork_root_Day1_396hz_plus256_TuningFork.aac"
        const embodimentTotal = 122_235_907
        const forkTotal = 4_500_000

        let progress: Record<string, { bytesWritten: number; bytesTotal: number }> =
            {}

        progress = {
            ...progress,
            [fork]: buildVaultTrackProgress(fork, forkTotal, forkTotal, progress),
        }
        expect(vaultDownloadPercent(forkTotal, forkTotal)).toBe(100)

        const next = buildVaultTrackProgress(embodiment, 0, 0, progress)
        expect(next.bytesTotal).toBe(0)
        expect(next.bytesWritten).toBe(0)

        const seeded = buildVaultTrackProgress(
            embodiment,
            5_000_000,
            embodimentTotal,
            { ...progress, [embodiment]: next },
        )
        expect(seeded.bytesTotal).toBe(embodimentTotal)
        expect(vaultDownloadPercent(seeded.bytesWritten, seeded.bytesTotal)).toBe(4)

        const forkStill = progress[fork]
        expect(vaultDownloadPercent(forkStill.bytesWritten, forkStill.bytesTotal)).toBe(
            100,
        )
        expect(
            mergeVaultTrackTotal(embodiment, 0, {
                ...progress,
                [embodiment]: seeded,
            }),
        ).toBe(embodimentTotal)
    })

    it("labels a rushed play button as queuing with percent", () => {
        expect(
            formatVaultCueLabel({
                isThisTrack: false,
                status: "downloading",
                bytesWritten: 0,
                bytesTotal: 10_000_000,
                idle: "396 Hz",
            }),
        ).toBe("396 Hz")
        expect(
            formatVaultCueLabel({
                isThisTrack: true,
                status: "downloading",
                bytesWritten: 0,
                bytesTotal: 0,
                idle: "396 Hz",
            }),
        ).toBe("Queuing…")
        expect(
            formatVaultCueLabel({
                isThisTrack: true,
                status: "downloading",
                bytesWritten: 5_000_000,
                bytesTotal: 10_000_000,
                idle: "396 Hz",
            }),
        ).toBe("Queuing… 50%")
        expect(
            formatVaultCueLabel({
                isThisTrack: true,
                status: "paused",
                bytesWritten: 1,
                bytesTotal: 10,
                idle: "396 Hz",
            }),
        ).toBe("Paused — resuming…")
    })
})

describe("vault downloader reports byte progress", () => {
    it("wires the resumable progress callback and HEAD size probe", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "src/services/sanctuaryVaultDownloader.ts"),
            "utf8",
        )
        expect(src).toContain("totalBytesWritten")
        expect(src).toContain("reportDownloadProgress")
        expect(src).toContain("probeRemoteByteLength")
        expect(src).toContain("bytesTotal")
        expect(src).toContain("SEEDED_EXPECTED_BYTES")
        expect(src).toContain("KIND_FALLBACK_BYTES")
        expect(src).toContain("readyIds")
        expect(src).toContain("progressByAudioId")
        expect(src).toContain("buildVaultTrackProgress")
        expect(src).not.toContain("state.bytesTotal")
        expect(src).toContain("all 28 tracks stored — rechecking")
        expect(src).not.toMatch(
            /next === 'background' \|\| next === 'inactive'/,
        )
    })
})

describe("progressive vault playback", () => {
    it("AudioRow uses course-only playback, not Audio Library or generic vault", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/AudioRow.tsx"),
            "utf8",
        )
        expect(src).toContain("playSanctuaryTrack")
        expect(src).toContain("prepareSanctuaryTrack")
        expect(src).not.toContain("openMusicRoomAtIndex")
        expect(src).toContain("VaultDownloadLine")
        expect(src).toContain("SANCTUARY_READY_BORDER")
        expect(src).not.toMatch(/await ensureSanctuaryTrack/)
    })

    it("VaultFirstLoadPanel reads per-track progress, not global vault bytes", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/VaultFirstLoadPanel.tsx"),
            "utf8",
        )
        expect(src).toContain("progressByAudioId")
        expect(src).not.toMatch(/useSanctuaryVaultStore\(\(s\) => s\.bytesWritten\)/)
    })

    it("openFullPlayer only closes; playSanctuaryTrack owns navigation", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "utils/openFullPlayer.ts"),
            "utf8",
        )
        expect(src).toContain("closeFullPlayerAndLeave")
        expect(src).not.toContain("playSanctuaryTrack")
        const play = fs.readFileSync(
            path.join(__dirname, "..", "utils/sanctuaryPlayback.ts"),
            "utf8",
        )
        expect(play).toContain("playSanctuaryTrack")
        const auto = fs.readFileSync(
            path.join(__dirname, "..", "src/services/vaultAutoPlayback.ts"),
            "utf8",
        )
        expect(auto).not.toContain("router.push('/AudioPlayer')")
        expect(auto).toContain('applySanctuarySource')
        expect(auto).toContain("setSource")
    })

    it("AudioPlayer polls vault while loading and closes safely", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/AudioPlayer.tsx"),
            "utf8",
        )
        expect(src).toContain("peekPlayableVaultUri")
        expect(src).toContain("poll until the vault")
        expect(src).toContain("teardownPlayerForLeave")
        expect(src).toContain("requestLeavePlayer")
        expect(src).toContain("beforeRemove")
        expect(src).toContain("silenceAllAudio")
    })

    it("crystal bowl prepare refuses incomplete vault files", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "src/utils/crystalBowlPlayback.ts"),
            "utf8",
        )
        expect(src).toContain("peekSanctuaryTrack")
        expect(src).not.toContain("ensureSanctuaryTrack")
        expect(src).toContain("This track is not on this device")
    })

    it("end-of-day presence uses word beats, not a frozen swirl overlay", () => {
        const src = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "components/chakras/BreathIntegrationScreen.tsx",
            ),
            "utf8",
        )
        expect(src).toContain("getEndOfDayBeats")
        expect(src).toContain("showChakra")
        expect(src).toContain("schedule(finish, 1100)")
        expect(src).not.toContain("BREATH_HOLD_MS")
        expect(src).not.toContain("LightSwirl")
    })

    it("goodbye reveals as a second stage, then opens the gallery chamber", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/GoodbyeModal.tsx"),
            "utf8",
        )
        expect(src).toContain("BreathIntegrationScreen")
        expect(src).toContain("getGoodbyeField")
        expect(src).toContain("GALLERY_GOODBYE_DOOR")
        expect(src).toContain("GalleryOfGnosis?chakra=")
        expect(src).toContain('setStage("goodbye")')
        expect(src).not.toContain("Open Your Gift")
        expect(src).not.toContain("Claim Your Chakra Card")
        expect(src).not.toContain("GiftChakra")
        expect(src).not.toContain("breathLayerOpacity")
        expect(src).not.toContain("withDelay")
        expect(src).toContain("silenceAllAudio")
        expect(src).not.toContain("if (!isVisible && stage !== \"presence\")")
    })

    it("Audio Library opens music-room player for all 28 tracks", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/AudioLibrary.tsx"),
            "utf8",
        )
        expect(src).toContain("openMusicRoomAtIndex")
        expect(src).toContain("MUSIC_ROOM_TRACK_DEFS")
        expect(src).not.toContain("requestVaultPlayback")
        expect(src).not.toContain("ensureSanctuaryTrack")
    })
})

describe("tuning fork and crystal bowl first tap", () => {
    it("SoundBath rushes incomplete audio instead of blocking the first tap", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/SoundBath.tsx"),
            "utf8",
        )
        expect(src).toContain("useInlineTuningFork")
        expect(src).toContain("rushSanctuaryTrack")
        expect(src).not.toContain("ensureSanctuaryTrack")
        expect(src).toContain("MusicRoomTrackButton")
        expect(src).not.toContain("handleTuningForkSeek")
    })

    it("Drop In rushes incomplete audio instead of blocking the first tap", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/DropInButton.tsx"),
            "utf8",
        )
        expect(src).toContain("useInlineTuningFork")
        expect(src).not.toContain("ensureSanctuaryTrack")
        expect(src).toContain("useVaultTrackDownloadUi")
    })

    it("Android hardware back never exits the app", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/_layout.tsx"),
            "utf8",
        )
        expect(src).toContain("handleAndroidHardwareBack")
        expect(src).toContain("isAppCrashOverlayVisible")
        expect(src).toContain("isAppErrorRecoveryActive")
        const helpers = fs.readFileSync(
            path.join(__dirname, "..", "utils/navigationHelpers.ts"),
            "utf8",
        )
        expect(helpers).toContain("Never exits the app")
        expect(helpers).toContain("goToChakraHubRoot")
        expect(helpers).toContain("isAudioPlayerPath")
        expect(helpers).toContain("closeFullPlayerAndLeave")
        expect(helpers).toContain("navigateBackWithCleanup")
        expect(helpers).toContain("runAndroidBackCleanup")
        expect(helpers).toContain("runAndroidHardwareBackOverrides")
    })
})

describe("Android lock-screen playback is a media foreground service", () => {
    it("does not reintroduce Play Asset Delivery", () => {
        const config = fs.readFileSync(
            path.join(__dirname, "..", "app.config.js"),
            "utf8",
        )
        expect(config).not.toMatch(/Play Asset Delivery|assetPacks|play-asset-delivery/i)
        const downloader = fs.readFileSync(
            path.join(__dirname, "..", "src/services/sanctuaryVaultDownloader.ts"),
            "utf8",
        )
        expect(downloader).not.toMatch(/Play Asset Delivery|asset.?pack/i)
    })

    it("declares FOREGROUND_SERVICE_MEDIA_PLAYBACK in app config and the local manifest", () => {
        const config = fs.readFileSync(
            path.join(__dirname, "..", "app.config.js"),
            "utf8",
        )
        expect(config).toContain("FOREGROUND_SERVICE")
        expect(config).toContain("FOREGROUND_SERVICE_MEDIA_PLAYBACK")
        expect(config).toContain("expo-audio")
        expect(config).toContain("withAndroidMediaPlayback")

        const manifest = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "android/app/src/main/AndroidManifest.xml",
            ),
            "utf8",
        )
        expect(manifest).toContain("FOREGROUND_SERVICE_MEDIA_PLAYBACK")
        expect(manifest).toContain(
            "expo.modules.meditationplayback.MeditationPlaybackService",
        )
    })

    it("healing playback uses expo-audio plus the media FGS", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "src/utils/singleActiveSound.ts"),
            "utf8",
        )
        expect(src).toContain("createAudioPlayer")
        expect(src).toContain("await startMeditationPlaybackService")
        expect(src).toContain("createExclusiveSoundViaAv")
        expect(src).toMatch(
            /pauseAsync: async \(\) => \{[\s\S]*stopMeditationPlaybackService\(\)/,
        )
        const seekBlock = src.match(
            /setPositionAsync: async \(positionMs: number\) => \{[\s\S]*?\n        \},/,
        )
        expect(seekBlock?.[0]).toContain("await player.seekTo(seconds)")
        expect(seekBlock?.[0]).toContain("verifyLanded")
        expect(seekBlock?.[0]).toContain("player.pause()")
        expect(src).toContain("player?.pause()")
    })

    it("lets ExoPlayer seek raw AAC instead of restarting at 0", () => {
        const native = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "node_modules/expo-audio/android/src/main/java/expo/modules/audio/AudioModule.kt",
            ),
            "utf8",
        )
        expect(native).toContain("FLAG_ENABLE_CONSTANT_BITRATE_SEEKING_ALWAYS")
        expect(native).toContain("setConstantBitrateSeekingEnabled(true)")
        const patch = fs.readFileSync(
            path.join(__dirname, "..", "patches/expo-audio+0.4.9.patch"),
            "utf8",
        )
        expect(patch).toContain("FLAG_ENABLE_CONSTANT_BITRATE_SEEKING_ALWAYS")
    })

    it("Android back from the full player stops audio before returning to the course day", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "utils/openFullPlayer.ts"),
            "utf8",
        )
        expect(src).toContain("closeFullPlayerAndLeave")
        expect(src).toContain("await silenceAllAudio()")
        expect(src).toContain("persistResumeBookmark")
        expect(src).toContain("isAudioPlayerPath")
    })

    it("Sound Bath back stops inline tuning fork before leaving", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/SoundBath.tsx"),
            "utf8",
        )
        expect(src).toContain("useInlineTuningFork")
        expect(src).toContain("handleCloseSoundBath")
        expect(src).toContain("onXPress={handleCloseSoundBath}")
        expect(src).toContain("navigateBackWithCleanup")
        expect(src).toContain("mountedRef")
        expect(src).not.toContain("if (!isValidChakra(chakraParam)) return null")
    })

    it("Part II frequency pill uses TouchableOpacity (Android tap reliability)", () => {
        const pill = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/HealingPillTouchable.tsx"),
            "utf8",
        )
        expect(pill).toContain("TouchableOpacity")
        expect(pill).toContain('pointerEvents="none"')

        const part2 = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/TextButtonSection.tsx"),
            "utf8",
        )
        expect(part2).toContain("HealingPillTouchable")
        expect(part2).not.toContain("<Pressable")
    })

    it("course days use the combined wisdom overview panel", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/ChakraTemplate.tsx"),
            "utf8",
        )
        expect(src).toContain("WisdomOverviewSection")
        expect(src).not.toContain('<TextSection title="OVERVIEW"')
    })

    it("awaits notification permission and skips FGS when denied", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "modules/meditation-playback/index.ts"),
            "utf8",
        )
        expect(src).toContain("getPermissionsAsync")
        expect(src).toContain("requestPermissionsAsync")
        expect(src).toContain("if (!allowed) return")
        expect(src).toContain("export async function startMeditationPlaybackService")
        expect(src).not.toMatch(
            /void Notifications\.requestPermissionsAsync\(\)\.catch/,
        )
        const service = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "modules/meditation-playback/android/src/main/java/expo/modules/meditationplayback/MeditationPlaybackService.kt",
            ),
            "utf8",
        )
        expect(service).toContain("canPostNotifications")
        expect(service).toContain("areNotificationsEnabled")
        expect(service).toContain("stopSelf()")
    })

    it("does not declare unused CAMERA, storage, or exact-alarm permissions", () => {
        const config = fs.readFileSync(
            path.join(__dirname, "..", "app.config.js"),
            "utf8",
        )
        expect(config).not.toContain('"CAMERA"')
        expect(config).not.toContain('"SCHEDULE_EXACT_ALARM"')
        expect(config).not.toContain('"READ_EXTERNAL_STORAGE"')
        expect(config).not.toContain('"WRITE_EXTERNAL_STORAGE"')
        expect(config).not.toContain('"expo-camera"')
        expect(config).toContain("android.permission.READ_EXTERNAL_STORAGE")
        expect(config).toContain("android.permission.WRITE_EXTERNAL_STORAGE")
        expect(config).toContain("android.permission.SCHEDULE_EXACT_ALARM")
        expect(config).toContain("blockedPermissions")

        const manifest = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "android/app/src/main/AndroidManifest.xml",
            ),
            "utf8",
        )
        expect(manifest).not.toContain("READ_EXTERNAL_STORAGE")
        expect(manifest).not.toContain("WRITE_EXTERNAL_STORAGE")
        expect(manifest).not.toContain("SCHEDULE_EXACT_ALARM")
        expect(manifest).not.toContain("android.permission.CAMERA")
    })
})
