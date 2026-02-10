/**
 * Image Picker Button Component
 *
 * Button for selecting images from device for community posts
 */

import React from "react"
import { Pressable, Image, View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { AppText } from "@/components/AppText"

interface ImagePickerButtonProps {
  selectedImage: string | null
  onImageSelected: (uri: string | null) => void
  isUploading?: boolean
  disabled?: boolean
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  selectedImage,
  onImageSelected,
}) => {
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        if (__DEV__) {
          console.warn("[ImagePickerButton] Permission denied")
        }
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri)
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[ImagePickerButton] Error picking image:", error)
      }
    }
  }

  const removeImage = () => {
    onImageSelected(null)
  }

  if (selectedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: selectedImage }} style={styles.image} />
        <Pressable onPress={removeImage} style={styles.removeButton}>
          <Ionicons name="close-circle" size={24} color="#fff" />
        </Pressable>
      </View>
    )
  }

  return (
    <Pressable onPress={pickImage} style={styles.button}>
      <Ionicons name="image-outline" size={20} color="#fff" />
      <AppText font="instrument-regular" size="sm" className="text-white ml-2">
        Add Image
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginVertical: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    marginVertical: 8,
  },
})
