/**
 * Date Confirmation Modal
 *
 * Confirms the selected start date. Two buttons with gradient fill and fallback
 * backgroundColor so the box is always visible. Gradient adds depth and softens into the space.
 */

import React from "react"
import {
  Modal,
  View,
  Pressable,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { formatDate } from "@/utils/date"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { TOUCH } from "@/constants/layout"

interface DateConfirmationModalProps {
  visible: boolean
  selectedDateISO: string | null
  onConfirm: () => void
  onCancel: () => void
  offeringNumber?: 1 | 2
  isCourseMode?: boolean
}

export const DateConfirmationModal: React.FC<DateConfirmationModalProps> = ({
  visible,
  selectedDateISO,
  onConfirm,
  onCancel,
  offeringNumber = 1,
  isCourseMode = false,
}) => {
  const { width: screenWidth } = useWindowDimensions()
  if (!selectedDateISO) return null

  const cardWidth = Math.min(screenWidth - 48, 320)
  const dateStr = formatDate(new Date(selectedDateISO + "T00:00:00"))
  const confirmLabel = isCourseMode
    ? "Confirm start date"
    : offeringNumber === 2
      ? "Confirm 2nd offering"
      : "Confirm 1st offering"

  const buttonBorder = "rgba(135, 174, 115, 0.7)"
  const buttonFallbackBg = "rgba(135, 174, 115, 0.35)"
  const buttonGradientColors = [
    "rgba(168, 201, 154, 0.5)",
    "rgba(135, 174, 115, 0.35)",
    "rgba(100, 130, 90, 0.2)",
  ] as const

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.85)",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: cardWidth,
            padding: 24,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(135, 174, 115, 0.4)",
            backgroundColor: "rgba(20, 20, 20, 0.98)",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <AppText
            font="instrument-bold"
            size="lg"
            style={{
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Confirm Start Date
          </AppText>

          <View style={{ alignItems: "center", marginBottom: isCourseMode ? 16 : 8 }}>
            <AppText
              font="instrument-regular"
              size="base"
              style={{ color: "rgba(255,255,255,0.9)", textAlign: "center" }}
            >
              Your journey will begin on{" "}
            </AppText>
            <AppText
              font="instrument-bold"
              size="xl"
              style={{
                color: "rgba(168, 201, 154, 1)",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              {dateStr}
            </AppText>
          </View>

          {!isCourseMode && (
            <AppText
              font="instrument-regular"
              size="sm"
              style={{
                color: "rgba(255,255,255,0.7)",
                marginBottom: 16,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Two free trials of the course, as a gift. Use them wisely.
            </AppText>
          )}

          <View
            pointerEvents="box-none"
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 8,
              width: "100%",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            {Platform.OS === "android" ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    onCancel()
                  }}
                  hitSlop={TOUCH.hitSlop}
                  activeOpacity={TOUCH.activeOpacity}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <View
                    style={{
                      backgroundColor: buttonFallbackBg,
                      borderWidth: 1.5,
                      borderColor: buttonBorder,
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      minHeight: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[...buttonGradientColors]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                    />
                    <AppText font="instrument-medium" size="base" style={{ color: "#ffffff" }} numberOfLines={1}>
                      Change
                    </AppText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    onConfirm()
                  }}
                  hitSlop={TOUCH.hitSlop}
                  activeOpacity={TOUCH.activeOpacity}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <View
                    style={{
                      backgroundColor: buttonFallbackBg,
                      borderWidth: 1.5,
                      borderColor: buttonBorder,
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      minHeight: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[...buttonGradientColors]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                    />
                    <AppText font="instrument-semibold" size="base" style={{ color: "#ffffff" }} numberOfLines={1}>
                      {confirmLabel}
                    </AppText>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    onCancel()
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
                      backgroundColor: buttonFallbackBg,
                      borderWidth: 1.5,
                      borderColor: buttonBorder,
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 24,
                      minHeight: 50,
                      minWidth: 100,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[...buttonGradientColors]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                    />
                    <AppText font="instrument-medium" size="base" style={{ color: "#ffffff" }}>
                      Change
                    </AppText>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    onConfirm()
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
                      backgroundColor: buttonFallbackBg,
                      borderWidth: 1.5,
                      borderColor: buttonBorder,
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 24,
                      minHeight: 50,
                      minWidth: 100,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[...buttonGradientColors]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                    />
                    <AppText font="instrument-semibold" size="base" style={{ color: "#ffffff" }} numberOfLines={1}>
                      {confirmLabel}
                    </AppText>
                  </View>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}
