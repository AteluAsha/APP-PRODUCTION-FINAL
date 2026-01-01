import { useState, useEffect } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '@/src/services/firebase'
import { Chakra } from '@/types/chakras/Chakra'
import { checkRateLimit, waitForRateLimit } from '@/src/utils/rateLimiter'

/**
 * Map chakras to their embodiment audio filenames
 * CRITICAL: These must match exactly with Firebase Storage file names
 * 
 * Day Mapping:
 * - Monday (Day 0) - ROOT: Day1_RootChakraEmbodiment_SoulSchool.aac
 * - Tuesday (Day 1) - SACRAL: Day2_SacralChakraEmbodiment_SoulSchool.aac
 * - Wednesday (Day 2) - SOLAR_PLEXUS: Day3_SolarChakraEmbodiment_SoulSchool.aac
 * - Thursday (Day 3) - HEART: Day4_HeartChakraEmbodiment_SoulSchool.aac
 * - Friday (Day 4) - THROAT: Day5_ThroatChakraEmbodiment_SoulSchool.aac
 * - Saturday (Day 5) - THIRD_EYE: Day6_PARTONE + Day6_PARTTWO
 * - Sunday (Day 6) - CROWN: Day7_CrownChakraEmbodiment_SoulSchool.aac
 */
const CHAKRA_TO_AUDIO_FILE: Record<Chakra, string | string[]> = {
    [Chakra.ROOT]: 'Day1_RootChakraEmbodiment_SoulSchool.aac', // Monday - Day 0
    [Chakra.SACRAL]: 'Day2_SacralChakraEmbodiment_SoulSchool.aac', // Tuesday - Day 1
    [Chakra.SOLAR_PLEXUS]: 'Day3_SolarChakraEmbodiment_SoulSchool.aac', // Wednesday - Day 2
    [Chakra.HEART]: 'Day4_HeartChakraEmbodiment_SoulSchool.aac', // Thursday - Day 3
    [Chakra.THROAT]: 'Day5_ThroatChakraEmbodiment_SoulSchool.aac', // Friday - Day 4
    [Chakra.THIRD_EYE]: ['Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac', 'Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac'], // Saturday - Day 5
    [Chakra.CROWN]: 'Day7_CrownChakraEmbodiment_SoulSchool.aac', // Sunday - Day 6
}

const STORAGE_FOLDER = 'Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days'

export interface EmbodimentAudioUrls {
    partOne?: string
    partTwo?: string
    single?: string
    isLoading: boolean
    error: Error | null
}

/**
 * Hook to fetch Firebase Storage URLs for chakra embodiment audio files
 * Handles Day 6 specially with two parts (Part One and Part Two)
 */
export const useEmbodimentAudio = (chakra: Chakra) => {
    const [urls, setUrls] = useState<EmbodimentAudioUrls>({
        isLoading: true,
        error: null,
    })

    useEffect(() => {
        const fetchAudioUrls = async () => {
            // Get audio file name before try block so it's available in catch
            const audioFile = CHAKRA_TO_AUDIO_FILE[chakra]
            
            if (__DEV__) {
                console.log(`[useEmbodimentAudio] Fetching audio for chakra: ${chakra}`)
                console.log(`[useEmbodimentAudio] Audio file(s):`, audioFile)
            }
            
            try {
                setUrls({ isLoading: true, error: null })

                // Check if Firebase Storage is initialized
                if (!storage) {
                    throw new Error('Firebase Storage is not initialized. Please check your configuration.')
                }

                // Check rate limit for Firebase Storage reads
                if (!checkRateLimit('firebase')) {
                    await waitForRateLimit('firebase')
                }

                // Handle Day 6 (Third Eye) with two parts
                if (Array.isArray(audioFile)) {
                    const [partOneFile, partTwoFile] = audioFile
                    const partOnePath = `${STORAGE_FOLDER}/${partOneFile}`
                    const partTwoPath = `${STORAGE_FOLDER}/${partTwoFile}`

                    if (__DEV__) {
                        console.log(`[useEmbodimentAudio] Day 6 (Third Eye) - Fetching Part One: ${partOnePath}`)
                        console.log(`[useEmbodimentAudio] Day 6 (Third Eye) - Fetching Part Two: ${partTwoPath}`)
                    }

                    try {
                        const [partOneUrl, partTwoUrl] = await Promise.all([
                            getDownloadURL(ref(storage, partOnePath)),
                            getDownloadURL(ref(storage, partTwoPath)),
                        ])

                    if (__DEV__) {
                        console.log(`[useEmbodimentAudio] Day 6 (Third Eye) - Successfully fetched both parts`)
                    }

                        setUrls({
                            partOne: partOneUrl,
                            partTwo: partTwoUrl,
                            isLoading: false,
                            error: null,
                        })
                    } catch (fetchError) {
                    if (__DEV__) {
                        console.error(`[useEmbodimentAudio] Day 6 (Third Eye) - Error fetching audio files:`, fetchError)
                    }
                        throw fetchError
                    }
                }
                // Handle Crown (Day 7) - awaiting final export
                else if (!audioFile || audioFile === '') {
                    setUrls({
                        isLoading: false,
                        error: new Error('Audio file not yet available for Crown chakra'),
                    })
                }
                // Handle single audio file (Days 1-5)
                else {
                    // Rate limit already checked above for Day 6, but check again for single files
                    if (!checkRateLimit('firebase')) {
                        await waitForRateLimit('firebase')
                    }
                    const audioPath = `${STORAGE_FOLDER}/${audioFile}`
                    
                    if (__DEV__) {
                        console.log(`[useEmbodimentAudio] Fetching single audio file: ${audioPath}`)
                    }
                    
                    const audioUrl = await getDownloadURL(ref(storage, audioPath))

                    if (__DEV__) {
                        console.log(`[useEmbodimentAudio] Successfully fetched audio URL for ${chakra}:`, audioUrl.substring(0, 50) + '...')
                    }

                    setUrls({
                        single: audioUrl,
                        isLoading: false,
                        error: null,
                    })
                }
            } catch (error) {
                if (__DEV__) {
                    console.error(`Error fetching embodiment audio for ${chakra}:`, error)
                }
                
                // Provide more specific error messages
                let errorMessage = 'Failed to fetch audio URL'
                if (error instanceof Error) {
                    if (error.message.includes('object-not-found') || error.message.includes('404')) {
                        errorMessage = `Audio file not found in Firebase Storage. Please verify the file exists: ${audioFile}`
                    } else if (error.message.includes('permission') || error.message.includes('403')) {
                        errorMessage = 'Permission denied. Please check Firebase Storage rules.'
                    } else if (error.message.includes('network') || error.message.includes('fetch')) {
                        errorMessage = 'Network error. Please check your internet connection.'
                    } else {
                        errorMessage = error.message
                    }
                }
                
                setUrls({
                    isLoading: false,
                    error: new Error(errorMessage),
                })
            }
        }

        fetchAudioUrls()
    }, [chakra])

    return urls
}

