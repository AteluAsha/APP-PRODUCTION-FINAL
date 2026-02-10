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
        font="instrument-semibold"
        size="xs"
        style={{ marginHorizontal: 32, marginBottom: 4, fontSize: 13, letterSpacing: 0.5, color: "#ffffff" }}
      >
        {title}
      </AppText>
      <CollapsibleText
        text={content}
        linesToTruncate={3}
        textClassName="leading-snug"
        containerClassName="mx-4"
      />
    </View>
  )
}
