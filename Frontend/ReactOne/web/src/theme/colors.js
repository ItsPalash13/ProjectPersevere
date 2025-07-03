// Centralized Color Palette for the Application
// This file contains all color definitions used across theme files

export const colors = {
  // Primary Purple Theme (Reserved for navbar logo and avatar only)
  primary: {
    main: '#667eea',
    secondary: '#764ba2',
    accent: '#9667e0',
    light: '#d4bbfc',
    lighter: '#f093fb',
    dark: '#7c3aed',
    darker: '#5a67d8',
    darkest: '#6b46c1',
  },

  // Major App Colors (New neutral scheme)
  app: {
    light: {
      primary: '#FFFFFF',
      secondary: '#FBFBFA',
      surface: '#FFFFFF',
      paper: '#FBFBFA',
      accent: '#F8F8F8',
      border: '#E5E5E5',
      divider: '#F0F0F0',
    },
    dark: {
      primary: '#0A0A0A',
      secondary: '#FBFBFA',
      surface: '#0A0A0A',
      paper: '#111111',
      accent: '#1A1A1A',
      border: '#222222',
      divider: '#151515',
    },
  },

  // Semantic Colors
  success: {
    main: '#4caf50',
    dark: '#2e7d32',
    light: '#81c784',
  },
  
  error: {
    main: '#f44336',
    dark: '#d32f2f',
    light: '#ef5350',
  },
  
  warning: {
    main: '#ffc107',
    dark: '#f57c00',
    light: '#ffb300',
    secondary: '#ff9800',
    accent: '#f59e0b',
    lighter: '#fbbf24',
    orange: '#e65100',
  },

  // Background Colors (Updated to new scheme)
  background: {
    light: {
      primary: '#FFFFFF',
      secondary: '#FBFBFA',
      surface: '#FFFFFF',
      paper: '#FBFBFA',
      accent: '#F8F8F8',
    },
    dark: {
      primary: '#0A0A0A',
      secondary: '#FBFBFA',
      surface: '#0A0A0A',
      paper: '#111111',
      accent: '#1A1A1A',
    },
  },

  // Text Colors (Updated for better contrast with new backgrounds)
  text: {
    light: {
      primary: '#1F1F1F',
      secondary: '#666666',
      disabled: '#CCCCCC',
      hint: '#999999',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#DDDDDD',
      disabled: '#888888',
      hint: '#AAAAAA',
    },
  },

  // Border Colors (Updated to neutral tones)
  border: {
    light: {
      primary: '#E5E5E5',
      secondary: '#F0F0F0',
      accent: '#DDDDDD',
      focus: '#CCCCCC',
    },
    dark: {
      primary: '#222222',
      secondary: '#1A1A1A',
      accent: '#333333',
      focus: '#444444',
    },
  },

  // Overlay Colors (Updated for new scheme)
  overlay: {
    light: {
      low: 'rgba(0, 0, 0, 0.02)',
      medium: 'rgba(0, 0, 0, 0.05)',
      high: 'rgba(0, 0, 0, 0.1)',
      card: 'rgba(255, 255, 255, 0.95)',
      surface: 'rgba(251, 251, 250, 0.98)',
      glassSoft: 'rgba(255, 255, 255, 0.9)',
    },
    dark: {
      low: 'rgba(255, 255, 255, 0.02)',
      medium: 'rgba(255, 255, 255, 0.05)',
      high: 'rgba(255, 255, 255, 0.08)',
      card: 'rgba(17, 17, 17, 0.95)',
      surface: 'rgba(10, 10, 10, 0.98)',
      glassSoft: 'rgba(10, 10, 10, 0.9)',
    },
  },

  // Shadow Colors (Updated for neutral theme)
  shadow: {
    light: {
      low: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      high: 'rgba(0, 0, 0, 0.15)',
      primary: 'rgba(0, 0, 0, 0.08)',
      primaryMedium: 'rgba(0, 0, 0, 0.12)',
      primaryHigh: 'rgba(0, 0, 0, 0.18)',
      warning: 'rgba(255, 193, 7, 0.3)',
      warningHigh: 'rgba(255, 193, 7, 0.4)',
      error: 'rgba(244, 67, 54, 0.3)',
    },
    dark: {
      low: 'rgba(0, 0, 0, 0.5)',
      medium: 'rgba(0, 0, 0, 0.6)',
      high: 'rgba(0, 0, 0, 0.7)',
      primary: 'rgba(0, 0, 0, 0.55)',
      primaryMedium: 'rgba(0, 0, 0, 0.65)',
      primaryHigh: 'rgba(0, 0, 0, 0.75)',
      warning: 'rgba(255, 193, 7, 0.3)',
      warningHigh: 'rgba(255, 193, 7, 0.4)',
      error: 'rgba(244, 67, 54, 0.3)',
    },
  },

  // Special Colors
  special: {
    white: '#FFFFFF',
    offWhite: '#FBFBFA',
    darkGray: '#0A0A0A',
    black: '#000000',
    transparent: 'rgb(255, 255, 255)',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradient Definitions (Updated to neutral scheme)
  gradients: {
    // Keep purple gradients for navbar logo and avatar
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primaryAlt: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    primaryAccent: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    primaryDark: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
    
    // New neutral gradients for main app
    appLight: 'linear-gradient(135deg, #FFFFFF 0%, #FBFBFA 100%)',
    appLightAlt: 'linear-gradient(135deg, #FBFBFA 0%, #F8F8F8 100%)',
    appDark: 'linear-gradient(135deg, #0A0A0A 0%, #111111 100%)',
    appDarkAlt: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
    
    success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    error: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
    warning: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    warningAlt: 'linear-gradient(135deg, #ffb300 0%, #f57c00 100%)',
    warningAccent: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    
    backgroundLight: 'linear-gradient(135deg, #FFFFFF 0%, #FBFBFA 100%)',
    backgroundLightAlt: 'linear-gradient(135deg, #FBFBFA 0%, #F8F8F8 100%)',
    backgroundDark: 'linear-gradient(135deg, #0A0A0A 0%, #111111 100%)',
    
    cardLight: 'linear-gradient(145deg, #FFFFFF 0%, #FBFBFA 100%)',
    cardLightAlt: 'linear-gradient(145deg, #FBFBFA 0%, #F8F8F8 100%)',
    cardLightGlass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(251, 251, 250, 0.9) 100%)',
    cardDark: 'linear-gradient(145deg, #0A0A0A 0%, #111111 100%)',
    cardDarkAlt: 'linear-gradient(145deg, #111111 0%, #1A1A1A 100%)',
    cardDarkGlass: 'linear-gradient(145deg, rgba(10, 10, 10, 0.95) 0%, rgba(17, 17, 17, 0.9) 100%)',
    
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.02) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%)',
    
    // Active session gradients (neutral)
    sessionLight: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%)',
    sessionDark: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
    sessionWarning: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
    
    // Chip gradients (neutral)
    chipLight: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%)',
    chipLightHover: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
    chipDark: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
    chipDarkHover: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
  },
};

