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
    poseDescription: string
  }
  soundBath: {
    title: string
    subtitle: string
    body: string
    soundBowlAudio: AVPlaybackSource
    tuningForkAudio: AVPlaybackSource
  }
  goodbye: {
    content: string
    chakraImage: ImageSourcePropType
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
