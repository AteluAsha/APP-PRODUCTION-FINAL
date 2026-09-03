/* eslint-env jest */
/**
 * Silent Background Vault – 28 tracks, Day 1 → Day 7.
 */

import * as fs from "fs"
import * as path from "path"

import { SANCTUARY_HOSTED_URLS } from "@/constants/sanctuaryHostedUrls"
import {
  SANCTUARY_TRACK_COUNT,
  buildSanctuaryDownloadManifest,
  hasSanctuaryCrystalBowl,
  hasSanctuaryTuningFork,
} from "@/constants/sanctuaryAudioManifest"
import {
  SANCTUARY_VAULT_TRACKS,
  isSanctuaryVaultAudioId,
} from "@/constants/sanctuaryVaultTracks"
import {
  getEmbodimentAssetFilenames,
  isBundledSanctuaryAudioId,
} from "@/constants/meditationAssetPack"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

describe("sanctuary hosted URL placeholders", () => {
  it("has exactly 28 Cloudflare R2 HTTPS URLs keyed by filename", () => {
    const keys = Object.keys(SANCTUARY_HOSTED_URLS)
    expect(keys).toHaveLength(SANCTUARY_TRACK_COUNT)
    expect(keys).toHaveLength(28)
    for (const filename of keys) {
      expect(filename.endsWith(".aac") || filename.endsWith(".mp3")).toBe(true)
      expect(SANCTUARY_HOSTED_URLS[filename]).toBe(
        `https://pub-8bca6c1eb390402899d44e670911141b.r2.dev/${filename}`,
      )
    }
  })
})

