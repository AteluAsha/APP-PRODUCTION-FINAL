/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Define font families based on useFonts keys
        "instrument-regular": ["InstrumentSansRegular", "sans-serif"],
        "instrument-medium": ["InstrumentSansMedium", "sans-serif"],
        "instrument-semibold": ["InstrumentSansSemiBold", "sans-serif"],
        "instrument-bold": ["InstrumentSansBold", "sans-serif"],
        "instrument-semibold-italic": [
          "InstrumentSansSemiBoldItalic",
          "sans-serif",
        ],
        "instrument-italic": ["InstrumentSansItalic", "sans-serif"],
        cormorant: ["CormorantGaramond", "serif"],
        "cormorant-italic": ["CormorantGaramondItalic", "serif"],
        "space-mono": ["SpaceMono", "monospace"],
        "fira-code": ["FiraCode", "monospace"],
        "koh-santepheap": ["KohSantepheap", "sans-serif"],
        // Optionally set default sans/serif/mono if desired
        // sans: ['InstrumentSansRegular', 'sans-serif'],
        // serif: ['CormorantGaramond', 'serif'],
        // mono: ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
}
