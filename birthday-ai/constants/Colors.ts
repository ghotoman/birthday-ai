// BirthdayAI Color System — тёплая, дружелюбная палитра

export const palette = {
  // Primary — тёплый коралловый/розовый
  primary50: '#FFF0F3',
  primary100: '#FFD6DE',
  primary200: '#FFB0C1',
  primary300: '#FF8AA4',
  primary400: '#FF6B8A',
  primary500: '#FF4D6D',
  primary600: '#E63E5C',
  primary700: '#CC2F4B',

  // Secondary — мягкий фиолетовый
  secondary50: '#F3F0FF',
  secondary100: '#DDD6FE',
  secondary200: '#C4B5FD',
  secondary300: '#A78BFA',
  secondary400: '#8B5CF6',
  secondary500: '#7C3AED',
  secondary600: '#6D28D9',

  // Accent — золотисто-жёлтый
  accent50: '#FFFBEB',
  accent100: '#FEF3C7',
  accent200: '#FDE68A',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',

  // Success
  success: '#10B981',
  successLight: '#D1FAE5',

  // Warning
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Error
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',
};

const Colors = {
  light: {
    text: palette.gray900,
    textSecondary: palette.gray500,
    textTertiary: palette.gray400,
    background: palette.white,
    backgroundSecondary: palette.gray50,
    backgroundTertiary: palette.gray100,
    tint: palette.primary500,
    primary: palette.primary500,
    primaryLight: palette.primary50,
    secondary: palette.secondary500,
    secondaryLight: palette.secondary50,
    accent: palette.accent400,
    accentLight: palette.accent50,
    border: palette.gray200,
    borderLight: palette.gray100,
    card: palette.white,
    cardShadow: 'rgba(0,0,0,0.06)',
    tabIconDefault: palette.gray400,
    tabIconSelected: palette.primary500,
    tabBar: palette.white,
    tabBarBorder: palette.gray100,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    text: palette.gray50,
    textSecondary: palette.gray400,
    textTertiary: palette.gray500,
    background: '#0F0F1A',
    backgroundSecondary: '#1A1A2E',
    backgroundTertiary: '#252540',
    tint: palette.primary400,
    primary: palette.primary400,
    primaryLight: 'rgba(255,77,109,0.15)',
    secondary: palette.secondary400,
    secondaryLight: 'rgba(139,92,246,0.15)',
    accent: palette.accent400,
    accentLight: 'rgba(251,191,36,0.15)',
    border: '#2A2A40',
    borderLight: '#1F1F35',
    card: '#1A1A2E',
    cardShadow: 'rgba(0,0,0,0.3)',
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.primary400,
    tabBar: '#0F0F1A',
    tabBarBorder: '#1A1A2E',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export type ThemeColors = typeof Colors.light;

export default Colors;
