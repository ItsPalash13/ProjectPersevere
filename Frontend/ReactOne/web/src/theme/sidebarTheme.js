import { styled } from '@mui/material/styles';
import { Drawer, Box, ListItemButton, Typography } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

const drawerWidth = 240;
const collapsedWidth = 64;

export const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedWidth,
    background: getThemeGradient(colors.gradients.cardLightGlass, colors.gradients.cardDarkAlt)(theme),
    backdropFilter: 'blur(20px)',
    border: 'none',
    borderRight: themeColors.card.border(theme),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  ...theme.mixins.toolbar,
  minHeight: '64px !important',
  borderBottom: themeColors.card.border(theme),
}));

export const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1.5),
  minHeight: 48,
  background: selected 
    ? colors.gradients.primary
    : colors.special.transparent,
  color: selected ? colors.special.white : themeColors.text.primary(theme),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: selected 
      ? colors.gradients.primaryDark
      : getThemeColor(colors.overlay.light.medium, colors.overlay.dark.medium)(theme),
    transform: 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: theme.spacing(1.5),
    justifyContent: 'center',
    color: 'inherit',
  },
  '& .MuiListItemText-primary': {
    fontWeight: selected ? 600 : 400,
    fontSize: '0.9rem',
  },
}));

export const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
  background: colors.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

export const sidebarStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  navigation: {
    flexGrow: 1,
    pt: 2,
  },
  footer: {
    p: 2,
    borderTop: themeColors.card.border,
    background: getThemeColor(colors.overlay.light.low, colors.overlay.dark.low),
  },
  navigationItems: [
    { text: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { text: 'Subjects', icon: 'subject', path: '/subjects' },
    { text: 'Map', icon: 'map', path: '/map' },
    { text: 'Inventory', icon: 'inventory', path: '/inventory' },
    { text: 'Reports', icon: 'report', path: '/reports' },
  ],
  tooltipProps: {
    placement: 'right',
    arrow: true,
    sx: {
      '& .MuiTooltip-tooltip': {
        backgroundColor: getThemeColor(colors.background.light.surface, colors.background.dark.surface),
        color: themeColors.text.primary,
        border: themeColors.card.border,
        fontSize: '0.8rem',
        fontWeight: 500,
      },
      '& .MuiTooltip-arrow': {
        color: getThemeColor(colors.background.light.surface, colors.background.dark.surface),
      },
    },
  },
}; 