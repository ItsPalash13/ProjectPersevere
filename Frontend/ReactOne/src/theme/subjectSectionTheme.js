import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const subjectSectionStyles = {
  container: {
    mb: 5,
  },
  sectionTitle: {
    mb: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: 'text.primary',
    fontWeight: 500,
  },
  scrollContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  scrollButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    transition: 'opacity 0.3s ease-in-out',
    cursor: 'pointer',
  },
  leftScrollButton: {
    left: 0,
  },
  rightScrollButton: {
    right: 0,
  },
  scrollButton: {
    color: colors.special.white,
    backgroundColor: colors.special.backdrop,
    '&:hover': {
      backgroundColor: getThemeColor(colors.shadow.light.medium, colors.shadow.dark.medium),
    },
  },
  chaptersContainer: {
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    overflowY: 'hidden',
    pb: 2,
    pr: 3, // Right padding to prevent edge cutoff
    // Hide scrollbar by default
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      height: 8,
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: 4,
    },
    // Show scrollbar on hover
    '&:hover': {
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: colors.border.light.accent,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: colors.border.light.secondary,
        borderRadius: 4,
      },
    },
    // Smooth scrolling
    scrollBehavior: 'smooth',
  },
  chapterItem: {
    flexShrink: 0,
  },
  loadingText: {
    variant: 'body2',
    color: 'text.secondary',
  },
  errorText: {
    variant: 'body2',
    color: 'error',
  },
  noChaptersText: {
    variant: 'body2',
    color: 'text.secondary',
  },
}; 