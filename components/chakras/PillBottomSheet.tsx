import React, { useRef, useEffect, useCallback } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { AppText } from "@/components/AppText"
import { LinearGradient } from "expo-linear-gradient"
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

  if (pill === PillType.FREQUENCY) {
    const pillData = chakraContent[chakra]?.pills?.frequency
    if (pillData?.modalTitle && pillData?.modalContent) {
      titleNode = (
        <AppText font="instrument-medium" size="2xl" className="pt-5 px-5 pb-2">
          {pillData.modalTitle}
        </AppText>
      )
      contentNode = (
        <AppText font="instrument-regular" size="lg">
          {pillData.modalContent}
        </AppText>
      )
    }
  } else if (pill === PillType.IDENTITY_STATEMENT) {
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
      handleIndicatorStyle={{ backgroundColor: "#D4C5A9" }}
      backgroundStyle={{ backgroundColor: "transparent" }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ paddingBottom: 40, paddingTop: 20 }}>
        {/* Earth-toned gradient glass container with depth */}
        <LinearGradient
          colors={[
            "rgba(139, 115, 85, 0.35)",
            "rgba(168, 201, 154, 0.2)",
            "rgba(212, 197, 169, 0.25)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            paddingVertical: 24,
            paddingHorizontal: 24,
            marginHorizontal: 16,
            marginBottom: 20,
            borderWidth: 1.5,
            borderColor: "rgba(139, 115, 85, 0.5)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            shadowColor: "#8B7355",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Subtle depth overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />

          {/* Content with relative z-index */}
          <View style={{ position: "relative", zIndex: 10 }}>
            <View style={{ marginBottom: 16 }}>{titleNode}</View>
            <View style={{ paddingHorizontal: 4 }}>{contentNode}</View>
          </View>
        </LinearGradient>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
