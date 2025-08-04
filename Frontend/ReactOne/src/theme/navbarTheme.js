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
    padding: '4px !important',
    minHeight: '48px !important',
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
    minHeight: '48px !important',
    padding: '4px !important',
    margin: '10px !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&.MuiToolbar-root': {
      padding: '4px !important',
      minHeight: '48px !important',
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
    width: 36,
    height: 36,
    background: colors.gradients.primary,
    color: colors.special.white,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
    background: getThemeColor('#1F1F1F', '#1F1F1F'),
    color: '#FFFFFF',
    px: 2,
    py: 0.75,
    borderRadius: 2,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    minHeight: '32px',
    border: 'none',
    '&:hover': {
      background: getThemeColor('#2A2A2A', '#2A2A2A'),
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
      marginRight: '4px',
    },
  },
  registerButton: {
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    border: getThemeColor(`1.5px solid ${colors.border.light.primary}`, `1.5px solid ${colors.border.dark.primary}`),
    px: 2,
    py: 0.75,
    borderRadius: 2,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    minHeight: '32px',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: getThemeColor('rgba(0, 0, 0, 0.04)', 'rgba(255, 255, 255, 0.08)'),
      borderColor: getThemeColor(colors.border.light.accent, colors.border.dark.accent),
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
  searchBar: {
    position: 'relative',
    borderRadius: 12,
    backgroundColor: 'transparent',
    border: getThemeColor('1px solid rgba(0, 0, 0, 0.2)', '1px solid rgba(255, 255, 255, 0.3)'),
    '&:hover': {
      borderColor: getThemeColor('rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)'),
    },
    '&:focus-within': {
      borderColor: getThemeColor('rgba(0, 0, 0, 0.4)', 'rgba(255, 255, 255, 0.5)'),
    },
    marginLeft: 1,
    marginRight: 1,
    width: '100%',
    maxWidth: 500,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    paddingRight: 0,
    transition: 'all 0.2s ease',
  },
  searchInput: {
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    fontSize: '0.9rem',
    padding: '8px 12px',
    paddingRight: 0,
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    '&::placeholder': {
      color: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
      fontSize: '0.9rem',
    },
  },
  searchActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    height: '100%',
  },
  searchIconButton: {
    padding: '0 12px',
    minWidth: '40px',
    height: '100%',
    backgroundColor: getThemeColor('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.1)'),
    borderLeft: getThemeColor('1px solid rgba(0, 0, 0, 0.1)', '1px solid rgba(255, 255, 255, 0.15)'),
    borderRadius: '0 16px 16px 0',
    color: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
    },
  },
  clearButton: {
    padding: '4px',
    minWidth: '24px',
    minHeight: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 1,
    marginRight: 0.5,
    color: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
    '&:hover': {
      backgroundColor: getThemeColor('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.12)'),
    },
    '& .MuiSvgIcon-root': {
      fontSize: '0.9rem',
    },
  },
}; 