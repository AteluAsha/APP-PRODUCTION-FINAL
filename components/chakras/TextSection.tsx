import { View } from "react-native"
import { AppText } from "@/components/AppText"
import { CollapsibleText } from "../CollapsibleText"

export const TextSection = ({
  title,
  content,
}: {
  title: string
  content: string
}) => {
  return (
    <View style={{ marginVertical: 16 }}>
      <AppText
        font="instrument-bold"
        size="xs"
        style={{
          letterSpacing: 0.5,
          color: "#ffffff",
          marginHorizontal: 32,
          marginBottom: 4,
          fontSize: 13,
        }}
      >
        {title}
      </AppText>
      <CollapsibleText
        text={content}
        linesToTruncate={3}
        containerStyle={{ marginHorizontal: 16 }}
        textStyle={{ lineHeight: 22, color: "#ffffff" }}
      />
    </View>
  )
}
