/**
 * Contact Sync Service
 *
 * Permission-aware access to device contacts for "Find Friends" in Tribe Chat.
 * Uses dynamic import so app does not crash when expo-contacts native module
 * is unavailable (e.g. Expo Go). When unavailable, all functions return safe defaults.
 */

const MAX_CONTACTS = 500

export interface ContactInfo {
  id: string
  displayName: string
  firstName?: string
  lastName?: string
  phoneNumbers: string[]
  emails: string[]
}

let contactsModule: typeof import("expo-contacts") | null = null
let contactsModuleLoaded: boolean | null = null

async function getContactsModule(): Promise<
  typeof import("expo-contacts") | null
> {
  if (contactsModuleLoaded === true && contactsModule) return contactsModule
  if (contactsModuleLoaded === false) return null
  try {
    contactsModule = await import("expo-contacts")
    contactsModuleLoaded = true
    return contactsModule
  } catch (e) {
    if (__DEV__) {
      console.warn(
        "[contactSync] expo-contacts not available (native module missing or error):",
        e,
      )
    }
    contactsModuleLoaded = false
    return null
  }
}

/**
 * True if the contacts native module is available (e.g. in a dev/build that includes expo-contacts).
 */
export async function isContactsAvailable(): Promise<boolean> {
  const Contacts = await getContactsModule()
  return Contacts != null
}

/**
 * Request contacts permission at runtime.
 * Call when user taps "Find Friends" (opt-in).
 * Returns false if expo-contacts is not available.
 */
export async function requestContactsPermission(): Promise<boolean> {
  const Contacts = await getContactsModule()
  if (!Contacts) return false
  try {
    const { status } = await Contacts.requestPermissionsAsync()
    return status === "granted"
  } catch (e) {
    if (__DEV__) {
      console.warn("[contactSync] requestContactsPermission error:", e)
    }
    return false
  }
}

/**
 * Check if we already have contacts permission (without prompting).
 */
export async function getContactsPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined"
> {
  const Contacts = await getContactsModule()
  if (!Contacts) return "undetermined"
  try {
    const { status } = await Contacts.getPermissionsAsync()
    return status as "granted" | "denied" | "undetermined"
  } catch (e) {
    if (__DEV__) {
      console.warn("[contactSync] getContactsPermissionStatus error:", e)
    }
    return "undetermined"
  }
}

/**
 * Get device contacts with name, phone numbers, and emails.
 * Limit to MAX_CONTACTS for performance.
 * Returns [] if expo-contacts is not available.
 */
export async function getDeviceContacts(): Promise<ContactInfo[]> {
  const Contacts = await getContactsModule()
  if (!Contacts) return []
  try {
    const { data } = await Contacts.getContactsAsync({
      pageSize: MAX_CONTACTS,
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    })

    return data.map((c) => {
      const name =
        (c.name ?? [c.firstName, c.lastName].filter(Boolean).join(" ")) ||
        "Unknown"
      const phoneNumbers = (c.phoneNumbers ?? [])
        .map((p) => p.number ?? p.digits ?? "")
        .filter(Boolean)
      const emails = (c.emails ?? []).map((e) => e.email ?? "").filter(Boolean)
      return {
        id: c.id ?? "",
        displayName: name.trim() || "Unknown",
        firstName: c.firstName ?? undefined,
        lastName: c.lastName ?? undefined,
        phoneNumbers,
        emails,
      }
    })
  } catch (e) {
    if (__DEV__) {
      console.warn("[contactSync] getDeviceContacts error:", e)
    }
    return []
  }
}

/**
 * Normalize phone number for future matching (digits only, optional country code).
 * Used when backend supports hashed-phone matching.
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Stub: match device contacts against app users (hashed phone/email).
 * Returns empty until backend/Firestore user hashes exist.
 */
export async function findFriendsOnApp(
  _contacts: ContactInfo[],
): Promise<{ id: string; displayName: string; profilePicUrl?: string }[]> {
  return []
}
