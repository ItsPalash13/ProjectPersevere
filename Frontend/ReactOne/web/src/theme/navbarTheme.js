import { styled } from '@mui/material/styles';
import { AppBar, Typography } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: getThemeColor(colors.background.light.primary, colors.background.dark.primary)(theme),
  backdropFilter: 'blur(10px)',
  border: 'none',
  borderBottom: themeColors.card.border(theme),
  boxShadow: getThemeColor(colors.shadow.light.medium, colors.shadow.dark.medium)(theme),
  padding: 0,
  margin: 0,
  '& .MuiToolbar-root': {
    padding: '0 !important',
    minHeight: '24px !important',
  },
}));

export const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  background: colors.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.25px',
}));

export const navbarStyles = {
  toolbar: {
    minHeight: '24px !important',
    padding: '0px !important',
    margin: '10px !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&.MuiToolbar-root': {
      padding: '0 !important',
      minHeight: '24px !important',
    },
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: 0,
    margin: 0,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: 0,
    marginRight: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    background: colors.gradients.primary,
    color: colors.special.white,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.75rem',
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
      minWidth: 160,
      boxShadow: getThemeColor(colors.shadow.light.medium, colors.shadow.dark.medium),
    },
    '& .MuiMenuItem-root': {
      px: 1,
      py: 0.5,
      fontSize: '0.8rem',
      color: themeColors.text.primary,
      '&:hover': {
        backgroundColor: getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium),
      },
    },
  },
  loginButton: {
    background: getThemeColor(colors.app.light.border, colors.app.dark.border),
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    px: 1,
    py: 0.125,
    borderRadius: 1.5,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'none',
    minHeight: 'auto',
    '&:hover': {
      background: getThemeColor(colors.app.light.accent, colors.app.dark.accent),
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease',
  },
  registerButton: {
    color: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
    border: getThemeColor(`1px solid ${colors.border.light.primary}`, `1px solid ${colors.border.dark.primary}`),
    px: 1,
    py: 0.125,
    borderRadius: 1.5,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'none',
    minHeight: 'auto',
    '&:hover': {
      backgroundColor: getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium),
      borderColor: getThemeColor(colors.border.light.accent, colors.border.dark.accent),
    },
    transition: 'all 0.2s ease',
  },
  themeToggle: {
    padding: '0px',
    minWidth: 'auto',
    minHeight: 'auto',
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
  sidebarToggle: {
    padding: '0px',
    minWidth: 'auto',
    minHeight: 'auto',
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
  menuItem: {
    '& .MuiListItemIcon-root': {
      minWidth: '28px',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
    '& .MuiListItemText-primary': {
      fontSize: '0.8rem',
    },
    '& .MuiListItemText-secondary': {
      fontSize: '0.7rem',
    },
  },
  logoutMenuItem: {
    '& .MuiListItemIcon-root': {
      minWidth: '28px',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
    '& .MuiListItemText-primary': {
      fontSize: '0.8rem',
    },
  },
}; 