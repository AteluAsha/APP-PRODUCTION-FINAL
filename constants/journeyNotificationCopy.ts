/**
 * Soul School — local notification copy (iOS + Android).
 * Single source of truth for gentle "Soul Journey Nudges" messaging.
 */

export const PRE_COURSE_COPY = {
  /** Scenario A — 14 days before start (morning) */
  a14: {
    title: 'A gentle breath',
    body: 'The seed is planted. Notice the space around you today. Your journey from head to heart is gathering energy.',
  },
  /** Scenario A — 7 days before start (afternoon) */
  a7: {
    title: 'Clearing the space',
    body: 'We are one week away. As you walk through the world, remember: shadows are simply teachers in disguise.',
  },
  /** Scenario B — 3 days before start (morning) */
  b3: {
    title: 'The rule of threes',
    body: 'Where you were, where you are, where you are going. Your Soul School journey begins in exactly three days.',
  },
  /** Scenario B — 2 days before start (evening) */
  b2: {
    title: 'Preparing the vessel',
    body: 'Drink extra water today and rest your physical body. The locks are your own lived experiences; the keys arrive soon.',
  },
  /** Scenario C — day before, 12:00 */
  cNoon: {
    title: 'The threshold approaches',
    body: 'Your journey begins tomorrow. Get some rest so you can begin the day fully present on the path to the soul.',
  },
  /** Scenario C — day before, 20:00 */
  cEve: {
    title: 'Midnight awakening',
    body: 'Your course opens tonight at midnight. It will be waiting quietly for you when you wake up. Sleep well.',
  },
  /** Scenario D — same calendar day as course start; ~1h after scheduling */
  dWelcome: {
    title: 'Welcome to the heart mind',
    body: 'The door is open. We move from "me" to "we". Your first lesson is ready whenever you find your quiet center today.',
  },
} as const

export const ENGAGEMENT_COPY = {
  river24: {
    title: 'Step back into the river',
    body: 'The waters of the course keep moving. Yesterday has closed, but today is wide open. Release what was missed and simply join the current where you are.',
  },
  river48: {
    title: 'The present moment',
    body: 'The path flows forward. Let go of the days that have passed; they were not meant for you right now. Today\'s lesson is unlocked and waiting.',
  },
  silentIntegration: {
    title: 'The journey shifts',
    body: 'The structured days have flowed past, but your inner path continues. Sometimes the deepest lesson is simply learning to let go. The river is always within you.',
  },
} as const

export const HORIZON_COPY = {
  plus1: {
    title: 'The beginning of always',
    body: 'The 7 days have completed their cycle, but your true journey is just beginning. You hold the keys. The locks are your lived experiences ahead.',
  },
  plus7: {
    title: "Entering the 'We'",
    body: 'As you continue to anchor into the heart mind, notice how the world shifts around you. Seva awaits. Thank you for walking this path.',
  },
} as const

/** Paid / scholarship — weekly rhythm + long idle (parallel to trial course nudges). */
export const SUSTENANCE_COPY = {
  sundayEve: {
    title: 'The Temple is Prepared',
    body: 'The doors open tomorrow. Rest well and set your intention to join the river at sunrise.',
  },
  pulseMon: {
    title: 'The anchor',
    body: 'Monday is the anchor. Reconnect with your tribe and your physical vessel. You are safe. You are home.',
  },
  pulseTue: {
    title: 'Sweetness',
    body: 'Where is the sweetness today? Allow yourself the joy of being.',
  },
  pulseWed: {
    title: 'Midweek fire',
    body: 'Midweek fire. Is your sun shining brightly, or are you dimming your light for others? Reclaim your power with a single breath.',
  },
  pulseThu: {
    title: 'One for you, one for We',
    body: "One breath for you, one for the 'We'.",
  },
  pulseSat: {
    title: 'The thin veil',
    body: 'Trust the quiet voice that speaks without words today.',
  },
  cycleCompletes: {
    title: 'The Cycle Completes',
    body: "A period of exchange is ending. Whether you stay in this digital space or walk forward with the keys you've found, the sanctuary remains within you. Thank you for the Seva of your presence.",
  },
} as const

