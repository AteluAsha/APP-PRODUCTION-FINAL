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
    <View className="my-4">
      <AppText
        font="instrument-semibold"
        className="mx-8 mb-1 text-[13px]"
        style={{ letterSpacing: 0.5 }}
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
