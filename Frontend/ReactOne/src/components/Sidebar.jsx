import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Collapse,
  Tooltip,
  Drawer,
  Backdrop,
} from '@mui/material';
import {
  Home as HomeIcon,
  Quiz as QuizIcon,
  MenuBook as ChaptersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { 
  StyledDrawer, 
  DrawerHeader, 
  StyledListItemButton, 
  BrandText, 
  sidebarStyles 
} from '../theme/sidebarTheme';

const navigationItems = [
  { text: 'Dashboard', icon: <HomeIcon fontSize="small" />, path: '/dashboard' },
  { text: 'Admin', icon: <SettingsIcon fontSize="small" />, path: '/admin' },
];

const Sidebar = ({ open, onToggle, devicePixelRatio }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Render sidebar content
  const renderSidebarContent = () => (
    <>
      <DrawerHeader>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.7rem',
            color: 'primary.main',
            letterSpacing: '0.1em'
          }}
        >
          BETA
        </Typography>
      </DrawerHeader>

      <List sx={sidebarStyles.listContainer}>
        {navigationItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 0 }}>
              <Tooltip 
                title={item.text} 
                placement="right"
                arrow
              >
                <StyledListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ width: '100%' }}
                >
                  <ListItemIcon
                    sx={{
                      ...sidebarStyles.listItemIcon,
                      mr: 'auto',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </StyledListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <StyledDrawer variant="permanent" open={false}>
      {renderSidebarContent()}
    </StyledDrawer>
  );
};

export default Sidebar; 