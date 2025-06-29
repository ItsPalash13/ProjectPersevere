import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  IconButton, 
  Toolbar, 
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { authClient } from '../lib/auth-client';
import { useDispatch } from 'react-redux';  
import { logout } from '../features/auth/authSlice';
import { StyledAppBar, BrandText, navbarStyles } from '../theme/navbarTheme';

const Navbar = ({ darkMode, onDarkModeToggle, onSidebarToggle, showSidebarToggle = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: session } = authClient.useSession();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    try {
      handleMenuClose();
      await authClient.revokeSession({
        token: session?.session?.token
      });
      await authClient.signOut();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    console.log('Navigate to profile');
    // Navigate to profile page
    handleMenuClose();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBrandClick = () => {
    navigate(session ? '/dashboard' : '/');
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar sx={navbarStyles.toolbar}>
        <Box sx={navbarStyles.leftSection}>
          {showSidebarToggle && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="toggle sidebar"
              onClick={onSidebarToggle}
              sx={navbarStyles.sidebarToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={navbarStyles.rightSection}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={onDarkModeToggle}
            sx={navbarStyles.themeToggle}
            size="small"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          {/* Authenticated User Menu */}
          {session ? (
            <>
              <IconButton
                onClick={handleAvatarClick}
                sx={{ 
                  p: '0 !important', 
                  m: '0 !important',
                  minWidth: '24px !important', 
                  minHeight: '24px !important',
                  width: '24px',
                  height: '24px'
                }}
              >
                <Avatar sx={navbarStyles.avatar}>
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={navbarStyles.menu}
              >
                <MenuItem onClick={handleProfile} sx={navbarStyles.menuItem}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profile" 
                    secondary={session?.user?.name}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={navbarStyles.logoutMenuItem}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Unauthenticated User Buttons */
            <Button
              onClick={handleLogin}
              variant="contained"
              startIcon={<LoginIcon />}
              size="small"
              sx={navbarStyles.loginButton}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar; 