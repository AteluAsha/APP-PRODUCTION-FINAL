import React from "react"
import { Link, Stack } from "expo-router"
import { StyleSheet, View } from "react-native"

import { AppText } from "@/components/AppText"

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Path Not Found" }} />
      <View style={styles.container}>
        <AppText
          font="instrument-regular"
          size="lg"
          className="text-center mb-4"
        >
          This path doesn't exist in this moment.
        </AppText>
        <AppText
          font="instrument-regular"
          size="base"
          className="text-center mb-8 text-white/60"
        >
          Perhaps you're being called back to your center.
        </AppText>
        <Link
          href="/"
          className="bg-purple-500/20 border border-purple-400/30 py-3 px-6 rounded-lg"
        >
          <AppText
            font="instrument-medium"
            size="base"
            className="text-purple-300"
          >
            Return to Your Path
          </AppText>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
