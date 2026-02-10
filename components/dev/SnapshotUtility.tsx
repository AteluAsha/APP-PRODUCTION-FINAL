/**
 * Snapshot Utility - Static Visual Gallery Capture
 *
 * Provides utilities to capture screenshots of components for the static gallery.
 * For web: Uses html2canvas (browser-based capture)
 * For native: Would use react-native-view-shot (if installed)
 *
 * IMPORTANT: This utility is designed to work WITHOUT navigation context.
 * Components are rendered in isolation for snapshot capture only.
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove from gallery workflow
 * 3. Done - zero impact on production code
 */

import React from "react"
import { View, StyleSheet, Platform } from "react-native"
import * as FileSystem from "expo-file-system"

export interface SnapshotConfig {
  quality?: number // 0.0 - 1.0
  format?: "png" | "jpg" | "webm"
  width?: number
  height?: number
}

export interface SnapshotResult {
  uri: string
  width: number
  height: number
  format: string
}

/**
 * Captures a snapshot of a component view
 *
 * For web: Uses html2canvas (must be installed)
 * For native: Would use react-native-view-shot (if installed)
 */
export async function captureSnapshot(
  viewRef: React.RefObject<View>,
  config: SnapshotConfig = {},
): Promise<SnapshotResult | null> {
  if (!viewRef.current) {
    if (__DEV__) {
      console.warn("[SnapshotUtility] View ref is null, cannot capture")
    }
    return null
  }

  if (Platform.OS === "web") {
    // Web: Use html2canvas (loaded dynamically in CaptureAll)
    // This function is a placeholder - actual capture happens in CaptureAll
    if (__DEV__) {
      console.warn(
        "[SnapshotUtility] Web capture should use html2canvas in CaptureAll component",
      )
    }
    return null
  }

  // Native: Would use react-native-view-shot (if installed)
  if (__DEV__) {
    console.warn(
      "[SnapshotUtility] Native capture not implemented. Install react-native-view-shot if needed.",
    )
  }
  return null
}

/**
 * Saves a snapshot to the dev-gallery directory
 */
export async function saveSnapshot(
  snapshot: SnapshotResult,
  fileName: string,
): Promise<string | null> {
  if (!snapshot || !snapshot.uri) {
    if (__DEV__) {
      console.warn("[SnapshotUtility] Invalid snapshot, cannot save")
    }
    return null
  }

  try {
    // Ensure snapshots directory exists
    const snapshotsDir =
      FileSystem.documentDirectory + "../assets/dev-gallery/snapshots/"
    await FileSystem.makeDirectoryAsync(snapshotsDir, { intermediates: true })

    // Move/copy the temporary file to the snapshots directory
    const destPath = snapshotsDir + fileName
    await FileSystem.moveAsync({ from: snapshot.uri, to: destPath })

    if (__DEV__) {
      console.log(`[SnapshotUtility] Saved snapshot: ${fileName}`)
    }

    return destPath
  } catch (error) {
    if (__DEV__) {
      console.error(`[SnapshotUtility] Failed to save ${fileName}:`, error)
    }
    return null
  }
}

/**
 * Snapshot Container Component
 *
 * Wraps a component in a capture-ready container.
 * This ensures the component is rendered in isolation for snapshot capture.
 */
interface SnapshotContainerProps {
  children: React.ReactNode
  onCaptureReady?: (ref: React.RefObject<View>) => void
}

export const SnapshotContainer: React.FC<SnapshotContainerProps> = ({
  children,
  onCaptureReady,
}) => {
  const captureRef = React.useRef<View>(null)

  React.useEffect(() => {
    if (onCaptureReady && captureRef.current) {
      onCaptureReady(captureRef)
    }
  }, [onCaptureReady])

  return (
    <View ref={captureRef} style={styles.container} collapsable={false}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 375, // iPhone standard width
    height: 812, // iPhone 13 height
    backgroundColor: "#000",
  },
})
