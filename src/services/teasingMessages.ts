/**
 * Teasing Messages Service
 *
 * Provides playful, encouraging messages for the GoodbyeModal
 */

export interface TeasingMessage {
  message: string
  emoji?: string
}

/**
 * Get a random teasing message for the goodbye modal
 */
export function getRandomTeasingMessage(): TeasingMessage {
  const messages: TeasingMessage[] = [
    { message: "Your journey continues tomorrow...", emoji: "✨" },
    { message: "See you on the next step of your path", emoji: "🌙" },
    { message: "Until we meet again, beautiful soul", emoji: "💫" },
    { message: "Your transformation continues...", emoji: "🦋" },
  ]

  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

/**
 * Get a wisdom message for the next day
 * Used in GoodbyeModal to encourage users to return
 * @param chakraDay - Optional day number (0-6) for day-specific messages
 */
export function getNextDayWisdomMessage(chakraDay?: number): TeasingMessage {
  const messages: TeasingMessage[] = [
    { message: "Tomorrow brings new wisdom...", emoji: "🌟" },
    { message: "Your next step awaits...", emoji: "🌱" },
    { message: "The journey deepens tomorrow...", emoji: "💎" },
    { message: "New insights await you...", emoji: "🔮" },
  ]

  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}
