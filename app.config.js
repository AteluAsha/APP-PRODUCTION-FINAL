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

// Firebase Android native config: repo root, or EAS file env path on the worker.
// .easignore must not exclude this path — see .easignore comment block.
const GOOGLE_SERVICES_FILE =
  process.env.GOOGLE_SERVICES_JSON || "./google-services.json"

module.exports = {
  expo: {
    // Store title (App Store / Play). Home-screen label is CFBundleDisplayName /
    // Android app_name via withLauncherDisplayName — both "Awakening Soul".
    name: "Awakening Soul",
    slug: "soul-school",
    version: "1.2.7",
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
        // App Store export compliance: app only uses exempt encryption (e.g. HTTPS)
        ITSAppUsesNonExemptEncryption: false,
        // iOS home-screen label under the icon
        CFBundleDisplayName: "Awakening Soul",
        CFBundleName: "Awakening Soul",
        LSApplicationQueriesSchemes: ["whatsapp", "sms", "mailto"],
        UIBackgroundModes: ["audio"],
        UIStatusBarStyle: "UIStatusBarStyleLightContent",
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
          "Awakening Soul uses the local network only when you connect from this device on your own Wi-Fi.",
        NSCameraUsageDescription:
          "Allow Awakening Soul to access your camera to record videos for sharing your journey.",
        NSMicrophoneUsageDescription:
          "Allow Awakening Soul to access your microphone to record audio with your videos.",
        NSPhotoLibraryUsageDescription:
          "Awakening Soul uses your photo library so you can choose a profile picture.",
        AppStoreID: "6760920862",
      },
      bundleIdentifier: "com.sevenchakras.SevenChakras",
      // iOS 1.2.7 (49): App Store ship — Alignment gallery, embodiment close.
      buildNumber: "49",
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeDeviceID",
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              "NSPrivacyCollectedDataTypePurposeAppFunctionality",
            ],
          },
        ],
      },
    },
    android: {
      jsEngine: "hermes", // Explicitly set Hermes for Android
      // Disable Google Auto Backup. Per-install state (AsyncStorage: trial progress,
      // course start date, completed chakras) must not be restored on reinstall or
      // device transfer. RevenueCat / Firebase restore from their own servers.
      // Matches android:allowBackup="false" + xml/data_extraction_rules in the native
      // manifest; this line keeps the setting if anyone runs `expo prebuild --clean`.
      allowBackup: false,
      googleServicesFile: GOOGLE_SERVICES_FILE,
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
      // User-facing 1.2.7. Production AAB versionCode 47 (appVersionSource: local).
      versionCode: 47,
      // No SEND_SMS / SMS permissions: app never sends messages automatically; invite flow only opens system Messages/WhatsApp with pre-filled text; user taps Send.
      permissions: [
        "RECORD_AUDIO",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "WAKE_LOCK",
        "POST_NOTIFICATIONS",
      ],
      // Strip unused / plugin leftovers so Play does not review dead permissions.
      // CAMERA stays only via expo-image-picker (Energy Exchange video).
      blockedPermissions: [
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.USE_EXACT_ALARM",
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
        "expo-image-picker",
        {
          photosPermission:
            "Awakening Soul uses your photo library so you can choose a profile picture.",
          cameraPermission:
            "Allow Awakening Soul to access your camera to record videos for sharing your journey.",
          microphonePermission:
            "Allow Awakening Soul to access your microphone to record audio with your videos.",
        },
      ],
      [
        "expo-notifications",
        {
          defaultChannel: "soul-journey-nudges",
          color: "#9D4EDD",
        },
      ],
      "expo-audio",
      "./plugins/withAndroidMediaPlayback",
      "./plugins/withLauncherDisplayName",
      "./plugins/withFmtConstevalWorkaround",
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
        // iOS: FIREBASE_APP_ID | Android: FIREBASE_ANDROID_APP_ID (see firebase.ts)
        appId: process.env.FIREBASE_APP_ID || "",
        appIdAndroid: process.env.FIREBASE_ANDROID_APP_ID || "",
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
      },
      // RevenueCat: iOS REVENUECAT_API_KEY | Android REVENUECAT_ANDROID_API_KEY (see revenuecat.ts)
      revenuecat: {
        apiKeyIos: process.env.REVENUECAT_API_KEY || "",
        apiKeyAndroid: process.env.REVENUECAT_ANDROID_API_KEY || "",
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
