import React from 'react';
import { Box, Typography, Paper, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Results from '../Quiz/Results/Results';
import { colors } from '../../theme/colors';

// Styled Button Component
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&.MuiButton-contained': {
    background: colors.app.light.border,
    color: colors.text.light.primary,
    '&:hover': {
      background: colors.app.light.accent,
      transform: 'translateY(-2px)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: colors.border.light.accent,
    color: colors.text.light.secondary,
    '&:hover': {
      backgroundColor: colors.overlay.light.medium,
      borderColor: colors.border.light.accent,
    },
  },
}));

const TempResults = () => {
  // Mock data for testing Results component
  const mockQuizResults = {
    attemptType: 'time_rush',
    timeRush: {
      currentXp: 850,
      requiredXp: 1000,
      minTime: 120.5,
      timeTaken: 180.2,
      percentile: 75
    },
    precisionPath: {
      currentXp: 750,
      requiredXp: 800,
      timeTaken: 95.3,
      bestTime: 85.1,
      percentile: 60
    },
    hasNextLevel: true,
    nextLevelNumber: 5,
    nextLevelId: 'mock-level-id',
    nextLevelAttemptType: 'precision_path',
    xpNeeded: 150,
    isNewHighScore: true,
    aiFeedback: "Excellent work, John! Your 85% accuracy in algebra shows real mastery. Ready to tackle the next challenge with confidence!"
  };

  const mockEarnedBadges = [
    {
      badgeId: 'badge1',
      level: 2,
      badgeName: 'Speed Demon',
      badgeImage: 'https://via.placeholder.com/24x24/FFD700/000000?text=⚡',
      badgeDescription: 'Complete 10 questions in under 2 minutes'
    },
    {
      badgeId: 'badge2',
      level: 1,
      badgeName: 'Accuracy Master',
      badgeImage: 'https://via.placeholder.com/24x24/4CAF50/FFFFFF?text=🎯',
      badgeDescription: 'Achieve 90% accuracy in a single level'
    }
  ];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const handleNextLevel = () => {
    console.log('Next level clicked!');
    alert('Next level functionality would be triggered here.');
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      p: 2,
      backgroundColor: 'background.default'
    }}>
      <Box sx={{ 
        maxWidth: 400, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Temporary Results Component Test
        </Typography>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          <Results 
            quizResults={mockQuizResults}
            earnedBadges={mockEarnedBadges}
            formatTime={formatTime}
            onNextLevel={handleNextLevel}
          />
        </Paper>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Test Data:</strong>
          </Typography>
          <List dense sx={{ py: 0 }}>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Time Rush mode with 850/1000 XP (85% progress)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="75th percentile ranking"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="2 earned badges"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Personalized AI feedback with user's first name"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Next level available (Level 5)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="New high score achieved"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Alert>

        {/* Styled Button Examples */}
        <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Styled Button Examples
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            alignItems: 'center' 
          }}>
            <StyledButton 
              variant="contained" 
              onClick={() => alert('Contained button clicked!')}
            >
              Contained Button
            </StyledButton>
            
            <StyledButton 
              variant="outlined" 
              onClick={() => alert('Outlined button clicked!')}
            >
              Outlined Button
            </StyledButton>
            
            <StyledButton 
              variant="text" 
              onClick={() => alert('Text button clicked!')}
            >
              Text Button
            </StyledButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TempResults; 