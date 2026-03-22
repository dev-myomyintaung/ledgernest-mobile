/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {

        // ── Brand — Soft Violet ──────────────────────────────────────────────
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA', // dark mode primary
          500: '#7C6FF7', // light mode primary
          600: '#6D5FED',
          700: '#5B4DD6',
          800: '#4237A8',
          900: '#2E2478',
        },

        // ── Neutral — Zinc (warm gray) ───────────────────────────────────────
        // Extends Tailwind's built-in zinc — no override needed,
        // listed here for reference and NativeWind autocomplete.
        // zinc-50 … zinc-900 are available out of the box.

        // ── Semantic — Muted ─────────────────────────────────────────────────
        success: {
          DEFAULT: '#4D7C5F',
          dark:    '#6A9E7F',
          light:   '#D1F0DC',
        },
        warning: {
          DEFAULT: '#A16207',
          dark:    '#CA8A04',
          light:   '#FEF3C7',
        },
        danger: {
          DEFAULT: '#BE3A50',
          dark:    '#D95C72',
          light:   '#FCE4E8',
        },
        info: {
          DEFAULT: '#3A7EB5',
          dark:    '#5B9FD6',
          light:   '#DBEAFE',
        },

        // ── Semantic aliases (kept for existing class usage) ─────────────────
        primary: {
          DEFAULT: '#7C6FF7',
          dark:    '#A78BFA',
          light:   '#EDE9FE',
          foreground: '#FFFFFF',
        },

        // ── Surfaces — Light ─────────────────────────────────────────────────
        background: {
          DEFAULT: '#FFFFFF',
          dark:    '#18181B',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          dark:    '#27272A',
        },
        card: {
          DEFAULT: '#F4F4F5',
          dark:    '#27272A',
        },
        border: {
          DEFAULT: '#E4E4E7',
          dark:    '#3F3F46',
        },

        // ── Text ─────────────────────────────────────────────────────────────
        text: {
          DEFAULT:   '#18181B',
          secondary: '#71717A',
          muted:     '#A1A1AA',
          dark:      '#FAFAFA',
        },

      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontSize: {
        xs:   ['12px', { lineHeight: '16px' }],
        sm:   ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg:   ['18px', { lineHeight: '28px' }],
        xl:   ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },

      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

    },
  },
  plugins: [],
};
