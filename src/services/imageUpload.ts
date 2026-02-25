/**
 * Image Upload Service
 *
 * Handles uploading images to Firebase Storage for community posts and profile avatars
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Upload a profile avatar image
 * @param imageUri - Local URI of the image to upload
 * @param userId - User ID (Soul Signature or legacy format)
 * @returns Download URL of the uploaded image
 */
export async function uploadProfileImage(
  imageUri: string,
  userId: string,
): Promise<string> {
  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized")
    }

    const response = await fetch(imageUri)
    const blob = await response.blob()

    const filename = `profiles/${userId}/avatar.jpg`
    const storageRef = ref(storage, filename)

    await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(storageRef)

    if (__DEV__) {
      console.log("[imageUpload] Profile image uploaded:", downloadURL)
    }

    return downloadURL
  } catch (error) {
    if (__DEV__) {
      console.error("[imageUpload] Error uploading profile image:", error)
    }
    throw error
  }
}

/**
 * Upload an image for a community comment/reflection
 * @param imageUri - Local URI of the image to upload
 * @param userId - User ID for organizing uploads
 * @returns Download URL of the uploaded image
 */
export async function uploadCommentImage(
  imageUri: string,
  userId: string,
): Promise<string> {
  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized")
    }

    // Fetch the image from local URI
    const response = await fetch(imageUri)
    const blob = await response.blob()

    // Create a unique filename
    const timestamp = Date.now()
    const filename = `community/${userId}/${timestamp}.jpg`
    const storageRef = ref(storage, filename)

    // Upload the image
    await uploadBytes(storageRef, blob)

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)

    if (__DEV__) {
      console.log("[imageUpload] Image uploaded successfully:", downloadURL)
    }

    return downloadURL
  } catch (error) {
    if (__DEV__) {
      console.error("[imageUpload] Error uploading image:", error)
    }
    throw error
  }
}
