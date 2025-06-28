export const levelsStyles = {
  container: {
    minHeight: '100vh',
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  backdrop: {
    color: '#fff',
    zIndex: (theme) => theme.zIndex.drawer + 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1.5,
    p: 3,
    borderRadius: 2,
    backgroundColor: (theme) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.3)',
  },
  pageContainer: {
    py: 3,
  },
  pageTitle: {
    mb: 3,
    fontWeight: 700,
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  },
  tabsContainer: {
    borderBottom: 'none',
    mb: 4,
    px: 2,
    py: 2,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiTabs-root': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 4,
      outline: 'none',
      p: 1,
      pt: 1.5,
      pb: 1,
      minHeight: 56,
      overflow: 'visible',
    },
    '& .MuiTab-root': {
      fontWeight: 600,
      fontSize: '0.95rem',
      textTransform: 'none',
      minHeight: 44,
      px: 4,
      py: 1.5,
      mx: 0.5,
      borderRadius: 3,
      color: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(0, 0, 0, 0.7)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 0 0 2px rgba(102, 126, 234, 0.4)' 
          : '0 0 0 2px rgba(102, 126, 234, 0.3)',
      },
      '&:focus-within': {
        outline: 'none',
      },
      '&:hover': {
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(102, 126, 234, 0.1)' 
          : 'rgba(102, 126, 234, 0.05)',
        color: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.9)' 
          : 'rgba(0, 0, 0, 0.8)',
        transform: 'scale(1.02)',
      },
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 700,
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 0 0 1px rgba(102, 126, 234, 0.4), 0 2px 6px rgba(102, 126, 234, 0.15)' 
          : '0 0 0 1px rgba(102, 126, 234, 0.3), 0 2px 6px rgba(102, 126, 234, 0.1)',
        transform: 'scale(1.03)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: 3,
          pointerEvents: 'none',
        },
      },
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
    '& .MuiTabs-flexContainer': {
      gap: 1,
    },
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 2,
    alignItems: 'stretch',
    px: 1,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  levelCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 3,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(20px)',
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: (theme) => theme.palette.mode === 'dark' 
      ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
      : '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
  },
  lockedCard: {
    opacity: 0.75,
    filter: 'grayscale(0.2)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 6px 25px rgba(0, 0, 0, 0.4)' 
        : '0 6px 25px rgba(0, 0, 0, 0.12)',
      cursor: 'not-allowed',
    },
  },
  activeCard: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 12px 35px rgba(102, 126, 234, 0.3)' 
        : '0 12px 35px rgba(102, 126, 234, 0.2)',
      cursor: 'pointer',
      '&::before': {
        opacity: 1,
      },
    },
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    p: 2,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1.5,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: '1.1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  cardDescription: {
    color: 'text.secondary',
    mb: 2,
    flexGrow: 1,
    fontSize: '0.85rem',
    lineHeight: 1.4,
    fontWeight: 400,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  topicsContainer: {
    mb: 2,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
  topicChip: {
    fontSize: '0.7rem',
    fontWeight: 500,
    height: 22,
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    color: '#667eea',
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(102, 126, 234, 0.3)' 
      : '1px solid rgba(102, 126, 234, 0.2)',
    '&:hover': {
      background: (theme) => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: 1,
    mb: 2,
  },
  metricCard: {
    p: 1.5,
    borderRadius: 2,
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(102, 126, 234, 0.2)' 
      : '1px solid rgba(102, 126, 234, 0.1)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 3px 8px rgba(102, 126, 234, 0.2)' 
        : '0 3px 8px rgba(102, 126, 234, 0.12)',
    },
  },
  metricIcon: {
    fontSize: '1rem',
    mb: 0.3,
    display: 'block',
  },
  metricValue: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#667eea',
    lineHeight: 1.1,
    mb: 0.3,
  },
  metricLabel: {
    fontSize: '0.65rem',
    color: 'text.secondary',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  progressContainer: {
    mb: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    '& .MuiLinearProgress-bar': {
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 3,
    },
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1,
  },
  progressText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#667eea',
  },
  progressPercentage: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#667eea',
  },
  activeSessionContainer: {
    mt: 1.5,
    p: 2,
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)'
      : 'linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
    borderRadius: 2,
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 193, 7, 0.3)' 
      : '1px solid rgba(255, 193, 7, 0.2)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
    },
  },
  activeSessionTitle: {
    color: '#e65100',
    fontSize: '0.8rem',
    fontWeight: 700,
    mb: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  activeSessionStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
  },
  activeSessionStat: {
    textAlign: 'center',
    p: 1,
    background: (theme) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.7)',
    borderRadius: 1,
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 193, 7, 0.2)' 
      : '1px solid rgba(255, 193, 7, 0.15)',
  },
  activeSessionStatValue: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#f57c00',
    mb: 0.3,
  },
  activeSessionStatLabel: {
    fontSize: '0.65rem',
    color: '#e65100',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  buttonsContainer: {
    display: 'flex',
    gap: 1,
    p: 1.5,
    pt: 0,
  },
  reconnectButton: {
    size: 'small',
    color: 'warning',
    variant: 'contained',
    sx: {
      background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
      color: 'white',
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 1.5,
      px: 2,
      py: 0.5,
      fontSize: '0.8rem',
      boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #ffb300 0%, #f57c00 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
      },
      transition: 'all 0.3s ease',
    },
  },
  startFreshButton: {
    size: 'small',
    color: 'error',
    variant: 'outlined',
    sx: {
      borderColor: '#f44336',
      color: '#f44336',
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 1.5,
      px: 2,
      py: 0.5,
      fontSize: '0.8rem',
      borderWidth: 1.5,
      '&:hover': {
        backgroundColor: '#f44336',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
      },
      transition: 'all 0.3s ease',
    },
  },
  startButton: {
    color: 'primary',
    sx: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 1.5,
      px: 3,
      py: 1,
      fontSize: '0.85rem',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      },
      transition: 'all 0.3s ease',
    },
  },
  lockedButton: {
    sx: {
      color: 'text.disabled',
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.02)' 
        : 'rgba(0, 0, 0, 0.04)',
      fontWeight: 500,
      textTransform: 'none',
      borderRadius: 1.5,
      px: 3,
      py: 1,
      fontSize: '0.85rem',
      cursor: 'not-allowed',
      border: (theme) => theme.palette.mode === 'dark' 
        ? '1px solid rgba(255, 255, 255, 0.05)' 
        : 'none',
    },
  },
  lockIcon: {
    color: 'text.disabled',
    backgroundColor: (theme) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.04)',
    borderRadius: '50%',
    p: 0.3,
    fontSize: '1rem',
    border: (theme) => theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : 'none',
  },
}; 