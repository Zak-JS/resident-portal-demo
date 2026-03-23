export const colors = {
  // Primary - Vonder-inspired pink/magenta accent
  primary: '#E91E63',
  primaryLight: '#F8BBD9',
  primaryDark: '#C2185B',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F8F8',
  surface: '#FFFFFF',
  border: '#E5E5E5',
  
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverse: '#FFFFFF',

  // Status colors
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  error: '#F44336',
  errorLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',

  // Ticket status
  statusOpen: '#FF9800',
  statusInProgress: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#9E9E9E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
