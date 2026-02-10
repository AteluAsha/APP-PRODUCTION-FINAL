/**
 * Date Confirmation Modal
 *
 * Confirmation modal for selected start date with option to invite a friend
 */

import React, { useState } from "react"
import { Modal, View, Pressable } from "react-native"
import { AppText } from "@/components/AppText"
import { formatDate } from "@/utils/date"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface DateConfirmationModalProps {
  visible: boolean
  selectedDateISO: string | null
  onConfirm: () => void
  onCancel: () => void
  /** 1 = first trial, 2 = second trial (button label) */
  offeringNumber?: 1 | 2
}

export const DateConfirmationModal: React.FC<DateConfirmationModalProps> = ({
  visible,
  selectedDateISO,
  onConfirm,
  onCancel,
  offeringNumber = 1,
}) => {
  if (!selectedDateISO) return null

  const dateStr = selectedDateISO
    ? formatDate(new Date(selectedDateISO + "T00:00:00"))
    : ""

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        }}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.95)", "rgba(10, 10, 10, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: "rgba(135, 174, 115, 0.3)",
            shadowColor: "rgba(6, 182, 212, 0.4)",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 16,
          }}
        >
          <AppText
            font="instrument-bold"
            size="lg"
            style={{
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
              textShadowColor: "rgba(135, 174, 115, 0.4)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 6,
            }}
          >
            Confirm Start Date
          </AppText>
          <AppText
            font="instrument-regular"
            size="base"
            style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8, textAlign: "center" }}
          >
            Your journey will begin on {dateStr}
          </AppText>
          <AppText
            font="instrument-regular"
            size="sm"
            style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16, textAlign: "center", fontStyle: "italic" }}
          >
            Two free trials of the course, as a gift. Use them wisely.
          </AppText>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderWidth: 1,
                borderColor: "rgba(135, 174, 115, 0.3)",
              }}
            >
              <AppText font="instrument-medium" size="base" style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
                Change
              </AppText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["rgba(135, 174, 115, 0.4)", "rgba(6, 182, 212, 0.4)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(135, 174, 115, 0.5)",
                }}
              />
              <AppText font="instrument-bold" size="base" style={{ color: "#ffffff", textAlign: "center", zIndex: 10 }}>
                {offeringNumber === 2 ? "Confirm 2nd offering" : "Confirm 1st offering"}
              </AppText>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}
