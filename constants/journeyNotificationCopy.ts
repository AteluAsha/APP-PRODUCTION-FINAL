/**
 * Awakening Soul — local notification copy (iOS + Android).
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
    body: 'Where you were, where you are, where you are going. Your Awakening Soul journey begins in exactly three days.',
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

/** Calendar day index: 1 = Monday (Root) … 7 = Sunday (Crown). */
export type LoveBalmDay = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function chakraDayFromDate(d: Date): LoveBalmDay {
  const js = d.getDay()
  return (js === 0 ? 7 : js) as LoveBalmDay
}

export function nextLoveBalmDay(day: LoveBalmDay): LoveBalmDay {
  return (day === 7 ? 1 : ((day + 1) as LoveBalmDay))
}

export type CourseChakraNudge = {
  chakra: string
  todayTitle: string
  todayBody: string
  nightBeforeTitle: string
  nightBeforeBody: string
}

/**
 * Lock-screen copy. Noon = today's chakra. Evening = tomorrow's chakra.
 * Sunday evening is the course itself — Monday Root, the seven-day beginning.
 */
export const COURSE_CHAKRA_NUDGES: Record<LoveBalmDay, CourseChakraNudge> = {
  1: {
    chakra: 'Root',
    todayTitle: 'I am. I belong.',
    todayBody:
      'The Root holds you to the Earth. One slow breath into the feet — safety is the soil every other chakra grows from.',
    nightBeforeTitle: 'Tomorrow, the Root',
    nightBeforeBody:
      'The seven days begin at dawn. Rest tonight. Monday asks only this: can you feel that you already belong?',
  },
  2: {
    chakra: 'Sacral',
    todayTitle: 'I feel. I flow. I create.',
    todayBody:
      'Sacral is the waters of joy. Let one honest desire move — creation starts as sweetness, not strain.',
    nightBeforeTitle: 'Tomorrow, the Sacral',
    nightBeforeBody:
      'A little gnosis for the night: pleasure is intelligence. Sacral waters wait on Tuesday — will you let yourself feel?',
  },
  3: {
    chakra: 'Solar Plexus',
    todayTitle: 'My truth is my fire.',
    todayBody:
      'Solar plexus heals the dimmed light. Speak one true thing to yourself — power returns when you stop shrinking.',
    nightBeforeTitle: 'Tomorrow, the Solar Plexus',
    nightBeforeBody:
      'The sun in you is not arrogance. Solar plexus fire asks tomorrow: where have you dimmed to keep the peace?',
  },
  4: {
    chakra: 'Heart',
    todayTitle: 'My love is unconditional.',
    todayBody:
      'Heart is the bridge from head to We. One breath for you, one for another — this is how the chest actually opens.',
    nightBeforeTitle: 'Tomorrow, the Heart',
    nightBeforeBody:
      'A secret of the path: the mind builds walls, the Heart is a window. Thursday is the crossing. Will you open it?',
  },
  5: {
    chakra: 'Throat',
    todayTitle: 'I speak with truth.',
    todayBody:
      'Throat heals the swallowed word. Let one clean sentence leave you — voice is how the soul takes up space.',
    nightBeforeTitle: 'Tomorrow, the Throat',
    nightBeforeBody:
      'Silence can be wisdom or a cage. Throat day invites your voice. What have you been holding behind the teeth?',
  },
  6: {
    chakra: 'Third Eye',
    todayTitle: 'I see beyond the mind of self.',
    todayBody:
      'Ajna clears the dust of overthinking. Soften the forehead — seeing is not figuring. Let the universe look through you.',
    nightBeforeTitle: 'Tomorrow, the Third Eye',
    nightBeforeBody:
      'Tonight, less story, more sky. Third Eye sight waits on Saturday. What if you are not the voice in your head?',
  },
  7: {
    chakra: 'Crown',
    todayTitle: 'I surround myself with light.',
    todayBody:
      'Crown completes the seven days. Rest in unity — you are not separate from the light you seek.',
    nightBeforeTitle: 'Tomorrow, the Crown',
    nightBeforeBody:
      'The week climbs to the stars. Crown is Sunday oneness. Can you meet yourself as light, not as a problem to solve?',
  },
}

