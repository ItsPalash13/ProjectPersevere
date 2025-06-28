// Centralized Color Palette for the Application
// This file contains all color definitions used across theme files

export const colors = {
  // Primary Purple Theme
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

  // Background Colors
  background: {
    light: {
      primary: '#f5f7fa',
      secondary: '#c3cfe2',
      surface: '#ffffff',
      paper: '#fbfaff',
      accent: '#f2ebfb',
    },
    dark: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      surface: '#2d2d44',
      paper: '#3a3a5c',
      accent: '#1e1e3f',
    },
  },

  // Text Colors
  text: {
    light: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.7)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.6)',
    },
    dark: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: 'rgba(255, 255, 255, 0.6)',
    },
  },

  // Border Colors
  border: {
    light: {
      primary: 'rgba(255, 255, 255, 0.3)',
      secondary: 'rgba(102, 126, 234, 0.1)',
      accent: 'rgba(102, 126, 234, 0.2)',
      focus: 'rgba(102, 126, 234, 0.3)',
    },
    dark: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(102, 126, 234, 0.2)',
      accent: 'rgba(102, 126, 234, 0.3)',
      focus: 'rgba(102, 126, 234, 0.4)',
    },
  },

  // Overlay Colors (for glass effects)
  overlay: {
    light: {
      low: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      high: 'rgba(255, 255, 255, 0.2)',
      card: 'rgba(255, 255, 255, 0.8)',
      surface: 'rgba(255, 255, 255, 0.95)',
      glassSoft: 'rgba(255, 255, 255, 0.85)',
    },
    dark: {
      low: 'rgba(255, 255, 255, 0.02)',
      medium: 'rgba(255, 255, 255, 0.05)',
      high: 'rgba(255, 255, 255, 0.08)',
      card: 'rgba(255, 255, 255, 0.06)',
      surface: 'rgba(255, 255, 255, 0.08)',
      glassSoft: 'rgba(255, 255, 255, 0.04)',
    },
  },

  // Shadow Colors
  shadow: {
    light: {
      low: 'rgba(0, 0, 0, 0.08)',
      medium: 'rgba(0, 0, 0, 0.12)',
      high: 'rgba(0, 0, 0, 0.15)',
      primary: 'rgba(102, 126, 234, 0.1)',
      primaryMedium: 'rgba(102, 126, 234, 0.15)',
      primaryHigh: 'rgba(102, 126, 234, 0.2)',
      warning: 'rgba(255, 193, 7, 0.3)',
      warningHigh: 'rgba(255, 193, 7, 0.4)',
      error: 'rgba(244, 67, 54, 0.3)',
    },
    dark: {
      low: 'rgba(0, 0, 0, 0.2)',
      medium: 'rgba(0, 0, 0, 0.3)',
      high: 'rgba(0, 0, 0, 0.4)',
      primary: 'rgba(102, 126, 234, 0.15)',
      primaryMedium: 'rgba(102, 126, 234, 0.2)',
      primaryHigh: 'rgba(102, 126, 234, 0.3)',
      warning: 'rgba(255, 193, 7, 0.3)',
      warningHigh: 'rgba(255, 193, 7, 0.4)',
      error: 'rgba(244, 67, 54, 0.3)',
    },
  },

  // Special Colors
  special: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradient Definitions
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primaryAlt: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    primaryAccent: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    primaryDark: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
    rainbow: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    
    success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    error: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
    warning: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    warningAlt: 'linear-gradient(135deg, #ffb300 0%, #f57c00 100%)',
    warningAccent: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    
    backgroundLight: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    backgroundLightAlt: 'linear-gradient(135deg, #fbfaff 0%, #f2ebfb 100%)',
    backgroundDark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    
    cardLight: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    cardLightAlt: 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
    cardLightGlass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
    cardDark: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
    cardDarkAlt: 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)',
    cardDarkGlass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)',
    
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    
    // Active session gradients
    sessionLight: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
    sessionDark: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)',
    sessionWarning: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
    
    // Chip gradients
    chipLight: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    chipLightHover: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    chipDark: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    chipDarkHover: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
  },
};

// Helper functions for theme-aware colors
export const getThemeColor = (lightColor, darkColor) => (theme) => 
  theme.palette.mode === 'dark' ? darkColor : lightColor;

export const getThemeGradient = (lightGradient, darkGradient) => (theme) => 
  theme.palette.mode === 'dark' ? darkGradient : lightGradient;

// Commonly used theme-aware color combinations
export const themeColors = {
  background: {
    main: getThemeColor(colors.gradients.backgroundLight, colors.gradients.backgroundDark),
    paper: getThemeColor(colors.background.light.paper, colors.background.dark.paper),
    surface: getThemeColor(colors.background.light.surface, colors.background.dark.surface),
  },
  
  card: {
    background: getThemeGradient(colors.gradients.cardLight, colors.gradients.cardDark),
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