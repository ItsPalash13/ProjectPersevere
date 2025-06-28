import { styled } from '@mui/material/styles';
import { AppBar, Typography } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.special.transparent,
  backdropFilter: 'blur(10px)',
  border: 'none',
  borderBottom: themeColors.card.border(theme),
  boxShadow: getThemeColor(colors.shadow.light.low, colors.shadow.dark.low)(theme),
}));

export const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  background: colors.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
}));

export const navbarStyles = {
  toolbar: {
    minHeight: 64,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    background: colors.gradients.primary,
    color: colors.special.white,
    fontWeight: 'bold',
    cursor: 'pointer',
    '&:hover': {
      background: colors.gradients.primaryDark,
      transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease',
  },
  menu: {
    '& .MuiPaper-root': {
      background: getThemeColor(colors.overlay.light.surface, colors.background.dark.surface),
      backdropFilter: 'blur(20px)',
      border: getThemeColor(colors.border.light.primary, colors.border.dark.primary),
      borderRadius: 2,
      mt: 1,
      minWidth: 200,
      boxShadow: getThemeColor(colors.shadow.light.medium, colors.shadow.dark.medium),
    },
    '& .MuiMenuItem-root': {
      px: 3,
      py: 1.5,
      color: themeColors.text.primary,
      '&:hover': {
        backgroundColor: getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium),
      },
    },
  },
  loginButton: {
    background: colors.gradients.primary,
    color: colors.special.white,
    px: 3,
    py: 1,
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      background: colors.gradients.primaryDark,
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease',
  },
  registerButton: {
    color: colors.primary.main,
    border: `1px solid ${colors.primary.main}`,
    px: 3,
    py: 1,
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium),
      borderColor: colors.primary.accent,
    },
    transition: 'all 0.2s ease',
  },
}; 