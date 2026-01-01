import * as Haptics from "expo-haptics"

export enum HapticStrength {
  Light = "light",
  Medium = "medium",
  Soft = "soft",
}

const HapticStrengthMap: Record<HapticStrength, Haptics.ImpactFeedbackStyle> = {
  [HapticStrength.Light]: Haptics.ImpactFeedbackStyle.Light,
  [HapticStrength.Medium]: Haptics.ImpactFeedbackStyle.Medium,
  [HapticStrength.Soft]: Haptics.ImpactFeedbackStyle.Soft,
}

export const addHapticFeedback = (
  strength: HapticStrength = HapticStrength.Medium,
) => {
  if (process.env.EXPO_OS === "ios") {
    // Map the abstract HapticStrength to the actual Haptics.ImpactFeedbackStyle
    Haptics.impactAsync(HapticStrengthMap[strength])
  }
}
