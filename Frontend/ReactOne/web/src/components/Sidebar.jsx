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
  Dashboard as DashboardIcon,
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
  { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
];

const Sidebar = ({ open, onToggle, devicePixelRatio }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Calculate zoom percentage
  const zoomPercentage = Math.round(devicePixelRatio * 100);
  const isAt100PercentOrAbove = zoomPercentage >= 100;
  const isBelow100Percent = zoomPercentage < 100;

  const handleNavigation = (path) => {
    navigate(path);
    // Close drawer if it's open (for 100% zoom and above behavior)
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  const handleToggleClick = () => {
    if (isAt100PercentOrAbove) {
      // At 100% zoom and above, toggle the backdrop drawer instead of normal sidebar
      setDrawerOpen(!drawerOpen);
    } else {
      // Below 100% zoom, use normal toggle behavior
      onToggle();
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  // Render sidebar content
  const renderSidebarContent = (isDrawerMode = false) => (
    <>
      <DrawerHeader>
        <Collapse in={isDrawerMode || open} orientation="horizontal">
          <BrandText variant="h6">
            ProjectX
          </BrandText>
        </Collapse>
        <IconButton 
          onClick={isDrawerMode ? handleDrawerClose : handleToggleClick}
          size="small"
          sx={sidebarStyles.toggleButton}
        >
          {(isDrawerMode || open) ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      </DrawerHeader>

      <List sx={sidebarStyles.listContainer}>
        {navigationItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={(isDrawerMode || open) ? '' : item.text} 
                placement="right"
                arrow
              >
                <StyledListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      ...sidebarStyles.listItemIcon,
                      mr: (isDrawerMode || open) ? 2 : 'auto',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Collapse in={isDrawerMode || open} orientation="horizontal">
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: '0.875rem',
                      }}
                    />
                  </Collapse>
                </StyledListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={sidebarStyles.divider} />
    </>
  );

  return (
    <>
      {/* Normal sidebar behavior for below 100% zoom */}
      {!isAt100PercentOrAbove && (
        <StyledDrawer variant="permanent" open={open}>
          {renderSidebarContent()}
        </StyledDrawer>
      )}

      {/* Collapsed sidebar with navigation icons for 100% zoom and above */}
      {isAt100PercentOrAbove && (
        <StyledDrawer variant="permanent" open={false}>
          <DrawerHeader>
            <IconButton 
              onClick={handleToggleClick}
              size="small"
              sx={sidebarStyles.toggleButton}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </DrawerHeader>

          <List sx={sidebarStyles.listContainer}>
            {navigationItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding>
                  <Tooltip 
                    title={item.text} 
                    placement="right"
                    arrow
                  >
                    <StyledListItemButton
                      selected={isSelected}
                      onClick={() => handleNavigation(item.path)}
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

        </StyledDrawer>
      )}

      {/* Backdrop drawer for 100% zoom and above expanded view */}
      {isAt100PercentOrAbove && (
        <>
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer - 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            open={drawerOpen}
            onClick={handleDrawerClose}
          />
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerClose}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
                backgroundColor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {renderSidebarContent(true)}
          </Drawer>
        </>
      )}
    </>
  );
};

export default Sidebar; 