/**
 * MediCall design tokens — single source of truth.
 * Mirrors the web design system (oklch values converted to hex).
 */
export const colors = {
  background: '#F4F7F8',
  foreground: '#16242E',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F4',

  primary: '#0F8A8C',
  primaryForeground: '#FBFEFE',
  primarySoft: '#DCEFEF',

  muted: '#EEF1F3',
  mutedForeground: '#6B7A82',

  border: '#E2E8EB',
  borderStrong: '#CBD3D8',

  success: '#1FA678',
  warning: '#E0A82E',
  destructive: '#D54B3B',

  white: '#FFFFFF',
  black: '#16242E',
} as const;

/** 8pt grid spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

/** Mobile typography — accessible minimums */
export const typography = {
  xs: { fontSize: 13, lineHeight: 18 },
  sm: { fontSize: 15, lineHeight: 22 },
  base: { fontSize: 17, lineHeight: 24 },
  lg: { fontSize: 19, lineHeight: 26 },
  xl: { fontSize: 22, lineHeight: 28 },
  '2xl': { fontSize: 28, lineHeight: 34 },
  '3xl': { fontSize: 34, lineHeight: 40 },
  display: { fontSize: 42, lineHeight: 48 },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  pill: 999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
