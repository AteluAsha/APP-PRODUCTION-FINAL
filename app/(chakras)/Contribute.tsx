/**
 * Contribute Screen
 *
 * Energy exchange for Project Starseed (501(c)(3)).
 * Founded in the higher aspects of the divine feminine principles—
 * not payment, but energy exchange.
 */

import React, { useState } from "react"
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useRevenueCat } from "@/hooks/useRevenueCat"
import { PRODUCT_IDS } from "@/src/services/revenuecat"
import { CONTRIBUTE_URL } from "@/constants/sharing"
import { SCROLL_BREATHING_BOTTOM_PADDING, SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"

const PRESET_AMOUNTS = [7, 11, 22, 55] as const

const AMOUNT_TO_PRODUCT: Record<
  number,
  (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]
> = {
  7: PRODUCT_IDS.CONTRIBUTION_7,
  11: PRODUCT_IDS.CONTRIBUTION_11,
  22: PRODUCT_IDS.CONTRIBUTION_22,
  55: PRODUCT_IDS.CONTRIBUTION_55,
}

export default function Contribute() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { purchase, getProductPackage } = useRevenueCat()

  const handleAmountSelect = (amount: number) => {
    addHapticFeedback(HapticStrength.Light)
    setSelectedAmount(amount)
  }

  const handleContribute = async () => {
    if (selectedAmount === null || selectedAmount <= 0) return

    addHapticFeedback(HapticStrength.Medium)
    setIsProcessing(true)

    try {
      const productId = AMOUNT_TO_PRODUCT[selectedAmount]
      const pkg = getProductPackage(productId)

      if (pkg) {
        await purchase(productId)
        // Contribution complete – no entitlement, just energy exchange
      } else {
        // Fallback: open web contribute page if product not configured yet
        await Linking.openURL(CONTRIBUTE_URL)
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Contribution error:", error)
      }
      // On error (e.g. product not found), offer web link
      await Linking.openURL(CONTRIBUTE_URL)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScholarshipLink = async () => {
    addHapticFeedback(HapticStrength.Light)
    await Linking.openURL(CONTRIBUTE_URL)
  }

  const canContribute =
    selectedAmount !== null && selectedAmount > 0 && !isProcessing

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ActionBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "#000" }}
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
          contentContainerStyle={{
            padding: 32,
            paddingBottom: 32 + SCROLL_BREATHING_BOTTOM_PADDING,
          }}
        >
          <View
            style={{ alignItems: "center", maxWidth: 400, alignSelf: "center" }}
          >
            {/* Header */}
            <AppText
              font="koh-santepheap"
              size="3xl"
              style={{ textAlign: "center", marginBottom: 16, color: "#fff" }}
            >
              Energy Exchange
            </AppText>

            <AppText
              font="instrument-regular"
              size="lg"
              style={{
                textAlign: "center",
                marginBottom: 32,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Your contribution helps us continue making spiritual growth
              accessible to all. Founded in the divine feminine principles of
              energy exchange.
            </AppText>

            {/* Mission */}
            <View
              style={{
                width: "100%",
                marginBottom: 32,
                backgroundColor: "rgba(90,74,58,0.3)",
                borderRadius: 12,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.3)",
              }}
            >
              <AppText
                font="instrument-regular"
                size="base"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 24,
                  marginBottom: 12,
                }}
              >
                Project Starseed is an IRS-recognized 501(c)(3) tax-exempt
                organization dedicated to making healing practices accessible to
                everyone.
              </AppText>
              <AppText
                font="instrument-italic"
                size="sm"
                style={{ color: "rgba(168,201,154,0.9)", lineHeight: 22 }}
              >
                Every contribution, no matter the size, helps us offer
                scholarships and expand access to transformative spiritual
                practices.
              </AppText>
            </View>

            {/* Preset Amounts - 2x2 grid */}
            <View style={{ width: "100%", marginBottom: 24 }}>
              <AppText
                font="instrument-medium"
                size="base"
                style={{ color: "#fff", marginBottom: 16 }}
              >
                Choose your energy exchange
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {PRESET_AMOUNTS.map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => handleAmountSelect(amount)}
                    style={{
                      flex: 1,
                      minWidth: "45%",
                      paddingVertical: 20,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        selectedAmount === amount
                          ? "#A8C99A"
                          : "rgba(139,115,85,0.4)",
                      backgroundColor:
                        selectedAmount === amount
                          ? "rgba(168,201,154,0.2)"
                          : "rgba(90,74,58,0.2)",
                    }}
                  >
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      style={{
                        textAlign: "center",
                        color:
                          selectedAmount === amount
                            ? "#A8C99A"
                            : "rgba(255,255,255,0.8)",
                      }}
                    >
                      ${amount}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Contribute Button */}
            <Pressable
              onPress={handleContribute}
              disabled={!canContribute}
              style={{
                width: "100%",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRadius: 16,
                marginBottom: 24,
                backgroundColor: canContribute
                  ? "rgba(168,201,154,0.2)"
                  : "rgba(90,74,58,0.3)",
                borderWidth: 2,
                borderColor: canContribute ? "#A8C99A" : "rgba(139,115,85,0.2)",
              }}
            >
              {isProcessing ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="small" color="#A8C99A" />
                  <AppText
                    font="instrument-medium"
                    size="lg"
                    style={{ color: "#A8C99A", marginLeft: 12 }}
                  >
                    Processing...
                  </AppText>
                </View>
              ) : (
                <AppText
                  font="instrument-bold"
                  size="lg"
                  style={{
                    textAlign: "center",
                    color: canContribute ? "#A8C99A" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {selectedAmount
                    ? `Contribute $${selectedAmount}`
                    : "Select an amount"}
                </AppText>
              )}
            </Pressable>

            {/* Contribute more for scholarships */}
            <Pressable
              onPress={handleScholarshipLink}
              style={{
                width: "100%",
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.3)",
                backgroundColor: "rgba(90,74,58,0.15)",
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  textAlign: "center",
                  color: "rgba(168,201,154,0.9)",
                }}
              >
                Contribute more for scholarships →
              </AppText>
            </Pressable>

            {/* Tax Deductible */}
            <View
              style={{
                width: "100%",
                backgroundColor: "rgba(90,74,58,0.2)",
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.2)",
                marginBottom: 16,
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(212,197,169,0.7)",
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                Your contribution to Project Starseed (501(c)(3)) is
                tax-deductible. You will receive a receipt for your records.
              </AppText>
            </View>

            <AppText
              font="instrument-regular"
              size="xs"
              style={{ color: "rgba(255,255,255,0.4)", textAlign: "center" }}
            >
              All payment information is securely processed. We never store your
              payment details.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
