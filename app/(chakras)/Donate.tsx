/**
 * Donation Screen
 *
 * Full-screen donation interface for Project Starseed (501(c)(3)).
 * Beautiful, earth-toned design with holistic, gentle aesthetic.
 * Ready to activate when the time is right.
 */

import React, { useState } from "react"
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"

const PRESET_AMOUNTS = [1, 5] as const

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAmountSelect = (amount: number) => {
    addHapticFeedback(HapticStrength.Light)
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "")
    setCustomAmount(cleaned)
    setSelectedAmount(null)
  }

  const getDonationAmount = (): number | null => {
    if (selectedAmount !== null) {
      return selectedAmount
    }
    if (customAmount.trim() !== "") {
      const parsed = parseFloat(customAmount)
      return isNaN(parsed) || parsed <= 0 ? null : parsed
    }
    return null
  }

  const handleDonate = async () => {
    const amount = getDonationAmount()
    if (!amount || amount <= 0) {
      return
    }

    addHapticFeedback(HapticStrength.Medium)
    setIsProcessing(true)

    try {
      // TODO: Implement donation processing when ready
      await new Promise((resolve) => setTimeout(resolve, 1500))
      if (__DEV__) {
        console.log(`[Donate] Donation of $${amount} would be processed`)
      }
      // Success - could show success modal here
    } catch (error) {
      if (__DEV__) {
        console.error("Donation error:", error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const donationAmount = getDonationAmount()
  const canDonate =
    donationAmount !== null && donationAmount > 0 && !isProcessing

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ActionBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-black"
          contentContainerClassName="p-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center max-w-lg mx-auto">
            {/* Header */}
            <AppText
              font="koh-santepheap"
              size="3xl"
              className="text-center mb-4"
            >
              Support Our Mission
            </AppText>

            <AppText
              font="instrument-regular"
              size="lg"
              className="text-center mb-8 text-white/80"
            >
              Your contribution helps us continue making spiritual growth
              accessible to all.
            </AppText>

            {/* Mission Statement */}
            <View className="w-full mb-8">
              <View className="bg-[#5A4A3A]/30 rounded-xl p-6 border border-[#8B7355]/30 mb-6">
                <AppText
                  font="instrument-regular"
                  size="base"
                  className="text-white/90 leading-6 mb-4"
                >
                  Project Starseed is an IRS-recognized 501(c)(3) tax-exempt
                  organization dedicated to making healing practices accessible
                  to everyone.
                </AppText>
                <AppText
                  font="instrument-italic"
                  size="sm"
                  className="text-[#A8C99A]/90 leading-6"
                >
                  Every contribution, no matter the size, helps us offer
                  scholarships and expand access to transformative spiritual
                  practices.
                </AppText>
              </View>
            </View>

            {/* Preset Amounts */}
            <View className="w-full mb-6">
              <AppText
                font="instrument-medium"
                size="base"
                className="text-white mb-4"
              >
                Choose an amount
              </AppText>
              <View className="flex-row gap-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => handleAmountSelect(amount)}
                    className={`flex-1 py-5 px-6 rounded-xl border-2 ${
                      selectedAmount === amount
                        ? "border-[#A8C99A] bg-[#A8C99A]/20"
                        : "border-[#8B7355]/40 bg-[#5A4A3A]/20"
                    } active:opacity-80 active:scale-95`}
                  >
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      className={`text-center ${
                        selectedAmount === amount
                          ? "text-[#A8C99A]"
                          : "text-white/80"
                      }`}
                    >
                      ${amount}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Custom Amount */}
            <View className="w-full mb-8">
              <AppText
                font="instrument-medium"
                size="base"
                className="text-white mb-4"
              >
                Or enter a custom amount
              </AppText>
              <View className="border-2 border-[#8B7355]/40 rounded-xl bg-[#5A4A3A]/20 overflow-hidden">
                <View className="flex-row items-center px-4">
                  <AppText
                    font="instrument-regular"
                    size="xl"
                    className="text-[#D4C5A9] mr-2"
                  >
                    $
                  </AppText>
                  <TextInput
                    value={customAmount}
                    onChangeText={handleCustomAmountChange}
                    placeholder="0.00"
                    placeholderTextColor="#8B7355/60"
                    keyboardType="decimal-pad"
                    className="flex-1 py-5 text-white text-xl font-instrument-regular"
                    style={{ color: customAmount ? "#D4C5A9" : "#8B7355" }}
                  />
                </View>
              </View>
            </View>

            {/* Donate Button */}
            <Pressable
              onPress={handleDonate}
              disabled={!canDonate}
              style={{
                width: "100%",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRadius: 16,
                marginBottom: 24,
                backgroundColor: canDonate ? "rgba(168,201,154,0.2)" : "rgba(90,74,58,0.3)",
                borderWidth: 2,
                borderColor: canDonate ? "#A8C99A" : "rgba(139,115,85,0.2)",
              }}
            >
              {isProcessing ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#A8C99A" />
                  <AppText
                    font="instrument-medium"
                    size="lg"
                    className="text-[#A8C99A] ml-3"
                  >
                    Processing...
                  </AppText>
                </View>
              ) : (
                <AppText
                  font="instrument-bold"
                  size="lg"
                  className={`text-center ${
                    canDonate ? "text-[#A8C99A]" : "text-white/40"
                  }`}
                >
                  {donationAmount
                    ? `Donate $${donationAmount.toFixed(2)}`
                    : "Select an amount"}
                </AppText>
              )}
            </Pressable>

            {/* Tax Deductible Notice */}
            <View className="w-full bg-[#5A4A3A]/20 rounded-lg p-4 border border-[#8B7355]/20 mb-4">
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-[#D4C5A9]/70 text-center leading-5"
              >
                Your donation to Project Starseed (501(c)(3)) is tax-deductible.
                You will receive a receipt for your records.
              </AppText>
            </View>

            {/* Privacy Note */}
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-white/40 text-center"
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