/** Calendar day index for Love Balms: 1 = Monday (Root) … 7 = Sunday (Crown). */
export type LoveBalmDay = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function chakraDayFromDate(d: Date): LoveBalmDay {
  const js = d.getDay()
  return (js === 0 ? 7 : js) as LoveBalmDay
}

/**
 * Sporadic whisper layer — hero affirmations + curated love balm per weekday;
 * scheduler picks randomly among `affirmations` and `loveBalms` for that calendar day.
 */
export const LOVE_BALMS: Record<
  LoveBalmDay,
  { affirmations: string[]; loveBalms: string[] }
> = {
  1: {
    affirmations: ['I am, I exist, I belong.'],
    loveBalms: [
      'In the stillness of the Earth, find your grounding, your sanctuary, your belonging. Remember, you are home.',
    ],
  },
  2: {
    affirmations: ['I feel, I flow, I create.'],
    loveBalms: [
      'Embrace the freedom of the present moment, where your soul\'s desires ignite and your authentic self takes flight.',
    ],
  },
  3: {
    affirmations: ['Through my truth, I find my soul fire.'],
    loveBalms: [
      'Honesty fuels the fire within. Accountability unlocks the gates. Opening the solar plexus is how you become the master of your destiny.',
    ],
  },
  4: {
    affirmations: ['My heart is open; my love is unconditional.'],
    loveBalms: [
      'Love without limits, that\'s the power of the heart. Break free from the chains of conditions, and let your compassion flow like a river, nourishing all it touches.',
    ],
  },
  5: {
    affirmations: ['I speak with purity, compassion, and truth.'],
    loveBalms: [
      'Your truth is your power. Speak it with the unwavering authority of your heart, and let your voice rise above the noise, igniting a fearless symphony of authentic expression.',
    ],
  },
  6: {
    affirmations: [
      'I release the mind of self,\nand open my eyes to the Universe.',
    ],
    loveBalms: [
      'As you clear away the dust and awaken this powerful energy center, you\'ll begin to perceive the world with new clarity. It\'s a gateway to deeper understanding.',
    ],
  },
  7: {
    affirmations: ['I awaken my inner child - and surround myself with light.'],
    loveBalms: [
      'It\'s about perceiving yourself and the world through the lens of unity, recognizing the divine spark within all beings and experiencing boundless love.',
    ],
  },
}

/** Sporadic whisper layer — general pool (same channel as other Soul Journey nudges). */
export const ANCESTRAL_GNOSIS: readonly string[] = [
  'We hoard our love because we forgot that we are made of it.',
  'The ego acts as \'the mind of self.\' A belief that we are an individual and that our outward identities are the reality.',
  'True wisdom and healing come from integrating the intellect with the intuition, the rational with the emotional.',
  'Thoughts are the instructions and energy is what we use to build.',
  'To become whole is to transcend the self to remember you are two parts, a conditional experience driven by an unconditional soul.',
  'The universe is a mental creation, a divine curiosity, and your curiosities shape your reality.',
]

/** Long idle (lifetime): random deep inquiry — body is the whole message. */
export const GNOSIS_DEEP_INQUIRY: { title: string; body: string }[] = [
  {
    title: 'A question for the root',
    body: 'If your body was a mountain, how stable would the base feel today? Notice your feet on the earth.',
  },
  {
    title: 'A question for the sacral',
    body: 'Where is the sweetness in your life today? Are you allowing yourself to taste the joy of the simple?',
  },
  {
    title: 'A question for the heart',
    body: "Is there a wall where there should be a window? Take one breath for yourself, and one for the 'We'.",
  },
]
