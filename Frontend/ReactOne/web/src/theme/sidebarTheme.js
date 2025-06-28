import { styled } from '@mui/material/styles';
import { Drawer, Box, ListItemButton, Typography } from '@mui/material';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  transition: 'width 0.3s ease-in-out',
  '& .MuiDrawer-paper': {
    width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? '#2d2d44' : '#fbfaff',
    backgroundImage: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
      : 'linear-gradient(145deg, #fbfaff 0%, #f2ebfb 100%)',
    transition: 'width 0.3s ease-in-out',
    overflowX: 'hidden',
    boxShadow: theme.palette.mode === 'dark' 
      ? '2px 0 8px rgba(0, 0, 0, 0.2)'
      : '2px 0 8px rgba(150, 103, 224, 0.08)',
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(150, 103, 224, 0.2)'
      : '1px solid rgba(150, 103, 224, 0.08)',
  },
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  minHeight: 56,
  justifyContent: 'space-between',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #9667e0 0%, #7c3aed 100%)'
    : 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
  color: '#ffffff',
  borderBottom: theme.palette.mode === 'dark' 
    ? '1px solid rgba(150, 103, 224, 0.3)' 
    : '1px solid rgba(150, 103, 224, 0.15)',
}));

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ theme, selected }) => ({
  margin: theme.spacing(0.3, 1),
  borderRadius: theme.spacing(1.5),
  minHeight: 42,
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(150, 103, 224, 0.1)' 
      : '#f2ebfb',
  },
  ...(selected && {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(150, 103, 224, 0.2)'
      : '#ebd9fc',
    color: theme.palette.mode === 'dark' ? '#d4bbfc' : '#9667e0',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(150, 103, 224, 0.25)'
        : '#d4bbfc',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.mode === 'dark' ? '#d4bbfc' : '#9667e0',
    },
  }),
}));

export const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
}));

export const sidebarStyles = {
  toggleButton: {
    color: 'inherit',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  listContainer: {
    flex: 1,
    py: 1.5,
  },
  listItemIcon: {
    minWidth: 0,
    justifyContent: 'center',
    color: 'inherit',
  },
  listItemText: {
    fontWeight: 400,
    fontSize: '0.875rem',
  },
  selectedListItemText: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  divider: {
    borderColor: theme => theme.palette.mode === 'dark' 
      ? 'rgba(150, 103, 224, 0.2)' 
      : 'rgba(150, 103, 224, 0.1)',
  },
  footer: {
    p: 1.5,
    textAlign: 'center',
  },
  footerText: {
    color: theme => theme.palette.mode === 'dark' 
      ? 'rgba(212, 187, 252, 0.6)' 
      : 'rgba(150, 103, 224, 0.6)',
    fontSize: '0.75rem',
  },
};

// Navigation items configuration
export const navigationItems = [
  { text: 'Dashboard', icon: 'DashboardIcon', path: '/dashboard' },
  { text: 'Chapters', icon: 'ChaptersIcon', path: '/chapters' },
  { text: 'Reports', icon: 'ReportsIcon', path: '/reports' },
  { text: 'Settings', icon: 'SettingsIcon', path: '/settings' },
]; 