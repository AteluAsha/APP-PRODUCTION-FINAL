/**
 * Contact Sync Service
 *
 * Tribe / Find Friends is retired. These helpers stay as no-op stubs so leftover
 * call sites never request Contacts (App Store 5.1.1 / Play unused-permission).
 */

export interface ContactInfo {
  id: string
  displayName: string
  firstName?: string
  lastName?: string
  phoneNumbers: string[]
  emails: string[]
}

export async function isContactsAvailable(): Promise<boolean> {
  return false
}

export async function requestContactsPermission(): Promise<boolean> {
  return false
}

export async function getContactsPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined"
> {
  return "undetermined"
}

export async function getDeviceContacts(): Promise<ContactInfo[]> {
  return []
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "")
}

export async function findFriendsOnApp(
  _contacts: ContactInfo[],
): Promise<{ id: string; displayName: string; profilePicUrl?: string }[]> {
  return []
}
