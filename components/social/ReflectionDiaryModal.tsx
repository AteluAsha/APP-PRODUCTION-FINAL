/**
 * Reflection Diary Modal
 *
 * Modal for viewing and editing reflection diary entries
 */

import React from "react"
import { View, StyleSheet } from "react-native"
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"
import { AppText } from "@/components/AppText"

interface ReflectionDiaryModalProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>
  reflectionId: string
  chakraDay?: number
  chakraName?: string
}

export const ReflectionDiaryModal: React.FC<ReflectionDiaryModalProps> = ({
  bottomSheetRef,
  reflectionId,
}) => {
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["50%", "90%"]}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.container}>
        <AppText
          font="instrument-semibold"
          size="lg"
          className="text-white mb-4"
        >
          Reflection Diary
        </AppText>
        <AppText font="instrument-regular" size="base" className="text-white">
          Reflection ID: {reflectionId}
        </AppText>
        {/* TODO: Implement reflection diary content */}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
})