describe("sanctuary vault track order", () => {
  it("is Day 1 through Day 7 with all of a day before the next day", () => {
    expect(SANCTUARY_VAULT_TRACKS).toHaveLength(28)
    const days = SANCTUARY_VAULT_TRACKS.map((track) => track.day)
    expect(days[0]).toBe(1)
    expect(days[days.length - 1]).toBe(7)
  })

  it("starts Day 1 with embodiment, tuning fork, Head to Heart, then crystal bowl", () => {
    const day1 = SANCTUARY_VAULT_TRACKS.filter((track) => track.day === 1)
    expect(day1.map((track) => track.kind)).toEqual([
      "embodiment",
      "tuning_fork",
      "head_to_heart",
      "crystal_bowl",
    ])
  })

  it("Day 6 has all four tracks like every other day", () => {
    const day6 = SANCTUARY_VAULT_TRACKS.filter((track) => track.day === 6)
    expect(day6).toHaveLength(4)
    expect(day6.map((track) => track.kind)).toEqual([
      "embodiment",
      "tuning_fork",
      "head_to_heart",
      "crystal_bowl",
    ])
    expect(hasSanctuaryTuningFork(Chakra.THIRD_EYE)).toBe(true)
    expect(hasSanctuaryCrystalBowl(Chakra.THIRD_EYE)).toBe(true)
  })

  it("wires every track url from SANCTUARY_HOSTED_URLS", () => {
    for (const track of SANCTUARY_VAULT_TRACKS) {
      expect(track.url).toBe(SANCTUARY_HOSTED_URLS[track.filename])
    }
  })

  it("keeps hosted URLs, vault tracks, and Firebase manifest in lockstep", () => {
    const hostedKeys = Object.keys(SANCTUARY_HOSTED_URLS).sort()
    const vaultFilenames = [
      ...new Set(SANCTUARY_VAULT_TRACKS.map((track) => track.filename)),
    ].sort()
    expect(hostedKeys).toEqual(vaultFilenames)

    const manifestFilenames = buildSanctuaryDownloadManifest()
      .map((row) => row.storagePath.split("/").pop()!)
      .sort()
    expect(manifestFilenames).toEqual(vaultFilenames)
  })

  it("uses the refined Root MP3 and new crystal bowl for Day 1", () => {
    expect(getEmbodimentAssetFilenames(Chakra.ROOT)).toEqual([
      "Day1_RootDay_MasterEmbodiment_refined_AwkeningSoul.mp3",
    ])
    const rootCrystal = SANCTUARY_VAULT_TRACKS.find(
      (track) =>
        track.day === 1 &&
        track.kind === "crystal_bowl" &&
        track.chakra === Chakra.ROOT,
    )
    expect(rootCrystal?.filename).toBe(
      "Day1_CrystalBowlSoundBath_RootChakra_AwakeningSoul.mp3",
    )
    expect(chakraContent[Chakra.ROOT].soundBath.title).toBe(
      "Root Chakra - 396 Hz",
    )
    expect(
      SANCTUARY_HOSTED_URLS["Day1_ROOT_DAY_MASTER_EMBODIMENT_SoulSchool_MotherJJ.aac"],
    ).toBeUndefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day1_396hz_CrystalBowlSoundBath_Hero3.aac"],
    ).toBeUndefined()
  })

  it("uses the remastered Sacral MP3 for Day 2 master embodiment", () => {
    expect(getEmbodimentAssetFilenames(Chakra.SACRAL)).toEqual([
      "Day2_SacralChakraEmbodiment_SoulSchool.mp3",
    ])
    expect(chakraContent[Chakra.SACRAL].audioIntro.title).toBe(
      "Awakening The Authentic Self",
    )
    expect(chakraContent[Chakra.SACRAL].audioIntro.durationMs).toBe(2501492)
  })

  it("uses the Manipura MP3 for Day 3 master embodiment", () => {
    expect(getEmbodimentAssetFilenames(Chakra.SOLAR_PLEXUS)).toEqual([
      "DAY3_ManipuraEmbodiment_SoulSchool.mp3",
    ])
    expect(chakraContent[Chakra.SOLAR_PLEXUS].audioIntro.title).toBe(
      "Abundance & Accountability",
    )
  })

  it("uses the remastered Heart MP3 for Day 4 master embodiment", () => {
    expect(getEmbodimentAssetFilenames(Chakra.HEART)).toEqual([
      "Day4_HeartChakraEmbodiment_SoulSchool_Remastered.mp3",
    ])
    expect(chakraContent[Chakra.HEART].audioIntro.title).toBe("The Emerald Flame")
    expect(chakraContent[Chakra.HEART].audioIntro.durationMs).toBe(2820653)
  })

  it("uses the tagged Throat MP3 for Day 5 master embodiment", () => {
    expect(getEmbodimentAssetFilenames(Chakra.THROAT)).toEqual([
      "Day5_ThroatChakra_SoulSchool_TAGGED.mp3",
    ])
    expect(chakraContent[Chakra.THROAT].audioIntro.title).toBe(
      "The Power To Speak",
    )
  })

  it("uses one Ajna master MP3 for Day 6", () => {
    expect(getEmbodimentAssetFilenames(Chakra.THIRD_EYE)).toEqual([
      "Day6_Ajna_MasterEmbodiment_SoulSchool_TAGGED.mp3",
    ])
    expect(chakraContent[Chakra.THIRD_EYE].audioIntro.title).toBe(
      "The Third Eye Awakens",
    )
    expect(
      SANCTUARY_HOSTED_URLS["Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac"],
    ).toBeUndefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day6_852hz_ChakraBowl_Medittion_Audio.aac"],
    ).toBeUndefined()
  })

  it("uses remastered AwakeningSoul crystal bowl MP3s for Days 2–7", () => {
    expect(
      SANCTUARY_HOSTED_URLS["Day2_CrystalBowlSoundBacth_AwakeningSoul.mp3"],
    ).toBeDefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day4_CrystalBowl_AwakeningSoul_v2.mp3"],
    ).toBeDefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day4_CrystalBowlSoundBath_AwakeningSoul.mp3"],
    ).toBeUndefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day6_CrystalBowlSoundBath_AwakeningSoul.mp3"],
    ).toBeDefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day2_417hz_1Hour_CrystalBowl_SoundBath.aac"],
    ).toBeUndefined()
    expect(
      SANCTUARY_HOSTED_URLS["Day7_963_Hertz_CrystalBowlMeditation.aac"],
    ).toBeUndefined()
    expect(chakraContent[Chakra.SACRAL].soundBath.durationMs).toBe(3719477)
  })

  it("uses the tagged Crown MP3 for Day 7 master embodiment", () => {
    expect(getEmbodimentAssetFilenames(Chakra.CROWN)).toEqual([
      "Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool__TAGGED_.mp3",
    ])
    expect(chakraContent[Chakra.CROWN].audioIntro.title).toBe(
      "The Meadow of The Soul",
    )
    expect(
      SANCTUARY_HOSTED_URLS[
        "Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool.aac"
      ],
    ).toBeUndefined()
  })
})

describe("bundled sanctuary audio ids", () => {
  it("recognizes all four sanctuary families", () => {
    expect(isBundledSanctuaryAudioId("embodiment_root")).toBe(true)
    expect(isSanctuaryVaultAudioId("embodiment_root")).toBe(true)
    expect(isBundledSanctuaryAudioId("crystal_bowl_heart_Day4.aac")).toBe(true)
  })
})

describe("vault downloader source", () => {
  const root = path.join(__dirname, "..")

  it("is started from root layout on every app open", () => {
    const layout = fs.readFileSync(path.join(root, "app/_layout.tsx"), "utf8")
    expect(layout).toContain("subscribeSanctuaryVaultSync")
    expect(layout).toContain("VaultSyncKeepAwake")
  })
})
