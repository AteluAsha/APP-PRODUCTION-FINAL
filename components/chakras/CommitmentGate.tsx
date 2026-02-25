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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { useRevenueCat } from "@/hooks/useRevenueCat"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { PRODUCT_IDS, ENTITLEMENT_ID } from "@/src/services/revenuecat"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Ionicons } from "@expo/vector-icons"
import { ScholarshipModal } from "./ScholarshipModal"
import { useRouter } from "expo-router"
import { AccessGrantedModal } from "./AccessGrantedModal"
import * as Linking from "expo-linking"
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { getUserId } from "@/src/services/userId"
import { logScholarshipRequest } from "@/src/services/scholarshipAudit"

interface CommitmentGateProps {
  onComplete: () => void
  /** Dev only: when provided, shows back arrow to dismiss paywall */
  onBack?: () => void
  /** When true (Trial 1 complete), show "Continue to trial number 2" link */
  showContinueToTrial2?: boolean
  /** Called when user taps "Continue to trial number 2" */
  onContinueToTrial2?: () => void
  /** Optional: when provided, "Continue Journey" in AccessGranted modal calls this instead of onComplete (e.g. Paywall route uses router.back()) */
  onContinueJourney?: () => void
}

type AccessOption = "annual" | "scholarship"

export const CommitmentGate: React.FC<CommitmentGateProps> = ({
  onComplete,
  onBack,
  showContinueToTrial2 = false,
  onContinueToTrial2,
  onContinueJourney,
}) => {
  const [selectedOption, setSelectedOption] = useState<AccessOption>("annual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [showScholarshipModal, setShowScholarshipModal] = useState(false)
  const [showAccessGranted, setShowAccessGranted] = useState(false)
  const {
    purchase,
    restore,
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
  const insets = useSafeAreaInsets()

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
        setPurchaseError(null)
        await purchase(PRODUCT_IDS.YEARLY)
        // grantLifetimeAccess is automatically called by useRevenueCat hook
        // Show celebration modal - onComplete called when user dismisses modal
        setShowAccessGranted(true)
      } catch (error: any) {
        if (__DEV__) {
          console.error("Error processing purchase:", error)
        }
        const msg = error?.message || ""
        if (msg.toLowerCase().includes("cancelled")) {
          setPurchaseError(null)
        } else {
          setPurchaseError(
            msg ||
              "Purchase failed. Please try again or use Restore Purchases.",
          )
        }
      } finally {
        setIsProcessing(false)
      }
    } else {
      // Scholarship path - show modal to get reason, then proceed to Energy Exchange
      setShowScholarshipModal(true)
    }
  }

  const handleRestore = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setPurchaseError(null)
    setRestoreError(null)
    try {
      const info = await restore()
      const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENT_ID]
      if (hasEntitlement) {
        setShowAccessGranted(true)
      } else {
        setRestoreError(
          "No purchases found. If you bought on another device, sign in with the same Apple ID and try again.",
        )
      }
    } catch (err: any) {
      const msg = err?.message || "Restore failed"
      setRestoreError(
        msg.toLowerCase().includes("cancelled")
          ? null
          : "Restore failed. Please check your connection and try again.",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScholarshipContinue = (reason: string) => {
    // Log for 501(c)(3) audit (fire-and-forget; does not block grant)
    getUserId()
      .then((userId) => logScholarshipRequest(userId, reason))
      .catch(() => {})
    // Grant lifetime access immediately (it's free, not a barter)
    grantLifetimeAccess("scholarship")
    setShowScholarshipModal(false)
    // Close paywall and navigate to Energy Exchange (not AccessGrantedModal)
    onComplete()
    router.replace("/(chakras)/EnergyExchange")
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
      {onBack ? (
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            onBack()
          }}
          style={[styles.backButton, { top: Math.max(insets.top, 16) + 8 }]}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color="rgba(255,255,255,0.9)" />
        </Pressable>
      ) : null}
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
            <AppText font="instrument-bold" size="lg" style={styles.titleText}>
              Your Path Awaits
            </AppText>
            <AppText
              font="instrument-regular"
              size="xs"
              style={styles.subtitle}
            >
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
                  <Ionicons name="checkmark" size={12} color="#6B8E5A" />
                </View>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.featureText}
                >
                  Access to all sacred teachings
                </AppText>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={12} color="#6B8E5A" />
                </View>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.featureText}
                >
                  Guided meditation library
                </AppText>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={12} color="#6B8E5A" />
                </View>
                <AppText
                  font="instrument-regular"
                  size="sm"
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
                setPurchaseError(null)
                setRestoreError(null)
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
                    : ["rgba(28, 32, 38, 0.95)", "rgba(24, 28, 34, 0.95)"]
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
                      <Ionicons name="diamond" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <AppText
                        font="instrument-semibold"
                        size="sm"
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
                          size="lg"
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
                setPurchaseError(null)
                setRestoreError(null)
                addHapticFeedback(HapticStrength.Light)
              }}
              style={[
                styles.optionCardWrap,
                selectedOption === "scholarship" &&
                  styles.optionCardSelectedWrap,
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
                    : ["rgba(28, 32, 38, 0.95)", "rgba(24, 28, 34, 0.95)"]
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
                      <Ionicons name="star" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <AppText
                        font="instrument-semibold"
                        size="sm"
                        style={styles.optionTitle}
                      >
                        Monthly Course Pass
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={styles.scholarshipSubtitle}
                      >
                        Monthly Scholarship Pass with chance to reapply after
                        the grant has ended.
                      </AppText>
                      <View style={styles.priceContainer}>
                        <AppText
                          font="instrument-bold"
                          size="lg"
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

          {/* Restore Error Banner */}
          {restoreError && (
            <View
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "#fca5a5", textAlign: "center" }}
              >
                {restoreError}
              </AppText>
            </View>
          )}

          {/* Purchase Error Banner */}
          {purchaseError && (
            <View
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "#fca5a5", textAlign: "center" }}
              >
                {purchaseError}
              </AppText>
            </View>
          )}

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
                  font="instrument-semibold"
                  size="sm"
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
              style={[styles.footerText, { opacity: 0.8 }]}
            >
              Your journey, your pace · Sacred space always available
            </AppText>
            <AppText
              font="instrument-regular"
              size="xs"
              style={[styles.footerText, { marginTop: 8, opacity: 0.5 }]}
            >
              Soul School is operated by Project Starseed, an IRS-recognized
              501(c)(3) tax-exempt organization. All donations are
              tax-deductible.
            </AppText>

            <Pressable
              onPress={handleRestore}
              disabled={isProcessing || revenueCatLoading}
              style={{ marginTop: 12 }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={[styles.footerText, styles.linkText]}
              >
                Restore Purchases
              </AppText>
            </Pressable>

            {showContinueToTrial2 && onContinueToTrial2 && (
              <Pressable
                onPress={() => {
                  addHapticFeedback(HapticStrength.Light)
                  onContinueToTrial2()
                }}
                style={{ marginTop: 8 }}
              >
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={[
                    styles.footerText,
                    { color: "rgba(168, 201, 154, 0.9)", opacity: 0.9 },
                  ]}
                >
                  Continue to trial number 2
                </AppText>
              </Pressable>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
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
                style={[styles.footerText, styles.linkText]}
              >
                Contact Support
              </AppText>
            </Pressable>

            {/* Subtle Donation Footer Link - Ready but not activated */}
            {false && ( // Feature flag - set to true when ready to activate
              <Pressable
                onPress={() => {
                  router.push("/(chakras)/Contribute")
                  addHapticFeedback(HapticStrength.Light)
                }}
                style={{ marginTop: 8 }}
              >
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={[
                    styles.footerText,
                    { color: "#A8C99A", opacity: 0.7 },
                  ]}
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
          router.replace("/(chakras)/ChakraHub")
        }}
        onContinueJourney={() => {
          setShowAccessGranted(false)
          if (onContinueJourney) {
            onContinueJourney()
          } else {
            onComplete()
          }
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
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 1000,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32 + SCROLL_BREATHING_BOTTOM_PADDING,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 12,
  },
  logo: {
    width: 200,
    height: 100,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    color: "#ffffff",
  },
  subtitle: {
    color: "#d1d5db",
    marginTop: 2,
  },
  featuresCardWrap: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.15)",
    shadowColor: "rgba(6, 182, 212, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  featuresCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 0,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkmarkContainer: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#A8C99A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  featureText: {
    color: "#d1d5db",
    flex: 1,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  optionCardWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.12)",
    shadowColor: "rgba(168, 201, 154, 0.08)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  optionCardSelectedWrap: {
    borderColor: "rgba(168, 201, 154, 0.45)",
    borderWidth: 1.5,
    shadowColor: "rgba(168, 201, 154, 0.2)",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  optionCard: {
    borderRadius: 14,
    padding: 14,
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
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    marginBottom: 2,
  },
  optionSubtitle: {
    color: "rgba(168, 201, 154, 0.9)",
    marginBottom: 4,
  },
  scholarshipSubtitle: {
    color: "rgba(212, 165, 116, 0.9)",
    marginBottom: 4,
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
    color: "rgba(156, 163, 175, 0.85)",
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#A8C99A", // Light sage - earth tone
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.35)",
    shadowColor: "rgba(168, 201, 154, 0.25)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  beginButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  beginButtonText: {
    color: "#ffffff",
  },
  footerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(168, 201, 154, 0.08)",
  },
  footerText: {
    color: "rgba(156, 163, 175, 0.9)",
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
  },
  linkText: {
    color: "rgba(168, 201, 154, 0.85)",
    textDecorationLine: "underline",
    fontSize: 11,
  },
})
