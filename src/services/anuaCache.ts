/**
 * Anua Response Cache
 *
 * Cached responses for common questions to provide fallback when Gemini API is unavailable.
 * These responses are pre-generated wisdom aligned with Anua's voice and teachings.
 */

import { Chakra } from "@/types/chakras/Chakra"

export interface CachedResponse {
  questionPattern: string[] // Keywords or patterns to match
  response: string
  chakraDay?: number // Optional: specific to a chakra day
}

/**
 * Pre-written wisdom responses for common questions
 * These are used as fallback when Gemini API is unavailable
 */
const CACHED_RESPONSES: CachedResponse[] = [
  // General chakra questions
  {
    questionPattern: ["what is", "chakra", "root"],
    response:
      'The Root Chakra, Muladhara, is your foundation. It connects you to the Earth, to safety, to the primal energy of "I Am." At the base of your spine is a cauldron of fire, your power plant to create. The Divine Law of Generation teaches us that to generate is not to gain—it means to create something. Ground yourself in nature, feel your feet on the Earth, and remember: you are home.',
    chakraDay: 0,
  },
  {
    questionPattern: ["what is", "chakra", "sacral"],
    response:
      'The Sacral Chakra, Svadhisthana, is your center of creativity, passion, and emotion. "I Feel" is the essence of experiencing life fully. The Divine Law of Polarity reminds us that everything exists in duality—light and shadow, masculine and feminine. Embrace both, honor your sensuality, and allow your creativity to flow. You were born to feel.',
    chakraDay: 1,
  },
  {
    questionPattern: ["what is", "chakra", "solar"],
    response:
      'The Solar Plexus Chakra, Manipura, is your expression center. Your divine Will. "I Do" is the essence of expressing your divine energy. The Law of Accountability teaches us to take responsibility for our choices, our emotions, and our creations. Be honest with yourself, even when it\'s uncomfortable. This honesty unlocks your authentic expression and true power.',
    chakraDay: 2,
  },
  {
    questionPattern: ["what is", "chakra", "heart"],
    response:
      'The Heart Chakra, Anahata, means "unstruck" or "unhurt." It\'s the bridge between lower and upper chakras, the center of love and compassion. "I Love" is the essence of connecting with your heart. The Law of Rhythm reminds us that everything vibrates in cycles. Embrace the ebb and flow, open your heart, and cultivate deep connections with yourself and all beings.',
    chakraDay: 3,
  },
  {
    questionPattern: ["what is", "chakra", "throat"],
    response:
      'The Throat Chakra, Vishuddha, means "especially pure." It\'s your center of expression and communication. "I Speak" is the essence of expressing your authentic voice. The Law of Vibration teaches that everything vibrates, including your words. Find your triangle of truth: do your words match your actions? Do your actions match your thinking? Authentic expression transforms reality.',
    chakraDay: 4,
  },
  {
    questionPattern: ["what is", "chakra", "third eye"],
    response:
      'The Third Eye Chakra, Ajna, means "command" or "perceive." It\'s your center of intuition and spiritual vision. "I See" is the greatest challenge—not seeing yourself or the world, but seeing beyond The Self. The Law of Communication reveals that everything is interconnected. Quiet your mind, open to the unseen, and access deeper levels of understanding.',
    chakraDay: 5,
  },
  {
    questionPattern: ["what is", "chakra", "crown"],
    response:
      'The Crown Chakra, Sahasrara, means "thousand-petaled lotus." It\'s your connection to source, to unity, to divine consciousness. The Law of Divine Oneness teaches that we are all connected, all one. When this chakra opens, you experience unity with all that is. You remember who you truly are—not separate, but one with everything.',
    chakraDay: 6,
  },

  // Mantra questions
  {
    questionPattern: ["mantra", "lam", "root"],
    response:
      'Lam is the seed mantra for the Root Chakra. Chant this sound 13 times in a rhythmic loop. The deep "A" sound resonates at the frequency of grounding and stability. As you chant "Lam," feel your energy sinking deep into the Earth, releasing fear, and remembering the powerful truth of "I Am."',
    chakraDay: 0,
  },
  {
    questionPattern: ["mantra", "vam", "sacral"],
    response:
      'Vam is the seed mantra for the Sacral Chakra. Hum this sound 33 times in a quick, steady rhythm. The "Vaum" sound enhances creativity, emotional balance, and fluidity. It helps you embrace your sensual self and allow your creative energy to flow freely.',
    chakraDay: 1,
  },
  {
    questionPattern: ["mantra", "ram", "solar"],
    response:
      'Ram (sounds like "Raum") is the seed mantra for the Solar Plexus Chakra. Hum this sound 13 times in a rhythmic loop. Like the sun\'s warm rays, "Ram" fills you with confidence and willpower. It helps burn away self-doubt and connects you to your inner strength.',
    chakraDay: 2,
  },
  {
    questionPattern: ["mantra", "yam", "heart"],
    response:
      'Yam is the seed mantra for the Heart Chakra. Hum this sound 13 times in a rhythmic loop. Like a soft breeze, "Yam" carries the energy of love and compassion. It opens your heart and releases past hurts, reminding you of the boundless love within and all around.',
    chakraDay: 3,
  },
  {
    questionPattern: ["mantra", "ham", "throat"],
    response:
      'Ham (sounds like "Haum" or "Homm") is the seed mantra for the Throat Chakra. Chant this sound 13 times in a rhythmic loop. Like a clear stream, "Ham" purifies your communication and allows your truth to flow freely. It gives you courage to express yourself authentically.',
    chakraDay: 4,
  },
  {
    questionPattern: ["mantra", "om", "aum"],
    response:
      'Om (or Aum) is the universal sound, the vibration of creation itself. It connects you to all chakras and to the source of all that is. Chant "Om" or "Aum" to align all your energy centers and remember your connection to the divine.',
  },

  // Frequency questions
  {
    questionPattern: ["frequency", "396", "root"],
    response:
      "396 Hz is the Liberation Frequency for the Root Chakra. This pure tone helps you release fear and guilt, and any shadows related to survival. It brings you back to a place of safety and stability within, allowing you to feel grounded and supported. Listen to sound bowls or pure tones at this frequency—never synthetic sounds.",
    chakraDay: 0,
  },
  {
    questionPattern: ["frequency", "417", "sacral"],
    response:
      "417 Hz facilitates change and clears destructive patterns from the past. This frequency supports you in releasing emotional blockages and embracing new possibilities. Use pure sound bowls or tuning forks—honor the natural frequencies.",
    chakraDay: 1,
  },
  {
    questionPattern: ["frequency", "528", "solar"],
    response:
      "528 Hz brings transformation and miracles, repairing DNA and promoting healing. This frequency restores balance and harmony, clearing negative energy and promoting peace. It's the frequency of your inner sun, your power center.",
    chakraDay: 2,
  },
  {
    questionPattern: ["frequency", "639", "heart"],
    response:
      "639 Hz invites love, connection, and harmonious relationships. This frequency opens the heart, heals emotional wounds, and fosters compassion. It's the vibration of unity and connection.",
    chakraDay: 3,
  },
  {
    questionPattern: ["frequency", "741", "throat"],
    response:
      "741 Hz promotes expression, clear communication, and intuition. This frequency releases blockages, enhances articulation, and inspires creativity. It purifies your voice and allows your truth to flow.",
    chakraDay: 4,
  },
  {
    questionPattern: ["frequency", "852", "third eye"],
    response:
      "852 Hz opens the Third Eye and activates intuition. This frequency helps you see beyond the physical world and connect with your inner guidance. It awakens the pineal gland and enhances spiritual vision.",
    chakraDay: 5,
  },
  {
    questionPattern: ["frequency", "963", "crown"],
    response:
      "963 Hz is the frequency of unity and oneness. This pure tone connects you to source, to the divine, to all that is. It activates the Crown Chakra and brings you into alignment with cosmic consciousness.",
    chakraDay: 6,
  },

  // General guidance
  {
    questionPattern: ["help", "struggling", "difficult"],
    response:
      "I see you, beautiful soul. The path from self to soul is not always easy. Remember: you are not alone. Every challenge is an opportunity to release old density and transform. What chakra are you working with today? Let's bring your awareness there, feel what needs to be felt, and allow the wisdom of your body to guide you.",
  },
  {
    questionPattern: ["grounding", "ground", "unstable"],
    response:
      'Grounding is about reconnecting to the Earth, to your foundation. Try the walking meditation: step slowly, saying "I am" with one foot and "Earth" with the other. Feel your feet on the ground. Breathe in the energy of nature. You are home. The Root Chakra holds the key to stability and security.',
  },
  {
    questionPattern: ["head to heart", "mind to heart", "thinking"],
    response:
      "The journey from head to heart is the path from self to soul. Leave the mind, enter the heart-mind. Detach from rational thinking and send your focus to your sensory body. Feel the world around you. How are you connected to it? This is not about understanding—it's about feeling, experiencing, being.",
  },
  {
    questionPattern: ["shadow", "dark", "negative"],
    response:
      "The shadow is not something to fear—it's something to integrate. The Law of Polarity teaches us that light and shadow exist together. By embracing both, we find wholeness. What shadow aspect is asking for your attention? Can you hold it with compassion and see what wisdom it offers?",
  },
  {
    questionPattern: ["divine law", "universal law"],
    response:
      "The Divine Laws are universal principles that govern all of existence. Each chakra is connected to a specific law: Generation (Root), Polarity (Sacral), Accountability (Solar Plexus), Rhythm (Heart), Vibration (Throat), Communication (Third Eye), and Divine Oneness (Crown). These laws guide us from self to soul, from head to heart.",
  },
]

