/**
 * Community Placeholders
 *
 * Pre-populated reflections and questions from the course material
 * to make the community halls feel alive and provide examples of the kind
 * of sharing that happens in this space.
 */

import { addReflection } from "./socialSanctuary"

export interface PlaceholderReflection {
  chakraDay: number // 0-6 (Monday-Sunday)
  message: string
  isAnonymous: boolean
  replies?: PlaceholderReflection[] // Nested replies
}

/**
 * Placeholder reflections organized by chakra day
 * These are insights and questions from the course material
 */
export const PLACEHOLDER_REFLECTIONS: PlaceholderReflection[] = [
  // Day 0 - Root Chakra (Monday)
  {
    chakraDay: 0,
    message:
      "I think I already had a massive awareness moment. Just planting into the Earth, and remembering the stars. That was enough for my soul.",
    isAnonymous: false,
    replies: [
      {
        chakraDay: 0,
        message:
          "Yes! I felt that too. The walking meditation really connected me to something ancient.",
        isAnonymous: true,
      },
      {
        chakraDay: 0,
        message:
          "The 'I Am' mantra has been so powerful. I finally feel like I belong here.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 0,
    message:
      "I am struggling with my root. I don't feel good at grounding. Anyone else feel this way?",
    isAnonymous: false,
    replies: [
      {
        chakraDay: 0,
        message:
          "I felt the same at first. Try the walking meditation barefoot if you can. It helped me so much.",
        isAnonymous: true,
      },
      {
        chakraDay: 0,
        message:
          "The 396 Hz frequency really helped me release fear. Keep going, you're not alone.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 0,
    message:
      "The Divine Law of Generation clicked for me today. I've been trying to gain instead of create. This changes everything.",
    isAnonymous: true,
  },

  // Day 1 - Sacral Chakra (Tuesday)
  {
    chakraDay: 1,
    message:
      "Dancing freely today unlocked something in me. I forgot how good it feels to move without judgment.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 1,
        message:
          "Same! I put on music and just let my body move. It was so freeing.",
        isAnonymous: true,
      },
    ],
  },
  // Day 2 - Solar Plexus Chakra (Wednesday)
  {
    chakraDay: 2,
    message:
      "The power pose meditation was intense. I felt old emotions releasing. Standing in my power is new for me.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 2,
        message:
          "I cried during it. So much old self-doubt came up. But I feel stronger now.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 2,
    message:
      "The Law of Accountability hit hard. Taking responsibility for my choices instead of blaming others is powerful.",
    isAnonymous: true,
  },
  {
    chakraDay: 2,
    message:
      "528 Hz frequency is incredible. I feel so much more balanced after listening.",
    isAnonymous: true,
  },

  // Day 3 - Heart Chakra (Thursday)
  {
    chakraDay: 3,
    message:
      "The loving-kindness meditation opened my heart in ways I didn't expect. Sending love to myself was the hardest part.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 3,
        message:
          "I struggled with that too. But once I started, the love just flowed.",
        isAnonymous: true,
      },
      {
        chakraDay: 3,
        message:
          "Forgiving myself was the breakthrough. The Law of Rhythm makes so much sense now.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 3,
    message:
      "Anahata - 'unstruck' or 'unhurt'. This concept is healing something deep in me.",
    isAnonymous: true,
  },
  {
    chakraDay: 3,
    message:
      "639 Hz + rose quartz = pure heart opening. I'm feeling so much compassion today.",
    isAnonymous: true,
  },

  // Day 4 - Throat Chakra (Friday)
  {
    chakraDay: 4,
    message:
      "Finding my triangle of truth was eye-opening. My words, actions, and thoughts weren't aligned. Working on that now.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 4,
        message:
          "This exercise changed everything for me. Authentic expression is a journey.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 4,
    message:
      "The Law of Vibration - everything is vibration. My words have power. This is profound.",
    isAnonymous: true,
  },
  {
    chakraDay: 4,
    message:
      "Chanting 'Ham' cleared something in my throat. I can speak my truth more easily now.",
    isAnonymous: true,
  },

  // Day 5 - Third Eye Chakra (Saturday)
  {
    chakraDay: 5,
    message:
      "The Spirit Mind Awakening Breath activated something. I'm seeing with new eyes. 'I See' beyond the self is challenging but beautiful.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 5,
        message:
          "The pineal gland activation is real. My intuition is so much clearer now.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 5,
    message:
      "The Law of Communication - everything is interconnected. I'm starting to feel that connection.",
    isAnonymous: true,
  },
  {
    chakraDay: 5,
    message:
      "852 Hz frequency is opening my third eye. The visions during meditation are incredible.",
    isAnonymous: true,
  },

  // Day 6 - Crown Chakra (Sunday)
  {
    chakraDay: 6,
    message:
      "Sahasrara - 'thousand-petaled lotus'. I felt that expansion today. Connection to source is real.",
    isAnonymous: true,
    replies: [
      {
        chakraDay: 6,
        message:
          "The unity meditation brought tears. I am one with everything. This is what I've been seeking.",
        isAnonymous: true,
      },
      {
        chakraDay: 6,
        message:
          "The Law of Divine Oneness - we are all connected. This journey has shown me that.",
        isAnonymous: true,
      },
    ],
  },
  {
    chakraDay: 6,
    message:
      "963 Hz frequency took me to another dimension. Pure consciousness. I am home.",
    isAnonymous: true,
  },
  {
    chakraDay: 6,
    message:
      "Completing all 7 chakras feels like coming full circle. The path from self to soul is complete, but the journey continues.",
    isAnonymous: true,
  },
]

/**
 * Populate community halls with placeholder reflections
 * This should be called once during app initialization or setup
 *
 * Note: This will only add placeholders if the collection is empty
 * to avoid duplicates on subsequent runs
 */
export const populatePlaceholders = async (): Promise<void> => {
  try {
    // Check if collection already has content
    const { getReflectionsForDay } = await import("./socialSanctuary")

    // Check a few days to see if content exists
    const hasContent = await Promise.all([
      getReflectionsForDay(0, 1),
      getReflectionsForDay(3, 1),
      getReflectionsForDay(6, 1),
    ]).then((results) => results.some((r) => r.length > 0))

    if (hasContent) {
      if (__DEV__) {
        console.log(
          "[Community Placeholders] Collection already has content. Skipping placeholder population.",
        )
      }
      return
    }

    if (__DEV__) {
      console.log(
        "[Community Placeholders] Populating community halls with placeholder reflections...",
      )
    }

    // Add all placeholder reflections
    for (const reflection of PLACEHOLDER_REFLECTIONS) {
      try {
        // Add main reflection
        const reflectionId = await addReflection(
          reflection.chakraDay,
          reflection.message,
          reflection.isAnonymous,
        )

        // Add replies if they exist
        if (reflection.replies && reflection.replies.length > 0) {
          for (const reply of reflection.replies) {
            await addReflection(
              reply.chakraDay,
              reply.message,
              reply.isAnonymous,
              reflectionId,
            )
          }
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        if (__DEV__) {
          console.error(
            `[Community Placeholders] Error adding reflection for day ${reflection.chakraDay}:`,
            error,
          )
        }
        // Continue with next reflection even if one fails
      }
    }

    if (__DEV__) {
      console.log(
        "[Community Placeholders] Successfully populated community halls with placeholder reflections.",
      )
    }
  } catch (error) {
    if (__DEV__) {
      console.error(
        "[Community Placeholders] Error populating placeholders:",
        error,
      )
    }
    // Don't throw - this is a non-critical operation
  }
}
