export const subjectSectionStyles = {
  container: {
    mb: 5,
  },
  sectionTitle: {
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: 'text.primary',
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
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.7)',
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
        backgroundColor: 'rgba(150, 103, 224, 0.3)',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(150, 103, 224, 0.1)',
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