import React from 'react';
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
  { text: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
];

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <DrawerHeader>
        <Collapse in={open} orientation="horizontal">
          <BrandText variant="h6">
            ProjectX
          </BrandText>
        </Collapse>
        <IconButton 
          onClick={onToggle}
          size="small"
          sx={sidebarStyles.toggleButton}
        >
          {open ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      </DrawerHeader>

      <List sx={sidebarStyles.listContainer}>
        {navigationItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={open ? '' : item.text} 
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
                      mr: open ? 2 : 'auto',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Collapse in={open} orientation="horizontal">
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
      
      {/* Minimal footer */}
      <Box sx={sidebarStyles.footer}>
        <Collapse in={open} orientation="horizontal">
          <Typography variant="caption" sx={sidebarStyles.footerText}>
            © 2024 ProjectX
          </Typography>
        </Collapse>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar; 