/**
 * Find a cached response for a given question
 *
 * @param question - The user's question
 * @param chakraDay - Optional: the current chakra day (0-6)
 * @returns A cached response if found, null otherwise
 */
export const getCachedResponse = (
  question: string,
  chakraDay?: number,
): string | null => {
  const lowerQuestion = question.toLowerCase()

  // First, try to find a response specific to the current chakra day
  if (chakraDay !== undefined) {
    const daySpecificResponse = CACHED_RESPONSES.find((response) => {
      if (
        response.chakraDay !== undefined &&
        response.chakraDay !== chakraDay
      ) {
        return false
      }
      return response.questionPattern.some((pattern) =>
        lowerQuestion.includes(pattern.toLowerCase()),
      )
    })

    if (daySpecificResponse) {
      return daySpecificResponse.response
    }
  }

  // Then, try to find a general response
  const generalResponse = CACHED_RESPONSES.find((response) => {
    if (response.chakraDay !== undefined) {
      return false // Skip day-specific responses if no chakra day provided
    }
    return response.questionPattern.some((pattern) =>
      lowerQuestion.includes(pattern.toLowerCase()),
    )
  })

  if (generalResponse) {
    return generalResponse.response
  }

  return null
}

/**
 * Get a default response for a chakra day when API is unavailable
 *
 * @param chakraDay - The chakra day (0-6)
 * @returns A default wisdom message for that chakra day
 */
