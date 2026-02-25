/**
 * Integration Bridge Moment content for days 1–7.
 * Keyed by day index (0–6). Shown in IntegrationMomentModal when user taps the integration card.
 */

export type IntegrationMomentEntry = {
  title: string
  body: string
}

export const INTEGRATION_MOMENT_CONTENT: Record<number, IntegrationMomentEntry> = {
  0: {
    title: "Standing in Your Mountain",
    body:
      "As you move into your day, remember that you are the mountain, not the weather passing over it. Your ego might try to convince you that you're \"behind\" or that you need to hustle to prove your worth, but that's just the old script of survival. Your heart knows that you are already home in your own skin, and the Earth is rising up to meet every step you take. This grounding isn't about being stuck; it's about becoming unshakable so you can finally stop running from yourself.\n\n" +
      "Your integration key for the day is to find your \"Tadasana moments\"—whenever you feel the world spinning too fast, just stop and feel the weight of your feet on the ground. Your challenge is to catch the ego every time it tries to make you rush through a door or a conversation just to get to the \"next thing.\" When you feel that push, take three slow breaths and remind your nervous system that the heart moves at the speed of presence, and there is absolutely nowhere else you need to be.",
  },
  1: {
    title: "The Flow of Real Feeling",
    body:
      "The world is going to ask you to perform today, to put on the \"I'm fine\" mask and keep the waters still, but you've just committed to a different frequency. The ego is scared of being \"too much\" or too sensitive because it wants to stay in control, but your heart thrives on the raw, honest truth of how you actually feel. Carry this fluidity with you today like a hidden river, knowing that your sensitivity isn't a weakness—it's your most accurate compass for navigating the \"we.\"\n\n" +
      "Your integration key is the \"Sacral Check-In\": before you react to anything today, ask yourself, How does this energy actually feel? Your challenge is to look people in the eye and ask, \"How are you feeling today?\" instead of the standard \"How's it going?\" When the ego tries to jump in and fix their answer or judge your own mood, just breathe into your lower belly and let the feelings flow. You aren't here to be perfect; you're here to be fluid.",
  },
  2: {
    title: "The Fire of Honest Power",
    body:
      "You're heading into a day that often rewards \"faking it,\" but you're choosing the quiet power of being real. The ego thinks that power comes from being right or looking \"cool,\" which is why it whispers those little white lies that keep you disconnected from your center. Today, you are practicing a higher level of sovereignty by refusing to trade your truth for a comfortable seat at the table. Your inner sun doesn't need to shout to be felt; it just needs to stay honest.\n\n" +
      "The key for today is your \"Truth Log\"—simply notice every time your words don't match your internal vibration. Your challenge is to catch the ego trying to \"people-please\" or perform for status. When you feel a lie starting to form, even a small one, simply pause and stay silent. Witness how much more power you reclaim when you refuse to trade your integrity for someone else's comfort. Your fire is for warming the world, not for burning your own truth.",
  },
  3: {
    title: "Softness as Your Superpower",
    body:
      "Today is about staying soft in a world that often feels quite hard. The ego is going to tell you that building walls is the only way to stay safe, but you're carrying the amethyst frequency now, which teaches you that the heart is the only sanctuary that can't be breached. Every time you feel a \"trigger\" or a judgment today, it's not an attack; it's just a shadow asking for a little bit of light. You are becoming the bridge between the head's fear and the heart's compassion.\n\n" +
      "Your integration key is the \"Amethyst Anchor\": keep that stone close and let it be your secret weapon for staying centered. Your challenge for the day is to internally whisper \"I love you\" to the person—or the part of yourself—that irritates you the most. The ego will think this is \"giving in,\" but the heart-minded truth is that you are simply reclaiming the frequency of your environment so nothing outside of you can dictate your peace. Softness is the ultimate strength.",
  },
  4: {
    title: "Resonating Your Truth",
    body:
      "As you go about your day, remember that your voice is a vibration before it's ever a tool for argument. The ego loves to debate and defend its territory with clever words, but your heart-mind is looking for resonance. You don't need the \"perfect\" sentence to be heard; you just need to be in tune with your own essence. If words feel like they're getting stuck or becoming a performance today, bypass the mind and let your vibration speak for you.\n\n" +
      "Your key for the day is \"Primal Sound\"—if a strong emotion hits, don't try to explain it away with logic or labels. Your challenge is to resist the ego's urge to have the last word or win a point in a conversation. Instead, find a private moment to hum or make a soft sound to move that energy through your throat. Notice how much more space you have in your chest when you stop letting the ego use your voice to build walls between you and the world.",
  },
  5: {
    title: "Seeing the Unseen",
    body:
      "You're stepping into the day with a new set of eyes—not the eyes of the mind that judge and label, but the eyes of the soul that see the unity in everything. The ego is going to try to distract you with \"facts\" and noise, wanting you to analyze and categorize everything you see. But you're on a mission to feel the hidden secrets of the day, listening to the unspoken messages that are always humming beneath the surface of the physical.\n\n" +
      "The key for today is \"Sacred Silence\": try to move through your day without the usual commentary and labels running in your head. Your challenge is to walk into a space—like a store or a park—and write down what you feel from the energy around you, rather than what you see. The ego will want to call it \"imagination,\" but your heart-mind knows that this is the beginning of true intuition. Trust the vibes over the visuals today and see what reveals itself.",
  },
  6: {
    title: "The Grace of Being Done",
    body:
      "Today is the day you stop \"trying\" and start \"being.\" The ego is obsessed with the hustle, convinced that you have to earn your place in the universe by checking off boxes and being productive. But you are a divine being, and your worth is inherent and immovable. By clearing your physical space today, you are creating a temple for your heart-mind to settle in, reminding yourself that you are already part of the whole and the work is finished.\n\n" +
      "Your integration key is \"Saucha,\" the act of purification: as you clean your space today, do it as a prayer, not a chore. Your final challenge is to declare yourself \"done\" for the day once that space is clear. The ego will try to find something else to \"fix\" or \"improve,\" but your heart-minded task is to simply exist in the stillness you've created. You have the keys now, and the locks are gone. You are the bridge, you are the heart, and you are home.",
  },
}

export function getIntegrationMomentContent(dayIndex: number): IntegrationMomentEntry | undefined {
  if (dayIndex < 0 || dayIndex > 6) return undefined
  return INTEGRATION_MOMENT_CONTENT[dayIndex]
}
