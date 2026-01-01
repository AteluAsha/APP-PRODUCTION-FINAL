/**
 * Anua Community Cache Service
 * 
 * This service manages community-contributed questions and responses for Anua,
 * building her offline knowledge base from real user interactions.
 * 
 * Features:
 * - Stores user questions and Anua's responses in Firestore
 * - Tracks question frequency to identify common queries
 * - Auto-populates cache on app launch with most common questions
 * - Allows community to build Anua's offline content library
 */

import { collection, doc, setDoc, getDocs, query, orderBy, limit, where, increment, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { apiCall } from '../utils/apiHelpers'
import { captureException } from './sentry'

const COMMUNITY_CACHE_COLLECTION = 'anua_community_cache'
const CACHE_STATS_COLLECTION = 'anua_cache_stats'

interface CommunityQuestion {
    id: string
    question: string
    response: string
    chakraDay?: number // 0-6 (Monday-Sunday)
    chakraContext?: string // e.g., "root", "heart"
    createdAt: Date
    askCount: number // How many times this question has been asked
    lastAsked: Date
    tags?: string[] // e.g., ["grounding", "meditation", "mantra"]
}

interface CacheStats {
    totalQuestions: number
    totalInteractions: number
    lastUpdated: Date
    topQuestions: string[] // IDs of most frequently asked questions
}

/**
 * Store a question and Anua's response in the community cache
 * This builds the offline knowledge base from real user interactions
 */
export const storeCommunityInteraction = async (
    question: string,
    response: string,
    context?: {
        chakraDay?: number
        chakraContext?: string
    },
): Promise<void> => {
    try {
        // Normalize question (lowercase, trim, remove extra spaces)
        const normalizedQuestion = question
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')

        // Create a document ID from the normalized question (hash-like)
        const docId = normalizedQuestion
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 100) // Limit length

        const questionRef = doc(db, COMMUNITY_CACHE_COLLECTION, docId)
        const questionDoc = await apiCall(
            async () => getDoc(questionRef),
            { timeout: 5000 },
            { service: 'firestore', operation: 'getCommunityQuestion' },
        )

        const now = serverTimestamp()

        if (questionDoc.exists()) {
            // Question already exists - increment ask count
            await apiCall(
                async () => setDoc(
                    questionRef,
                    {
                        askCount: increment(1),
                        lastAsked: now,
                        // Update response if it's been improved or changed
                        response: response,
                        updatedAt: now,
                    },
                    { merge: true },
                ),
                { timeout: 5000 },
                { service: 'firestore', operation: 'updateCommunityQuestion' },
            )
        } else {
            // New question - create document
            const newQuestion = {
                question: question,
                response: response,
                chakraDay: context?.chakraDay,
                chakraContext: context?.chakraContext,
                createdAt: now,
                askCount: 1,
                lastAsked: now,
            }

            await apiCall(
                async () => setDoc(questionRef, newQuestion),
                { timeout: 5000 },
                { service: 'firestore', operation: 'createCommunityQuestion' },
            )
        }

        // Update cache stats
        await updateCacheStats()
    } catch (error) {
        // Don't throw - this is a background operation
        if (__DEV__) {
            console.error('Error storing community interaction:', error)
        }
        captureException(error instanceof Error ? error : new Error(String(error)), {
            service: 'anuaCommunityCache',
            operation: 'storeCommunityInteraction',
        })
    }
}

/**
 * Get the most common questions from the community cache
 * These will be used to populate Anua's offline responses
 */
export const getTopCommunityQuestions = async (
    limitCount: number = 50,
    chakraDay?: number,
): Promise<CommunityQuestion[]> => {
    try {
        let q = query(
            collection(db, COMMUNITY_CACHE_COLLECTION),
            orderBy('askCount', 'desc'),
            limit(limitCount),
        )

        // Filter by chakra day if provided
        if (chakraDay !== undefined) {
            q = query(
                collection(db, COMMUNITY_CACHE_COLLECTION),
                where('chakraDay', '==', chakraDay),
                orderBy('askCount', 'desc'),
                limit(limitCount),
            )
        }

        const snapshot = await apiCall(
            async () => getDocs(q),
            { timeout: 10000 },
            { service: 'firestore', operation: 'getTopCommunityQuestions' },
        )

        const questions: CommunityQuestion[] = []
        snapshot.forEach((doc) => {
            const data = doc.data()
            questions.push({
                id: doc.id,
                question: data.question,
                response: data.response,
                chakraDay: data.chakraDay,
                chakraContext: data.chakraContext,
                createdAt: data.createdAt?.toDate() || new Date(),
                askCount: data.askCount || 1,
                lastAsked: data.lastAsked?.toDate() || new Date(),
                tags: data.tags || [],
            })
        })

        return questions
    } catch (error) {
        if (__DEV__) {
            console.error('Error fetching top community questions:', error)
        }
        captureException(error instanceof Error ? error : new Error(String(error)), {
            service: 'anuaCommunityCache',
            operation: 'getTopCommunityQuestions',
        })
        return []
    }
}