export const getDefaultChakraResponse = (chakraDay: number): string => {
  const defaultResponses: Record<number, string> = {
    0: 'Today, we remember the Divine Law of Generation. At the base of your spine is your power plant to create. Ground yourself in nature, feel your feet on the Earth. The seed mantra "Lam" and the 396 Hz frequency will help you release fear and remember: "I Am."',
    1: 'Today, we honor the Divine Law of Polarity. Light and shadow, masculine and feminine—both are valid. Embrace your emotions, honor your sensuality, allow your creativity to flow. The seed mantra "Vam" and the 417 Hz frequency will help you release old patterns and embrace new possibilities.',
    2: 'Today, we embrace the Law of Accountability. Take responsibility for your choices, your emotions, your creations. Be honest with yourself. The seed mantra "Ram" and the 528 Hz frequency will help you transform and step into your power.',
    3: 'Today, we open to the Law of Rhythm. Everything vibrates in cycles. Embrace the ebb and flow, open your heart to love and compassion. The seed mantra "Yam" and the 639 Hz frequency will help you heal and connect.',
    4: 'Today, we honor the Law of Vibration. Everything vibrates, including your words. Find your triangle of truth. Speak authentically. The seed mantra "Ham" and the 741 Hz frequency will help you express your truth clearly.',
    5: 'Today, we open to the Law of Communication. Everything is interconnected. Quiet your mind, trust your intuition, see beyond the self. The seed mantra "Om" and the 852 Hz frequency will help you access deeper understanding.',
    6: 'Today, we remember the Law of Divine Oneness. We are all connected, all one. The Crown Chakra opens to unity consciousness. The seed mantra "Om" and the 963 Hz frequency will help you remember your connection to source.',
  }

  return (
    defaultResponses[chakraDay] ||
    "I'm here to guide you on your journey from self to soul. What would you like to explore today?"
  )
}