export function copyForDailySlot(
  kind: 'noon' | 'evening',
  fireAt: Date,
): { title: string; body: string } {
  const today = chakraDayFromDate(fireAt)
  if (kind === 'noon') {
    const n = COURSE_CHAKRA_NUDGES[today]
    return { title: n.todayTitle, body: n.todayBody }
  }
  const n = COURSE_CHAKRA_NUDGES[nextLoveBalmDay(today)]
  return { title: n.nightBeforeTitle, body: n.nightBeforeBody }
}

/** Sunday night — course-aligned preview of Monday Root. */
export const SUNDAY_EARTH_CYCLE_COPY = {
  title: COURSE_CHAKRA_NUDGES[1].nightBeforeTitle,
  body: COURSE_CHAKRA_NUDGES[1].nightBeforeBody,
} as const

/** Modal copy when opting in to daily alignment reminders. */
export const DAILY_ALIGNMENT_MODAL_COPY = {
  title: 'Partner on the path',
  body:
    'Allow gentle daily reminders to align with the rhythm of your energy body. We walk beside you — heart-minded nudges toward soul alignment, never noise.',
  profileNote: 'You can turn daily reminders off anytime in Profile.',
  allowLabel: 'Activate daily reminders to align',
  notNowLabel: 'Not now',
} as const

/** Shown once after the first close of Chakras 101 (new seekers, first week). */
export const WEEK1_JOURNEY_NOTICE_COPY = {
  title: 'We will walk with you',
  body:
    'We will lovingly join you on your first journey, and remind the busy mind when it is time to check in with the heart and soul — only on days you have not opened the app.',
  profileNote:
    'You can turn these reminders on or off anytime in Profile.',
  cta: 'I understand',
} as const

/** Shown once after leaving the Crown / final goodbye screen. */
export const CROWN_GOODBYE_PROFILE_REMINDER_COPY = {
  title: 'Reminders live in Profile',
  body:
    'This first week, we walked with you automatically. From here, daily alignment reminders live in Profile — on or off, whenever you need them.',
  profileNote: 'Open Profile anytime to change this.',
  cta: 'I understand',
} as const

/** Wednesday — solar plexus, only when daily alignment is off. */
export const WEDNESDAY_ENERGY_BODY_COPY = {
  title: COURSE_CHAKRA_NUDGES[3].todayTitle,
  body: COURSE_CHAKRA_NUDGES[3].todayBody,
} as const

export const SUSTENANCE_COPY = {
  sundayEve: SUNDAY_EARTH_CYCLE_COPY,
  pulseMon: {
    title: 'The anchor',
    body: 'Root is the anchor. Reconnect with your physical vessel. You are safe. You are home.',
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

/**
 * Affirmations aligned to COURSE_CHAKRA_NUDGES — kept for any remaining readers.
 */
export const LOVE_BALMS: Record<
  LoveBalmDay,
  { affirmations: string[]; loveBalms: string[] }
> = {
  1: {
    affirmations: [COURSE_CHAKRA_NUDGES[1].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[1].todayBody],
  },
  2: {
    affirmations: [COURSE_CHAKRA_NUDGES[2].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[2].todayBody],
  },
  3: {
    affirmations: [COURSE_CHAKRA_NUDGES[3].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[3].todayBody],
  },
  4: {
    affirmations: [COURSE_CHAKRA_NUDGES[4].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[4].todayBody],
  },
  5: {
    affirmations: [COURSE_CHAKRA_NUDGES[5].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[5].todayBody],
  },
  6: {
    affirmations: [COURSE_CHAKRA_NUDGES[6].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[6].todayBody],
  },
  7: {
    affirmations: [COURSE_CHAKRA_NUDGES[7].todayTitle],
    loveBalms: [COURSE_CHAKRA_NUDGES[7].todayBody],
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
