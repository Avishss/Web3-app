export const colors = {
  bg: '#0B0E14',
  bgElevated: '#11151E',
  card: '#161B26',
  cardPressed: '#1C2230',
  border: '#232A38',
  text: '#F2F5F9',
  textDim: '#8A94A6',
  textFaint: '#5A6478',
  accent: '#00D09C',
  accentDark: '#00A87E',
  accentSoft: 'rgba(0, 208, 156, 0.12)',
  up: '#00D09C',
  down: '#FF5C6C',
  downSoft: 'rgba(255, 92, 108, 0.12)',
  warning: '#FFB020',
  white: '#FFFFFF',
  overlay: 'rgba(4, 6, 10, 0.72)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  screen: 20,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const type = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  sub: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const },
} as const;
