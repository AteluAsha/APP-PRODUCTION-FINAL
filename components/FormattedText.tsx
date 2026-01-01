import React from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"
import { AppText, textVariants } from "./AppText"
import { type VariantProps } from "tailwind-variants"
import { TextSegment } from "@/types/chakras/Content"

// Define props with separate style props for each mode
interface FormattedTextProps extends VariantProps<typeof textVariants> {
  segments?: TextSegment[]
  baseClassName?: string
  renderAsParagraphs?: boolean
  paragraphSpacingClassName?: string
  viewStyle?: StyleProp<ViewStyle> // Style for paragraph mode wrapper (View)
  textStyle?: StyleProp<TextStyle> // Style for inline mode wrapper (AppText)

  // Common passthrough props
  accessible?: boolean
  accessibilityLabel?: string
}

/**
 * Renders text from segments. Can render inline or as paragraphs.
 * - Inline: Renders nested <AppText> within a single wrapper <AppText>.
 * - Paragraphs: Renders each segment in a <View> with bottom margin,
 *   within a wrapper <View>. Base font/size apply to each segment's text.
 */
export const FormattedText = ({
  segments,
  baseClassName,
  font,
  size,
  renderAsParagraphs = false,
  paragraphSpacingClassName = "mb-4",
  viewStyle, // Use viewStyle
  textStyle, // Use textStyle
  accessible,
  accessibilityLabel,
}: FormattedTextProps) => {
  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    return null
  }

  if (renderAsParagraphs) {
    // PARAGRAPH MODE: Use View wrappers
    return (
      <View
        style={viewStyle} // Apply viewStyle
        className={baseClassName}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      >
        {segments.map((segment, index) => (
          <View key={index} className={paragraphSpacingClassName}>
            <AppText font={font} size={size} className={segment.className}>
              {segment.title && (
                <AppText font="instrument-semibold" className="">
                  {segment.title}{" "}
                </AppText>
              )}
              {segment.text}
            </AppText>
          </View>
        ))}
      </View>
    )
  } else {
    // INLINE MODE: Use nested AppText
    return (
      <AppText
        font={font}
        size={size}
        className={baseClassName}
        style={textStyle} // Apply textStyle
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      >
        {segments.map((segment, index) => (
          <AppText key={index} className={segment.className}>
            {segment.title && (
              <AppText font="instrument-semibold" className="">
                {segment.title}{" "}
              </AppText>
            )}
            {segment.text}
          </AppText>
        ))}
      </AppText>
    )
  }
}

export default FormattedText
