/**
 * Share Destinations – Single source of truth for "where to share"
 *
 * Used by ShareDestinationPicker and all invite/share flows. Each destination
 * has a dedicated helper; openSystemShare is the fallback for More… (Instagram,
 * Slack, etc.). All helpers are safe for high traffic and long-term use:
 * canOpenURL checks before opening, try/catch, no crashes on missing apps.
 */

import { Platform, Linking, Share } from "react-native"
import * as Clipboard from "expo-clipboard"
import { APP_STORE_URLS } from "@/constants/sharing"

export const SHARE_TITLE = "Join me on Soul School"

/** App store link for current platform (for invite messages). */
export function getAppStoreLink(): string {
  return (
    Platform.select({
      ios: APP_STORE_URLS.ios,
      android: APP_STORE_URLS.android,
      default: "https://soulschool.app",
    }) || "https://soulschool.app"
  )
}

/** Generate referral link; optional ref and start (inviter journey start ISO) so invitee can sync to same week. */
export function generateReferralLink(
  referralCode?: string,
  startDateISO?: string,
): string {
  const baseUrl = "https://soulschool.app/invite"
  if (!referralCode && !startDateISO) return baseUrl
  const params = new URLSearchParams()
  if (referralCode) params.set("ref", referralCode)
  if (startDateISO) params.set("start", startDateISO)
  return `${baseUrl}?${params.toString()}`
}

/** Invite copy for modals (single source of truth). */
export const INVITE_OPENING_COPY =
  "Invite people to your exact journey. They'll join your Tribe and be with you in tribe chat along the 7 chakra path."
export const INVITE_PREVIEW_LABEL = "Your invite"
export const INVITE_PREVIEW_HINT =
  "Tap Share to send, or copy the link below."

/** Generate invite message (heart-minded, Soul School voice). */
export function generateInviteMessage(options: {
  startDate?: string
  referralLink?: string
  personalMessage?: string
  senderSoulSchoolId?: string
}): string {
  const { startDate, referralLink, personalMessage, senderSoulSchoolId } =
    options
  const appLink = referralLink ?? getAppStoreLink()
  const defaultOpening =
    "I'm walking a 7-day chakra journey with Soul School and would love you to join me — your presence would make the path richer."
  let message = personalMessage ?? defaultOpening
  if (startDate) {
    message += `\n\nI'm beginning on ${startDate}.`
  } else {
    message += `\n\nWhenever you're ready, you can begin your own journey from self to soul.`
  }
  message += `\n\nSoul School — healing through connection:\n${appLink}`
  message += `\n\nWith you in spirit. ✨`
  if (senderSoulSchoolId) {
    message += `\n\nSoul School ID: ${senderSoulSchoolId}`
    message += `\n\nAfter you download the app, enter this ID in Tribe Chat to sync journeys.`
  }
  message += `\n\nGet the app: soulschool.app`
  return message
}

/** Ordered list of destination ids for the picker (single source of truth) */
export const SHARE_DESTINATION_IDS = [
  "messages",
  "whatsapp",
  "mail",
  "copy",
  "more",
] as const

export type ShareDestinationId = (typeof SHARE_DESTINATION_IDS)[number]

export type SystemShareOptions = {
  message: string
  url: string
  title?: string
}

/**
 * Open Messages/SMS with pre-filled text. iOS: Messages. Android: default SMS app.
 */
export async function openMessages(message: string): Promise<boolean> {
  try {
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    const canOpen = await Linking.canOpenURL(smsUrl)
    if (canOpen) {
      await Linking.openURL(smsUrl)
      return true
    }
  } catch (e) {
    if (__DEV__) console.error("[shareDestinations] openMessages:", e)
  }
  return false
}

/**
 * Open Mail app with pre-filled subject and body.
 */
export async function openEmail(message: string): Promise<boolean> {
  try {
    const subject = encodeURIComponent(SHARE_TITLE)
    const body = encodeURIComponent(message)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    const canOpen = await Linking.canOpenURL(mailtoUrl)
    if (canOpen) {
      await Linking.openURL(mailtoUrl)
      return true
    }
  } catch (e) {
    if (__DEV__) console.error("[shareDestinations] openEmail:", e)
  }
  return false
}

/**
 * Open WhatsApp with pre-filled text. Uses whatsapp://send?text=...
 * Returns false if WhatsApp is not installed (use openSystemShare as fallback).
 */
export async function openWhatsApp(message: string): Promise<boolean> {
  try {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
      return true
    }
  } catch (e) {
    if (__DEV__) console.error("[shareDestinations] openWhatsApp:", e)
  }
  return false
}

/**
 * Copy text to clipboard. Silent (no system alert); UI can show "Link copied!".
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text)
    return true
  } catch (e) {
    if (__DEV__) console.error("[shareDestinations] copyToClipboard:", e)
  }
  return false
}

/**
 * Open system share sheet (More…). Use for Instagram, Slack, Twitter, etc.
 * On simulator some options may not appear; test on device for full behavior.
 */
export async function openSystemShare(options: SystemShareOptions): Promise<{
  success: boolean
  action?: string
}> {
  const { message, url, title = SHARE_TITLE } = options
  try {
    const result = (await Share.share(
      Platform.OS === "ios"
        ? { message, url, title }
        : { message: `${message}\n${url}`, title },
    )) as { action: string }
    return {
      success: result?.action === "sharedAction",
      action: result?.action,
    }
  } catch (e) {
    if (__DEV__) console.error("[shareDestinations] openSystemShare:", e)
    return { success: false }
  }
}

/**
 * Execute share for a given destination id. Returns whether the action succeeded.
 * Caller can close picker or show "Link copied!" based on result.
 */
export async function shareToDestination(
  destinationId: ShareDestinationId,
  payload: { message: string; url: string; title?: string },
): Promise<boolean> {
  const { message, url, title } = payload
  switch (destinationId) {
    case "messages":
      return openMessages(message)
    case "mail":
      return openEmail(message)
    case "whatsapp":
      return openWhatsApp(message)
    case "copy":
      return copyToClipboard(url)
    case "more": {
      const { success } = await openSystemShare({ message, url, title })
      return success
    }
    default:
      return false
  }
}
