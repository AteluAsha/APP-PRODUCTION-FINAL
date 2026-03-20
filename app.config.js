/**
 * Expo Configuration with Environment Variables
 *
 * This file reads environment variables from .env (in development) or
 * from EAS Build environment variables (in production builds).
 * This allows secure API key management.
 */

// Try to load dotenv in development, but don't fail if it's not available
// EAS Build uses environment variables set in the build environment
try {
  require("dotenv").config()
} catch (error) {
  // dotenv is optional - EAS Build will use environment variables from build config
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "dotenv not available, using environment variables from system",
    )
  }
}

// HERO MASTER: App icon on phone MUST be black background + color wheel. Never white.
// Single source: ChakraWheel_ONBLACK_300DPI.png (production app icon for iOS and Android).
const APP_ICON_BLACK = "./assets/images/ChakraWheel_ONBLACK_300DPI.png"

module.exports = {
  expo: {
    // Home screen label under icon; store listing may use longer name (e.g. SOUL SCHOOL | ProjectStarseed)
    name: "SOUL SCHOOL",
    slug: "soul-school",
    version: "1.0.0",
    orientation: "portrait",
    icon: APP_ICON_BLACK,
    // Native shield: golden "7" load art (small, centered). JS splash uses SoulSchool_HERO_Logo. Run prebuild --clean after change.
    splash: {
      image: "./assets/images/SoulSchool_APP_HeroLoadImage.png",
      backgroundColor: "#000000",
      resizeMode: "contain",
      imageWidth: 130,
    },
    scheme: "soul-school",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    jsEngine: "hermes", // Explicitly use Hermes for iOS and Android
    ios: {
      jsEngine: "hermes", // Explicitly set Hermes for iOS
      supportsTablet: true,
      icon: APP_ICON_BLACK,
      infoPlist: {
        // iOS home screen label; production uses SOUL SCHOOL (App Store listing may differ)
        CFBundleDisplayName: "SOUL SCHOOL",
        LSApplicationQueriesSchemes: ["whatsapp", "sms", "mailto"],
        UIBackgroundModes: ["audio"],
        // Allow Metro bundler at localhost/127.0.0.1 in simulator and dev (required for "Could not connect to development server")
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            localhost: { NSExceptionAllowsInsecureHTTPLoads: true },
            "127.0.0.1": { NSExceptionAllowsInsecureHTTPLoads: true },
          },
        },
        // Required for iOS to access your local network (e.g. Metro on 192.168.x.x).
        NSLocalNetworkUsageDescription:
          "Allow SOUL SCHOOL to connect to your local Metro dev server during development.",
        NSCameraUsageDescription:
          "We need access to your camera to record a video for sharing your journey.",
        NSMicrophoneUsageDescription:
          "We need access to your microphone to record audio with your video.",
        NSPhotoLibraryUsageDescription:
          "SOUL SCHOOL uses your photo library so you can choose a profile picture and share images in the community.",
      },
      bundleIdentifier: "com.sevenchakras.SevenChakras",
      // Bump for each TestFlight / store upload. EAS production profile may autoIncrement over this; align with dashboard if needed.
      buildNumber: "2",
    },
    android: {
      jsEngine: "hermes", // Explicitly set Hermes for Android
      adaptiveIcon: {
        foregroundImage: APP_ICON_BLACK,
        backgroundColor: "#000000",
      },
      // Avoid default semi-transparent status bar scrim (#00000088) so the app doesn't feel dim
      androidStatusBar: {
        backgroundColor: "#00000000",
        translucent: true,
      },
      package: "com.sevenchakras.SevenChakras",
      // No SEND_SMS / SMS permissions: app never sends messages automatically; invite flow only opens system Messages/WhatsApp with pre-filled text; user taps Send.
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "SCHEDULE_EXACT_ALARM",
        "READ_CONTACTS",
      ],
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "15.1",
          },
        },
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/SoulSchool_APP_HeroLoadImage.png",
          backgroundColor: "#000000",
          resizeMode: "contain",
          imageWidth: 130,
        },
      ],
      [
        "expo-navigation-bar",
        {
          barStyle: "light",
          enforceContrast: false,
        },
      ],
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow SOUL SCHOOL to access your camera to record videos for sharing your journey.",
          microphonePermission:
            "Allow SOUL SCHOOL to access your microphone to record audio with your videos.",
        },
      ],
      [
        "expo-notifications",
        {
          defaultChannel: "journey-reminders",
          color: "#9D4EDD",
        },
      ],
      [
        "expo-contacts",
        {
          contactsPermission:
            "Allow SOUL SCHOOL to find friends who are also on the journey.",
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
        projectId: "778607df-420e-4e0d-9c38-e9546155bdb8",
      },
      // Environment variables accessible via Constants.expoConfig.extra
      // These come from .env in development or EAS Build environment variables in production
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY || "",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.FIREBASE_APP_ID || "",
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
      },
      revenuecat: {
        apiKey: process.env.REVENUECAT_API_KEY || "",
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || "",
        apiKey2: process.env.GEMINI_API_KEY_2 || "",
        apiKey3: process.env.GEMINI_API_KEY_3 || "",
      },
      // Google Cloud Speech-to-Text API (optional - for voice transcription)
      // If not configured, responses will proceed without transcription
      googleCloudSpeechApiKey: process.env.GOOGLE_CLOUD_SPEECH_API_KEY || "",
      elevenlabs: {
        apiKey: process.env.ELEVENLABS_API_KEY || "",
        anuaVoiceId: "HrWCrSWs1tCFPWiH0ax8", // Anua's permanent hero voice - curated for true alignment
      },
      stripe: {
        // Stripe Publishable Key (safe to expose in app)
        // Updated: Non-profit account credentials (hot swap completed)
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
        // Backend API URL for Stripe operations (serverless function)
        // IMPORTANT: Secret key is stored on backend, NOT in app
        // Update STRIPE_SECRET_KEY in backend environment variables
        backendUrl: process.env.STRIPE_BACKEND_URL || "",
      },
      // Sentry error tracking (optional - add SENTRY_DSN to .env or EAS Build env vars)
      sentry: {
        dsn: process.env.SENTRY_DSN || "",
        enableInDev: false, // Set to true to test Sentry in development
        debug: false, // Enable Sentry debug logging
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      },
    },
    owner: "theprofessor1111s-organization",
  },
}
