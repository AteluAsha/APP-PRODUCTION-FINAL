/**
 * Commitment Gate Screen
 *
 * A native React Native screen that appears after the 14-day trial period.
 * Offers two paths: Annual Access (via RevenueCat) or Scholarship (energy exchange).
 * Matches the exact visual design from the provided screenshots.
 */

import React, { useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { useRevenueCat } from "@/hooks/useRevenueCat"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { PRODUCT_IDS } from "@/src/services/revenuecat"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Ionicons } from "@expo/vector-icons"
import { ScholarshipModal } from "./ScholarshipModal"
import { useRouter } from "expo-router"
import { AccessGrantedModal } from "./AccessGrantedModal"
import * as Linking from "expo-linking"

interface CommitmentGateProps {
  onComplete: () => void
}

type AccessOption = "annual" | "scholarship"

export const CommitmentGate: React.FC<CommitmentGateProps> = ({
  onComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<AccessOption>("annual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showScholarshipModal, setShowScholarshipModal] = useState(false)
  const [showAccessGranted, setShowAccessGranted] = useState(false)
  const {
    purchase,
    getProductPackage,
    isLoading: revenueCatLoading,
  } = useRevenueCat()
  const grantLifetimeAccess = useChakraJourneyStore(
    (state) => state.grantLifetimeAccess,
  )
  const hasEverCompletedChakra = useChakraJourneyStore(
    (state) => state.hasEverCompletedChakra,
  )
  const router = useRouter()

  const yearlyPackage = getProductPackage(PRODUCT_IDS.YEARLY)

  // Check if user has any unlocked chakra cards
  const hasUnlockedCards = React.useMemo(() => {
    for (let i = 0; i < 7; i++) {
      if (hasEverCompletedChakra(i)) {
        return true
      }
    }
    return false
  }, [hasEverCompletedChakra])

  const handleGalleryPress = () => {
    router.push("/(chakras)/GalleryOfGnosis")
  }

  const handleBeginJourney = async () => {
    if (isProcessing) return

    addHapticFeedback(HapticStrength.Medium)

    if (selectedOption === "annual") {
      // Purchase annual subscription via RevenueCat
      setIsProcessing(true)
      try {
        await purchase(PRODUCT_IDS.YEARLY)
        // grantLifetimeAccess is automatically called by useRevenueCat hook
        // Show celebration modal - onComplete called when user dismisses modal
        setShowAccessGranted(true)
      } catch (error) {
        if (__DEV__) {
          console.error("Error processing purchase:", error)
        }
        // Error handling - user can try again
      } finally {
        setIsProcessing(false)
      }
    } else {
      // Scholarship path - show modal to get reason, then proceed to Energy Exchange
      setShowScholarshipModal(true)
    }
  }

  const handleScholarshipContinue = (reason: string) => {
    // Grant lifetime access immediately (it's free, not a barter)
    grantLifetimeAccess("scholarship")
    setShowScholarshipModal(false)
    // Show celebration modal - onComplete called when user dismisses modal
    setShowAccessGranted(true)
  }

  const formatPrice = (priceString: string): string => {
    // Extract numeric price from RevenueCat price string
    // Format: "$7.00" -> "$7"
    const match = priceString.match(/\$?([\d.]+)/)
    if (match) {
      const num = parseFloat(match[1])
      return `$${Math.round(num)}`
    }
    return priceString
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#000000", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <AppText font="instrument-bold" size="3xl" style={styles.titleText}>
            Your Path Awaits
          </AppText>
          <AppText font="instrument-regular" size="lg" style={styles.subtitle}>
            All Paths Open to You
          </AppText>
        </View>

        {/* Features List - depth and gradient */}
        <View style={styles.featuresCardWrap}>
          <LinearGradient
            colors={[
              "rgba(28, 32, 38, 0.95)",
              "rgba(24, 28, 34, 0.95)",
              "rgba(20, 28, 36, 0.95)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuresCard}
          >
          <View style={styles.featureItem}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={16} color="#6B8E5A" />
            </View>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.featureText}
            >
              Access to all sacred teachings
            </AppText>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={16} color="#6B8E5A" />
            </View>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.featureText}
            >
              Guided meditation library
            </AppText>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={16} color="#6B8E5A" />
            </View>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.featureText}
            >
              Social Sanctuary Access
            </AppText>
          </View>
          </LinearGradient>
        </View>

        {/* Access Options */}
        <View style={styles.optionsContainer}>
          {/* Annual Access Card - depth and gradient */}
          <Pressable
            onPress={() => {
              setSelectedOption("annual")
              addHapticFeedback(HapticStrength.Light)
            }}
            style={[
              styles.optionCardWrap,
              selectedOption === "annual" && styles.optionCardSelectedWrap,
            ]}
          >
            <LinearGradient
              colors={
                selectedOption === "annual"
                  ? [
                      "rgba(168, 201, 154, 0.18)",
                      "rgba(212, 165, 116, 0.12)",
                      "rgba(6, 182, 212, 0.06)",
                    ]
                  : [
                      "rgba(28, 32, 38, 0.95)",
                      "rgba(24, 28, 34, 0.95)",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.optionCard,
                selectedOption === "annual" && styles.optionCardSelected,
              ]}
            >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, styles.crownIcon]}>
                  <Ionicons name="diamond" size={20} color="#ffffff" />
                </View>
                <View style={styles.optionTextContainer}>
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    style={styles.optionTitle}
                  >
                    Complete Sacred Path
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.optionSubtitle}
                  >
                    Unlimited access to all teachings
                  </AppText>
                  <View style={styles.priceContainer}>
                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      style={styles.priceText}
                    >
                      {yearlyPackage
                        ? formatPrice(yearlyPackage.product.priceString)
                        : "$7"}
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.pricePeriod}
                    >
                      /year
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.priceDescription}
                  >
                    Open the full course with universal access
                  </AppText>
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedOption === "annual" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </View>
            </LinearGradient>
          </Pressable>

          {/* Scholarship Card - depth and gradient */}
          <Pressable
            onPress={() => {
              setSelectedOption("scholarship")
              addHapticFeedback(HapticStrength.Light)
            }}
            style={[
              styles.optionCardWrap,
              selectedOption === "scholarship" && styles.optionCardSelectedWrap,
            ]}
          >
            <LinearGradient
              colors={
                selectedOption === "scholarship"
                  ? [
                      "rgba(168, 201, 154, 0.18)",
                      "rgba(212, 165, 116, 0.12)",
                      "rgba(6, 182, 212, 0.06)",
                    ]
                  : [
                      "rgba(28, 32, 38, 0.95)",
                      "rgba(24, 28, 34, 0.95)",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.optionCard,
                selectedOption === "scholarship" && styles.optionCardSelected,
              ]}
            >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, styles.starIcon]}>
                  <Ionicons name="star" size={20} color="#ffffff" />
                </View>
                <View style={styles.optionTextContainer}>
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    style={styles.optionTitle}
                  >
                    Scholarship
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.scholarshipSubtitle}
                  >
                    Energy exchange
                  </AppText>
                  <View style={styles.priceContainer}>
                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      style={styles.priceText}
                    >
                      Free
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.priceDescription}
                  >
                    Realizing that WE are the value.
                  </AppText>
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedOption === "scholarship" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Begin Your Journey Button */}
        <Pressable
          onPress={handleBeginJourney}
          disabled={isProcessing || revenueCatLoading}
          style={styles.beginButton}
          accessibilityLabel="Enter Your Sacred Space"
          accessibilityHint="Complete purchase to access all teachings"
        >
          <LinearGradient
            colors={[
              "rgba(168, 201, 154, 0.9)",
              "rgba(107, 142, 90, 0.95)",
              "rgba(212, 165, 116, 0.6)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.beginButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <AppText
                font="instrument-bold"
                size="lg"
                style={styles.beginButtonText}
              >
                Enter Your Sacred Space
              </AppText>
            )}
          </LinearGradient>
        </Pressable>

        {/* Footer Guarantee Text */}
        <View style={styles.footerContainer}>
          <AppText
            font="instrument-regular"
            size="xs"
            style={styles.footerText}
          >
            ✨ Your journey, your pace • Sacred space always available ✨
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            style={[styles.footerText, { marginTop: 8 }]}
          >
            Soul School is operated by Project Starseed, an IRS-recognized
            501(c)(3) tax-exempt organization. All donations are tax-deductible.
          </AppText>

          {/* Privacy Policy & Terms Links - App Store Compliance */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Pressable
              onPress={() => {
                Linking.openURL("https://soulschool.app/privacy").catch(
                  (error) => {
                    if (__DEV__) {
                      console.error("Error opening privacy policy:", error)
                    }
                  },
                )
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={[styles.footerText, styles.linkText]}
              >
                Privacy Policy
              </AppText>
            </Pressable>
            <AppText
              font="instrument-regular"
              size="xs"
              style={[styles.footerText, { opacity: 0.4 }]}
            >
              •
            </AppText>
            <Pressable
              onPress={() => {
                Linking.openURL("https://soulschool.app/terms").catch(
                  (error) => {
                    if (__DEV__) {
                      console.error("Error opening terms of service:", error)
                    }
                  },
                )
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={[styles.footerText, styles.linkText]}
              >
                Terms of Service
              </AppText>
            </Pressable>
          </View>
          {/* Support Contact - App Store Compliance */}
          <Pressable
            onPress={() => {
              Linking.openURL(
                "mailto:support@soulschool.app?subject=Support Request",
              ).catch((error) => {
                if (__DEV__) {
                  console.error("Error opening support email:", error)
                }
              })
            }}
            style={{ marginTop: 8 }}
          >
            <AppText
              font="instrument-regular"
              size="xs"
              style={[styles.footerText, styles.linkText, { opacity: 0.5 }]}
            >
              Contact Support
            </AppText>
          </Pressable>

          {/* Subtle Donation Footer Link - Ready but not activated */}
          {false && ( // Feature flag - set to true when ready to activate
            <Pressable
              onPress={() => {
                router.push("/(chakras)/Donate")
                addHapticFeedback(HapticStrength.Light)
              }}
              style={{ marginTop: 8 }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={[styles.footerText, { color: "#A8C99A", opacity: 0.7 }]}
              >
                Support our mission
              </AppText>
            </Pressable>
          )}
        </View>
      </ScrollView>
      </LinearGradient>

      {/* Scholarship Modal */}
      <ScholarshipModal
        visible={showScholarshipModal}
        onClose={() => setShowScholarshipModal(false)}
        onContinue={handleScholarshipContinue}
      />

      {/* Access Granted Celebration Modal - onComplete closes gate when user chooses */}
      <AccessGrantedModal
        visible={showAccessGranted}
        onClose={() => {
          onComplete()
          setShowAccessGranted(false)
        }}
        onGoToHub={() => {
          onComplete()
          router.push("/(chakras)/ChakraHub")
        }}
        onContinueJourney={() => {
          onComplete()
          router.push("/(chakras)/ChakraHome")
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleText: {
    color: "#ffffff",
  },
  subtitle: {
    color: "#d1d5db",
    marginTop: 4,
  },
  featuresCardWrap: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.25)",
    shadowColor: "rgba(6, 182, 212, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  featuresCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#A8C99A", // Light sage - earth tone
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    color: "#d1d5db",
    flex: 1,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCardWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.2)",
    shadowColor: "rgba(168, 201, 154, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  optionCardSelectedWrap: {
    borderColor: "rgba(168, 201, 154, 0.5)",
    borderWidth: 2,
    shadowColor: "rgba(168, 201, 154, 0.25)",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0,
  },
  optionCardSelected: {
    borderWidth: 0,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  crownIcon: {
    backgroundColor: "#D4A574", // Warm earth tone
  },
  starIcon: {
    backgroundColor: "#A8C99A", // Light sage
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: "#ffffff",
    marginBottom: 4,
  },
  optionSubtitle: {
    color: "#A8C99A", // Light sage - earth tone
    marginBottom: 8,
  },
  scholarshipSubtitle: {
    color: "#D4A574", // Warm earth tone
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  priceText: {
    color: "#ffffff",
  },
  pricePeriod: {
    color: "#9ca3af",
    marginLeft: 4,
  },
  priceDescription: {
    color: "#9ca3af",
    marginTop: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A8C99A", // Light sage - earth tone
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#A8C99A", // Light sage - earth tone
  },
  galleryButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  galleryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButtonText: {
    color: "#D4A574", // Warm earth tone
    marginLeft: 8,
  },
  beginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.4)",
    shadowColor: "rgba(168, 201, 154, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  beginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  beginButtonText: {
    color: "#ffffff",
  },
  footerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    color: "#9ca3af",
    textAlign: "center",
  },
  linkText: {
    color: "#A8C99A", // Sage green to match earth tones
    textDecorationLine: "underline",
  },
})
