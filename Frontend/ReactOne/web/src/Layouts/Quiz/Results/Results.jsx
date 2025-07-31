import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Star as StarIcon, EmojiEvents as TrophyIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import { quizStyles } from '../../../theme/quizTheme';

const Results = ({ quizResults, earnedBadges, formatTime, onNextLevel }) => {
  if (!quizResults) return null;

  const isTimeRush = quizResults.attemptType === 'time_rush';
  const data = isTimeRush ? quizResults.timeRush : quizResults.precisionPath;
  const progressPercent = Math.min((data.currentXp / data.requiredXp) * 100, 100);
  const isLevelCompleted = data.currentXp >= data.requiredXp;
  const hasNextLevel = quizResults.hasNextLevel && quizResults.nextLevelId;

  return (
    <Box sx={{ 
      maxHeight: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      p: 0
    }}>
      {/* Header Section - XP and Percentile */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        {/* XP Display */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          flex: 1,
          maxWidth: '45%'
        }}>
          <StarIcon sx={{ fontSize: '1.2rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
              {data.currentXp}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              XP EARNED
            </Typography>
          </Box>
        </Box>

        {/* Percentile Display */}
        {data.percentile !== undefined && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
            flex: 1,
            maxWidth: '45%'
          }}>
            <TrendingIcon sx={{ fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {String(data.percentile)}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                PERCENTILE
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={1} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left Column - Progress and Status */}
        <Grid item xs={12} md={earnedBadges && earnedBadges.length > 0 ? 6 : 12}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
              {/* Progress Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progressPercent.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#3a3a5c' : '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: isLevelCompleted ? '#4caf50' : '#f59e0b',
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Status Message */}
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: isLevelCompleted 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${isLevelCompleted ? 'rgba(76, 175, 80, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: isLevelCompleted ? '#2e7d32' : '#f59e0b',
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}>
                  {isLevelCompleted ? "🎉 Level Completed!" : "💪 Keep Going!"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  {quizResults.message}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

                 {/* Right Column - Badges (only show if badges exist) */}
         {earnedBadges && earnedBadges.length > 0 && (
           <Grid item xs={12} md={6}>
             <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                 {/* Earned Badges Display */}
                 <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     gap: 1,
                     mb: 0.5
                   }}>
                     <TrophyIcon sx={{ color: '#f57c00', fontSize: '1rem' }} />
                     <Typography variant="body2" sx={{ 
                       fontWeight: 'bold', 
                       color: '#f57c00'
                     }}>
                       New Badges Earned!
                     </Typography>
                   </Box>
                   
                   <Box sx={{ 
                     display: 'flex', 
                     flexWrap: 'wrap', 
                     gap: 0.5, 
                     justifyContent: 'center',
                     flex: 1,
                     overflow: 'auto'
                   }}>
                     {earnedBadges.map((badge, index) => (
                       <Box key={index} sx={{
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'center',
                         gap: 0.25,
                         backgroundColor: 'rgba(255, 193, 7, 0.1)',
                         borderRadius: 1,
                         padding: '4px 6px',
                         border: '1px solid rgba(255, 193, 7, 0.3)',
                         minWidth: 70,
                         maxWidth: 80
                       }}>
                         {badge.badgeImage && (
                           <img 
                             src={badge.badgeImage} 
                             alt={badge.badgeName} 
                             style={{ 
                               width: 24, 
                               height: 24, 
                               objectFit: 'contain'
                             }} 
                           />
                         )}
                         <Typography variant="caption" sx={{ 
                           fontWeight: 'bold', 
                           color: '#f57c00',
                           textAlign: 'center',
                           lineHeight: 1.1,
                           fontSize: '0.6rem'
                         }}>
                           {badge.badgeName}
                         </Typography>
                         <Box sx={{ 
                           backgroundColor: '#f57c00', 
                           color: 'white', 
                           borderRadius: '50%', 
                           width: 14, 
                           height: 14, 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           fontSize: '0.5rem',
                           fontWeight: 'bold'
                         }}>
                           {badge.level + 1}
                         </Box>
                       </Box>
                     ))}
                   </Box>
                 </Box>
               </CardContent>
             </Card>
           </Grid>
         )}
      </Grid>
    </Box>
  );
};

export default Results; 