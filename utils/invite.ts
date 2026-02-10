/**
 * Invite Friend Utilities
 *
 * Functions for inviting friends via SMS, sharing, and other methods.
 * Share uses message + url so iOS/Android surface Messages, WhatsApp, Instagram, etc.
 */

import { Platform, Linking, Share, Alert } from "react-native"
import * as Clipboard from "expo-clipboard"
import { APP_STORE_URLS } from "@/constants/sharing"

export type ShareInviteOptions = {
  message: string
  url: string
  title?: string
}

/**
 * Share invite via system sheet.
 * @deprecated Use ShareDestinationPicker or shareToDestination from utils/shareDestinations.ts
 * for the unified in-app share flow (Messages, WhatsApp, Mail, Copy, More…).
 */
export async function shareInvite(
  options: ShareInviteOptions,
): Promise<{ action: string }> {
  const { message, url, title = "Join me on Soul School" } = options
  return Share.share(
    Platform.OS === "ios"
      ? { message, url, title }
      : { message: `${message}\n${url}`, title },
  ) as Promise<{ action: string }>
}

/**
 * Generate referral link with optional referral code
 * For now, uses placeholder link - replace when actual referral system is ready
 */
export const generateReferralLink = (referralCode?: string): string => {
  const baseUrl = "https://soulschool.app/invite"
  if (referralCode) {
    return `${baseUrl}?ref=${referralCode}`
  }
  return baseUrl
}

/**
 * Get app store link for current platform
 */
export const getAppStoreLink = (): string => {
  return (
    Platform.select({
      ios: APP_STORE_URLS.ios,
      android: APP_STORE_URLS.android,
      default: "https://soulschool.app",
    }) || "https://soulschool.app"
  )
}

/**
 * Open Messages/SMS app with pre-filled invite (no system share sheet).
 * iOS: opens Messages. Android: opens default SMS app.
 */
export const openMessagesWithInvite = async (
  message: string,
): Promise<boolean> => {
  try {
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    const canOpen = await Linking.canOpenURL(smsUrl)
    if (canOpen) {
      await Linking.openURL(smsUrl)
      return true
    }
  } catch (e) {
    if (__DEV__) console.error("[invite] openMessagesWithInvite:", e)
  }
  return false
}

/**
 * Open Mail app with pre-filled invite (no system share sheet).
 */
export const openEmailWithInvite = async (
  message: string,
): Promise<boolean> => {
  try {
    const subject = encodeURIComponent("Join me on Soul School")
    const body = encodeURIComponent(message)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    const canOpen = await Linking.canOpenURL(mailtoUrl)
    if (canOpen) {
      await Linking.openURL(mailtoUrl)
      return true
    }
  } catch (e) {
    if (__DEV__) console.error("[invite] openEmailWithInvite:", e)
  }
  return false
}

/** @deprecated Use openMessagesWithInvite; share sheet fallback removed for invite flows */
export const inviteViaSMS = async (message: string): Promise<boolean> => {
  return openMessagesWithInvite(message)
}

/**
 * Copy invite link to clipboard
 */
export const copyInviteLink = async (link: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(link)
    Alert.alert(
      "Link Copied",
      "The invite link has been copied to your clipboard.",
    )
    return true
  } catch (error) {
    if (__DEV__) {
      console.error("Error copying link:", error)
    }
    Alert.alert("Error", "Failed to copy link. Please try again.")
    return false
  }
}

/**
 * Generate invite message with personalization
 */
export const generateInviteMessage = (options: {
  startDate?: string
  referralLink?: string
  personalMessage?: string
}): string => {
  const { startDate, referralLink, personalMessage } = options

  const appLink = referralLink || getAppStoreLink()

  let message =
    personalMessage || `Join me on a healing journey through the 7 chakras! 🌟`

  if (startDate) {
    message += `\n\nI'm starting my journey on ${startDate} and would love to have you join me.`
  } else {
    message += `\n\nI'd love to have you join me on this path of transformation.`
  }

  message += `\n\nDownload the Soul School app and begin your own journey from self to soul:\n${appLink}`

  message += `\n\nHealing through connection. ✨`

  return message
}
