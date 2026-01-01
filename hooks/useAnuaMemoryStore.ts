/**
 * Anua Memory Store
 *
 * Stores Anua's growing understanding of each user through their journey.
 * This allows Anua to personalize questions, remember context, and guide
 * with increasing intimacy and wisdom as she learns who they are.
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface MeditationReflection {
    chakra: string
    date: string // ISO date string
    motivation?: string
    emotion?: string
    thinking?: string
    reflection?: string // Anua's generated reflection
}

export interface UserInsight {
    category: 'motivation' | 'challenge' | 'pattern' | 'growth' | 'preference' | 'health' | 'chakra_block'
    insight: string
    date: string // ISO date string
    chakra?: string // Related chakra if applicable
}

export interface ChakraBlock {
    chakra: string
    detectedDate: string // ISO date string
    severity: 'mild' | 'moderate' | 'significant'
    symptoms: string[] // Physical or emotional symptoms indicating the block
    lastReminderSent?: string // ISO date string of last reminder
    reminderFrequency?: 'daily' | 'every_other_day' | 'weekly' // How often to send reminders
    preferredReminderTime?: string // Time of day (e.g., "09:00", "14:00")
}

export interface HealthPattern {
    symptom: string
    associatedChakras: string[] // Which chakras relate to this symptom
    firstNoted: string // ISO date string
    frequency: 'occasional' | 'frequent' | 'chronic'
    context: string // When/why it appears
}

export interface AnuaMemoryState {
    // User's name (if shared)
    userName: string | null

    // All meditation reflections and responses
    meditationHistory: MeditationReflection[]

    // Insights Anua has learned about the user
    userInsights: UserInsight[]

    // Previous questions asked (to avoid repetition)
    previousQuestions: Array<{
        question: string
        date: string
        chakra?: string
    }>

    // Journey context - what Anua knows about their path
    journeyContext: {
        currentChakra?: string
        completedChakras: string[]
        patterns: string[] // e.g., "tends to feel tightness in solar plexus", "struggles with throat expression"
        strengths: string[] // e.g., "strong connection to heart chakra", "natural intuition"
        challenges: string[] // e.g., "difficulty grounding", "trouble with boundaries"
    }

    // Chakra blocks detected through user responses
    chakraBlocks: ChakraBlock[]

    // Health patterns and symptoms
    healthPatterns: HealthPattern[]

    // Notification preferences and schedule
    notificationPreferences: {
        enabled: boolean
        preferredTimes: string[] // Array of times (e.g., ["09:00", "18:00"])
        gentleRemindersEnabled: boolean
    }

    // Conversation history for context
    conversationHistory: Array<{
        date: string
        userMessage?: string
        anuaMessage: string
        context?: string // e.g., "post-meditation", "reminder", "check-in"
    }>

    // Actions
    setUserName: (name: string) => void
    addMeditationReflection: (reflection: MeditationReflection) => void
    addUserInsight: (insight: UserInsight) => void
    addPreviousQuestion: (question: string, chakra?: string) => void
    updateJourneyContext: (updates: Partial<AnuaMemoryState['journeyContext']>) => void
    addConversation: (userMessage: string | undefined, anuaMessage: string, context?: string) => void
    getMemoryContext: () => string // Returns formatted context for AI prompts
    addChakraBlock: (block: ChakraBlock) => void
    updateChakraBlock: (chakra: string, updates: Partial<ChakraBlock>) => void
    getChakraBlocks: () => ChakraBlock[]
    addHealthPattern: (pattern: HealthPattern) => void
    getHealthPatterns: () => HealthPattern[]
    updateNotificationPreferences: (preferences: Partial<AnuaMemoryState['notificationPreferences']>) => void
    getPastReflections: (chakra?: string) => MeditationReflection[] // Get past reflections for personalization
}

export const useAnuaMemoryStore = create<AnuaMemoryState>()(
    persist(
        (set, get) => ({
            userName: null,
            meditationHistory: [],
            userInsights: [],
            previousQuestions: [],
            journeyContext: {
                completedChakras: [],
                patterns: [],
                strengths: [],
                challenges: [],
            },
            conversationHistory: [],
            chakraBlocks: [],
            healthPatterns: [],
            notificationPreferences: {
                enabled: true,
                preferredTimes: ['09:00', '18:00'], // Default morning and evening
                gentleRemindersEnabled: true,
            },

            setUserName: (name: string) => set({ userName: name }),

            addMeditationReflection: (reflection: MeditationReflection) =>
                set((state) => ({
                    meditationHistory: [...state.meditationHistory, reflection],
                })),

            addUserInsight: (insight: UserInsight) =>
                set((state) => ({
                    userInsights: [...state.userInsights, insight],
                })),

            addPreviousQuestion: (question: string, chakra?: string) =>
                set((state) => ({
                    previousQuestions: [
                        ...state.previousQuestions,
                        { question, date: new Date().toISOString(), chakra },
                    ],
                })),

            updateJourneyContext: (updates: Partial<AnuaMemoryState['journeyContext']>) =>
                set((state) => ({
                    journeyContext: { ...state.journeyContext, ...updates },
                })),

            addConversation: (userMessage: string | undefined, anuaMessage: string, context?: string) =>
                set((state) => ({
                    conversationHistory: [
                        ...state.conversationHistory,
                        {
                            date: new Date().toISOString(),
                            userMessage,
                            anuaMessage,
                            context,
                        },
                    ],
                })),

            getMemoryContext: () => {
                const state = get()
                const contextParts: string[] = []

                if (state.userName) {
                    contextParts.push(`User's name: ${state.userName}`)
                }

                if (state.meditationHistory.length > 0) {
                    contextParts.push(
                        `\nMeditation History (${state.meditationHistory.length} sessions):`,
                    )
                    state.meditationHistory.slice(-5).forEach((reflection) => {
                        contextParts.push(
                            `- ${reflection.chakra} meditation on ${reflection.date}`,
                        )
                        if (reflection.emotion) {
                            contextParts.push(`  Body sensation: ${reflection.emotion}`)
                        }
                        if (reflection.motivation) {
                            contextParts.push(`  Life focus: ${reflection.motivation}`)
                        }
                    })
                }

                if (state.userInsights.length > 0) {
                    contextParts.push(`\nInsights about this user:`)
                    state.userInsights.forEach((insight) => {
                        contextParts.push(`- [${insight.category}] ${insight.insight}`)
                    })
                }

                if (state.journeyContext.patterns.length > 0) {
                    contextParts.push(`\nPatterns observed:`)
                    state.journeyContext.patterns.forEach((pattern) => {
                        contextParts.push(`- ${pattern}`)
                    })
                }

                if (state.journeyContext.strengths.length > 0) {
                    contextParts.push(`\nStrengths:`)
                    state.journeyContext.strengths.forEach((strength) => {
                        contextParts.push(`- ${strength}`)
                    })
                }

                if (state.journeyContext.challenges.length > 0) {
                    contextParts.push(`\nChallenges:`)
                    state.journeyContext.challenges.forEach((challenge) => {
                        contextParts.push(`- ${challenge}`)
                    })
                }

                if (state.previousQuestions.length > 0) {
                    contextParts.push(`\nRecent questions asked (avoid repetition):`)
                    state.previousQuestions.slice(-10).forEach((q) => {
                        contextParts.push(`- "${q.question}"`)
                    })
                }

                return contextParts.join('\n')
            },

            addChakraBlock: (block: ChakraBlock) =>
                set((state) => {
                    // Check if block already exists for this chakra
                    const existingIndex = state.chakraBlocks.findIndex(
                        (b) => b.chakra === block.chakra,
                    )
                    if (existingIndex >= 0) {
                        // Update existing block
                        const updated = [...state.chakraBlocks]
                        updated[existingIndex] = { ...updated[existingIndex], ...block }
                        return { chakraBlocks: updated }
                    }
                    return { chakraBlocks: [...state.chakraBlocks, block] }
                }),

            updateChakraBlock: (chakra: string, updates: Partial<ChakraBlock>) =>
                set((state) => {
                    const updated = state.chakraBlocks.map((block) =>
                        block.chakra === chakra ? { ...block, ...updates } : block,
                    )
                    return { chakraBlocks: updated }
                }),

            getChakraBlocks: () => get().chakraBlocks,

            addHealthPattern: (pattern: HealthPattern) =>
                set((state) => {
                    // Check if pattern already exists
                    const existing = state.healthPatterns.find(
                        (p) => p.symptom === pattern.symptom,
                    )
                    if (existing) {
                        // Update frequency if it's the same symptom
                        const updated = state.healthPatterns.map((p) =>
                            p.symptom === pattern.symptom
                                ? { ...p, frequency: pattern.frequency }
                                : p,
                        )
                        return { healthPatterns: updated }
                    }
                    return { healthPatterns: [...state.healthPatterns, pattern] }
                }),

            getHealthPatterns: () => get().healthPatterns,

            updateNotificationPreferences: (
                preferences: Partial<AnuaMemoryState['notificationPreferences']>,
            ) =>
                set((state) => ({
                    notificationPreferences: {
                        ...state.notificationPreferences,
                        ...preferences,
                    },
                })),

            getPastReflections: (chakra?: string) => {
                const state = get()
                if (chakra) {
                    return state.meditationHistory.filter((r) => r.chakra === chakra)
                }
                return state.meditationHistory
            },
        }),
        {
            name: 'anua-memory-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
)

