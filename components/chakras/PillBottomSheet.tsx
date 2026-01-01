import React, { useRef, useEffect, useCallback } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { AppText } from "@/components/AppText"
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet"
import type { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Chakra } from "@/types/chakras/Chakra"
import { PillType } from "@/types/chakras/PillType"
import { chakraContent } from "@/constants/chakras/content"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface PillBottomSheetProps {
  chakra: Chakra
  pill: PillType | null
  isVisible: boolean
  onClose: () => void
}

export const PillBottomSheet = ({
  chakra,
  pill,
  isVisible,
  onClose,
}: PillBottomSheetProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModalMethods>(null)

  useEffect(() => {
    if (isVisible && pill) {
      bottomSheetModalRef.current?.present()
    } else {
      if (!isVisible || !pill) {
        bottomSheetModalRef.current?.dismiss()
      }
    }
  }, [isVisible, pill])

  const renderBackdrop = useCallback(
    (props: any) => (
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          addHapticFeedback(HapticStrength.Light)
          bottomSheetModalRef.current?.dismiss()
        }}
      >
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="none"
        />
      </Pressable>
    ),
    [],
  )

  const handleDismiss = useCallback(() => {
    onClose()
  }, [onClose])

  if (!isVisible || !pill) {
    return null
  }

  let titleNode: React.ReactNode = null
  let contentNode: React.ReactNode = null

  if (pill === PillType.IDENTITY_STATEMENT) {
    const pillData = chakraContent[chakra]?.pills?.identityStatement
    if (pillData) {
      titleNode = (
        <AppText font="instrument-medium" size="2xl" className="pt-5 px-5 pb-2">
          {pillData.title}
        </AppText>
      )
      contentNode = (
        <AppText font="instrument-regular" size="lg">
          {pillData.description}
        </AppText>
      )
    }
  } else if (pill === PillType.SEED_MANTRA) {
    const pillData = chakraContent[chakra]?.pills?.seedMantra
    if (pillData) {
      titleNode = (
        <AppText font="instrument-medium" size="2xl" className="pt-5 px-5 pb-2">
          Seed Mantra
        </AppText>
      )
      contentNode = (
        <AppText font="instrument-regular" size="lg">
          <AppText font="instrument-italic">"{pillData.title}"</AppText>
          {" - "}
          <AppText font="instrument-regular">{pillData.description}</AppText>
        </AppText>
      )
    }
  } else {
    return null
  }

  if (!titleNode || !contentNode) {
    return null
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      enableDynamicSizing={true}
      enablePanDownToClose={true}
      onDismiss={handleDismiss}
      handleIndicatorStyle={{ backgroundColor: "#ffffff50" }}
      backgroundStyle={{ backgroundColor: "#1E2024" }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ paddingBottom: 40 }}>
        <View>{titleNode}</View>
        <View style={{ paddingHorizontal: 20 }}>{contentNode}</View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