// Helper functions for theme-aware colors
export const getThemeColor = (lightColor, darkColor) => (theme) => 
  theme.palette.mode === 'dark' ? darkColor : lightColor;

export const getThemeGradient = (lightGradient, darkGradient) => (theme) => 
  theme.palette.mode === 'dark' ? darkGradient : lightGradient;

// Commonly used theme-aware color combinations (Updated to new scheme)
export const themeColors = {
  background: {
    main: getThemeColor(colors.background.light.primary, colors.background.dark.primary),
    paper: getThemeColor(colors.background.light.paper, colors.background.dark.paper),
    surface: getThemeColor(colors.background.light.surface, colors.background.dark.surface),
  },
  
  card: {
    background: getThemeColor(colors.background.light.paper, colors.background.dark.paper),
    border: getThemeColor(colors.border.light.primary, colors.border.dark.primary),
    shadow: getThemeColor(colors.shadow.light.low, colors.shadow.dark.low),
  },
  
  text: {
    primary: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    secondary: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
    disabled: getThemeColor(colors.text.light.disabled, colors.text.dark.disabled),
  },
  
  overlay: {
    low: getThemeColor(colors.overlay.light.low, colors.overlay.dark.low),
    medium: getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium),
    high: getThemeColor(colors.overlay.light.high, colors.overlay.dark.high),
    card: getThemeColor(colors.overlay.light.card, colors.overlay.dark.card),
  },
}; 