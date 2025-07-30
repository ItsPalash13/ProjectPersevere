import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { quizStyles } from '../../theme/quizTheme';

const Results = ({ quizResults, earnedBadges, formatTime }) => {
  if (!quizResults) return null;

  const isTimeRush = quizResults.attemptType === 'time_rush';
  const data = isTimeRush ? quizResults.timeRush : quizResults.precisionPath;
  const progressPercent = Math.min((data.currentXp / data.requiredXp) * 100, 100);
  const isLevelCompleted = data.currentXp >= data.requiredXp;

  return (
    <>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={quizStyles.resultsXpBox}>
          <StarIcon sx={{ fontSize: '2rem' }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            {data.currentXp}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            XP
          </Typography>
        </Box>
        
        <Box sx={quizStyles.resultsStatsContainer}>
          <Typography variant="body1" color="text.secondary">
            Required: {data.requiredXp} XP
          </Typography>
                     <Typography variant="body1" color="text.secondary">
             {isTimeRush ? 'Best Time Remaining: ' : 'Best Time: '}{formatTime(isTimeRush ? data.minTime : data.bestTime)}
           </Typography>
        </Box>

        {/* Percentile Display */}
        {data.percentile !== undefined && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            border: '1px solid rgba(46, 125, 50, 0.3)',
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: '#2e7d32',
              mb: 1
            }}>
              {String(data.percentile)}th Percentile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You completed this level faster than {String(data.percentile)}% of players!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Earned Badges Display */}
      {earnedBadges && earnedBadges.length > 0 && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#f57c00',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            🏆 New Badges Earned!
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {earnedBadges.map((badge, index) => (
              <Box key={index} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                borderRadius: 1,
                padding: '8px 16px',
                border: '1px solid rgba(255, 193, 7, 0.5)',
                minWidth: 120,
                maxWidth: 180
              }}>
                {badge.badgeImage && (
                  <img 
                    src={badge.badgeImage} 
                    alt={badge.badgeName} 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      objectFit: 'contain', 
                      marginBottom: 4 
                    }} 
                  />
                )}
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                  {badge.badgeName}
                </Typography>
                <Typography variant="caption" sx={{ 
                  backgroundColor: '#f57c00', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 20, 
                  height: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  mb: 0.5
                }}>
                  {badge.level + 1}
                </Typography>
                {badge.badgeDescription && (
                  <Typography variant="caption" sx={{ color: '#333', mt: 0.5, textAlign: 'center' }}>
                    {badge.badgeDescription}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={quizStyles.progressBarContainer}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Progress: {progressPercent.toFixed(1)}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progressPercent}
          sx={{ 
            ...quizStyles.progressBar,
            '& .MuiLinearProgress-bar': {
              ...quizStyles.progressBar['& .MuiLinearProgress-bar'],
              ...(isLevelCompleted ? quizStyles.progressBarCompleted : quizStyles.progressBarIncomplete),
            }
          }}
        />
      </Box>

      <Box sx={quizStyles.resultsMessageBox}>
        <Typography variant="body1" sx={quizStyles.resultsMessageText}>
          {quizResults.message}
        </Typography>
      </Box>

      <Box sx={{ 
        ...quizStyles.resultsStatusBox,
        ...(isLevelCompleted ? quizStyles.resultsStatusCompleted : quizStyles.resultsStatusInProgress)
      }}>
        <Typography variant="h6" sx={{ 
          ...quizStyles.resultsStatusTitle,
          color: isLevelCompleted ? '#2e7d32' : theme => theme.palette.text.primary,
        }}>
          {isLevelCompleted ? "🎉 Level Completed!" : "💪 Keep Going!"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isLevelCompleted 
            ? "Amazing work! You've mastered this level!" 
            : "You're making great progress! Keep practicing to reach your goal!"}
        </Typography>
      </Box>
    </>
  );
};

export default Results; 