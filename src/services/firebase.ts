/**
 * Firebase Service Configuration
 *
 * Initializes Firebase App, Firestore, and Cloud Storage for the Soul School app.
 * Implements offline persistence to ensure the app remains connected to the soul
 * even without network connectivity.
 *
 * Key implementation details:
 * - Uses Firebase JS SDK v9+ modular API
 * - Enables Firestore offline persistence for cached data access (100MB cache)
 * - Configures Cloud Storage for asset retrieval
 * - Analytics is web-only and excluded for React Native compatibility
 *
 * Important: Large audio files (100MB+) are handled by expo-av streaming directly
 * from Cloud Storage URLs. They are NOT cached in Firestore. The Firestore cache
 * is reserved for chakra content data (text, metadata, image paths, etc.). Audio
 * files stream on-demand via expo-av's native streaming capabilities.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
    initializeFirestore,
    getFirestore,
    type Firestore,
} from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import Constants from 'expo-constants'

// Get Firebase configuration from environment variables via expo-constants
const getFirebaseConfig = () => {
    const firebaseConfig = Constants.expoConfig?.extra?.firebase

    if (!firebaseConfig || !firebaseConfig.apiKey) {
        if (__DEV__) {
            console.warn(
                'Firebase configuration is missing. Please check your .env file and app.config.js',
            )
        }
        // Return a minimal config to prevent app crash
        // The app will handle missing Firebase gracefully
        return null
    }

    return {
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
        measurementId: firebaseConfig.measurementId,
    }
}

// Your web app's Firebase configuration (from environment variables)
const firebaseConfig = getFirebaseConfig()

// Initialize Firebase App only if config is available
let app: FirebaseApp | null = null
if (firebaseConfig) {
    try {
        app = initializeApp(firebaseConfig)
    } catch (error) {
        if (__DEV__) {
            console.error('Failed to initialize Firebase:', error)
        }
    }
}

// Initialize Firestore with offline persistence enabled
// This ensures data is cached locally for offline access
// Note: This cache is for Firestore documents (chakra content, metadata, etc.)
// Large audio files are streamed directly via expo-av, not cached here
let db: Firestore | null = null
if (app) {
    try {
        // Initialize Firestore with offline persistence enabled
        // In Firebase v11, persistence is enabled by default with initializeFirestore
        db = initializeFirestore(app, {
            // Enable offline persistence with 200MB cache for Soul School's expansion
            // Increased from 100MB to support more cached content and better offline experience
            cacheSizeBytes: 200 * 1024 * 1024, // 200MB cache size
        })
        
        if (__DEV__) {
            console.log('Firestore offline persistence enabled (200MB cache)')
        }
    } catch (error: unknown) {
        if (__DEV__) {
            console.warn('Failed to initialize Firestore with persistence:', error)
        }
        // Fallback to regular Firestore initialization
        if (app) {
            db = getFirestore(app)
        }
    }
}

// Initialize Cloud Storage
let storage: FirebaseStorage | null = null
if (app) {
    try {
        storage = getStorage(app)
    } catch (error) {
        if (__DEV__) {
            console.warn('Failed to initialize Firebase Storage:', error)
        }
    }
}

// Export initialized services
export { app, db, storage }
export type { FirebaseApp, Firestore, FirebaseStorage }

