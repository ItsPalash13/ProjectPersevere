import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { authClient } from '../../lib/auth-client';
import PingButton from '../../components/PingButton';
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
import { Typography, Grid } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
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
              <IslandsScene />
            </Box>

            <QuizSection>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ready to Test Your Skills?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Take a quiz to improve your skill rating and track your progress
                </Typography>
              </Box>
              <QuizButton
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartQuiz}
                startIcon={<PlayArrowIcon />}
              >
                Start Quiz
              </QuizButton>
            </QuizSection>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Performance Analytics
              </Typography>
              <Report />
            </Box>

            <PingSection>
              <Typography variant="h6" gutterBottom>
                Server Status
              </Typography>
              <PingButton />
            </PingSection>
          </DashboardContent>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard; 