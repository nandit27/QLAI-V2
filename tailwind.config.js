/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#95ff00",
        "on-primary": "#000000",
        "surface": "#ffffff",
        "surface-variant": "#f8f9fa",
        "outline-variant": "#e2e4e7"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      // ── Aceternity ContainerScrollAnimation ──────────────────────────────
      // `will-change-transform` is built-in to Tailwind v3 (JIT), but we
      // call it out here for documentation clarity.
      // `perspective` values are NOT in Tailwind core — add them as CSS vars
      // via the plugin below instead of a theme key (avoids purge issues).
      // ─────────────────────────────────────────────────────────────────────
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Perspective utility used by ContainerScrollAnimation
    // Generates: .perspective-500, .perspective-1000, .perspective-2000
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-500':  { perspective: '500px'  },
        '.perspective-1000': { perspective: '1000px' },
        '.perspective-2000': { perspective: '2000px' },
      });
    },
  ],
}