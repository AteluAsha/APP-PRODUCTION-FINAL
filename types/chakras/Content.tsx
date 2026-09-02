import { type AVPlaybackSource } from "expo-av"
import { type ImageSourcePropType } from "react-native"

export type TextSegment = {
  title?: string
  text: string
  className?: string
}

export type Content = {
  chakraHeaderImage: ImageSourcePropType
  header: {
    headerBackground: ImageSourcePropType
    chakraImageSizePx: number
    textLine1: string
    textLine2: string
    textLine3: string
  }
  overview: string
  sanskrit: string
  locationImage: ImageSourcePropType
  soulSchool: string
  dailyActivity: string
  wordsOfWisdom: string
  affirmationText: string
  audioIntro: {
    title: string
    author: string
    durationMs: number
    source: AVPlaybackSource
  }
  audioOutro: {
    title: string
    author: string
    durationMs: number
    source: AVPlaybackSource
  }
  integration: string
  yoga: {
    chakraDay: string
    pose: string
    essence: string
    body: string
    somaticCue: string
    /** Optional URL to open for pose visual (e.g. Pocket Yoga or video). */
    poseUrl?: string
  }
  soundBath: {
    title: string
    subtitle: string
    helpsWith: string
    realWorldEffect: string
    body: string
    /** Vault track length in ms (ffprobe on remastered MP3). */
    durationMs: number
    tuningForkAudio: AVPlaybackSource
    /** Bundled fallback when Firebase crystal bowl is unavailable */
    crystalBowlAudio: AVPlaybackSource
  }
  goodbye: {
    content: string
    chakraImage: ImageSourcePropType
    /** Unique closing message per day (e.g. "Wonderful work, lovely soul. Your roots are stronger.") */
    closingMessage?: string
    /** Subline (e.g. "Tomorrow, the Sacral invites you to feel and flow.") */
    closingSubline?: string
  }
  elements: {
    background: ImageSourcePropType
    sanskrit: string
    body: string
    stones: string
    smells: string
    colors: string
    foods: string
    sacredgeometry: string
    principle: string
  }
  pills: {
    frequency: {
      pillTitle: string
      hertz: string
      description: string
      /** Modal title (e.g. "Root Chakra • 396 Hz") for the hertz pill pop-up */
      modalTitle: string
      /** Full modal body for the hertz pill pop-up */
      modalContent: string
    }
    identityStatement: {
      pillTitle: string
      title: string
      description: string
    }
    seedMantra: {
      pillTitle: string
      title: string
      description: string
    }
  }
  headtoheart: {
    title: string
    subtitle: string
    description: TextSegment[]
    masterKey: { text: string }
    dailyActivityTitle: string
    dailyActivitySubline: string
    audio: {
      title: string
      author: string
      duration: number
      source: AVPlaybackSource
      authorColor: string
    }
    dailyActivity: TextSegment[]
  }
}
