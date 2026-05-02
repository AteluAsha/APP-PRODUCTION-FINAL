/**
 * Static Visual Gallery Configuration
 *
 * Maps all 20 screens to their entry-point files for snapshot generation.
 * This is a simple hardcoded mapping for the "Museum Gallery" approach.
 *
 * To Use:
 * - Each screen entry contains the component path and required props
 * - Snapshots will be saved to /assets/dev-gallery/snapshots/
 * - All images are gitignored (temporary gallery only)
 *
 * To Remove:
 * 1. Delete assets/dev-gallery/ folder
 * 2. Remove from .gitignore
 * 3. Done - zero impact on production code
 */

import { Chakra } from "@/types/chakras/Chakra"

export interface ScreenEntry {
  id: string
  label: string
  type: "trial1" | "trial2" | "threshold" | "sanctuary" | "lifetime" | "entry"
  componentPath: string
  props?: Record<string, any>
  expectedFileName: string // For saved snapshot
}

export const GALLERY_SCREENS: ScreenEntry[] = [
  // TRIAL 1: All 7 Chakra Days
  {
    id: "trial1-root",
    label: "Trial 1: Root Chakra (Day 1)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.ROOT },
    expectedFileName: "trial1-root-day1.png",
  },
  {
    id: "trial1-sacral",
    label: "Trial 1: Sacral Chakra (Day 2)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.SACRAL },
    expectedFileName: "trial1-sacral-day2.png",
  },
  {
    id: "trial1-solar",
    label: "Trial 1: Solar Plexus Chakra (Day 3)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.SOLAR_PLEXUS },
    expectedFileName: "trial1-solar-day3.png",
  },
  {
    id: "trial1-heart",
    label: "Trial 1: Heart Chakra (Day 4)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.HEART },
    expectedFileName: "trial1-heart-day4.png",
  },
  {
    id: "trial1-throat",
    label: "Trial 1: Throat Chakra (Day 5)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.THROAT },
    expectedFileName: "trial1-throat-day5.png",
  },
  {
    id: "trial1-third-eye",
    label: "Trial 1: Third Eye Chakra (Day 6)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.THIRD_EYE },
    expectedFileName: "trial1-third-eye-day6.png",
  },
  {
    id: "trial1-crown",
    label: "Trial 1: Crown Chakra (Day 7)",
    type: "trial1",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.CROWN },
    expectedFileName: "trial1-crown-day7.png",
  },

  // TRIAL 2: All 7 Chakra Days (same structure)
  {
    id: "trial2-root",
    label: "Trial 2: Root Chakra (Day 1)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.ROOT },
    expectedFileName: "trial2-root-day1.png",
  },
  {
    id: "trial2-sacral",
    label: "Trial 2: Sacral Chakra (Day 2)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.SACRAL },
    expectedFileName: "trial2-sacral-day2.png",
  },
  {
    id: "trial2-solar",
    label: "Trial 2: Solar Plexus Chakra (Day 3)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.SOLAR_PLEXUS },
    expectedFileName: "trial2-solar-day3.png",
  },
  {
    id: "trial2-heart",
    label: "Trial 2: Heart Chakra (Day 4)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.HEART },
    expectedFileName: "trial2-heart-day4.png",
  },
  {
    id: "trial2-throat",
    label: "Trial 2: Throat Chakra (Day 5)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.THROAT },
    expectedFileName: "trial2-throat-day5.png",
  },
  {
    id: "trial2-third-eye",
    label: "Trial 2: Third Eye Chakra (Day 6)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.THIRD_EYE },
    expectedFileName: "trial2-third-eye-day6.png",
  },
  {
    id: "trial2-crown",
    label: "Trial 2: Crown Chakra (Day 7)",
    type: "trial2",
    componentPath: "@/components/chakras/ChakraTemplate",
    props: { chakra: Chakra.CROWN },
    expectedFileName: "trial2-crown-day7.png",
  },

  // THRESHOLDS: Waiting, Goodbye, Commitment Gate (Welcome/path selection is entry-welcome / WelcomeScreen)
  {
    id: "threshold-waiting",
    label: "Threshold: Waiting Screen",
    type: "threshold",
    componentPath: "@/components/chakras/WaitingScreen",
    props: {
      onPreviewPress: () => {},
    },
    expectedFileName: "threshold-waiting.png",
  },
  {
    id: "threshold-goodbye",
    label: "Threshold: Goodbye Modal",
    type: "threshold",
    componentPath: "@/components/chakras/GoodbyeModal",
    props: {
      visible: true,
      onClose: () => {},
      chakraDay: 0, // After Root Chakra
    },
    expectedFileName: "threshold-goodbye.png",
  },
  {
    id: "threshold-commitment-gate",
    label: "Threshold: Commitment Gate (Paywall)",
    type: "threshold",
    componentPath: "@/components/chakras/CommitmentGate",
    props: {
      onComplete: () => {},
    },
    expectedFileName: "threshold-commitment-gate.png",
  },

  // SANCTUARY: Post-Paywall Screens
  {
    id: "sanctuary-chakra-hub",
    label: "Sanctuary: Chakra Hub",
    type: "sanctuary",
    componentPath: "@/app/(chakras)/ChakraHub",
    props: {},
    expectedFileName: "sanctuary-chakra-hub.png",
  },
  {
    id: "sanctuary-community",
    label: "Sanctuary: Community Halls",
    type: "sanctuary",
    componentPath: "@/app/CommunityHalls",
    props: {},
    expectedFileName: "sanctuary-community.png",
  },

  // ENTRY: Path selection, date selection, trial home
  {
    id: "entry-welcome",
    label: "Entry: WelcomeScreen (Path Selection)",
    type: "entry",
    componentPath: "@/app/(chakras)/WelcomeScreen",
    props: {},
    expectedFileName: "entry-welcome-path-selection.png",
  },
  {
    id: "entry-date-selection",
    label: "Entry: DateSelection",
    type: "entry",
    componentPath: "@/app/(chakras)/DateSelection",
    props: {},
    expectedFileName: "entry-date-selection.png",
  },
  {
    id: "entry-chakra-home",
    label: "Entry: ChakraHome (Trial Home)",
    type: "entry",
    componentPath: "@/app/(chakras)/ChakraHome",
    props: {},
    expectedFileName: "entry-chakra-home-trial.png",
  },

  // LIFETIME: Additional screens
  {
    id: "lifetime-audio-player",
    label: "Lifetime: AudioPlayer",
    type: "lifetime",
    componentPath: "@/app/AudioPlayer",
    props: {},
    expectedFileName: "lifetime-audio-player.png",
  },
  {
    id: "lifetime-audio-library",
    label: "Lifetime: AudioLibrary",
    type: "lifetime",
    componentPath: "@/app/(chakras)/AudioLibrary",
    props: {},
    expectedFileName: "lifetime-audio-library.png",
  },
  {
    id: "lifetime-sound-bath",
    label: "Lifetime: SoundBath",
    type: "lifetime",
    componentPath: "@/app/(chakras)/SoundBath",
    props: {},
    expectedFileName: "lifetime-sound-bath.png",
  },
  {
    id: "lifetime-head-to-heart",
    label: "Lifetime: HeadToHeart",
    type: "lifetime",
    componentPath: "@/app/(chakras)/HeadToHeart",
    props: {},
    expectedFileName: "lifetime-head-to-heart.png",
  },
  {
    id: "lifetime-chakras101",
    label: "Lifetime: Chakras101",
    type: "lifetime",
    componentPath: "@/app/(chakras)/Chakras101",
    props: {},
    expectedFileName: "lifetime-chakras101.png",
  },
  {
    id: "lifetime-energy-exchange",
    label: "Lifetime: EnergyExchange",
    type: "lifetime",
    componentPath: "@/app/(chakras)/EnergyExchange",
    props: {},
    expectedFileName: "lifetime-energy-exchange.png",
  },
  {
    id: "lifetime-gallery",
    label: "Lifetime: GalleryOfGnosis",
    type: "lifetime",
    componentPath: "@/app/(chakras)/GalleryOfGnosis",
    props: {},
    expectedFileName: "lifetime-gallery-of-gnosis.png",
  },
  {
    id: "lifetime-notes",
    label: "Lifetime: NotesAlongTheWay",
    type: "lifetime",
    componentPath: "@/app/(chakras)/NotesAlongTheWay",
    props: {},
    expectedFileName: "lifetime-notes-along-the-way.png",
  },
]

export const TOTAL_SCREENS = GALLERY_SCREENS.length
