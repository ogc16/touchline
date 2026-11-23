import { Platform, StyleSheet, type ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  sans: 'Manrope',
  mono: 'DM Mono',
  systemSans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
  systemMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

export const layout = {
  tabBarHeight: 64,
  slipHeight: 56,
  maxContentWidth: 1180,
  cardGap: 12,
} as const;

export interface ThemeColors {
  canvas: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  line: string;
  emerald: string;
  emeraldDeep: string;
  emeraldWash: string;
  lime: string;
  red: string;
  redWash: string;
  navy: string;
  navySoft: string;
  white: string;
  overlay: string;
  input: string;
  skeleton: string;
  live: string;
  liveWash: string;
  disabled: string;
  onNavy: string;
  onNavySoft: string;
  onNavyBorder: string;
  onEmerald: string;
}

export const lightColors: ThemeColors = {
  canvas: '#F5F7F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3EF',
  surfaceRaised: '#FFFFFF',
  ink: '#0E1A24',
  inkSoft: '#4E606D',
  inkMuted: '#7D8D97',
  line: '#E1E7E2',
  emerald: '#0B8F5B',
  emeraldDeep: '#086B45',
  emeraldWash: '#E6F3EB',
  lime: '#C5F26B',
  red: '#D44C43',
  redWash: '#FBECEA',
  navy: '#0E1A24',
  navySoft: '#1B2B38',
  white: '#FFFFFF',
  overlay: 'rgba(10, 20, 28, 0.46)',
  input: '#FFFFFF',
  skeleton: '#E7ECE7',
  live: '#D44C43',
  liveWash: '#FBECEA',
  disabled: '#B9C9BF',
  onNavy: '#FFFFFF',
  onNavySoft: '#9FB0BC',
  onNavyBorder: 'rgba(255,255,255,0.18)',
  onEmerald: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  canvas: '#0B1116',
  surface: '#121B22',
  surfaceMuted: '#18252E',
  surfaceRaised: '#1B2A34',
  ink: '#F2F6F3',
  inkSoft: '#B8C6CE',
  inkMuted: '#81939E',
  line: '#263640',
  emerald: '#24C97F',
  emeraldDeep: '#7BE0A9',
  emeraldWash: '#12382A',
  lime: '#C5F26B',
  red: '#FF6B62',
  redWash: '#3A211F',
  navy: '#050A0E',
  navySoft: '#13202A',
  white: '#FFFFFF',
  overlay: 'rgba(2, 7, 10, 0.72)',
  input: '#0F1A21',
  skeleton: '#1D2A33',
  live: '#FF6B62',
  liveWash: '#3A211F',
  disabled: '#40545E',
  onNavy: '#FFFFFF',
  onNavySoft: '#9FB0BC',
  onNavyBorder: 'rgba(255,255,255,0.16)',
  onEmerald: '#04150D',
};

interface Elevation {
  card: ViewStyle;
  raised: ViewStyle;
}

const lightElevation = StyleSheet.create({
  card: {
    shadowColor: '#0E1A24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  raised: {
    shadowColor: '#0E1A24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
}) as Elevation;

const darkElevation = StyleSheet.create({
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 3,
  },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 28,
    elevation: 12,
  },
}) as Elevation;

export const elevation = lightElevation;

export function getElevation(isDark: boolean): Elevation {
  return isDark ? darkElevation : lightElevation;
}

export const colors = lightColors;
