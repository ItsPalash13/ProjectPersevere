import { styled } from '@mui/material/styles';
import { AppBar, Typography } from '@mui/material';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxShadow: 'none',
  backdropFilter: 'blur(20px)',
  borderBottom: theme.palette.mode === 'dark' 
    ? '1px solid rgba(150, 103, 224, 0.2)' 
    : '1px solid rgba(242, 235, 251, 0.8)',
}));

export const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.2rem',
  letterSpacing: '0.5px',
  background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
}));

export const navbarStyles = {
  toolbar: {
    minHeight: 64,
    px: 3,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  sidebarToggle: {
    display: { xs: 'block', sm: 'none' },
    color: 'text.primary',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  themeToggle: {
    color: 'text.primary',
  },
  avatar: {
    width: 32,
    height: 32,
    bgcolor: 'primary.main',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'primary.contrastText',
  },
  menu: {
    mt: 1.5,
    '& .MuiPaper-root': {
      borderRadius: 2,
      minWidth: 180,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid',
      borderColor: 'divider',
    },
  },
  menuItem: {
    py: 1.5,
  },
  logoutMenuItem: {
    py: 1.5,
    color: 'error.main',
  },
  loginButton: {
    background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
    },
  },
}; 