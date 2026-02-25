# Files Changed – Revert Guide

If you need to revert tonight's updates, these files were modified:

## Hero/Header/Chakra Layout

- `components/ParallaxScrollView.tsx` – explicit header dimensions
- `components/chakras/HeaderBackground.tsx` – inline styles, explicit height, marginTop 64
- `components/chakras/ChakraTemplate.tsx` – passes `height={screenWidth}` to HeaderBackground

## ChakraHub (App 2)

- `app/(chakras)/ChakraHub.tsx` – header redesign, DAY_INDEX_TO_CHAKRA_IMAGE, simplified 7-day button

## Gallery

- `components/chakras/GalleryOfGnosis/ChakraCard.tsx` – imageSource safety check

## Preload

- `app/_layout.tsx` – added SoulSchool, Hero_tulip, Anua to preload list

## Build Status (as of last check)

- TypeScript: ✅ passes
- Expo export (iOS): ✅ succeeds
- ParallaxScrollView: explicit width/height restored on header container
