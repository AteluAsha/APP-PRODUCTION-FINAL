/**
 * Soul Signature Service
 *
 * Generates heart-minded Soul Signatures (e.g., "Starseed | 1212:88") instead of
 * cold alphanumeric IDs. Format: Archetype | Anchor:Harmonic. Combines an
 * Archetype, a sacred Anchor number, and a Harmonic for uniqueness. Firestore
 * ensures no collisions at scale.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

const ARCHETYPES = [
  "Seeker",
  "Starseed",
  "Alchemist",
  "Weaver",
  "Anchor",
  "Mystic",
  "Guardian",
  "Renegade",
  "Wayfinder",
  "Oracle",
  "Luminary",
  "Catalyst",
  "Empath",
  "Healer",
  "Sage",
  "Traveler",
  "Architect",
  "Sentinel",
  "Voyager",
  "Keeper",
  "Witness",
  "Scribe",
  "Mirror",
  "Cipher",
  "Augur",
  "Seer",
  "Observer",
  "Chronicler",
  "Gnostic",
  "Ember",
  "Meridian",
  "Lotus",
  "Leyline",
  "Horizon",
  "Oasis",
  "Canyon",
  "Apex",
  "Thicket",
  "River",
  "Nova",
  "Pulsar",
  "Zenith",
  "Aether",
  "Solstice",
  "Equinox",
  "Nebula",
  "Cosmos",
  "Eclipse",
  "Orion",
  "Vessel",
  "Conduit",
  "Beacon",
  "Steward",
  "Envoy",
  "Harbinger",
  "Initiate",
  "Pilgrim",
  "Nomad",
  "Sovereign",
  "Radiant",
  "Harmonic",
  "Pulse",
  "Synthesis",
  "Resonance",
  "Stillness",
  "Clarion",
  "Frequency",
  "Echo",
  "Prism",
] as const

const ANCHORS = [111, 222, 333, 444, 555, 777, 888, 1010, 1111, 1212] as const

const STORAGE_KEY = "userId"

/** Regex: Archetype + space + pipe + space + Anchor + : + Harmonic (2-3 digits) */
const SOUL_SIGNATURE_REGEX = /^[A-Za-z]+\s\|\s\d{3,4}:\d{2,3}$/

export function isSoulSignatureFormat(value: string): boolean {
  return SOUL_SIGNATURE_REGEX.test(value.trim())
}

/**
 * Generate a Harmonic: 2-digit (10-99) or 3-digit (100-999) for variety.
 * Uses even numbers for a subtle sacred pattern.
 */
function generateHarmonic(): number {
  const useTwoDigit = Math.random() < 0.3
  if (useTwoDigit) {
    const even = Math.floor(Math.random() * 45) * 2 + 10
    return Math.min(99, Math.max(10, even))
  }
  const even = Math.floor(Math.random() * 450) * 2 + 100
  return Math.min(999, Math.max(100, even))
}

/**
 * Format Soul Signature: [Archetype] | [Anchor]:[Harmonic]
 * e.g. "Starseed | 1212:88", "Seeker | 111:429"
 */
function formatSoulSignature(
  archetype: string,
  anchor: number,
  harmonic: number,
): string {
  return `${archetype} | ${anchor}:${harmonic}`
}

/**
 * Claim a Soul Signature in Firestore.
 * Returns true if claimed, false if already exists.
 */
export async function claimSoulSignature(signature: string): Promise<boolean> {
  if (!db) return false
  try {
    const docRef = doc(db, "soul_signatures", signature)
    const existing = await getDoc(docRef)
    if (existing.exists()) return false
    await setDoc(docRef, { claimedAt: Timestamp.now() })
    return true
  } catch (error) {
    if (__DEV__) {
      console.warn("[soulSignature] claimSoulSignature error:", error)
    }
    return false
  }
}

/**
 * Get or create a Soul Signature.
 * Checks AsyncStorage first. If none, generates and claims via Firestore.
 */
export async function getOrCreateSoulSignature(): Promise<string> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY)
  if (stored && isSoulSignatureFormat(stored)) {
    return stored
  }

  const maxRetries = 10
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)]
    const anchor = ANCHORS[Math.floor(Math.random() * ANCHORS.length)]
    let harmonic = generateHarmonic()

    if (attempt > 0) {
      harmonic = Math.min(999, ((harmonic + attempt) % 900) + 100)
    }

    const signature = formatSoulSignature(archetype, anchor, harmonic)
    const claimed = await claimSoulSignature(signature)

    if (claimed) {
      await AsyncStorage.setItem(STORAGE_KEY, signature)
      return signature
    }
  }

  const harmonicFallback = parseInt(String(Date.now()).slice(-3), 10)
  const harmonicPadded = Math.max(10, Math.min(999, harmonicFallback))
  const fallback = formatSoulSignature(
    ARCHETYPES[0],
    ANCHORS[0],
    harmonicPadded,
  )
  if (__DEV__) {
    console.warn(
      "[soulSignature] Max retries reached, using timestamp fallback:",
      fallback,
    )
  }
  await AsyncStorage.setItem(STORAGE_KEY, fallback)
  return fallback
}

/**
 * Request a new Soul Signature. Clears stored ID and generates a fresh one.
 * Old ID remains in Firestore (claimed) and is never reused.
 */
export async function requestNewSoulSignature(): Promise<string> {
  await AsyncStorage.removeItem(STORAGE_KEY)
  return getOrCreateSoulSignature()
}
