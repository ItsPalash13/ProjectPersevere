import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { authClient } from '../../lib/auth-client';
import UserStatsCard from '../../components/UserStatsCard';
import SkillProgressionCard from '../../components/SkillProgressionCard';
import AccuracyCard from '../../components/AccuracyCard';
import Sidebar from '../../components/Sidebar';
import Report from '../Reports/Report';
import IslandsScene from '../Map/Map';
import {
  theme,
  DashboardContainer,
  DashboardNav,
  NavToolbar,
  NavBrand,
  UserInfo,
  UserName,
  LogoutButton,
  DashboardContent,
  DashboardHeader,
  StatsGrid,
  QuizSection,
  QuizButton,
  PingSection,
} from '../../theme/dashboardTheme';
import { Typography, Grid, Button } from '@mui/material';
import { PlayArrow as PlayArrowIcon, MenuBook as MenuBookIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';  
import { logout } from '../../features/auth/authSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      // First revoke the session token
      await authClient.revokeSession({
        token: session?.session?.token
      });
      
      // Then sign out
      await authClient.signOut();
      dispatch(logout());
      
      // Finally navigate to home
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  const handleViewChapters = () => {
    navigate('/chapters');
  };

  const handleViewInventory = () => {
    navigate('/inventory');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <DashboardNav position="static">
            <NavToolbar>
              <NavBrand variant="h6">ProjectX</NavBrand>
              <UserInfo>
                <UserName variant="body1">{session?.user?.name}</UserName>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </UserInfo>
            </NavToolbar>
          </DashboardNav>

          <DashboardContent>
            <DashboardHeader>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to Your Dashboard, {session?.user?.name}
              </Typography>
            </DashboardHeader>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Your Learning Journey
              </Typography>
            </Box>

            <Box sx={{ display: 'block', gap: 2, mb: 4 }}>
              <QuizSection>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Explore Chapters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse through our learning chapters and start your journey. 
                  </Typography>
                </Box>
                <QuizButton
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleViewChapters}
                  startIcon={<MenuBookIcon />}
                >
                  View Chapters
                </QuizButton>
              </QuizSection>

              <QuizSection sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Inventory
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check your artifacts and powerups collection.
                  </Typography>
                </Box>
                <QuizButton
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleViewInventory}
                  startIcon={<InventoryIcon />}
                >
                  View Inventory
                </QuizButton>
              </QuizSection>
            </Box>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Performance Analytics
              </Typography>
              <Report />
            </Box>

          </DashboardContent>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard; 