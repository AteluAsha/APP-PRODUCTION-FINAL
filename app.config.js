/**
 * Expo Configuration with Environment Variables
 * 
 * This file reads environment variables from .env and makes them available
 * via expo-constants. This allows secure API key management.
 */

require('dotenv').config()

module.exports = {
  expo: {
    name: 'SevenChakras',
    slug: 'SevenChakras',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/7chakras.png',
    scheme: 'myapp',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['audio'],
        NSCameraUsageDescription: 'We need access to your camera to record a video for sharing your journey.',
        NSMicrophoneUsageDescription: 'We need access to your microphone to record audio with your video.',
      },
      bundleIdentifier: 'com.sevenchakras.SevenChakras',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/7chakras.png',
        backgroundColor: '#000000',
      },
      package: 'com.sevenchakras.SevenChakras',
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#000000',
          image: './assets/images/SoulSchool_HERO_Logo.png',
          imageWidth: 300,
        },
      ],
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow Soul School to access your camera to record videos for sharing your journey.',
          microphonePermission: 'Allow Soul School to access your microphone to record audio with your videos.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "a698bc4b-394f-4487-b317-80884f2f0cee",
      },
      // Environment variables accessible via Constants.expoConfig.extra
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      revenuecat: {
        apiKey: process.env.REVENUECAT_API_KEY,
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        apiKey2: process.env.GEMINI_API_KEY_2,
        apiKey3: process.env.GEMINI_API_KEY_3,
      },
      elevenlabs: {
        apiKey: process.env.ELEVENLABS_API_KEY,
        anuaVoiceId: process.env.ANUA_VOICE_ID,
      },
      // Sentry error tracking (optional - add SENTRY_DSN to .env)
      sentry: {
        dsn: process.env.SENTRY_DSN,
        enableInDev: false, // Set to true to test Sentry in development
        debug: false, // Enable Sentry debug logging
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      },
    },
    owner: 'seven-chakras',
  },
}