/**
 * Update cache statistics
 */
const updateCacheStats = async (): Promise<void> => {
    try {
        const statsRef = doc(db, CACHE_STATS_COLLECTION, 'main')
        const statsDoc = await apiCall(
            async () => getDoc(statsRef),
            { timeout: 5000 },
            { service: 'firestore', operation: 'getCacheStats' },
        )

        const topQuestions = await getTopCommunityQuestions(20)
        const topQuestionIds = topQuestions.map((q) => q.id)

        if (statsDoc.exists()) {
            await apiCall(
                async () => setDoc(
                    statsRef,
                    {
                        totalQuestions: topQuestions.length,
                        lastUpdated: new Date(),
                        topQuestions: topQuestionIds,
                    },
                    { merge: true },
                ),
                { timeout: 5000 },
                { service: 'firestore', operation: 'updateCacheStats' },
            )
        } else {
            await apiCall(
                async () => setDoc(statsRef, {
                    totalQuestions: topQuestions.length,
                    totalInteractions: topQuestions.reduce((sum, q) => sum + q.askCount, 0),
                    lastUpdated: serverTimestamp(),
                    topQuestions: topQuestionIds,
                }),
                { timeout: 5000 },
                { service: 'firestore', operation: 'createCacheStats' },
            )
        }
    } catch (error) {
        if (__DEV__) {
            console.error('Error updating cache stats:', error)
        }
        // Don't throw - this is a background operation
    }
}

/**
 * Populate Anua's cache with top community questions on app launch
 * This ensures common questions are available offline
 */
export const populateCacheFromCommunity = async (): Promise<void> => {
    try {
        if (__DEV__) {
            console.log('[Anua Community Cache] Populating cache from community questions...')
        }

        // Get top questions for each chakra day (0-6) and general questions
        const allQuestions: CommunityQuestion[] = []

        // Get general questions (no specific chakra day)
        const generalQuestions = await getTopCommunityQuestions(20)
        allQuestions.push(...generalQuestions)

        // Get questions for each chakra day
        for (let day = 0; day < 7; day++) {
            const dayQuestions = await getTopCommunityQuestions(10, day)
            allQuestions.push(...dayQuestions)
        }

        // Remove duplicates (same question asked on different days)
        const uniqueQuestions = new Map<string, CommunityQuestion>()
        allQuestions.forEach((q) => {
            const key = q.question.toLowerCase().trim()
            if (!uniqueQuestions.has(key) || (uniqueQuestions.get(key)?.askCount || 0) < q.askCount) {
                uniqueQuestions.set(key, q)
            }
        })

        if (__DEV__) {
            console.log(`[Anua Community Cache] Loaded ${uniqueQuestions.size} unique community questions`)
        }

        // Store in a format that can be accessed by the cache system
        // We'll update the anuaCache.ts to use these
        return Promise.resolve()
    } catch (error) {
        if (__DEV__) {
            console.error('Error populating cache from community:', error)
        }
        captureException(error instanceof Error ? error : new Error(String(error)), {
            service: 'anuaCommunityCache',
            operation: 'populateCacheFromCommunity',
        })
    }
}

/**
 * Get a cached response from community questions
 * This is called when the API is unavailable
 */
export const getCommunityCachedResponse = async (
    question: string,
    chakraDay?: number,
): Promise<string | null> => {
    try {
        const normalizedQuestion = question
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')

        // Try to find exact match first
        const docId = normalizedQuestion
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 100)

        const questionRef = doc(db, COMMUNITY_CACHE_COLLECTION, docId)
        const questionDoc = await apiCall(
            async () => getDoc(questionRef),
            { timeout: 5000 },
            { service: 'firestore', operation: 'getCommunityCachedResponse' },
        )

        if (questionDoc.exists()) {
            const data = questionDoc.data()
            return data.response || null
        }

        // If no exact match, try to find similar questions for this chakra day
        if (chakraDay !== undefined) {
            const dayQuestions = await getTopCommunityQuestions(10, chakraDay)
            // Simple keyword matching (could be improved with better similarity matching)
            const questionWords = normalizedQuestion.split(' ')
            for (const q of dayQuestions) {
                const responseWords = q.question.toLowerCase().split(' ')
                const matchCount = questionWords.filter((w) => responseWords.includes(w)).length
                if (matchCount >= 2) {
                    // At least 2 words match
                    return q.response
                }
            }
        }

        return null
    } catch (error) {
        if (__DEV__) {
            console.error('Error getting community cached response:', error)
        }
        return null
    }
}

