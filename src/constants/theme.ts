import { Platform } from 'react-native';

// ─── Brand Scale — Soft Violet ───────────────────────────────────────────────

export const brand = {
  50:  '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA', // dark mode primary
  500: '#7C6FF7', // light mode primary ★
  600: '#6D5FED',
  700: '#5B4DD6',
  800: '#4237A8',
  900: '#2E2478',
} as const;

// ─── Neutral Scale — Zinc (warm gray) ────────────────────────────────────────

export const zinc = {
  50:  '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
} as const;

// ─── Semantic Colors — Muted ──────────────────────────────────────────────────

export const semantic = {
  success: { light: '#4D7C5F', dark: '#6A9E7F' },
  warning: { light: '#A16207', dark: '#CA8A04' },
  danger:  { light: '#BE3A50', dark: '#D95C72' },
  info:    { light: '#3A7EB5', dark: '#5B9FD6' },
} as const;

// ─── Color Tokens (light / dark) ─────────────────────────────────────────────

export const Colors = {
  light: {
    // Text
    text:          zinc[900],
    textSecondary: zinc[500],
    textMuted:     zinc[400],

    // Brand
    primary:            brand[500],
    primaryLight:       brand[100],
    primaryForeground:  '#FFFFFF',

    // Surfaces
    background:    '#FFFFFF',
    surface:       zinc[50],
    surfaceRaised: '#FFFFFF',
    card:          zinc[100],
    border:        zinc[200],

    // Semantic
    success:      semantic.success.light,
    warning:      semantic.warning.light,
    danger:       semantic.danger.light,
    info:         semantic.info.light,

    // Icons & navigation
    icon:             zinc[400],
    tabIconDefault:   zinc[400],
    tabIconSelected:  brand[500],

    // Compat aliases
    tint:             brand[500],
    secondary:        zinc[500],
    notification:     semantic.danger.light,
  },

  dark: {
    // Text
    text:          zinc[50],
    textSecondary: zinc[500],
    textMuted:     zinc[600],

    // Brand
    primary:            brand[400],
    primaryLight:       brand[900],
    primaryForeground:  zinc[900],

    // Surfaces
    background:    zinc[900],
    surface:       zinc[800],
    surfaceRaised: zinc[700],
    card:          zinc[800],
    border:        zinc[700],

    // Semantic
    success:      semantic.success.dark,
    warning:      semantic.warning.dark,
    danger:       semantic.danger.dark,
    info:         semantic.info.dark,

    // Icons & navigation
    icon:             zinc[500],
    tabIconDefault:   zinc[600],
    tabIconSelected:  brand[400],

    // Compat aliases
    tint:             brand[400],
    secondary:        zinc[400],
    notification:     semantic.danger.dark,
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
  size: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 30,
  },
  lineHeight: {
    xs:   16,
    sm:   20,
    base: 24,
    lg:   28,
    xl:   28,
    '2xl': 32,
    '3xl': 36,
  },
  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
