import React from "react"
import { Text as RNText, TextProps as RNTextProps } from "react-native"
import { tv, type VariantProps } from "tailwind-variants"

/**
 * @TechnicalDecision
 * AppText Font Handling
 *
 * We use a single `font` prop to specify the exact font variant (family, weight, style)
 * instead of separate `fontFamily`, `weight`, and `italic` props.
 *
 * Reasons:
 * 1. Guarantees the correct font file is loaded by mapping directly to specific
 *    Tailwind classes (e.g., `font-instrument-semibold-italic`) defined in `tailwind.config.js`.
 * 2. Avoids ambiguity and potential issues where React Native might try to apply
 *    faux bold/italic styles if only family and weight/style are specified separately.
 *
 * Trade-offs:
 * - Less abstract API: Users must specify the exact variant (e.g., `instrument-semibold-italic`)
 *   instead of combining `fontFamily="sans"`, `weight="semibold"`, `italic={true}`.
 * - Requires refactoring all existing `AppText` usages.
 *
 * Implementation:
 * - The `font` variant in `textVariants` maps keys to the font classes.
 * - The old `fontFamily`, `weight`, `italic`, and semantic `variant` props/variants are removed.
 */

export const textVariants = tv({
  base: "text-white tracking-normal", // Base color, tracking
  variants: {
    // Specific font variants (family, weight, style combined)
    font: {
      // Instrument Sans Family
      "instrument-regular": "font-instrument-regular",
      "instrument-medium": "font-instrument-medium",
      "instrument-semibold": "font-instrument-semibold",
      "instrument-bold": "font-instrument-bold",
      "instrument-italic": "font-instrument-italic",
      "instrument-semibold-italic": "font-instrument-semibold-italic",
      // Cormorant Family
      "cormorant-regular": "font-cormorant",
      "cormorant-italic": "font-cormorant-italic",
      // Other families
      "koh-santepheap": "font-koh-santepheap",
      "space-mono": "font-space-mono",
      "fira-code": "font-fira-code",
    },
    // Direct size variants (remain)
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
  },
  // Default variants
  defaultVariants: {
    font: "instrument-regular", // Set default font variant
  },
})

// Infer the variant props types from the new config
// Remove old props (fontFamily, weight, italic, variant)
// Add new `font` prop
interface AppTextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string // Allow className override/extension
  // Ensure the `font` prop derived from VariantProps is included and optional
}

/**
 * AppText Component
 *
 * Wrapper around RN Text providing consistent typography via tailwind-variants.
 * Use the `font` prop to specify the exact font variant (e.g., "instrument-medium").
 * Use `size` and `color` props for other styling.
 *
 * @example
 * <AppText font="instrument-bold" size="lg">Bold Sans Text</AppText>
 * <AppText font="cormorant-italic" size="xl">Italic Serif Text</AppText>
 * <AppText font="koh-santepheap">Display Text</AppText>
 * <AppText className="text-blue-500">Custom Blue Default Font</AppText>
 */
export function AppText({
  font, // Use the new font prop
  size,
  className,
  // Removed: variant, fontFamily, weight, italic
  ...props
}: AppTextProps) {
  return (
    <RNText
      // Pass the font prop to tv
      className={textVariants({
        font,
        size,
        className,
      })}
      {...props}
    />
  )
}
