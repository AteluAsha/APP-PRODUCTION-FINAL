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

export const SHARE_TITLE = "Join me on Soul School"

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
